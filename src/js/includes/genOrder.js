const genItem = require('./genItem.js');

// Provide output for user orders
const genOrder = (conn, userID, limit = '3, 2147483647', threeLimit = false) => {
  return new Promise((resolve, reject) => {
    let sQuery = `
      SELECT o.price AS fprice, o.*, i.* FROM orders AS o LEFT JOIN fix_products AS i
      ON o.item_id = i.id WHERE o.uid = ? ORDER BY o.order_time DESC LIMIT ${limit}
    `;

    let output = '';

    conn.query(sQuery, [userID], function getOrders(err, result, field) {
      if (err) {
        reject('Egy nem várt hiba történt, kérlek próbáld újra');
        return;
      }

      let lim = result.length;
      if (threeLimit) lim = 3;

      // Loop through items and build UI
      for (let i = 0; i < lim; i++) {
        let itemID = result[i].item_id;
        let orderTime = result[i].order_time;
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
        let cpFname = result[i].cp_fname;
        let litSphere = result[i].lit_sphere;
        let litSize = result[i].lit_size;
        let litFname = result[i].lit_fname;

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
        
        if (cpFname) name = 'Bérnyomtatás';
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
          'paymentOption': paymentOption,
          'sphere': litSphere,
          'size': litSize,
          'file': litFname
        };
        
        output += genItem(true, true, true, data, isLit);
      }
      resolve(output);
    });
  });
}

module.exports = genOrder;
