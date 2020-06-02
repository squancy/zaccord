const userExists = require('./includes/userExists.js');
const bcrypt = require('bcrypt');

// Validate user & on successful validation change their password in db
const chPassword = (conn, userID, formData) => {
  return new Promise((resolve, reject) => {
    // Make sure user exists in db
    userExists(conn, userID).then(data => {
      // Make sure the current password has been entered correctly
      let cpass = formData.cpass;
      let npass = formData.npass;
      let rpass = formData.rpass;

      // Get current hashed password form db
      conn.query('SELECT password FROM users WHERE id = ? LIMIT 1', [userID],
      function (err, result, fields) {
        if (err) {
          reject('Egy nem várt hiba történt, kérlek próbáld újra');
          throw err;
        }
        
        if (result.length < 1) {
          reject('Nincs ilyen felhasználó');
          return;
        }

        let hashedPass = result[0].password;
        if (!bcrypt.compareSync(cpass, hashedPass)) {
          reject('Hibás jelszót adtál meg');
          return;
        }

        // Current password is valid; now check new password
        if (npass.length < 6 || rpass != npass) {
          reject('Helytelen új jelszó');
          return;
        }

        // Now update password in db
        // First hash password
        const saltRounds = 10;
        const hash = bcrypt.hashSync(npass, saltRounds);
        
        conn.query('UPDATE users SET password = ? WHERE id = ? LIMIT 1', [hash, userID],
        (err, result, field) => {
          if (err) {
            reject('Egy nem várt hiba történt, kérlek proóbád újra');
            return;
          }

          // Successful change
          resolve('password changed');
        });
      });
    }).catch(err => {
      // User does not exist in db
      reject('Nincs ilyen felhasználó');
    });
  });
}

module.exports = chPassword;
