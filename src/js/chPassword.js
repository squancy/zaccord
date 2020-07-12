const userExists = require('./includes/userExists.js');
const bcrypt = require('bcrypt');
const sendEmail = require('./includes/sendEmail.js');

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
      conn.query('SELECT password, temp_password FROM users WHERE id = ? LIMIT 1', [userID],
      function (err, result, fields) {
        if (err) {
          reject('Egy nem várt hiba történt, kérlek próbáld újra');
          throw err;
        }
        
        if (result.length < 1) {
          reject('Nincs ilyen felhasználó');
          return;
        }

        // Make sure password (or temp password) is correct
        let hashedPass = result[0].password;
        let tmpPass = result[0].temp_password ? result[0].temp_password : '';
        if (!bcrypt.compareSync(cpass, hashedPass) && !bcrypt.compareSync(cpass, tmpPass)) {
          reject('Hibás jelszót adtál meg');
          return;
        }

        // Current password is valid; now check new password
        if (npass.length < 6 || rpass != npass) {
          reject('Helytelen új jelszó');
          return;
        }

        // Now update password in db & delete potential tmp password
        // First hash password
        const saltRounds = 10;
        const hash = bcrypt.hashSync(npass, saltRounds);
       
        let uQuery = 'UPDATE users SET password = ?, temp_password = ? WHERE id = ? LIMIT 1';
        conn.query(uQuery, [hash, '', userID],
        (err, result, field) => {
          if (err) {
            reject('Egy nem várt hiba történt, kérlek proóbád újra');
            return;
          }

          let eQuery = 'SELECT email FROM users WHERE id = ? LIMIT 1';
          conn.query(eQuery, [userID], (err, result, field) => {
            // On successful ordering, send customer a notification email
            let email = result[0].email;
            let emailContent = `
              <p style="font-size: 22px;">Sikeres jelszóváltoztatás!</p>
              <p>
                Értesítünk, hogy a fiókodhoz tartozó jelszavadat sikeresen megváltoztattad.<br>
                Mostantól ezzel a jelszóval tudsz belépni a fiókba.
              </p>
            `;
            let subject = 'Sikeres jelszóváltoztatás!';
            sendEmail('info@zaccord.com', emailContent, email, subject);
            
            // Successful change
            resolve('password changed');
          });
        });
      });
    }).catch(err => {
      // User does not exist in db
      reject('Nincs ilyen felhasználó');
    });
  });
}

module.exports = chPassword;
