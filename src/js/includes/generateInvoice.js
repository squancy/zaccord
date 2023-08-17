const request = require('request');
const path = require('path');
const fs = require('fs');
const constants = require('./constants.js');
const addHours = require('./addHours.js');
const EUDateFormat = require('./EUDateFormat.js');
const shipping = require('./shippingConstants.js');
const BILLINGO_BLOCK_ID = constants.billingoBlockID;
const BILLINGO_CARD_NUM = constants.billingoCardNum;
const BILLINGO_PRODNUM_1 = constants.billingoProdnum1; 
const BILLINGO_PRODNUM_2 = constants.billingoProdnum2; 
const BILLINGO_PRODNUM_3 = constants.billingoProdnum3;
const BILLINGO_COD_ID = constants.billingoCodID;
const BILLINGO_DELIVERY_ID = constants.billingoDeliveryID;
const BILLINGO_API_KEY = constants.billingoAPIKey;
const MONEY_HANDLE = shipping.moneyHandle;

const createBillingoClient = require('@codingsans/billingo-client').createBillingoClient;

const client = createBillingoClient({
  apiKey: BILLINGO_API_KEY
});

function getData(result) {
  let name = result[0].name;
  let postalCode = result[0].postal_code;
  let city = result[0].city;
  let address = result[0].address;
  let mobile = result[0].mobile;
  return [name, postalCode, city, address, mobile];
}

const generateInvoice = (conn, formData) => {
  return new Promise((resolve, reject) => {
    // Get customer credentials from db
    const uniqueID = formData.uniqueID;
    const SHIPPING_PRICE = formData.shippingPrice;
    const isElectronic = formData.isElectronic;
    let cQuery = 'SELECT * FROM orders WHERE unique_id = ?';
    conn.query(cQuery, [uniqueID], (err, result, field) => {
      if (err) {
        reject('Nincs ilyen rendelés');
        return;
      }
      
      let isTransfer = Number(result[0].is_transfer);
      let isCard = result[0].transaction_id;
      let shippingPrice = result[0].shipping_price;
      let cashOnDel = result[0].is_cash_on_del;
      let sameBillingAddr = result[0].same_billing_addr;
      let compname = result[0].normal_compname;
      let compnum = result[0].normal_compnum;
      let billingName = result[0].billing_name;
      let billingCountry = result[0].billing_country;
      let billingCity = result[0].billing_city;
      let billingPcode = result[0].billing_pcode;
      let billingAddress = result[0].billing_address;
      let billingCompname = result[0].billing_compname;
      let billingCompTaxNum = result[0].billing_comp_tax_num;
      let orderTime = result[0].order_time;

      let common = {
        'unit_price_type': 'gross',
        'unit': 'db',
        'vat': '0%',
        'entitlement': 'AAM'
      };

      let items = [];

      for (let row of result) {
        let name;
        if (row.lit_fname) {
          name = 'Litofánia';
        } else if (row.cp_fname) {
          name = 'Bérnyomtatott Termék';
        } else {
          name = '3D Nyomtatott Termék';
        }

        items.push({
          'name': '3D Nyomtatott Termék',
          'unit_price': row.price,
          'quantity': row.quantity,
          ...common
        });
      }

      console.log(shippingPrice)
      
      let uid = result[0].uid;
      let customerData;
      // Customer purchased without creating an account
      if (!uid) {
        customerData = new Promise((resolve, reject) => {
          let sQuery = 'SELECT * FROM delivery_data WHERE order_id = ? LIMIT 1';
          conn.query(sQuery, [uniqueID], (err, result, field) => {
            if (err) {
              reject([]);
            }

            let email = result[0].nl_email;
            resolve([...getData(result), email]);
          });
        });
      } else {
        // Customer purchased with an account
        customerData = new Promise((resolve, reject) => {
          let sQuery = `
            SELECT u.email, d.* FROM delivery_data AS d LEFT JOIN users AS u ON d.uid = u.id
            WHERE u.id = ? LIMIT 1`;
          conn.query(sQuery, [uid], (err, result, field) => {   
            if (err) {
              console.log(err)
              reject([]);
            }
            console.log(result)
            let email = result[0].email;
            resolve([...getData(result), email]);
          });
        });
      }
      
      let proceed = new Promise((resolve, reject) => {
        customerData.then(credentials => {
          let [name, postalCode, city, address, mobile, email] = credentials;
          let invoiceData = {
            name: billingCompname || compname || billingName || name,
            address: {
              country_code: 'HU',
              post_code: billingPcode || postalCode,
              city: billingCity || city,
              address: billingAddress || address
            },
            phone: mobile,
            emails: [email],
            taxcode: billingCompTaxNum || compnum || ''
          };

          console.log(billingCompname, compname, name);

          client.partners.create(invoiceData).then(data => {
            let pid = data.id;
            let dt = new Date();
            let today = EUDateFormat(dt).split(' ')[0];
            let dueDate = EUDateFormat(addHours(dt, 8 * 24)).split(' ')[0];
            let paymentMethod, paymentStatus = 'paid';
            if (isTransfer) {
              paymentMethod = 'elore_utalas';
            } else if (isCard) {
              paymentMethod = 'bankcard';
            } else {
              paymentMethod = 'cash_on_delivery';
              paymentStatus = 'outstanding';
            }

            let fdata = {
              partner_id: pid,
              block_id: BILLINGO_BLOCK_ID,
              bank_account_id: BILLINGO_CARD_NUM,
              type: 'invoice',
              fulfillment_date: today,
              due_date: dueDate,
              payment_method: paymentMethod, // cash_on_delivery, elore_utalas, bankcard
              payment_status: paymentStatus, // paid, none, outstanding
              language: 'hu',
              currency: 'HUF',
              electronic: isElectronic,
              items: items
            }; 
            
            let mhandle = {
              name: 'Utánvét',
              quantity: 1,
              unit_price: MONEY_HANDLE,
              ...common
            };

            let sprice = {
              name: 'Szállítás',
              quantity: 1,
              unit_price: SHIPPING_PRICE,
              ...common
            };
            
            if (shippingPrice == MONEY_HANDLE) {
              // Customer only pays a cash on delivery price, shipping is free
              items.push(mhandle);
            } else if (shippingPrice == SHIPPING_PRICE) {
              // Customer only pays shipping price since he/she payed in advance
              items.push(sprice);
            } else if (shippingPrice != 0) {
              items.push(sprice);
              items.push(mhandle);
            }

            fdata.items = items;
            resolve(fdata);
          }).catch(err => {
            console.log(err['response']['data']['errors']);
            reject('failed');
          });
        }).catch(err => {
          reject(err);
          return;
        });
      }).then(fdata => {
        console.log(fdata);
        client.documents.create(fdata).then(resp => {
          console.log(resp);
          if (!isElectronic) {
            resolve('success');
          } else {
            const options = {
              url: `https://api.billingo.hu/v3/documents/${resp.id}/download`,
              headers: {
                'Accept': 'application/pdf',
                'X-API-KEY': BILLINGO_API_KEY,
              },
              responseType: 'arraybuffer',
              responseEncoding: 'binary',
              encoding: null
            };
            
            setTimeout(function downloadPDF() {
              request(options, (err, res, body) => {
                let pathName = path.join(__dirname, '..', '..', '..', 'e-invoices', uniqueID + '.pdf');
                fs.writeFile(pathName, body, err => {
                  if (err) {
                    console.log(err);
                    reject(err);
                  }
                  resolve('success');
                });
              });
            }, 10 * 1000);
          }
        }).catch(err => {
          console.log(err.response.data);
          reject(err);
        });
      }).catch(err => {
        console.log(err);
      });
    });
  }).catch(err => {
    console.log('error:', err);
    return false;
  });
}

module.exports = generateInvoice;
