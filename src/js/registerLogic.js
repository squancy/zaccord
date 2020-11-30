const bcrypt = require('bcrypt');
const sendEmail = require('./includes/sendEmail.js');

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
          console.log(err);
          reject('Egy nem várt hiba történt, kérlek próbáld űjra');
          throw err;
        }

        // TODO do img source when deployed to server & email
        // On successful registration send a welcome email to user
        let emailContent = `
          <p style="font-size: 22px;">Köszöntünk a Zaccord-on!</p>
          <p style="line-height: 1.4;">
            Ezt a levelet azért kapod, mert nemrégiben regisztráltál a Zaccordra.
            A Zaccord egy olyan szolgáltatás, ahol a vásárlók 3D nyomtatóval készített
            tárgyakat vehetnek vagy a már meglévő tervüket beküldhetik hozzánk és mi azt
            kinyomtatjuk nekik.
            A küldetésünk az, hogy minden ötletet megvalósítsunk és népszerűsítsük a 3D-s
            technológiával készült termékeket.
          </p>
        `;
        let subject = 'Köszöntünk a Zaccordon!';

        sendEmail('info@zaccord.com', emailContent, email, subject);

        // Insert user to delivery_data table
        let sQuery = 'SELECT id FROM users WHERE email = ? LIMIT 1';
        conn.query(sQuery, [email], (err, result, field) => {
          if (err) {
            console.log(err);
            reject('Egy nem várt hiba történt, kérlek próbáld űjra');
            return;
          }

          let userID = result[0].id;
          let iQuery = 'INSERT INTO delivery_data (uid, date) VALUES (?, NOW())';
          conn.query(iQuery, [userID], (err, result, field) => {
            if (err) {
          console.log(err);
              reject('Egy nem várt hiba történt, kérlek próbáld űjra');
              return;
            }

            // Success
            console.log('hEEEEEE');
            resolve(userID);
          });
        });
      });
    });
  });
}

module.exports = userRegister;
