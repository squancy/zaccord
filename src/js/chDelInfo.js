const userExists = require('./includes/userExists.js');

// Push delivery info to db
const changeDeliveryInfo = (conn, userID, formData) => {
  return new Promise((resolve, reject) => {
    // Make sure user exists in db
    userExists(conn, userID).then(data => {
      let name = formData.name; 
      let pcode = Number(formData.pcode);
      let city = formData.city;
      let address = formData.address;
      let mobile = formData.mobile;

      // Update data in db
      let iQuery = `
        UPDATE delivery_data SET name = ?, postal_code = ?, city = ?, address = ?, mobile = ?,
          date = NOW() WHERE uid = ? LIMIT 1
      `;
      conn.query(iQuery, [name, pcode, city, address, mobile, userID], (err, result, f) => {
        if (err) {
          reject('Egy nem várt hiba történt, kérlek próbáld újra');
          return;
        }

        // Successfully updated
        resolve('success');
      });
    }).catch(err => {
      reject('Nincs ilyen felhasználó');
      return;
    });
  });
}

module.exports = changeDeliveryInfo;
