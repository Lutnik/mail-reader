const nodemailer = require("nodemailer");
const { SMTP } = require("../config/inbox");
const composeEmail = require("./composeEmail");
const recipients = require("../config/outbox");

module.exports = async (data, errors) => {
  const { text, html } = composeEmail(data, errors);
  const transporter = nodemailer.createTransport(SMTP);

  const status = await transporter.sendMail({
    from:
      '"Fieldglass Integration morning checkup" <FGcheckup@lutnik.usermd.net>',
    to: recipients,
    replyTo: "noreply@lutnik.usermd.net",
    subject: "Morning checkup script",
    text,
    html
  });

  return !!status.response.includes("OK");
};
