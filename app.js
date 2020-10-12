const Logger = require("./src/logger");
const connectors = require("./config/connectors");
const fetchEmails = require("./src/fetchEmails");
const checkup = require("./src/checkup");
const sendMail = require("./src/sendMail");

(async () => {
  const logger = new Logger("logs");
  const results = {};
  const errors = []; // [{name, message}]
  connectors.forEach(con => {
    results[con.name] = {
      status: 0, // 0: critical; 1: errors found; 2: errors skipped; 3: no email
      delivered: true,
      error: ""
    };
  });

  let emails = await fetchEmails();

  if (!emails || typeof emails === "undefined") {
    const e = {
      name: "Email fetch Error",
      message: "Critical error!!! Could not retrieve emails!"
    };
    errors.push(e);
    logger.warn(e);
  } else if (emails.length === 0) {
    const e = {
      name: "No emails in inbox",
      message: "No new mail in inbox!"
    };
    errors.push(e);
    logger.warn(e);
  } else {
    const fetchErrors = emails.filter(email => !!email.error);
    if (fetchErrors.length > 0) {
      const e = {
        name: "Email parse error",
        message: `${fetchErrors.length} emails could not be parsed, please check manually`
      };
      errors.push(e);
      logger.warn(e);
    }
    emails = emails.filter(email => !email.error);

    for (let con of connectors) {
      logger.info(`Checking ${con.name}`);

      const tmpEmails = emails.filter(email => {
        const [newResult, newError] = checkup(con, email);
        if (newResult || newError) {
          if (newResult) {
            const concatenated = newResult.error
              ? `${results[con.name].error} \n ${newResult.error}`
              : results[con.name].error;

            results[con.name] = {
              ...results[con.name],
              ...newResult,
              error: concatenated
            };
          }
          if (newError) {
            errors.push(newError);
            logger.warn(newError);
          }
          return false;
        } else {
          return true;
        }
      });

      if (tmpEmails.length === emails.length) {
        results[con.name].status = 3;
        results[con.name].error = "OK - no errorlog found";
      }
      emails = [...tmpEmails];
    }
    if (emails.length) {
      emails.forEach(email => {
        errors.push({
          name: "Unprocessed email in INBOX",
          message: email.subject
        });
      });
    }
  }

  if (await sendMail(results, errors)) {
    logger.info("Email have been sent, quitting");
  } else {
    logger.warn("Email not sent, please check");
  }
})();
