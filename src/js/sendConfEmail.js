const sendEmail = require('./includes/sendEmail.js');

const sendConfEmail = (conn, uid, delType, glsCode) => {
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

        // If there is no such user in the table check if user ordered without signing up
        if (result.length < 1) {
          var checkPromise = new Promise((resolve, reject) => {
            let cQuery = 'SELECT nl_email FROM delivery_data WHERE order_id = ? LIMIT 1';
            conn.query(cQuery, [uid], (err, result, fields) => {
              if (err) {
                reject(err);
                return;
              }

              // Make sure there is a non-empty email field
              if (result[0].nl_email) resolve(result[0].nl_email);
              else reject('invalid email');
            });
          });
        } else {
          var checkPromise = new Promise ((resolve, reject) => resolve(result[0].email));
        }

        checkPromise.then(email => {
          let emailAddr = email;

          if (delType === 'háztól házig') {
            delType = 'Házhozszállítás GLS futárszolgálattal';
          } else {
            delType = 'Átvétel GLS csomagponton';
          }

          // Now send email to the customer
          let emailContent = `
            <div style="line-height: 1.7;">
              <p style="font-size: 24px;">A csomagot átadtuk a futárszolgálatnak!</p>
              <p style="font-size: 16px;">Tisztelt Ügyfelünk!</p>
              <p style="font-size: 16px;">
                A <span style="color: #4285f4;">${uid}</span> azonosító számú rendelés
                átadásra került a kiszállítást végző szolgáltatónak.
              </p>
              <p style="font-size: 16px;">
                Választott szállítási mód: <span style="color: #4285f4;">${delType}</span>
                <br>
                A megrendelésről bővebb információ weboldalunkon, a
                <span style="color: #4285f4;">Fiók</span> menüpont alatt található.
              </p>
              <p style="font-size: 16px;">
                A csomag státuszát a
                <a href="https://gls-group.eu/HU/hu/csomagkovetes"
                  style="color: #4285f4; text-decoration: none;">GLS rendszerében</a>
                tudja megtekinteni az alábbi azonosítóval:
                <span style="color: #4285f4;">${glsCode}</span>
              </p>
              <p style="font-size: 16px;">
                Köszönjük, hogy megtisztelt minket rendelésével.
              </p>
              <p style="font-size: 16px;">
                Üdvözlettel,<br>
                Zaccord<br>
                3D nyomtatott termékek tárháza<br>
              </p>
            </div>
          `;
          let subject = 'A csomagod átadtuk a futárszolgálatnak! - Azonosító: ' + uid;
          sendEmail('info@zaccord.com', emailContent, emailAddr, subject);
          
          resolve('success');
        });
      });
    });
  });
}

module.exports = sendConfEmail;