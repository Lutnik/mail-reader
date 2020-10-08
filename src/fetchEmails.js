/* eslint no-prototype-builtins: 0 */

const Logger = require("./logger");
const mailer = require("./mailer");
const encode = require("./encode");
const checkEmailValidity = require("./checkEmailValidity");

module.exports = async () => {
  let lock = null;
  const logger = new Logger("logs");

  try {
    await mailer.connect();
    lock = await mailer.getMailboxLock("Inbox");

    const emails = [];
    const today = new Date(Date.now());

    for await (let mail of mailer.fetch(
      "1:*", // { sentOn: today }, // "1:*",
      {
        envelope: true,
        bodyStructure: true,
        bodyParts: ["1", "2", "3"]
      }
    )) {
      let emailBody = null;
      let emailAttachment = null;
      let error = null;

      if (!checkEmailValidity(mail)) {
        logger.error(`Could not decode an email uid:${!!mail && mail.uid}`);
        emails.push({
          error:
            "One of the emails could not be read. Please see the log and check the connectors manually"
        });
        continue;
      }
      //
      // email with one body structure (no child nodes)
      // only text/plain message, no attachments
      //
      if (!mail.bodyStructure.hasOwnProperty("childNodes")) {
        const { encoding } = mail.bodyStructure;
        emailBody = encode(mail.bodyParts.get("1"), encoding);
      } else {
        const [part1, part2] = mail.bodyStructure.childNodes;
        //
        // email with two body structure parts (no sub child nodes)
        //
        if (!part1.hasOwnProperty("childNodes")) {
          //
          // 1st is message body text/plain, 2nd is message body text/html
          // extract only text/plain
          //
          let { encoding } = part1;
          emailBody = encode(mail.bodyParts.get("1"), encoding);
          //
          // 1st is message body text/plain, 2nd is attachment
          //
          if (
            part2.hasOwnProperty("disposition") &&
            part2.disposition === "attachment"
          ) {
            encoding = part2.encoding;
            emailAttachment = encode(mail.bodyParts.get("2"), encoding);
          }
          //
          // email with two body structure parts and sub child nodes
          // 1st body structure part contains message split into two subparts:
          //  1.1 with message body text/plain, 1.2 text/html
          // 2nd body structure part is attachment
          //
        } else {
          const [part1_1] = part1.childNodes;
          //
          // 1st body structure part should be text/plain message
          // however, bodyPart('1') will contain both plain and html
          // need to extract the text/plain section of bodyPart('1') buffer
          //
          if (part1_1.type === "text/plain") {
            let encoding = "utf8";
            let emailBodyToDecode = encode(mail.bodyParts.get("1"), encoding);
            const { boundary } = part1.parameters;
            emailBodyToDecode = emailBodyToDecode.substring(
              emailBodyToDecode.indexOf("Content-Transfer-Encoding"),
              emailBodyToDecode.indexOf(boundary, 10)
            );
            emailBodyToDecode = emailBodyToDecode.substring(
              emailBodyToDecode.indexOf("\n"),
              emailBodyToDecode.length
            );
            emailBody = encode(emailBodyToDecode, "base64");
            encoding = part2.encoding;
            //
            // if there are 3 body parts then the last one is an attachment
            // OR there are two attachments in which case we grab the last one
            //
            if (mail.bodyParts.get("3")) {
              emailAttachment = encode(mail.bodyParts.get("3"), encoding);
            } else {
              emailAttachment = encode(mail.bodyParts.get("2"), encoding);
            }
            //
            // fallback in case none of the above
            //
          } else {
            error =
              "Could not decode the email structure (attachment), please check manually";
            let { encoding } = part1_1;
            emailBody = encode(mail.bodyParts.get("1"), encoding);
            encoding = part2.encoding;
            emailAttachment = encode(mail.bodyParts.get("2"), encoding);
          }
        }
      }
      if (!mail.envelope.subject)
        error = "Could not decode email Subject, please check manually";
      if (!emailBody)
        error = "Could not decode email Body, please check manually";

      emails.push({
        subject: mail.envelope.subject || "",
        date: mail.envelope.date || "",
        body: emailBody,
        attachment: emailAttachment,
        error
      });
    }
    return emails;
  } catch (err) {
    logger.error({ msg: err.message });
    lock && lock.release();
    await mailer.logout();
    return false;
  } finally {
    lock && lock.release();
    lock && logger.info("Inbox read successfully");
  }
};
