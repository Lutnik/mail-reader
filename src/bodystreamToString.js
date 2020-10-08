module.exports = buf => {
  return Buffer.from(buf.toString(), "base64").toString();
};
