const nodemailer = require("nodemailer");
const { SMTP } = require("../config/inbox");
const composeEmail = require("./composeEmail");

module.exports = async (data, errors) => {
  const { text, html } = composeEmail(data, errors);
  const transporter = nodemailer.createTransport(SMTP);

  return transporter.verify(async error => {
    if (error) {
      return false;
    } else {
      await transporter.sendMail({
        from:
          '"Fieldglass Integration morning checkup" <FGcheckup@lutnik.usermd.net>',
        to: "Lutnik_1@interia.pl",
        replyTo: "noreply@lutnik.usermd.net",
        subject: "Morning checkup script",
        text,
        html
      });
      return true;
    }
  });
};
