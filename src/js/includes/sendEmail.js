const nodemailer = require('nodemailer');

// Send email from a specific addr with arbitrary content
// NOTE: configure the parameters of the email server for yourself
function sendEmail(from, content, email, subject) {
  return new Promise((resolve, reject) => {
    var transporter = nodemailer.createTransport({
      host: 'HOST',
      port: 465,
      secure: true, 
      auth: {
        user: 'USER',
        pass: 'PASS'
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
        <div style="width: 100%; text-align: center; padding: 10px; box-sizing: border-box;">
          ${content}
        </div>
        <div style="width: 100%; background-color: #171717; color: white; padding: 10px;
          border-radius: 10px; text-align: center; box-sizing: border-box;">
          <p>	&copy; Zaccord ${curYear} - "Minden ötletet megvalósítani"</p>
        </div>
      </div>
    `;

    var mailOptions = {
      from: `Zaccord <${from}>`,
      to: email,
      subject: subject,
      html: emailContent
    };

    transporter.sendMail(mailOptions, function(error, info) {
      if (error) {
          console.log(error);
        reject('Egy nem várt hiba történt, kérlek próbáld űjra');
        return;
      } else {
        resolve('success');
      }
    });
  });
}

module.exports = sendEmail;
