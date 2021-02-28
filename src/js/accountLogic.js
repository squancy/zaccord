const userExists = require('./includes/userExists.js');
const genDelivery = require('./includes/genDelivery.js');
const genOrder = require('./includes/genOrder.js');

// Build account page of a logged in user
const buildAccountSection = (conn, userID) => {
  return new Promise((resolve, reject) => {
    // Fetch user from database & make sure user exists in db
    userExists(conn, userID).then(data => {
      // Create html output 
      // First build 'orders so far': both fixed products & custom prints
      let output = `
        <section class="keepBottom">
      `;

      let sQuery = `
        SELECT o.price AS fprice, o.*, i.* FROM orders AS o LEFT JOIN fix_products AS i
        ON o.item_id = i.id WHERE o.uid = ? ORDER BY o.order_time DESC
      `;

      // Fetch items & parameters from db
      conn.query(sQuery, [userID], function getOrders(err, result, field) {
        if (err) {
          reject('Egy nem várt hiba történt, kérlek próbáld újra');
          return;
        }

        // No orders so far
        if (result.length < 1) {
          output += `
            <div>
              <img src="/images/icons/orderHistory.png" class="emptyCart">
              <p class="dgray align font22">
                Úgy tűnik, hogy eddig még nem adtál le rendelést
              </p>
            </div>
          `;
        }

        // Display orders 
        let showMoreBtn = '';
        genOrder(conn, userID, '3', true).then(data => {
          output += data;
          // Only show the last 3 orders and a button for showing previous orders
          if (result.length > 3) {
            showMoreBtn = `
              <div id="moreHolder" class="align">
                <button class="fillBtn btnCommon" id="moreOrders" style="margin: 0;">
                  További rendelések
                </button>
              </div>
              <div id="allOrders">
              </div>
              <p class="align note ddgray">
                A rendelés árak nem tartalmazzák a szállítási és egyéb költségeket!
              </p>
            `;
          }
        }).then(o => {
          // Now build 'delivery information' section
          // If user has already filled in the fields display them as values
          genDelivery(conn, userID).then(data => {
            output += showMoreBtn;
            output += `<hr class="hrStyle">`;
            output += data;
            output += `
              <div class="errorBox" id="errStatusDel"></div>
              <div class="successBox" id="succStatusDel"></div>
              <button class="fillBtn btnCommon centerBtn" id="cDel">
                Megváltoztatás
              </button>
              <p class="note align ddgray">
                A szállítási adatok megváltoztatása akárhányszor lehetséges és vásárláskor is 
                átírható!
              </p>
              <hr class="hrStyle">
              <div class="flexDiv" style="flex-wrap: wrap; justify-content: space-evenly;">
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
              <p class="note align ddgray">
                A jelszónak minimum 6 karakter hosszúnak kell lennie!
              </p>
            `;
            output += '</section>';
            resolve(output);
          });
        });
      });
    }).catch(err => {
      reject('Nincs ilyen felhasználó');
    });
  });
}

module.exports = buildAccountSection;
