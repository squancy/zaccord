const validateEmail = require('email-validator');
const userExists = require('./includes/userExists.js');
const itemExists = require('./includes/itemExists.js');
const calcPrice = require('./includes/calcPrice.js');
const validateParams = require('./includes/validateParams.js');
const validateLitParams = require('./includes/validateLitParams.js');
const parseCookies = require('./includes/parseCookies.js');
const parseTime = require('./includes/parseTime.js');
const sendEmail = require('./includes/sendEmail.js');
const userLogin = require('./loginLogic.js');
const userRegister = require('./registerLogic.js');

// Validate order on server side & push to db
const buyItem = (conn, dDataArr, req, res, userSession) => {
  return new Promise((resolve, reject) => {
    // Extract data from form data obj
    let name = dDataArr[0].name;
    let city = dDataArr[0].city;
    let address = dDataArr[0].address;
    let mobile = dDataArr[0].mobile;
    let pcode = Number(dDataArr[0].pcode);
    let payment = dDataArr[0].payment;
    let promises = [];
    let localFinalPrice = 0;
    let finalPrice = dDataArr[0].finalPrice;
    let shippingPrice = dDataArr[0].shippingPrice;
    let authType = dDataArr[0].authType;
    let isLit = dDataArr[0].isLit;

    if (authType) {
      var email = dDataArr[0].email;
      var pass = dDataArr[0].pass;
      var emailReg = dDataArr[0].emailReg;
      var passReg = dDataArr[0].passReg;
      var repassReg = dDataArr[0].repassReg;
    }
    
    // Validate billing info & credentials
    let billingType = dDataArr[0].billingType;
    let billingName = dDataArr[0].billingName;
    let billingCountry = dDataArr[0].billingCountry;
    let billingPcode = dDataArr[0].billingPcode ? Number(dDataArr[0].billingPcode) : 0;
    let billingCity = dDataArr[0].billingCity;
    let billingAddress = dDataArr[0].billingAddress;
    let billingCompname = dDataArr[0].billingCompname;
    let billingCompnum = dDataArr[0].billingCompnum;
    if (billingType != 'same') {      
      if (!billingName || !billingCountry || !billingPcode || !billingCity || !billingAddress) {
        reject('Kérlek tölts ki minden számlázási adatot');
        return;
      } else if (!Number.isInteger(billingPcode) || billingPcode < 1000 || 
        billingPcode > 9985) {
        reject('Kérlek valós irányítószámot adj meg');
        return;
      }
      
      if (billingType == 'diffYes') {
        if (!billingCompname || !billingCompnum) {
          reject('Kérlek tölts ki minden céges számlázási adatot');
          return;
        }
      }
    }

    // Handle user authentication if not logged in
    if (!authType) {
      var userID = req.user.id;
      runPurchase();
    } else if (authType == 'login') {
      if (!email || !pass) {
        reject('Adj meg minden bejelentkezési adatot');
        return;
      }

      let formData = {
        'email': email,
        'pass': pass
      };

      userLogin(conn, formData, req).then(data => {
        userSession(req, res, function uSession() {
          req.user.id = userID = data;
          runPurchase();
        });
      }).catch(err => {
        reject('Egy nem várt hiba történt, kérlek próbáld újra')
        return;
      });
    } else if (authType == 'register') {
      if (!emailReg || !passReg || !repassReg) {
        reject('Kérlek tölts ki minden mezőt');
        return;
      } else if (!validateEmail.validate(emailReg)) {
        reject('Kérlek valós emailt adj meg');
        return;
      } else if (passReg != repassReg) {
        reject('A jelszavak nem egyeznek');
        return;
      } else if (passReg.length < 6) {
        reject('A jelszónak minimum 6 karakterből kell állnia');
        return;
      }

      let formData = {
        'email': emailReg,
        'pass': passReg
      };

      userRegister(conn, formData, req).then(data => {
        // Auto log in user after successful registration
        userSession(req, res, function uSession() {
          req.user.id = userID = data;
          runPurchase();
        });
      }).catch(err => {
        reject(err);
        return;
      });
    }

    /*
      Common date for all items in order to indicate that all those items belongs to the same
      order
    */

    function runPurchase() {
      movePurchase().then(data => {
        resolve('success');
      }).catch(err => {
        reject(err);
        return;
      });
    }

    function movePurchase() {
      return new Promise((resolve, reject) => {
        let commonDate = new Date().toMysqlFormat();

        for (let d of dDataArr) {
          localFinalPrice += d.price * d.quantity;
        }

        // Give discount for 15000 Ft < purchases and also an extra price for 500 Ft > purchases
        let discount = 0.97;
        if (localFinalPrice < 15000) discount = 1;
        if (localFinalPrice < 500) localFinalPrice += 500 - localFinalPrice;

        // Make sure the final price is valid
        if (Math.round(finalPrice) != Math.round(localFinalPrice * discount)) {
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
          let rvas = formData.rvas ? formData.rvas : 0.2;
          let suruseg = formData.suruseg ? formData.suruseg : 20;
          let scale = formData.scale ? formData.scale : 1;
          let fvas = formData.fvas ? formData.fvas : 1.2;
          let color = formData.color;
          let quantity = formData.quantity;
          let orderID = formData.orderID;
          let fixProduct = Number(Boolean(formData.fixProduct));

          // Lithophane parameters
          let sphere = formData.sphere ? formData.sphere : '';
          let size = formData.size ? formData.size : '';
          let file = formData.file ? formData.file : '';

          // Check the validity of parameters
          if (!validateParams(formData) && !isLit) {
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
          // Validate lithophane parameters
          } else if (isLit) {
            let paramObj = {
              'sphere': sphere,
              'color': color,
              'quantity': quantity,
              'size': size,
              'file': file
            };

            if (!validateLitParams(paramObj)) {
              reject('Hibás paraméter érték');
              return;
            }
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
                    lit_sphere, lit_size, lit_fname,
                    quantity, is_transfer, transfer_id, is_fix_prod, status, shipping_price,
                    cp_fname, same_billing_addr, billing_name, billing_country, billing_city,
                    billing_pcode, billing_address, billing_compname, billing_comp_tax_num,
                    order_time)
                  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,
                    ?, ?, ?, ?)
                `;

                // Decide if product is a custom print (attach filename) or fixed product
                if (!fixProduct) {
                  itemID = 0;
                  var cpFname = formData.itemID;
                } else {
                  var cpFname = '';
                }
              
                price *= discount;
                console.log(cpFname);
                let sameBillingAddr = billingType == 'same' ? 1 : 0;
                let valueArr = [req.user.id, itemID, price, String(rvas), String(suruseg),
                  String(scale), color, String(fvas), sphere, size, file, quantity, isTrans, 
                  transID, fixProduct, 0,
                  Number(shippingPrice), cpFname, sameBillingAddr, billingName, billingCountry,
                  billingCity, billingPcode, billingAddress, billingCompname, billingCompnum, 
                  commonDate];
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
              sendEmail('weebshit@beetster.pearscom.com', emailContent, email, subject);
              
              resolve('success');
            });
          });
        });
      });
    }
  });
}

module.exports = buyItem;
