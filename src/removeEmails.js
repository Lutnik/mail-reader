const Logger = require("./logger");
const mailer = require("./mailer");

module.exports = async () => {
  let lock = null;
  const logger = new Logger("logs");

  try {
    await mailer.connect();
    lock = await mailer.getMailboxLock("Inbox");
    await mailer.messageDelete("1:*");
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
