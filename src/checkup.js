const { parseAttachment } = require("./parseAttachment");
const { filterErrors } = require("./filterErrors");

module.exports = (connector, email) => {
  if (email.subject.includes(connector.keyword)) {
    if (connector.attachment_type === "none") {
      return [
        {
          status: 2,
          error: ""
        },
        null
      ];
    }
    if (!email.attachment) {
      return [
        {
          status: 0,
          error: "No attachment found, was expected"
        },
        {
          name: "Attachment error",
          message: `No error log attached for ${email.subject}`
        }
      ];
    }
    const data = parseAttachment(email.attachment, connector.attachment_type);
    if (!data || data === -1) {
      return [
        {
          status: 0,
          error: "Unknown attachment format"
        },
        {
          name: "Attachment error",
          message: `Could not parse the errorlog for ${email.subject}`
        }
      ];
    }
    const filtered = filterErrors(data, connector.errors_to_skip);
    if (filtered.length) {
      const zxc = filtered.reduce((acc, message) => {
        acc += `${message[0]} ${message[1]} \r\n`;
        return acc;
      }, "");
      return [
        {
          status: 1,
          error: zxc
        },
        null
      ];
    } else {
      return [
        {
          status: 2,
          error: "OK - all errors skipped"
        },
        null
      ];
    }
  }
  if (email.subject.includes(connector.delivery_failed_keyword)) {
    return [
      {
        status: 0,
        delivered: false,
        error: "Delivery failed"
      },
      null
    ];
  }
  return [null, null];
};
