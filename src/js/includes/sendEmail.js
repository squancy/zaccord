const nodemailer = require('nodemailer');
const constants = require('./constants.js');
const EMAIL_HOST_NAME = constants.emailHostName;
const EMAIL_USER_NAME = constants.emailUsername;
const EMAIL_PASSWORD = constants.emailPassword;

// Send email from a specific addr with arbitrary content
// NOTE: you may want to change nodemailer credentials to satisfy your needs
function sendEmail(from, content, email, subject, attachmentPath = null) {
  return new Promise((resolve, reject) => {
    var transporter = nodemailer.createTransport({
      host: EMAIL_HOST_NAME,
      port: 465,
      secure: true, 
      auth: {
        user: EMAIL_USER_NAME,
        pass: EMAIL_PASSWORD
      }
    });

    let curYear = new Date().getFullYear();
    let emailContent = `
      <div style="font-family: sans-serif;">
        <div style="width: 100%; height: 60px; background-color: white;
          box-sizing: border-box;">
          <img src="https://www.zaccord.com/images/logo.png"
            style="width: 50px; height: 50px; display: block;
            margin: 0 auto;">  
        </div>
        <div style="width: 100%; text-align: center; padding: 10px;
          box-sizing: border-box;">
          ${content}
        </div>
        <div style="width: 100%; background-color: #f4f4f4; color: #171717; padding: 10px;
          border-radius: 10px; text-align: center; box-sizing: border-box; font-size: 14px;">
          <p style="margin-bottom: 0; color: #7d7d7d;">Megvalósítunk minden elképzelést</p>
          <p style="color: #7d7d7d;">
            ${curYear} Zaccord -
            <a href="https://www.zaccord.com/aszf" style="color: #7d7d7d;">ÁSZF</a>
          </p>
        </div>
      </div>
    `;

    var mailOptions = {
      from: `Zaccord <${from}>`,
      to: email,
      subject: subject,
      html: emailContent,
    };

    if (attachmentPath) {
      mailOptions.attachments = [{
        filename: attachmentPath.filename,
        path: attachmentPath.path
      }];
    }

    transporter.sendMail(mailOptions, function(error, info) {
      if (error) {
        console.log(error);
        reject('Egy nem várt hiba történt, kérlek próbáld újra (email)');
        return;
      } else {
        resolve('success');
      }
    });
  });
}

module.exports = sendEmail;
