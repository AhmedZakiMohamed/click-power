const nodeMailer = require("nodemailer");
const pug = require("pug");
const htmlToText = require("html-to-text");
const config = require("../config");

module.exports = class Email {
  constructor(user, url) {
    this.to = user.email;
    this.firstName = user.name.split(" ")[0];
    this.url = url;
    this.from = `Click Power <${config.email.user}>`;
  }

  newTransport() {
  return nodeMailer.createTransport({
    host: config.email.host,  // mail.clickpower.net
    port: config.email.port,  // 465 أو 587
    secure: config.email.port == 465, // SSL true لو البورت 465
    auth: {
      user: config.email.user, // zaki@clickpower.net
      pass: config.email.pass, // الباسورد بتاع الإيميل
    },
  });
}


  async send(template, subject) {
    const html = pug.renderFile(`${__dirname}/../views/email/${template}.pug`, {
      firstName: this.firstName,
      url: this.url,
      subject,
    });

    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      html,
      text: htmlToText.convert(html), 
    };

    await this.newTransport().sendMail(mailOptions);
  }

  async sendWelcome() {
    await this.send("welcome", "Welcome to the Click Power Family!");
  }

  async sendPasswordReset() {
    await this.send(
      "passwordReset",
      "Your password reset token (valid for only 10 minutes)"
    );
  }
  async sendMessage() {
    await this.send("message", "You have a new message");
  }
};
