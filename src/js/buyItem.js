const userExists = require('./includes/userExists.js');
const itemExists = require('./includes/itemExists.js');
const calcPrice = require('./includes/calcPrice.js');
const validateParams = require('./includes/validateParams.js');

// Validate order on server side & push to db
const buyItem = (conn, formData) => {
  return new Promise((resolve, reject) => {
    // Extract data from form data obj
    let userID = formData.userID;
    let fixProduct = formData.fix_product;
    let itemID = formData.itemID;
    let price = formData.price;
    let originalPrice = formData.originalPrice;
    let rvas = formData.rvas;
    let suruseg = formData.suruseg;
    let scale = formData.scale;
    let color = formData.color;
    let fvas = formData.fvas;
    let quantity = formData.quantity;
    let payment = formData.payment;
    let orderID = formData.orderID;

    let name = formData.name;
    let city = formData.city;
    let address = formData.address;
    let mobile = formData.mobile;
    let pcode = formData.pcode;

    // Make sure user exists in db with the given ID
    userExists(conn, userID).then(data => {
      // Make sure item exists with the given ID  
      itemExists(conn, itemID).then(data => {
        // Check the validity of parameters
        if (!validateParams(formData)) {
          reject('Hibás paraméterek');
          return;
        }

        // Check if price is correct with the given parameters
        if (calcPrice(originalPrice, rvas, suruseg, scale, fvas) != price) {
          reject('Hibás ár'); 
          return;
        }

        // Make sure payment option is valid
        if (payment != 'uvet' && payment != 'transfer') {
          reject('Hibás fizetési mód');
          return;
        }

        // Request is valid, push data to db
        let isTrans = payment == 'transfer' ? 1 : 0;
        let transID = isTrans ? orderID : '';
        let iQuery = `
          INSERT INTO orders (uid, item_id, price, rvas, suruseg, scale, color, fvas,
            quantity, is_transfer, transfer_id, is_fix_prod, order_time)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
        `;
        let valueArr = [userID, itemID, price, String(rvas), String(suruseg), String(scale),
          color, String(fvas), quantity, isTrans, transID, fixProduct];
        conn.query(iQuery, valueArr, (err, result, field) => {
          if (err) {
            console.log(err);
            reject('Egy nem várt hiba történt, kérlek próbáld újra');
            return;
          }

          // Also insert user delivery info to db
          let dQuery = `
            INSERT INTO delivery_data (uid, name, postal_code, city, address, mobile, date)
            VALUES (?, ?, ?, ?, ?, ?, NOW())
          `;
          let deliveryArr = [userID, name, pcode, city, address, mobile];
          conn.query(dQuery, deliveryArr, (err, result, field) => {
            if (err) {
              reject('Egy nem várt hiba történt, kérlek próbáld újra');
              return;
            }

            resolve('success');
          });
        });
      }).catch(err => {
        reject('Nincs ilyen termék')
      });
    }).catch(err => {
      reject('Nincs ilyen felhasználó');
    });
  });
}

module.exports = buyItem;
