const bcrypt = require('bcrypt');

// Handle user login; push data to db
const userLogin = (conn, formData, req) => {
  return new Promise((resolve, reject) => {
    // Gather data
    let email = formData.email;
    let password = formData.pass;
    let userAgent = req.headers['user-agent'];
    let ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

    // First check if there is a user with such an email in db
    conn.query('SELECT password, temp_password, id FROM users WHERE email = ? LIMIT 1', [email],
    (err, result, fields) => {
      if (err) {
        console.log(err);
        reject('Egy nem várt hiba történt, kérlek próbáld újra');
        return;
      } else if (result.length === 0) {
        reject('Hibás e-mail vagy jelszó');
        return;
      }

      // Make sure password or temporary password is correct
      let passHash = result[0].password;
      let userId = result[0].id;
      let tempPassword = result[0].temp_password ? result[0].temp_password : '';
      let isCorrect = bcrypt.compareSync(password, passHash);
      let isCorrectTmp = bcrypt.compareSync(password, tempPassword);
      if (!isCorrect && !isCorrectTmp) {
        reject('Hibás e-mail vagy jelszó');
        return;
      }

      // Update db with new user-agent + ip (if new)
      let sQuery = `
        UPDATE users SET user_agent = ?, ip_addr = ? WHERE email = ? LIMIT 1
      `;

      conn.query(sQuery, [userAgent, ip, email], function (err, result, fields) {
        if (err) {
          console.log(err)
          reject('Egy nem várt hiba történt, kérlek próbáld újra');
          return;
        }

        // Successful login
        resolve(userId);
      });
    });
  });
}

module.exports = userLogin;
