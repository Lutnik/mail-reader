const bodystreamToString = require("./bodystreamToString");
const quotedPrintable = require("quoted-printable");
const utf8 = require("utf8");

module.exports = (input, encoding) => {
  if (encoding === "base64") {
    return bodystreamToString(input);
  }
  if (encoding === "quoted-printable") {
    return utf8.decode(quotedPrintable.decode(input.toString()));
  }
  if (encoding === "7bit") {
    return input.toString("ascii");
  }
  return input.toString("utf8");
};
