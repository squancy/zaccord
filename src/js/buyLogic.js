const randomstring = require('randomstring');
const genItem = require('./includes/genItem.js');
const genDelivery = require('./includes/genDelivery.js');
const calcPrice = require('./includes/calcPrice.js');
const validateParams = require('./includes/validateParams.js');
const parseCookies = require('./includes/parseCookies.js');
const NodeStl = require('node-stl');
const fs = require('fs');

// Build page where the customer can buy the products/custom print
const buildBuySection = (conn, paramObj, req) => {
  return new Promise((resolve, reject) => {
    // Generate random 8-char order ID
    let orderID = randomstring.generate(8);
    let userID = req.user.id;

    // Make sure page is accessed when user is logged in
    if (!userID) {
      reject('Kérlek jelentkezz be');
      return;
    }

    // Build html output
    let output = `
      <section class="keepBottom">
        <span id="main">
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

    // Calc parameters in connection with final price, discount, shipping...
    function calcPrices(price) {
      // Add 3% discount if order value is above 15000 Ft & free shipping
      // If product price is below 15000 Ft there is an extra 1450Ft shipping cost
      let discount = 1;
      let discountText = '';
      let shippingPrice = 1450;
      let shippingText = `
        a 15000 Ft alatti rendeléseknél 1450 Ft-os szállítási költséget számolunk fel`;
      if (price > 15000) {
        discount = 0.97;
        shippingPrice = 0;
        shippingText = `a 15000 Ft feletti rendeléseknél ingyenes a szállítás`;
        discountText = '(3% kedvezmény)';
      }
      return [discount, discountText, shippingPrice, shippingText];
    }

    // Reusable promise for generating a single item for output
    function buildItemOutput(isCrt, userID, orderID, product, rvas, suruseg, color, scale, fvas,
      quantity) {
      return new Promise((resolve, reject) => {
        // Get the product with that id from database & validate parameters
        let cQuery = 'SELECT * FROM fix_products WHERE id = ? LIMIT 1'; 
        conn.query(cQuery, [product], (err, result, field) => {
          if (err) {
            reject('Egy nem várt hiba történt, kérlek próbáld újra');
            return;
          }

          // Product does not exist
          if (result.length < 1) {
            reject('Nincs ilyen termék');
            return;
          }

          // Product exists, now validate params
          if (!validateParams(paramObj)) {
            reject('Hibás paraméter érték');
            return;
          }

          let prodURL = result[0]['url'];
          let itemID = result[0]['id'];
          let imgURL = result[0]['img_url'];
          let price = result[0]['price'];
          let name = result[0]['name'];

          let data = {
            'orderID': orderID,
            'itemID': itemID,
            'prodURL': prodURL,
            'imgURL': imgURL,
            'price': calcPrice(price, rvas, suruseg, scale, fvas),
            'name': name,
            'rvas': rvas,
            'suruseg': suruseg,
            'scale': scale,
            'color': color,
            'fvas': fvas,
            'quantity': quantity,
            'fixProduct': true
          };

          // Calculate shipping price & final price
          let total = data.price * quantity;
          let discount, discountText, shippingPrice, shippingText;
          [discount, discountText, shippingPrice, shippingText] = calcPrices(total);
 
          let finalPrice = data.price * quantity * discount;
          if (isCrt) {
            finalPrice *= 1 / discount
          }

          // Generate html output
          let output = genItem(false, false, false, data);

          if (!isCrt) {
            resolve([output, data, shippingText, finalPrice, discountText, shippingPrice]);
          } else {
            resolve([output, data, finalPrice]);
          }
        });
      });
    }

    function buildCPOutput(rvas, suruseg, color, scale, fvas, quantity, isFromCrt = false,
      fname = false) {
      return new Promise((resolve, reject) => {
        // Validate params
        if (!validateParams(paramObj)) {
          reject('Hibás paraméter érték');
          return;
        }

        // Validate files
        if (!isFromCrt) {
          var files = paramObj.files.split(',');
        } else {
          var files = [fname];
        }
        let finalPrice = 0;
        let output = '';
        let dataAll = [];
        for (let i = 0; i < files.length; i++) {
          let file = files[i];
          let uid = Number(file.split('_')[0]);

          // Make sure file belongs to user TODO: check id
          if (uid != userID && Number.isInteger(uid)) {
            reject('Hibás felhasználó');
            return;
          }

          // Now make sure that file & its thumbnail exist in directory if prefix is uid
          let filePath = __dirname.replace('/src/js', '') + '/printUploads/' + file + '.stl';
          let thPath = __dirname.replace('/src/js', '') + '/printUploads/thumbnails/'
            + file + '.png';
          if (!fs.existsSync(filePath) || !fs.existsSync(thPath)) {
            reject('Nincs ilyen fájl');
            return;
          }
         
          // Get weight to calculate price
          let stl = new NodeStl(filePath);
          let weight = (stl.weight).toFixed(2);
          let price = calcPrice(Math.round(weight * 60), rvas, suruseg, scale, fvas);
          finalPrice += price * quantity;
         
          // Build image path for thumbnail
          thPath = thPath.split('/');
          thPath = (thPath[thPath.length - 3] + '/' + thPath[thPath.length - 2] + '/' +
            thPath[thPath.length - 1]); 

          let pName = 'Bérnyomtatás Termék #' + (i + 1);
          if (isFromCrt) pName = 'Bérnyomtatás Termék';

          var data = {
            'orderID': orderID,
            'itemID': file,
            'prodURL': '#',
            'imgURL': thPath,
            'price': price,
            'name': pName,
            'rvas': rvas,
            'suruseg': suruseg,
            'scale': scale,
            'color': color,
            'fvas': fvas,
            'quantity': quantity,
            'fixProduct': false
          };

          output += genItem(false, false, false, data);
          dataAll.push(data);
        }
        if (isFromCrt) dataAll = data;
        resolve([output, finalPrice, dataAll]);
      });
    }

    // Build the delivery info section
    function buildLastSection(userID, shippingText, finalPrice, discountText) {
      return new Promise((resolve, reject) => {
        let output = `
          <p class="blueHead" style="font-size: 24px;">3. Szállítási adatok</p>
        `;

        let extraCharge = '';
        let charge = 0;
        if (finalPrice < 1000) {
          charge = 1000 - finalPrice;
          extraCharge = `<span>(+${charge} Ft felár)</span>`;
        }

        if (finalPrice < 15000) charge += 1450;

        genDelivery(conn, userID).then(result => {
          output += result;
          output += `
            <p class="note align" id="whoosh">
              <span class="blue">Megjegyzés:</span> ${shippingText}!
            </p>
            <p class="align" id="finalPrice">
              <span style="color: #4285f4;">
                Végösszeg:
              </span>
              ${Math.round(finalPrice + charge)} Ft ${discountText} ${extraCharge}
              (szállítással együtt)
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
          resolve(output);
        }).catch(err => {
          console.log(err);
          reject('Egy nem várt hiba történt, kérlek próbáld újra');
          return;
        });
      });
    }

    // User buys a single product from items page or orders a custom print
    if (Number.isInteger(Number(paramObj.product)) || paramObj.product === 'cp') {
      let product = Number.isInteger(paramObj.product) ? Number(paramObj.product) :
        paramObj.product;
      let rvas = Number(paramObj.rvas);
      let suruseg = Number(paramObj.suruseg);
      let color = paramObj.color;
      let scale = Number(paramObj.scale);
      let fvas = Number(paramObj.fvas);
      let quantity = Number(paramObj.q);
      let paramArr = [rvas, suruseg, color, scale, fvas, quantity];

      if (product === 'cp') {
        // Build product output
        buildCPOutput(...paramArr).then(data => {
          output += data[0];
          let finalPrice = data[1];
          let discount, discountText, shippingPrice, shippingText;
          [discount, discountText, shippingPrice, shippingText] = calcPrices(finalPrice);

          // Check if customer gets a discount 
          if (finalPrice > 15000) {
            finalPrice *= 0.97;
          } 

          buildLastSection(userID, shippingText, finalPrice, discountText).then(lastOutput => {
            output += lastOutput;

            // Extra charge below 1000Ft
            if (finalPrice < 1000) finalPrice += 1000 - finalPrice;

            output += `
              </section>
              <script type="text/javascript">
                let data = ${JSON.stringify(data[2])};
                data[0].finalPrice = Math.round(${finalPrice});
                data[0].shippingPrice = ${shippingPrice};
                let isFromCart = true;
                let isFromCP = true;
              </script>
            `;
            resolve(output);
          }).catch(err => {
            console.log(err);
            reject('Egy nem várt hiba történt, kérlek próbáld újra');
            return;
          });
        }).catch(err => {
          console.log(err);
          reject('Egy nem várt hiba történt, kérlek próbáld újra');
          return;
        });
        return;
      }
      
      paramArr = [product, rvas, suruseg, color, scale, fvas, quantity];
      buildItemOutput(false, userID, orderID, ...paramArr).then(data => {
        output += data[0]; 
        buildLastSection(userID, data[2], data[3] + data[5], data[4]).then(lastOutput => {
          output += lastOutput;
          let finalPrice = data[3];

          // Extra charge below 1000Ft
          if (finalPrice < 1000) finalPrice += 1000 - finalPrice;

          output += `
            </section>
            <script type="text/javascript">
              let data = [${JSON.stringify(data[1])}];
              data[0].finalPrice = Math.round(${finalPrice});
              data[0].shippingPrice = ${data[5]};
              let isFromCart = false;
              let isFromCP = false;
            </script>
          `;
          resolve(output);
        }).catch(err => {
          console.log(err);
          reject('Egy nem várt hiba történt, kérlek próbáld újra');
          return;
        });
      }).catch(err => {
        console.log(err);
        reject('Egy nem várt hiba történt, kérlek próbáld újra');
        return;
      });

    // Second case is when user buys the whole cart and data is fetched from cookies
    } else {
      // Make sure cookie is not empty
      if (!Object.keys(JSON.parse(parseCookies(req).cartItems)).length) {
        reject('Üres a kosarad');
        return;
      }
      // Get data from cookies and validate on server side
      let cartItems = JSON.parse(parseCookies(req).cartItems);

      // Iterate over all items & build a promise array
      let promises = [];
      let isfcp = false;
      for (let key of Object.keys(cartItems).filter(el => el[0] != 'i')) {
        let currentItem = cartItems[key];
        let id = key.replace('content_', '');
        let itemID = Number(id.split('_')[1]);

        let rvas = Number(currentItem['rvas_' + id]);
        let suruseg = Number(currentItem['suruseg_' + id]);
        let color = decodeURIComponent(currentItem['color_' + id]);
        let scale = Number(currentItem['scale_' + id]);
        let fvas = Number(currentItem['fvas_' + id]);
        let quantity = Number(currentItem['quantity_' + id]);

        // Check if current item in cart is a custom printed or a fixed product
        let paramArr = [itemID, rvas, suruseg, color, scale, fvas, quantity];
        if (id.split('_').length > 2) {
          isfcp = true;
          let paramArr = [rvas, suruseg, color, scale, fvas, quantity];
          var itemQuery = buildCPOutput(...paramArr, true, id);
        } else {
          let paramArr = [itemID, rvas, suruseg, color, scale, fvas, quantity];
          var itemQuery = buildItemOutput(true, userID, orderID, ...paramArr);
        }
        promises.push(itemQuery);
      }

      // Implement a gate and wait for all promises to finish
      Promise.all(promises).then(values => {
        let finalPrice = 0;
        let pData = [];
        for (let v of values) {
          output += v[0];
          if (typeof v[2] === 'object') {
            finalPrice += v[1];
            pData.push(v[2]);
          } else {
            finalPrice += v[2];
            pData.push(v[1]);
          }
        }
     
        // Get shipping price & build delivery section
        let discount, dText, shopPrice, sText;
        let shippingPrice = 1450;
        if (finalPrice > 15000) {
          finalPrice *= 0.97;
          shippingPrice = 0; 
        }

        [discount, dText, shopPrice, sText] = calcPrices(finalPrice);
        buildLastSection(userID, sText, finalPrice, dText).then(lastOutput => {
          output += lastOutput;

          // Order with a total value of less than 1000Ft will get a 1000 - price extra charge
          if (finalPrice < 1000) finalPrice += 1000 - finalPrice;
          output += `
            </section>
            <script type="text/javascript">
              let data = ${JSON.stringify(pData)};
              data[0].finalPrice = Math.round(${finalPrice});
              data[0].shippingPrice = ${shippingPrice};
              let isFromCart = true;
              let isFromCP = false;
            </script>
          `;
          resolve(output);
        }).catch(err => {
          console.log(err);
          reject('Egy nem várt hiba történt, kérlek próbáld újra');
          return;
        });
      }).catch(err => {
          console.log(err);
        reject('Egy nem várt hiba történt, kérlek próbáld újra');
        return;
      });
    }
  });
}

module.exports = buildBuySection;
