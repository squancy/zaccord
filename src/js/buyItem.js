const userExists = require('./includes/userExists.js');
const itemExists = require('./includes/itemExists.js');
const calcPrice = require('./includes/calcPrice.js');
const validateParams = require('./includes/validateParams.js');
const parseCookies = require('./includes/parseCookies.js');
const parseTime = require('./includes/parseTime.js');
const sendEmail = require('./includes/sendEmail.js');

// Validate order on server side & push to db
const buyItem = (conn, dDataArr, req) => {
  return new Promise((resolve, reject) => {
    // Extract data from form data obj
    let name = dDataArr[0].name;
    let city = dDataArr[0].city;
    let address = dDataArr[0].address;
    let mobile = dDataArr[0].mobile;
    let pcode = Number(dDataArr[0].pcode);
    let payment = dDataArr[0].payment;
    let promises = [];
    let userID = req.user.id;
    let localFinalPrice = 0;
    let finalPrice = dDataArr[0].finalPrice;
    let shippingPrice = dDataArr[0].shippingPrice;

    /*
      Common date for all items in order to indicate that all those items belongs to the same
      order
    */
    let commonDate = new Date().toMysqlFormat();

    for (let d of dDataArr) {
      localFinalPrice += d.price * d.quantity;
    }

    let discount = 0.97;
    if (localFinalPrice < 15000) discount = 1;
    if (localFinalPrice < 1500) localFinalPrice += 1500;

    if (Math.round(finalPrice) != Math.round(localFinalPrice * discount)) {
      console.log(finalPrice, localFinalPrice * discount)
      console.log(dDataArr)
      reject('Hibás végösszeg');
      return;
    }

    // Make sure user is logged in
    if (!userID) {
      reject('Jelentkezz be'); 
      return;
    // Make sure none of the delivery vars is empty
    } else if (!name || !city || !address || !mobile || !pcode || !payment) {
      reject('Hiányzó szállítási információ'); 
      return;
    // Validate postal code
    } else if (!Number.isInteger(pcode) || pcode < 1000 || pcode > 9985) {
      reject('Hibás irányítószám'); 
      return;
    // Make sure there is a valid shipping price
    } else if ((finalPrice <= 15000 && shippingPrice != 1450)
      || (finalPrice > 15000 && shippingPrice != 0)) {
      reject('Hibás szállítási ár');
      return;
    }

    for (let formData of dDataArr) {
      let itemID = formData.itemID;
      let price = formData.price;
      let rvas = formData.rvas;
      let suruseg = formData.suruseg;
      let scale = formData.scale;
      let color = formData.color;
      let fvas = formData.fvas;
      let quantity = formData.quantity;
      let orderID = formData.orderID;
      let fixProduct = Number(Boolean(formData.fixProduct));

      // Check the validity of parameters
      if (!validateParams(formData)) {
        reject('Hibás paraméterek');
        return;
      // Make sure payment option is valid
      } else if (payment != 'uvet' && payment != 'transfer') {
        reject('Hibás fizetési mód');
        return;
      // Check validity of order ID
      } else if (orderID.length !== 8) {
        reject('Hibás utalási azonosító');
        return;
      } 

      // Make sure user exists in db with the given ID
      userExists(conn, userID).then(data => {
        // Make sure item exists with the given ID  
        let process = new Promise((resolve, reject) => {
          // When ordering a custom print we do not check the existance of item in db
          let handler = itemExists(conn, itemID, true);
          if (fixProduct) {
            handler = itemExists(conn, itemID);
          }

          handler.then(data => {
            if (data != 'success') {
              let originalPrice = data[0].price;
              if (calcPrice(originalPrice, rvas, suruseg, scale, fvas) != price) {
                // Check if price is correct with the given parameters
                reject('Hibás ár'); 
                return;
              }
            }

            // Request is valid, push data to db
            let isTrans = payment == 'transfer' ? 1 : 0;
            let transID = isTrans ? orderID : '';
            let iQuery = `
              INSERT INTO orders (uid, item_id, price, rvas, suruseg, scale, color, fvas,
                quantity, is_transfer, transfer_id, is_fix_prod, status, shipping_price,
                cp_fname, order_time)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;

            // Decide if product is a custom print (attach filename) or fixed product
            if (!fixProduct) {
              itemID = 0;
              var cpFname = formData.itemID;
            } else {
              var cpFname = '';
            }
          
            price *= discount;
            let valueArr = [req.user.id, itemID, price, String(rvas), String(suruseg),
              String(scale), color, String(fvas), quantity, isTrans, transID, fixProduct, 0,
              Number(shippingPrice), cpFname, commonDate];
            conn.query(iQuery, valueArr, (err, result, field) => {
              if (err) {
                console.log(err, 'asd');
                reject('Egy nem várt hiba történt, kérlek próbáld újra');
                return;
              }

              resolve('success');
            });
          });
        }).catch(err => {
          console.log(err);
          reject('Nincs ilyen termék');
        });
      }).catch(err => {
        reject('Nincs ilyen felhasználó');
      });

      promises.push(process);
    }

    Promise.all(promises).then(data => {
      // Also update delivery info in db if needed
      let dQuery = `
        UPDATE delivery_data
        SET name = ?, postal_code = ?, city = ?, address = ?, mobile = ?, date = NOW()
        WHERE uid = ?
      `;
      let deliveryArr = [name, pcode, city, address, mobile, req.user.id];
      conn.query(dQuery, deliveryArr, (err, result, field) => {
        if (err) {
          console.log(err);
          reject('Egy nem várt hiba történt, kérlek próbáld újra');
          return;
        }

        let eQuery = 'SELECT email FROM users WHERE id = ? LIMIT 1';
        conn.query(eQuery, [req.user.id], (err, result, field) => {
          // On successful ordering, send customer a notification email
          let email = result[0].email;
          let emailContent = `
            <p style="font-size: 22px;">Megkaptuk a rendelésed!</p>
            <p>
              A rendelésedet és annak státuszát megtekintheted a Zaccord fiókodban.<br>
              Köszönjük, hogy a Zaccordot választottad!
            </p>
          `;
          let subject = 'Megkaptuk a rendelésed!';
          sendEmail('info@zaccord.com', emailContent, email, subject);
          
          resolve('success');
        });
      });
    });
  });
}

module.exports = buyItem;
