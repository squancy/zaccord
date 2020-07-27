const sendEmail = require('./includes/sendEmail.js');

const sendConfEmail = (conn, uid) => {
  return new Promise((resolve, reject) => {
    // First make sure that there is an order with that uid
    let mQuery = 'SELECT uid FROM orders WHERE unique_id = ? LIMIT 1';
    conn.query(mQuery, [uid], (err, result, fields) => {
      if (err) {
        reject('Egy nem várt hiba történt');
        return;
      }
      
      // If there is no order with such uid report an error
      if (result.length < 1) {
        reject('Nincs ilyen rendelés');
        return;
      }

      let userID = result[0].uid;

      // Otherwise, make sure there is a user with a valid email address
      let uQuery = 'SELECT email FROM users WHERE id = ? LIMIT 1';
      conn.query(uQuery, [userID], (err, result, fields) => {
        if (err) {
          reject('Egy nem várt hiba történt');
          return;
        }

        // If there is no such user in the table report an error
        if (result.length < 1) {
          reject('Nincs ilyen felhasználó');
          return;
        }

        let emailAddr = result[0].email;

        // Now send email to the customer
        let emailContent = `
          <p style="font-size: 22px;">A csomagod átadtuk a futárszolgálatnak!</p>
          <p>
            Az alábbi azonosítóval tudod megtekinteni a rendelésed státuszát a Zaccord
            fiókodban: <span style="color: #4285f4;">${uid}</span><br>
            Köszönjük, hogy a Zaccordot választottad!
          </p>
        `;
        let subject = 'A csomagod átadtuk a futárszolgálatnak! - Azonosító: ' + uid;
        sendEmail('info@zaccord.com', emailContent, emailAddr, subject);
        
        resolve('success');
      });
    });
  });
}

module.exports = sendConfEmail;
