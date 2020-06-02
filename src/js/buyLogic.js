const randomstring = require('randomstring');
const genItem = require('./includes/genItem.js');
const genDelivery = require('./includes/genDelivery.js');
const calcPrice = require('./includes/calcPrice.js');
const validateParams = require('./includes/validateParams.js');

// Build page where the customer can buy the products/custom print
const buildBuySection = (conn, paramObj, userID) => {
  return new Promise((resolve, reject) => {
    let product = Number(paramObj.product);
    let rvas = Number(paramObj.rvas);
    let suruseg = Number(paramObj.suruseg);
    let color = paramObj.color;
    let scale = Number(paramObj.scale);
    let fvas = Number(paramObj.fvas);
    let quantity = Number(paramObj.q);

    // First case is when user buys a single product from items page 
    if (Number.isInteger(product)) {
      // Get the product with that id from database & validate parameters
      let cQuery = 'SELECT * FROM fix_products WHERE id = ? LIMIT 1'; 
      conn.query(cQuery, [product], (err, result, field) => {
        if (err) {
          reject('Egy nem várt hiba történt, kérlek próbáld újra');
          return;
        }

        if (result.length < 1) {
          // Product does not exist
          reject('Nincs ilyen termék');
          return;
        }

        // Product exists, now validate params
        if (!validateParams(paramObj)) {
          reject('Hibás paraméter érték');
          return;
        }

        // Generate random 8-char order ID
        let orderID = randomstring.generate(8);

        let prodURL = result[0]['url'];
        let itemID = result[0]['id'];
        let imgURL = result[0]['img_url'];
        let price = result[0]['price'];
        let name = result[0]['name'];

        let data = {
          'userID': userID,
          'fix_product': true,
          'orderID': orderID,
          'itemID': itemID,
          'prodURL': prodURL,
          'imgURL': imgURL,
          'price': calcPrice(price, rvas, suruseg, scale, fvas),
          'originalPrice': price,
          'name': name,
          'rvas': rvas,
          'suruseg': suruseg,
          'scale': scale,
          'color': color,
          'fvas': fvas,
          'quantity': quantity
        };

        // Add 3% discount if order value is above 15000 Ft
        let discount = 1;
        let discountText = '';
        if (data.price * quantity > 15000) {
          discount = 0.97;
          discountText = '(3% kedvezmény)';
        }

        let finalPrice = data.price * quantity * discount;

        // Build html output
        let output = `
          <section class="keepBottom">
            <span id="main">
        `;

        output += `
          <p class="blueHead" style="font-size: 24px;">1. Válassz fizetési módot</p>
          <label class="container">
            <div style="padding-bottom: 0;">Utánvétel</div>
            <div>
              Ez esetben a csomag kiszállítása után történik meg a fizetés készpénzzel vagy
              bankkártyával.
            </div>
            <input type="radio" name="radio" id="uvet">
            <span class="checkmark"></span>
          </label>

          <label class="container">
            <div style="padding-bottom: 0;">Előre utalás</div>
            <div>
              Ilyenkor az alábbi számlára való utalással fizethetsz: 12001008-00238600-00100004.
              Fontos, hogy a közleményben tüntetsd fel az alábbi azonosítót:
              <span class="blue">${orderID}</span>
            </div>
            <input type="radio" name="radio" id="transfer">
            <span class="checkmark"></span>
          </label>


          <p class="blueHead" style="font-size: 24px;">2. Termékek</p>
        `;

        output += genItem(false, false, false, data);
        output += `
          <p class="blueHead" style="font-size: 24px;">3. Szállítási adatok</p>
        `;

        genDelivery(conn, userID).then(result => {
          output += result;
          output += `
            <p class="align" id="finalPrice">
              <span style="color: #4285f4;">
                Végösszeg:
              </span>
              ${Math.round(finalPrice)} Ft ${discountText}
            </p>
              <button class="fillBtn btnCommon centerBtn" style="margin-top: 20px;"
                onclick="submitOrder()">
                Vásárlás
              </button>
            </span>
            <div class="errorBox" id="errStatus"></div>
            <div class="successBox" id="succStatus"></div>
            <p class="note align" id="whoosh">
              <span class="blue">Megjegyzés:</span> a vásárlás fizetési kötelezettségeket von
              maga után!
            </p>
          `;
          output += `
            </section>
            <script type="text/javascript">
              let data = ${JSON.stringify(data)};
            </script>
          `;
          resolve(output);
        }).catch(err => {
          reject('Egy nem várt hiba történt, kérlek próbáld újra');
          return;
        });
      });
    }
  });
}

module.exports = buildBuySection;
