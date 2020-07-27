const validateEmail = require('email-validator');
const userExists = require('./includes/userExists.js');
const itemExists = require('./includes/itemExists.js');
const calcPrice = require('./includes/calcPrice.js');
const makeInline = require('./includes/makeInline.js');
const validateParams = require('./includes/validateParams.js');
const validateLitParams = require('./includes/validateLitParams.js');
const constants = require('./includes/constants.js');
const parseCookies = require('./includes/parseCookies.js');
const parseTime = require('./includes/parseTime.js');
const sendEmail = require('./includes/sendEmail.js');
const userLogin = require('./loginLogic.js');
const userRegister = require('./registerLogic.js');

// Shipping and money handle prices constants are used throughout the page
const SHIPPING_PRICE = constants.shippingPrice;
const MONEY_HANDLE = constants.moneyHandle;

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
    let emailTotPrice = dDataArr[0].emailTotPrice;
    let emailOutput = dDataArr[0].emailOutput;

    // Replace classes & ids with inline CSS for emails
    emailOutput = makeInline(emailOutput);
    let uniqueID = Math.round(Math.random() * Math.pow(10, 12));

    // Fields about packet points
    let deliveryType = dDataArr[0].delivery;
    let packetID = dDataArr[0].ppID;
    let packetName = dDataArr[0].ppName;
    let packetZipcode = dDataArr[0].ppZipcode;
    let packetCity = dDataArr[0].ppCity;
    let packetAddress = dDataArr[0].ppAddress;
    let packetContact = dDataArr[0].ppContact;
    let packetPhone = dDataArr[0].ppPhone;
    let packetEmail = dDataArr[0].ppEmail;
    let packetLat = dDataArr[0].ppLat;
    let packetLon = dDataArr[0].ppLon;

    // Because of async queries a track variable is needed for packet point checking in db
    let ppUpdated = false;

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

    let billingEmail = 'Megegyezik a szállítási címmel';
    if (billingType !== 'same') {
      billingEmail = `
        <div><b>Név: </b>${billingName}</div>
        <div><b>Ország: </b>${billingCountry}</div>
        <div><b>Irsz.: </b>${billingPcode}</div>
        <div><b>Város: </b>${billingCity}</div>
        <div><b>Cím: </b>${billingAddress}</div>
      `;    

      if (billingCompname) {
        billingEmail += `
          <div><b>Cégnév: </b>${billingCompname}</div>
          <div><b>Adószám: </b>${billingCompnum}</div>
        `;
      }
    }

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
        } else if ((finalPrice <= 15000 && shippingPrice != SHIPPING_PRICE)
          || (finalPrice > 15000 && shippingPrice != 0)) {
          reject('Hibás szállítási ár');
          return;
        // Make sure delivery type is valid
        } else if (deliveryType != 'toAddr' && deliveryType != 'packetPoint') {
          reject('Válassz szállítási módot');
          return;
        // Make sure that the necessary packet point fields are set
        } else if (deliveryType == 'packetPoint' && (!packetID || !packetName || !packetZipcode
          || !packetCity || !packetAddress)) {
          reject('Hiányzó csomagpont adatok');
          return;          
        }
        
        let cnt = 0;
        for (let formData of dDataArr) {
          let itemID = formData.itemID;
          let price = formData.price;
          let rvas = formData.rvas ? formData.rvas : 0.2;
          let suruseg = formData.suruseg ? formData.suruseg : 20;
          let scale = formData.scale ? formData.scale : 1;
          let fvas = formData.fvas ? formData.fvas : 1.2;
          let color = formData.color;
          let quantity = formData.quantity;
          var orderID = formData.orderID;
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

                // If cash on delivery add extra price
                if (payment != 'transfer') {
                  shippingPrice += MONEY_HANDLE;
                }

                let iQuery = `
                  INSERT INTO orders (uid, item_id, price, rvas, suruseg, scale, color, fvas,
                    lit_sphere, lit_size, lit_fname,
                    quantity, is_transfer, transfer_id, is_fix_prod, status, shipping_price,
                    cp_fname, is_cash_on_del, packet_id, unique_id, same_billing_addr, 
                    billing_name, billing_country, billing_city,
                    billing_pcode, billing_address, billing_compname, billing_comp_tax_num,
                    order_time)
                  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,
                    ?, ?, ?, ?, ?, ?, ?)
                `;

                // Decide if product is a custom print (attach filename) or fixed product
                if (!fixProduct) {
                  itemID = 0;
                  var cpFname = formData.itemID;
                } else {
                  var cpFname = '';
                }
              
                price *= discount;
                let sameBillingAddr = billingType == 'same' ? 1 : 0;
                let isCashOnDel = deliveryType == 'toAddr' ? 1: 0;
                let packetDbID = deliveryType == 'packetPoint' ? packetID : '';

                let valueArr = [
                  req.user.id, itemID, price, String(rvas), String(suruseg),
                  String(scale), color, String(fvas), sphere, size, file, quantity, isTrans, 
                  transID, fixProduct, 0,
                  Number(shippingPrice), cpFname, isCashOnDel, packetDbID, uniqueID,
                  sameBillingAddr, billingName, billingCountry,
                  billingCity, billingPcode, billingAddress, billingCompname, billingCompnum, 
                  commonDate
                ];

                conn.query(iQuery, valueArr, (err, result, field) => {
                  if (err) {
                    console.log(err, 'asd');
                    reject('Egy nem várt hiba történt, kérlek próbáld újra');
                    return;
                  }

                  // If delivery type if packet point insert contact info to db
                  if (deliveryType == 'packetPoint') {
                    // First check if the packet point is already in the db
                    // If it is, just update the existing row
                    // Otherwise insert the packet point as a new row

                    let mQuery = `
                      SELECT id FROM packet_points WHERE packet_id = ? LIMIT 1
                    `;

                    conn.query(mQuery, [packetID], (err, result, fields) => {
                      if (err) {
                        reject('Egy nem várt hiba történt, kérlek próbáld újra');
                        return;
                      } 

                      // Check existance in db
                      if (result.length > 0) {
                        // Update data in db
                        let updateQuery = `
                          UPDATE packet_points SET name = ?, zipcode = ?,
                          city = ?, contact = ?, phone = ?, email = ?, lat = ?, lon = ?
                          WHERE packet_id = ?
                        `;

                        let updateParams = [
                          packetName, packetZipcode, packetCity, packetContact, packetPhone,
                          packetEmail, packetLat, packetLon, packetID
                        ];

                        conn.query(updateQuery, updateParams, (err, result, fields) => {
                          if (err) {
                            reject('Egy nem várt hiba történt, kérlek próbáld újra');
                            return;
                          }                    

                          resolve('success');
                        });

                      // Only insert to db for the 1st time (because of async)
                      } else if (!ppUpdated) {
                        let pQuery = `
                          INSERT INTO packet_points (
                            packet_id, name, zipcode, city, contact, phone, email, lat, lon
                          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                        `;

                        // Insert packet point data as a new row
                        let pValues = [
                          packetID, packetName, Number(packetZipcode), packetCity,
                          packetContact,
                          packetPhone, packetEmail, packetLat, packetLon
                        ];

                        ppUpdated = true;
                        conn.query(pQuery, pValues, function packetInsert(err, result, field) {
                          if (err) {
                            reject('Egy nem várt hiba történt, kérlek próbáld újra');
                            return;
                          }                    
                          
                          resolve('success');
                        });
                      }
                    });
                  } else {
                    resolve('success');
                  }
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

                <hr style="border: 0;
                  height: 0;
                  border-top: 1px solid rgba(0, 0, 0, 0.1);
                  border-bottom: 1px solid rgba(255, 255, 255, 0.3);
                ">

                <div style="text-align: center;">
                  <p style="font-weight: bold; font-size: 16px;">
                    Személyes & Szállítási adatok
                  </p>
                  <div style="display: table; margin: 0 auto;">
                    <div><b>Név: </b>${name}</div>
                    <div><b>Város: </b>${city}</div>
                    <div><b>Cím: </b>${address}</div>
                    <div><b>Telefonszám: </b>${mobile}</div>
                    <div><b>Irsz.: </b>${pcode}</div>
                    <div><b>Azonosító: </b>${uniqueID}</div>
                    <div>
                      <b>Fizetési mód: </b>
                      ${payment == 'transfer' ? 'Előre utalás' : 'Utánvét'}
                      ${
                        payment == 'transfer' ? `(a közelményben tüntetsd fel az alábbi
                                                 azonosítót:
                                                 <span style="color: #4285f4;">
                                                   ${orderID}
                                                 </span>)
                                                 `
                                               : ''
                      }
                    </div>
                  </div>
                </div>

                <div style="text-align: center;">
                  <p style="font-weight: bold; font-size: 16px;">Számlázási adatok</p>
                  <div style="display: table; margin: 0 auto;">
                    ${billingEmail}
                  </div>
                </div>
                <br>

                ${emailOutput}
                <b style="font-size: 16px;">${emailTotPrice}</b>
                <p style="color: #7d7d7d;">Az oldalon feltüntetett árak tartalmazzák az ÁFÁt!</p>
              `;

              let subject = 'Megkaptuk a rendelésed! - Azonosító: ' + uniqueID;
              sendEmail('info@zaccord.com', emailContent, email, subject);
              
              resolve('success');
            });
          });
        });
      });
    }
  });
}

module.exports = buyItem;
