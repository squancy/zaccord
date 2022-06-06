const genItem = require('./genItem.js');
const addHours = require('./addHours.js');
const EUDateFormat = require('./EUDateFormat.js');

// Provide output for user orders
const genOrder = (conn, userID, limit = '3, 2147483647', threeLimit = false) => {
  return new Promise((resolve, reject) => {
    let sQuery = `
      SELECT o.price AS fprice, o.*, i.* FROM orders AS o LEFT JOIN fix_products AS i
      ON o.item_id = i.id WHERE o.uid = ? ORDER BY o.order_time DESC
    `;

    let output = '';

    conn.query(sQuery, [userID], function getOrders(err, result, field) {
      if (err) {
        reject('Egy nem várt hiba történt, kérlek próbáld újra');
        return;
      }

      if (result.length === 0) {
        resolve(output);
        return;
      }

      let lim = result.length;
      let startVal = 0;
      if (threeLimit) lim = result.length > 3 ? 3 : result.length;
      else startVal = 3;

      // Loop through items and build UI
      let orderNum = 1;
      for (let i = startVal; i < lim; i++) {
        let itemID = result[i].item_id;
        let orderTime = EUDateFormat(addHours(result[i].order_time, 2));
        let prodURL = result[i].url;
        let imgURL = result[i].img_url;
        let price = result[i].fprice;
        let size = result[i].size;
        let name = result[i].name;
        let rvas = result[i].rvas;
        let suruseg = result[i].suruseg;
        let scale = result[i].scale;
        let color = result[i].color;
        let fvas = result[i].fvas;
        let quantity = result[i].quantity;
        let stat = Boolean(result[i].status);
        let paymentOption = Boolean(result[i].is_transfer);
        let transID = result[i].transaction_id;
        let cpFname = result[i].cp_fname;
        let litSphere = result[i].lit_sphere;
        let litSize = result[i].lit_size;
        let litFname = result[i].lit_fname;
        let uniqueID = result[i].unique_id;
        let tech = result[i].printTech;
        
        let finalPO;
        if (transID) {
          finalPO = 'bankkártyás fizetés';
        } else if (paymentOption) {
          finalPO = 'előre utalás';
        } else {
          finalPO = 'utánvét';
        }

        /*
          If an order is a custom print item id is 0 and cp_fname is the name of the .stl
          file & its thumbnail img
        */
       
        prodURL = !itemID ? 'account' : prodURL;
        let isLit = true ? litFname : false;
        if (cpFname) {
          imgURL = 'printUploads/thumbnails/' + cpFname + '.png';
        } else if (litFname) {
          imgURL = 'printUploads/lithophanes/' + litFname;
        }
        
        if (cpFname) name = 'Bérnyomtatott Termék';
        else if (litFname) name = 'Litofánia';

        let data = {
          'orderTime': orderTime,
          'prodURL': prodURL,
          'imgURL': imgURL,
          'price': price,
          'size': size,
          'name': name,
          'rvas': rvas,
          'suruseg': suruseg,
          'scale': scale,
          'color': color,
          'fvas': fvas,
          'quantity': quantity,
          'stat': stat,
          'finalPO': finalPO,
          'sphere': litSphere,
          'size': litSize,
          'file': litFname,
          'uid': uniqueID,
          'tech': tech
        };
        
        if ((i == 0) || result[i].unique_id != result[i - 1].unique_id) {
          let invoiceLink = '';
          if (result[i].e_invoice) {
            invoiceLink = `
              - <a class="blueLink font20" href="/e-invoices/${uniqueID}.pdf" target="_blank">E-számla letöltés</a>
            `;
          }
          output += `
            <p class="gotham font20 group">Rendelés (${orderTime.substring(0, 10)}) ${invoiceLink}</p>
          `;
        }

        output += genItem(true, true, true, data, isLit, true);
      }
      resolve(output);
    });
  });
}

module.exports = genOrder;
