const Logger = require("./logger");
const mailer = require("./mailer");

module.exports = async () => {
  let lock = null;
  const logger = new Logger("logs");

  try {
    lock = await mailer.getMailboxLock("Inbox");
    await mailer.messageDelete("1:*");
    //console.log("We will be removing all emails here");
    return true;
  } catch (err) {
    logger.error(err);
    return false;
  } finally {
    lock && lock.release();
    await mailer.logout();
    lock && logger.info("Emails removed successfully");
  }
};
