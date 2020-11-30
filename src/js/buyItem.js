const validateEmail = require('email-validator');
const randomstring = require('randomstring');
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
const formatOrderId = require('./includes/formatOrderId.js');

// Shipping and money handle prices constants are used throughout the page
const SHIPPING_PRICE = constants.shippingPrice;
const MONEY_HANDLE = constants.moneyHandle;
const COUNTRIES = constants.countries;

// Validate order on server side & push to db
const buyItem = (conn, dDataArr, req, res, userSession) => {
  return new Promise((resolve, reject) => {
    // Extract data from form data obj
    let UID = req.user.id ? req.user.id : null;
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
    let isLoggedIn = dDataArr[0].isLoggedIn;
    let isLit = dDataArr[0].isLit;
    let emailTotPrice = dDataArr[0].emailTotPrice;
    let emailOutput = dDataArr[0].emailOutput;
    let nlEmail = dDataArr[0].nlEmail;

    console.log(dDataArr);

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

    // Validate billing info & credentials
    let billingType = dDataArr[0].billingType;
    let billingName = dDataArr[0].billingName;
    let billingCountry = dDataArr[0].billingCountry;
    let billingPcode = dDataArr[0].billingPcode ? Number(dDataArr[0].billingPcode) : 0;
    let billingCity = dDataArr[0].billingCity;
    let billingAddress = dDataArr[0].billingAddress;
    let billingCompname = dDataArr[0].billingCompname;
    let billingCompnum = dDataArr[0].billingCompnum;

    // Buy as a company but not with a different invoice address
    let normalCompname = dDataArr[0].normalCompname;
    let normalCompnum = dDataArr[0].normalCompnum;

    // Make sure both fields are set and valid
    if ((!normalCompname && normalCompnum) || (normalCompname && !normalCompnum)) {
      reject('Kérlek add meg mindkét adatot a cégről');
      return;
    }

    let billingEmail = 'Megegyezik a szállítási címmel';
    if (billingType !== 'same') {
      billingEmail = `
        <div><b>Név: </b>${billingName}</div>
        <div><b>Ország: </b>${billingCountry}</div>
        <div><b>Cím: </b>${billingPcode} ${billingCity}, ${billingAddress}</div>
      `;    

      if (billingCompname) {
        billingEmail += `
          <div><b>Cégnév: </b>${billingCompname}</div>
          <div><b>Adószám: </b>${billingCompnum}</div>
        `;
      }
    }

    let compInfo = '';
    if (normalCompname) {
      compInfo = `
        <div><b>Cégnév: </b>${normalCompname}</div>
        <div><b>Adószám: </b>${normalCompnum}</div>
      `;
    }

    if (billingType != 'same') {      
      if (!billingName || !billingCountry || !billingPcode || !billingCity || !billingAddress) {
        reject('Kérlek tölts ki minden számlázási adatot');
        return;
      } else if (COUNTRIES.indexOf(billingCountry) < 0) {
        // Make sure the country is in the list of supported countries
        reject('Kérlek válassz egy érvényes országot');
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

    runPurchase();

    function movePurchase() {
      return new Promise((resolve, reject) => {
        let commonDate = new Date().toMysqlFormat();

        for (let d of dDataArr) {
          localFinalPrice += d.price * d.quantity;
        }

        // Give discount for 15000 Ft < purchases and also an extra price for 800 Ft > purchases
        let discount = 0.97;
        if (localFinalPrice < 15000) discount = 1;
        if (localFinalPrice < 800) localFinalPrice += 800 - localFinalPrice;

        // Make sure the final price is valid
        if (Math.round(finalPrice) != Math.round(localFinalPrice * discount)) {
          reject('Hibás végösszeg');
          return;
        }

        if (!name || !city || !address || !mobile || !pcode || !payment) {
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

        console.log('huuuu')
        
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

          // Order id formatting is currently not used: See js/buyLogic.js why
          // formatOrderId(orderID)
          var orderIDDisplay = orderID;

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
          } else if (orderID.length !== 4) {
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
                  normal_compname, normal_compnum,
                  billing_name, billing_country, billing_city,
                  billing_pcode, billing_address, billing_compname, billing_comp_tax_num,
                  order_time)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,
                  ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
                UID, itemID, price, String(rvas), String(suruseg),
                String(scale), color, String(fvas), sphere, size, file, quantity, isTrans, 
                transID, fixProduct, 0,
                Number(shippingPrice), cpFname, isCashOnDel, packetDbID, uniqueID,
                sameBillingAddr, normalCompname, normalCompnum, billingName, billingCountry,
                billingCity, billingPcode, billingAddress, billingCompname, billingCompnum, 
                commonDate
              ];
              
              if (payment != 'transfer') {
                shippingPrice -= MONEY_HANDLE;
              }

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

          promises.push(process);
        }

        Promise.all(promises).then(data => {
          // Also update delivery info in db if needed
          if (isLoggedIn) {
            var dQuery = `
              UPDATE delivery_data
              SET name = ?, postal_code = ?, city = ?, address = ?, mobile = ?, nl_email = NULL,
              order_id = NULL, date = NOW() WHERE uid = ?
            `;
            var deliveryArr = [name, pcode, city, address, mobile, nlEmail, UID];
          } else {
            var dQuery = `
              INSERT INTO delivery_data (uid, name, postal_code, city, address, mobile,
              nl_email, order_id, date)
              VALUES (NULL, ?, ?, ?, ?, ?, ?, ?, NOW())
            `;
            var deliveryArr = [name, pcode, city, address, mobile, nlEmail, uniqueID];
          }

          conn.query(dQuery, deliveryArr, (err, result, field) => {
            if (err) {
              console.log(err);
              reject('Egy nem várt hiba történt, kérlek próbáld újra');
              return;
            }

            let eQuery = 'SELECT email FROM users WHERE id = ? LIMIT 1';
            conn.query(eQuery, [UID], (err, result, field) => {
              // On successful ordering, send customer a notification email
              // If query result is null then user is not in db -> get email from form field
              let email = result[0] ? result[0].email : nlEmail;
              let emailContent = `
                <p style="font-size: 24px;">Megkaptuk a rendelésed!</p>
                <p style="font-size: 16px;">
                  A rendelésedet és annak státuszát megtekintheted a Zaccord fiókodban.<br>
                  Köszönjük, hogy a Zaccordot választottad!
                </p>

                <hr style="border: 0;
                  height: 0;
                  border-top: 1px solid rgba(0, 0, 0, 0.1);
                  border-bottom: 1px solid rgba(255, 255, 255, 0.3);
                ">

                <div style="text-align: center; line-height: 1.7; width: 50%; float: left;">
                  <p style="font-weight: bold; font-size: 16px;">
                    Személyes & Szállítási Adatok
                  </p>
                  <div style="font-size: 14px;">
                    <div><b>Név: </b>${name}</div>
                    <div><b>Cím: </b>${pcode} ${city}, ${address}</div>
                    <div><b>Telefonszám: </b>${mobile}</div>
                    <div>
                      <b>Fizetési mód: </b>
                      ${payment == 'transfer' ? 'előre utalás' : 'utánvét'}
                      ${
                        payment == 'transfer' ? `(a közelményben tüntetsd fel az alábbi
                                                 utalási azonosítót:
                                                 <span style="color:
                                                 #4285f4;">${orderIDDisplay}</span>)
                                                 `
                                               : ''
                      }
                    </div>
                    <div>
                      <b>Átvétel: </b> ${deliveryType == 'toAddr'
                        ? 'Házhozszállítás' : 'Csomagpont átvétel'}
                    </div>
                    ${compInfo}
                  </div>
                </div>

                <div style="text-align: center; width: 50%; float: left; line-height: 1.7;">
                  <p style="font-weight: bold; font-size: 16px;">Számlázási Adatok</p>
                  <div style="font-size: 14px;">
                    ${billingEmail}
                  </div>
                </div>
                <div style="clear: both;"></div>
                <br>
                <p style="font-size: 14px; text-align: center;">
                  Az alábbi termék azonosítóval tudod nyomonkövetni a
                  rendelésed a Zaccord fiókodban:
                  <span style="color: #4285f4;">${uniqueID}</span>
                </p>

                <div style="font-size: 14px;">
                  ${emailOutput}
                </div>
                <b style="font-size: 16px;">${emailTotPrice}</b>
                <p style="color: #7d7d7d; font-size: 14px;">
                  Az oldalon feltüntetett árak tartalmazzák az áfát!
                </p>
                <p style="color: #7d7d7d; font-size: 14px;">
                  
                </p>
              `;

              let subject = 'Megkaptuk a rendelésed! - Azonosító: ' + uniqueID;
              sendEmail('info@zaccord.com', emailContent, email, subject);

              // Send a notification email to us about every new order
              //let ownerEmails = ['mark@pearscom.com', 'turcsanmate113@gmail.com'];
              let ownerEmails = [];
              let sj = 'Dől a zsé, jönnek a rendelők! - Azonosító: ' + uniqueID;
              let cnt = '<p style="font-size: 18px;">Új rendelés érkezett!</p>';
              for (let i = 0; i < ownerEmails.length; i++) {
                sendEmail('info@zaccord.com', cnt, ownerEmails[i], sj);
              }

              console.log('last part')
              
              resolve('success');
            });
          });
        });
      });
    }
  });
}

module.exports = buyItem;
