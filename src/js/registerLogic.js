const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');

// Handle user registration; push data to db
const userRegister = (conn, formData, req) => {
  return new Promise((resolve, reject) => {
    // Gather data
    let email = formData.email;
    let password = formData.pass;
    let userAgent = req.headers['user-agent'];
    let ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

    // Secure password
    const saltRounds = 10;
    const hash = bcrypt.hashSync(password, saltRounds);

    // Make sure email is not already in the system
    conn.query('SELECT id FROM users WHERE email = ?', [email], (err, result, fields) => {
      if (result.length > 0) {
        reject('Ez az e-mail cím már foglalt');
        return;
      }

      // Insert data to db
      let sQuery = `
        INSERT INTO users (email, password, user_agent, ip_addr, register_time)
        VALUES (?, ?, ?, ?, NOW())
      `;

      conn.query(sQuery, [email, hash, userAgent, ip], function (err, result, fields) {
        if (err) {
          reject('Egy nem várt hiba történt, kérlek próbáld űjra');
          throw err;
        }

        // TODO do img source when deployed to server & email
        // On successful registration send a welcome email to user
        var transporter = nodemailer.createTransport({
          host: 'zaccord.com',
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
            border-bottom: 1px solid #dfdfdf;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24);
            box-sizing: border-box;">
            <img src="https://www.pearscom.com/company/complogo.png"
              style="width: 50px; height: 50px; display: block;
              margin: 0 auto;">  
          </div>
          <div style="width: 100%; text-align: center; padding: 10px; box-sizing: border-box;">
            <p style="font-size: 22px;">Köszöntünk a Zaccord-on!</p>
            <p>
              Ezt a levelet azért kapod, mert nemrégiben regisztráltál a Zaccord-ra.
              A Zaccord egy olyan szolgáltatás, ahol a vásárlók 3D nyomtatóval készített
              tárgyakat vehetnek vagy a már meglévő tervüket beküldhetik hozzánk és mi azt
              kinyomtatjuk nekik.
              A küldetésünk az, hogy minden ötletet megvalósítsunk és népszerűsítsük a 3D-s
              technológiával készült termékeket.
            </p>
          </div>
          <div style="width: 100%; background-color: #171717; color: white; padding: 10px;
            border-radius: 10px; text-align: center; box-sizing: border-box;">
            <p>	&copy; Zaccord ${curYear} - "Minden ötletet megvalósítani"</p>
          </div>
        `;

        var mailOptions = {
          from: 'Zaccord <welcome@zaccord.com>',
          to: email,
          subject: 'Köszöntünk a Zaccord-on!',
          html: emailContent
        };
 
        transporter.sendMail(mailOptions, function(error, info) {
          if (error) {
            reject('Egy nem várt hiba történt, kérlek próbáld űjra');
            return;
          }
        });

        // Insert user to delivery_data table
        let sQuery = 'SELECT id FROM users WHERE email = ? LIMIT 1';
        conn.query(sQuery, [email], (err, result, field) => {
          if (err) {
            reject('Egy nem várt hiba történt, kérlek próbáld űjra');
            return;
          }

          let userID = result[0].id;
          let iQuery = 'INSERT INTO delivery_data (uid, date) VALUES (?, NOW())';
          conn.query(iQuery, [userID], (err, result, field) => {
            if (err) {
              reject('Egy nem várt hiba történt, kérlek próbáld űjra');
              return;
            }

            // Success
            resolve('register success');
          });
        });
      });
    });
  });
}

module.exports = userRegister;
