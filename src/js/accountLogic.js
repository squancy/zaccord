const userExists = require('./includes/userExists.js');
const genItem = require('./includes/genItem.js');
const genDelivery = require('./includes/genDelivery.js');

// Build account page of a logged in user
const buildAccountSection = (conn, userID) => {
  return new Promise((resolve, reject) => {
    // Fetch user from database & make sure user exists in db
    userExists(conn, userID).then(data => {
      // Create html output 
      // First build 'orders so far'
      let output = `
        <section class="keepBottom">
          <p class="mainTitle">Rendelések & Felhasználói adatok</p>
      `;

      let sQuery = `
        SELECT o.*, i.* FROM orders AS o LEFT JOIN fix_products AS i
          ON o.item_id = i.id WHERE o.uid = ?
      `;

      conn.query(sQuery, [userID], function getOrders(err, result, field) {
        if (err) {
          reject('Egy nem várt hiba történt, kérlek próbáld újra');
          return;
        }

        // No orders so far
        if (result.length < 1) {
          output += `
            <p class="blue align">Úgy tűnik, hogy eddig még nem adtál le rendelést</p>
          `;
        }
        
        // Loop through items and build UI
        for (let i = 0; i < result.length; i++) {
          let orderTime = result[i]['order_time'];
          let prodURL = result[i]['url'];
          let imgURL = result[i]['img_url'];
          let price = result[i]['price'];
          let size = result[i]['size'];
          let name = result[i]['name'];
          let rvas = result[i]['rvas'];
          let suruseg = result[i]['suruseg'];
          let scale = result[i]['scale'];
          let color = result[i]['color'];
          let fvas = result[i]['fvas'];
          let quantity = result[i]['quantity'];
          let stat = Boolean(result[i]['status']);
          let paymentOption = Boolean(result[i]['is_transfer']);

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
            'paymentOption': paymentOption
          };

          output += genItem(true, true, true, data);
        }

        // Now build 'delivery information' section
        // If user has already filled in the fields display them as values
        genDelivery(conn, userID).then(data => {
          output += '<hr class="hrStyle">';
          output += data;
          output += `
            <div class="errorBox" id="errStatusDel"></div>
            <div class="successBox" id="succStatusDel"></div>
            <button class="fillBtn btnCommon centerBtn" id="cDel">
              Megváltoztatás
            </button>
            <p class="note align">
              <span class="blue">Megjegyzés:</span> a szállítási adatok megváltoztatása
              akárhányszor lehetséges és vásárláskor is átírható!
            </p>
            <hr class="hrStyle">
            <div class="flexDiv" style="flex-wrap: wrap;">
              <input type="password" class="dFormField" id="cpass"
                placeholder="Jelenlegi jelszó">
              <input type="password" class="dFormField" id="pass" placeholder="Új jelszó">
              <input type="password" class="dFormField" id="rpass" placeholder="Jelszó újra">
            </div>
            <div class="errorBox" id="errStatusPass"></div>
            <div class="successBox" id="succStatusPass"></div>
            <button class="fillBtn btnCommon centerBtn" id="cPass">
              Megváltoztatás
            </button>
            <p class="note align">
              <span class="blue">Megjegyzés:</span> a jelszónak minimum 6 karakter hosszúnak
              kell lennie!
            </p>
          `;
          output += '</section>';
          resolve(output);
        });
      });
    }).catch(err => {
      reject('Nincs ilyen felhasználó');
    });
  });
}

module.exports = buildAccountSection;
