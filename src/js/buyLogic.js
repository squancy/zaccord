const randomstring = require('randomstring');
const genItem = require('./includes/genItem.js');
const genDelivery = require('./includes/genDelivery.js');
const calcPrice = require('./includes/calcPrice.js');
const calcLitPrice = require('./includes/calcLitPrice.js');
const validateParams = require('./includes/validateParams.js');
const validateLitParams = require('./includes/validateLitParams.js');
const parseCookies = require('./includes/parseCookies.js');
const formatOrderId = require('./includes/formatOrderId.js');
const getPrice = require('./includes/modelPriceCalc/getPrice.js');
const constants = require('./includes/constants.js');
const NodeStl = require('node-stl');
const fs = require('fs');

// Shipping and money handle prices constants are used throughout the page
const SHIPPING_PRICE = constants.shippingPrice;
const MONEY_HANDLE = constants.moneyHandle;

const calcCPPrice = constants.calcCPPrice;
const getCoords = constants.getCoords;

// Build page where the customer can buy the products/custom print
const buildBuySection = (conn, paramObj, req) => {
  return new Promise((resolve, reject) => {
    // Generate random 8-char order ID
    let orderID = randomstring.generate({
      length: 4,
      charset: 'numeric'
    });

    let userID = req.user.id;

    // Order ID in a more readable form: formatOrderId(orderID)
    // Currently not used, if more orders come in we may need to format a longer sequence
    let orderIDDisplay = orderID;

    // Build html output
    let output = `
      <script type="text/javascript">
        const MONEY_HANDLE = ${MONEY_HANDLE};
      </script>
      <section class="keepBottom">
        <span id="main">
          <p class="blueHead" style="font-size: 24px; margin-top: 0;">
            1. Válassz Fizetési Módot
          </p>

          <label class="container trans" id="uvetCont">
            <div style="padding-bottom: 0;">Utánvétel</div>
            <div class="lh sel">
              Ez esetben a csomag kiszállítása után történik meg a fizetés készpénzzel vagy
              bankkártyával és a futárcég ${MONEY_HANDLE} Ft kezelési költséget számol fel.
            </div>
            <input type="radio" name="radio" id="uvet">
            <span class="checkmark"></span>
          </label>
          
          <label class="container trans" id="btransfer">
            <div style="padding-bottom: 0;">Banki előre utalás</div>
            <div class="lh sel">
              Ilyenkor az alábbi számlára való utalással fizethetsz:
              <span class="blue">11773449-02809630</span><br>
              Kedvezményezett neve: <span class="blue">Turcsán Edit</span><br>
              Fontos, hogy a közleményben tüntetsd fel az alábbi azonosítót:
              <span class="blue">${orderIDDisplay}</span>
            </div>
            <input type="radio" name="radio" id="transfer">
            <span class="checkmark"></span>
          </label>

          <p class="blueHead" style="font-size: 24px;">2. Termékek</p>
          <div id="emlHolder">
    `;

    // Calc parameters in connection with final price, discount, shipping...
    function calcPrices(price) {
      // Add 3% discount if order value is above 15000 Ft & free shipping
      // If product price is below 15000 Ft there is an extra 1450Ft shipping cost
      let discount = 1;
      let discountText = '';

      // Shipping text was used in a previous prototype, currently not in use
      // May reset it later
      let shippingText = `
        A 15000 Ft alatti rendeléseknél ${SHIPPING_PRICE} Ft-os szállítási költséget számolunk
        fel`;
      if (price > 15000) {
        discount = 0.97;
        shippingText = `A 15000 Ft feletti rendeléseknél ingyenes a szállítás`;
        discountText = '(3% kedvezmény)';
      }

      let actualShippingPrice = (price > 15000) ? 0 : SHIPPING_PRICE;
      return [discount, discountText, actualShippingPrice, shippingText];
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
          if (userID && id != userID && Number.isInteger(uid)) {
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

          // Get volume to calculate price
          let [W, H, D] = getCoords(filePath);
          let basePrice = calcCPPrice(W, H, D);
          let price = calcPrice(basePrice, rvas, suruseg, scale, fvas);
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

    // Build output for lithophanes
    function buildLitOutput(sphere, color, size, quantity, file) {
      return new Promise((resolve, reject) => {
          let output = '';
          let params = {
          'sphere': sphere,
          'color': color,
          'size': size,
          'quantity': quantity,
          'file': file
          };

          if (!validateLitParams(params))  {
          reject('Hibás paraméter érték heheheh');
          return;
          }

          let prodURL = '';
          let imgURL = 'printUploads/lithophanes/' + file;
          let price = calcLitPrice(size);
          let name = 'Litofánia'

          let data = {
            'orderID': orderID,
            'prodURL': prodURL,
            'imgURL': imgURL,
            'price': price,
            'name': name,
            'color': color,
            'size': size,
            'sphere': sphere,
            'file': file,
            'quantity': quantity,
            'fixProduct': false
          };

          let finalPrice = price * quantity;
          output += genItem(false, false, false, data, true);

          resolve([output, finalPrice, data]);
      }).catch(err => {
        console.log(err);
        reject('Egy nem várt hiba történt, kérlek próbáld újra');
        return;
        });
    }

    // Build the delivery info section
    function buildLastSection(userID, shippingText, finalPrice, discountText) {
      return new Promise((resolve, reject) => {
        let output = `
          </div>
          <p class="blueHead" style="font-size: 24px;">3. Szállítás Módja</p>
          <label class="container" id="toAddrHolder">
            <div style="padding-bottom: 0;">GLS házhozszállítás</div>
            <div class="lh sel">
            A futárszolgálat ilyenkor a megadott címre fogja szállítani a rendelt
            terméket/termékeket.<br>
            Szállítási költség: 15000Ft alatt +${SHIPPING_PRICE} Ft, felette ingyenes.
            </div>
            <input type="radio" name="radio2" id="toAddr">
            <span class="checkmark"></span>
          </label>
          
          <label class="container" id="packetPointHolder">
            <div style="padding-bottom: 0;">GLS csomagpont átvétel</div>
            <div class="lh sel">
            A futárszolgálat a vásárló által megadott csomagpontra fogja kézbesíteni a
            csomagot ami ezután lesz átvehető.<br>
            Szállítási költség: 15000Ft alatt +${SHIPPING_PRICE} Ft, felette ingyenes.
            </div>
            <div class="lh sel" id="selectedPP" style="color: #4285f4; display: none;"></div>
            <input type="radio" name="radio2" id="packetPoint">
            <span class="checkmark"></span>
          </label>

          <div id="glsBigBox"></div>
          <div class="overlay" id="overlay"></div>
          <img src="/images/icons/closeLight.svg" class="exitBtn trans" id="exitBtn"
            onclick="exitMap()">
        `;

        output += `
          <p class="blueHead" style="font-size: 24px;">4. Szállítási & Számlázási Adatok</p>
        `;

        let extraCharge = '';
        let charge = 0;
        if (finalPrice < 800) {
          charge = 800 - finalPrice;
          extraCharge = `<span>(+${charge} Ft felár)</span>`;
        }

        if (finalPrice < 15000) charge += SHIPPING_PRICE;

        genDelivery(conn, userID, !!userID).then(result => {
          output += result;

          // Provide 'different billing address' form
          output += `
            <div class="align" style="margin: 10px 0 20px 0;" id="normalBac">
              <label class="chCont">Cégként vásárolok
                <input type="checkbox" id="compNormal"
                  onchange="companyBilling('normalCompname', 'normalCompnum', 'normal',
                    'normalDiv')">
                <span class="cbMark"></span>
              </label>
            </div>
 
            <button class="btnCommon fillBtn pad centr" id="diffBilling">
              Eltérő számlázási cím
            </button>
            <div id="billingHolder">
              <div id="billingForm" class="flexDiv"
                style="margin-top: 10px; flex-wrap: wrap; justify-content: space-evenly;"
                data-status="close">
              </div>
            </div>
          `;

          // Shipping text is currently not used
          /*
            output += `
              <p class="note align ddgray" id="whoosh">
                ${shippingText}!
              </p>
            `;
          */

          output += `
              <p class="align">
                <label class="chCont note ddgray"
                  style="font-family: 'Roboto', sans-serif; font-size: 14px;">
                  Elolvastam és elfogadom az
                  <a href="/aszf" class="blueLink font14">Általános Szerződési Feltételeket</a>
                  <input type="checkbox" id="agree">
                  <span class="cbMark"></span>
                </label>
              </p>
              <p class="align">
                <label class="chCont note ddgray"
                  style="font-family: 'Roboto', sans-serif; font-size: 14px;">
                  Elolvastam és elfogadom az
                  <a href="/nyilatkozat" class="blueLink font14">Adatvédelmi Nyilatkozatot</a>
                  <input type="checkbox" id="agree2">
                  <span class="cbMark"></span>
                </label>
              </p>
              <p class="align bold" id="finalPrice">
                <span style="color: #4285f4;">
                  Végösszeg:
                </span>
                <span id="fPrice">${Math.round(finalPrice + charge)}</span>
                Ft ${discountText} ${extraCharge}
                (szállítással együtt)
              </p>
              <button class="fillBtn btnCommon centerBtn" style="margin-top: 20px;"
                onclick="submitOrder()" id="submitBtn">
                Megrendelés
              </button>
            </span>
            <div class="errorBox" id="errStatus"></div>
            <div class="successBox" id="succStatus"></div>
          `;
          resolve(output);
        }).catch(err => {
          console.log(err);
          reject('Egy nem várt hiba történt, kérlek próbáld újra');
          return;
        });
      });
    }

    // User buys a single product from items page or orders a custom print / lithophane
    if (Number.isInteger(Number(paramObj.product)) ||
      ['cp', 'lit'].indexOf(paramObj.product) > -1) {
      let product = Number.isInteger(paramObj.product) ? Number(paramObj.product) :
        paramObj.product;
      if (product != 'lit') {
        var rvas = Number(paramObj.rvas);
        var suruseg = Number(paramObj.suruseg);
        var color = paramObj.color;
        var scale = Number(paramObj.scale);
        var fvas = Number(paramObj.fvas);
        var quantity = Number(paramObj.q);
        var paramArr = [rvas, suruseg, color, scale, fvas, quantity];
      } else {
        var sphere = paramObj.sphere;
        var color = paramObj.color;
        var size = paramObj.size;
        var quantity = paramObj.q;
        var file = paramObj.file;
        var paramArr = [sphere, color, size, quantity, file];
      }

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

            // Extra charge below 800Ft
            if (finalPrice < 800) finalPrice += 800 - finalPrice;

            output += `
              </section>
              <script type="text/javascript">
                let data = ${JSON.stringify(data[2])};
                data[0].finalPrice = Math.round(${finalPrice});
                data[0].shippingPrice = ${shippingPrice};
                let isFromCart = true;
                let isFromCP = true;
                let isLoggedIn = ${userID ? true : false};
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
     
      if (product != 'lit') {
        paramArr = [product, rvas, suruseg, color, scale, fvas, quantity];
        buildItemOutput(false, userID, orderID, ...paramArr).then(data => {
          output += data[0]; 
          buildLastSection(userID, data[2], data[3], data[4]).then(lastOutput => {
            output += lastOutput;
            let finalPrice = data[3];

            // Extra charge below 800Ft
            if (finalPrice < 800) finalPrice += 800 - finalPrice;

            output += `
              </section>
              <script type="text/javascript">
                let data = [${JSON.stringify(data[1])}];
                data[0].finalPrice = Math.round(${finalPrice});
                data[0].shippingPrice = ${data[5]};
                let isFromCart = false;
                let isFromCP = false;
                let isLoggedIn = ${userID ? true : false};
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
      } else {
        buildLitOutput(...paramArr).then(data => {
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
            output += `
              <script type="text/javascript">
                let data = [${JSON.stringify(data[2])}];
                data[0].finalPrice = Math.round(${finalPrice});
                data[0].shippingPrice = ${shippingPrice};
                let isFromCart = false;
                let isFromCP = false;
                let isLit = true;
                let isLoggedIn = ${userID ? true : false};
              </script>
            `;
            output += '</section>';
            resolve(output);
          }).catch(err => {
            reject('Egy nem várt hiba történt, kérlek próbáld újra');
            return;
          });
        }).catch(err => {
          reject('Egy nem várt hiba történt, kérlek próbáld újra');
          return;
        });        
      }

    // Second case is when user buys the whole cart and data is fetched from cookies
    } else {
      // Make sure cookie is not empty
      let cItems = parseCookies(req).cartItems;
      if (!cItems) {
        cItems = '{}';
      }

      if (!Object.keys(JSON.parse(cItems)).length) {
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

        if (currentItem['sphere_' + id]) {
          var isLit = true;
          var sphere = currentItem['sphere_' + id];
          var size = currentItem['size_' + id];
          var file = currentItem['file_' + id];
        } else {
          var isLit = false;
          var rvas = Number(currentItem['rvas_' + id]);
          var suruseg = Number(currentItem['suruseg_' + id]);
          var scale = Number(currentItem['scale_' + id]);
          var fvas = Number(currentItem['fvas_' + id]);
        }

        let color = decodeURIComponent(currentItem['color_' + id]);
        let quantity = Number(currentItem['quantity_' + id]);

        // Check if current item in cart is a custom printed or a fixed product or a lithophane
        let paramArr = [itemID, rvas, suruseg, color, scale, fvas, quantity];
        if (id.split('_').length > 2 && !isLit) {
          isfcp = true;
          let paramArr = [rvas, suruseg, color, scale, fvas, quantity];
          var itemQuery = buildCPOutput(...paramArr, true, id);
        } else if (isLit) {
          let paramArr = [sphere, color, size, quantity, file];
          var itemQuery = buildLitOutput(...paramArr);
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
        if (finalPrice > 15000) {
          finalPrice *= 0.97;
        }
        
        let actualShippingPrice = (finalPrice > 15000) ? 0 : SHIPPING_PRICE;

        [discount, dText, shopPrice, sText] = calcPrices(finalPrice);
        buildLastSection(userID, sText, finalPrice, dText).then(lastOutput => {
          output += lastOutput;

          // Order with a total value of less than 800Ft will get a 800 - price extra charge
          if (finalPrice < 800) finalPrice += 800 - finalPrice;
          output += `
            </section>
            <script type="text/javascript">
              let data = ${JSON.stringify(pData)};
              data[0].finalPrice = Math.round(${finalPrice});
              data[0].shippingPrice = ${actualShippingPrice};
              let isFromCart = true;
              let isFromCP = false;
              let isLoggedIn = ${userID ? true : false};
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
