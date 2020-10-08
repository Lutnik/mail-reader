const { ImapFlow } = require("imapflow");
const Logger = require("./logger");
const { IMAP } = require("../config/inbox");

module.exports = new ImapFlow({
  ...IMAP,
  logger: new Logger("logs")
});
