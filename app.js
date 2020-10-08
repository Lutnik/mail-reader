const Logger = require("./src/logger");
const connectors = require("./config/connectors");
const fetchEmails = require("./src/fetchEmails");
const removeEmails = require("./src/removeEmails");
const sendMail = require("./src/sendMail");
const { parseAttachment } = require("./src/parseAttachment");
const { filterErrors } = require("./src/filterErrors");

(async () => {
  const logger = new Logger("logs");
  const results = {};
  const errors = []; // [{name, message}]
  connectors.forEach(con => {
    results[con.name] = {
      status: 0, // 0: critical; 1: errors found; 2: errors skipped; 3: no email
      error: null
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
      message:
        "It's a bank holiday or what? Did somebody remove the message forwarded? No new mail in inbox!"
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
        if (email.subject.includes(con.keyword)) {
          // check for delivery failed
          if (email.subject.includes("Delivery failed")) {
            logger.warn(`Delivery falied!!!: ${con.name}`);
            results[con.name].status = 0;
            results[con.name].error = "Delivery failed";
          } else {
            // check for errors in body
            // TODO
            if (con.attachment_type !== "none") {
              if (email.attachment) {
                const asd = parseAttachment(
                  email.attachment,
                  con.attachment_type
                );
                if (!asd || asd === -1) {
                  const e = {
                    name: "Attachment parse error",
                    message: `An attachment cound not be parsed for message ${email.subject}`
                  };
                  results[con.name].status = 0;
                  results[con.name].error = "Error parsing an attachment";
                  errors.push(e);
                  logger.warn(e);
                } else {
                  const zxc = filterErrors(asd, con.errors_to_skip);
                  if (zxc.length) {
                    results[con.name].status = 1;
                    results[con.name].error = zxc.reduce((acc, message) => {
                      acc += `${message[0]} ${message[1]} \n`;
                      return acc;
                    }, "");
                  } else {
                    results[con.name].status = 2;
                  }
                }
              } else {
                results[con.name].status = 0;
                results[con.name].error = "Expected an attachment, none found";
              }
            }
          }
          return false;
        }
        return true;
      });
      if (tmpEmails.length === emails.length) results[con.name].status = 3;
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
    if (!(await removeEmails())) {
      errors.push({
        name: "Mailbox cleanup error",
        message: "Please remove all emails from inbox manually"
      });
    }
  }

  if (await sendMail(results, errors)) {
    logger.info("Email have been sent, quitting");
  } else {
    logger.warn("Email not sent, please check");
  }
})();
