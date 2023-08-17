const sendEmail = require('./includes/sendEmail.js');
const shipping = require('./includes/shippingConstants.js');
const SHIPPING_OBJ = shipping.shippingObj;

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

          for (let key of Object.keys(SHIPPING_OBJ)) {
            if (SHIPPING_OBJ[key]['radioID'] == delType) {
              var trackURL = SHIPPING_OBJ[key]['trackURL'];
              var delText = SHIPPING_OBJ[key]['title'];
            }
          }

          // Now send email to the customer
          let emailContent = `
            <div style="line-height: 1.7;">
              <p style="font-size: 24px;">A csomagod átadtuk a futárszolgálatnak!</p>
              <p style="font-size: 16px;">Kedves Vásárlónk,</p>
              <p style="font-size: 16px;">
                A(z) <span style="color: #4285f4;">${uid}</span> azonosító számú rendelésed
                átadásra került a kiszállítást végző szolgáltatónak.
              </p>
              <p style="font-size: 16px;">
                Választott szállítási mód: <span style="color: #4285f4;">${delText}</span>
                <br>
                A megrendelésről bővebb információ weboldalunkon, a
                <span style="color: #4285f4;">Fiók</span> menüpont alatt található.
              </p>
              <p style="font-size: 16px;">
                A csomag státuszát a
                <a href="${trackURL}"
                  style="color: #4285f4; text-decoration: none;">futárszolgálat rendszerében</a>
                tudod megtekinteni az alábbi azonosítóval:
                <span style="color: #4285f4;">${glsCode}</span>
              </p>
              <p style="font-size: 16px;">
                Köszönjük, hogy a Zaccordot választottad!
              </p>
              <p style="font-size: 16px;">
                Zaccord
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
