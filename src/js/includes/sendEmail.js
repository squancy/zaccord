const nodemailer = require('nodemailer');

// Send email from a specific addr with arbitrary content
function sendEmail(from, content, email, subject) {
  return new Promise((resolve, reject) => {
    // Note: change email sending params to yours
    var transporter = nodemailer.createTransport({
      host: 'YOUR_HOST',
      port: 465,
      secure: true, 
      auth: {
        user: 'USER',
        pass: 'PASS'
      }
    });

    let curYear = new Date().getFullYear();
    let emailContent = `
      <div style="width: 100%; height: 60px; background-color: white;
        box-sizing: border-box;">
        <img src="https://www.pearscom.com/company/complogo.png"
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
    `;

    var mailOptions = {
      from: `Zaccord <${from}>`,
      to: email,
      subject: subject,
      html: emailContent
    };

    transporter.sendMail(mailOptions, function(error, info) {
      if (error) {
        reject('Egy nem várt hiba történt, kérlek próbáld űjra');
        return;
      }
    });

    // Do not wait for checking error msg: proceed anyways
    resolve('success');
  });
}

module.exports = sendEmail;
