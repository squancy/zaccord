const parseCookies = require('./includes/parseCookies.js');
const calcPrice = require('./includes/calcPrice.js');
const escapeVars = require('./includes/escapeVars.js');
const calcLitPrice = require('./includes/calcLitPrice.js');
const fs = require('fs');

// Build cart page from cookies & validate them on server side
const buildCartSection = (conn, req) => {
  return new Promise((resolve, reject) => {
    // Check if cart is empty
    let cookies = parseCookies(req);
    if (!cookies.cartItems || Object.keys(JSON.parse(cookies.cartItems)).length === 0) {
      resolve(`
        <section class="keepBottom animate__animated animate__fadeIn">
          <img src="/images/empty_cart.png" class="emptyCart">
        </section>
      `);
      return;
    }

    // If not empty then loop through all items
    let cart = JSON.parse(cookies['cartItems']);
    let keys = Object.keys(cart).filter(prop => prop[0] != 'i');
    let queries = [];
    for (let key of keys) {
      let tid = key.replace('content_', '');
      let dbId = escapeVars(tid.split('_')[1]);
      let content = cart['content_' + tid]; 

      let rvas = content['rvas_' + tid];
      let suruseg = content['suruseg_' + tid];
      let color = content['color_' + tid];
      let scale = content['scale_' + tid];
      let fvas = content['fvas_' + tid];
      let quantity = content['quantity_' + tid];

      // Get the item from db & make sure it exists
      let isLit = false;
      let sqlQuery = new Promise((resolve, reject) => {
        conn.query("SELECT * FROM fix_products WHERE id = ? LIMIT 1", [dbId],
        function (err, result, fields) {
          if (err) {
            reject('Egy nem várt hiba történt, kérlek próbáld újra');
            return;
          }

          // Check if cookie item is a saved custom print
          if (result.length === 0 && tid.split('_').length > 2
            && !content.hasOwnProperty('file_' + tid)) {
            // Make sure there is such a file  
            let fPath = __dirname.replace('/src/js', '') + '/printUploads/' + tid + '.stl';
            let tPath = __dirname.replace('/src/js', '') + '/printUploads/thumbnails/' +
              tid + '.png';
            if (!fs.existsSync(fPath) || !fs.existsSync(tPath)) {
              reject('Nem létezik ilyen fájl');
              return;
            }

            var url = 'cart';
            var imgUrl = 'printUploads/thumbnails/' + tid + '.png';
            var productName = 'Bérnyomtatás Termék';
            var price = Number(content['price_' + tid]);

          // Check if cookie item is a lithophane
          } else if (result.length === 0 && content.hasOwnProperty('sphere_' + tid)) {
            isLit = true;
            let lithophaneFile = content['file_' + tid];

            // Make sure file exists
            let fPath = __dirname.replace('/src/js', '') + '/printUploads/lithophanes/'
              + lithophaneFile;

            // No such lithophane
            if (!fs.existsSync(fPath)) {
              reject('Nem létezik ilyen fájl');
              return;
            }

            var url = 'cart';
            var imgUrl = 'printUploads/lithophanes/' + lithophaneFile;
            var productName = 'Litofánia';
            var litSphere = content['sphere_' + tid];
            var litSize = content['size_' + tid];
            var litColor = content['color_' + tid];
          } else if (result.length === 0) {
            // Item is not found in db
            reject('Egy nem várt hiba történt, kérlek próbáld újra');
            return;
          } else {
            var id = result[0]['id'];
            var url = result[0]['url'];
            var imgUrl = result[0]['img_url'];
            var productName = result[0]['name'];
            var price = result[0]['price'];
          }

          // Calculate the actual price of the product with all extras
          if (!isLit) {
            console.log(quantity)
            var actualPrice = calcPrice(price, rvas, suruseg, scale, fvas);
            var selQuan = `updateSpecs(this, ${price}, '${tid}')`;
          } else {
            var actualPrice = calcLitPrice(content['size_' + tid]);
            var selQuan = `updateSpecs(this, ${price}, '${tid}', true)`;
            let splitted = litSize.split('x');

            // Calculate the ration of width and height of lithophane
            var ratio = Math.min(Number(splitted[0]) / Number(splitted[1]), 
              Number(splitted[1]) / Number(splitted[0]));

            // With the calculated ratio provide the possible sizes
            var litSizes = [100, 150, 200].map(v => {
              let middleParam = (v * ratio).toFixed(2);
              return `${v}mm x ${middleParam}mm x 2mm`;
            });
          }

          // Build html output
          let output = `
            <div class="cartItemHolder" id="cartItem_${tid}">
              <img src="/images/icons/delete.png" class="topRight trans"
                onclick="removeItem('${tid}')">
              <div class="itemLeftCenter">
                <a href="/${url}">
                  <div class="cartImgHolder bgCommon" style="background-image: url(/${imgUrl})">
                  </div>
                </a>
                <div style="padding: 10px;" class="hideText">
                  <p>
                    <a href="/${url}" class="linkTitle gotham">${productName}</a>
                  </p>
                </div>
              </div>

              <div class="flexDiv prodInfo">
                <div>
                  <p>Egységár: <span id="priceHolder_${tid}">${actualPrice}</span> Ft</p>
                </div>
          `;

          if (!isLit) {
            output += `
                  <div>
                    <p>
                      Rétegvastagság:
                      <select class="specSelect chItem" id="rvas${tid}"
                        onchange="updateSpecs(this, ${price}, '${tid}')">
            `;
            
            for (let vas of [0.12, 0.2, 0.28]) {
              let selected = vas == rvas ? 'selected' : '';
              output += `<option value="${vas}" ${selected}>${vas}mm</option>`;
            }

            output += `            
                      </select>
                    </p>
                  </div>
                  <div>
                    <p>
                      Sűrűség:
                      <select class="specSelect chItem" id="suruseg${tid}"
                        onchange="updateSpecs(this, ${price}, '${tid}')">
                      <option value="10">10%</option>
            `;

            for (let i = 20; i <= 80; i += 20) {
              let selected = i == suruseg ? 'selected' : '';
              output += `
                <option value="${i}" ${selected}>${i}%</option>
              `;
            }

            output += `
                      </select>
                    </p>
                  </div>
                  <div>
                    <p>
                      Méretezés:
                      <select class="specSelect chItem" id="scale${tid}"
                        onchange="updateSpecs(this, ${price}, '${tid}')">
            `;

            for (let i = 0.7; i <= 1.3; i += 0.3) {
              let selected = i == scale ? 'selected' : '';
              output += `
                <option value="${i.toFixed(1)}" ${selected}>x${i.toFixed(1)}</option>
              `; 
            }

            output += `
                      </select>
                    </p>
                  </div>
                  <div>
                    <p>
                      Falvastagság:
                      <select class="specSelect chItem" id="fvas${tid}"
                        onchange="updateSpecs(this, ${price}, '${tid}')">
            `;

            for (let i = 0.8; i <= 2.4; i += 0.4) {
              let selected = i.toFixed(1) == fvas ? 'selected' : '';
              output += `
                <option value="${i.toFixed(1)}" ${selected}>${i.toFixed(1)}mm</option>
              `; 
            }

            output += `
                      </select>
                    </p>
                  </div>
            `;

          } else {
            output += `
                <div>
                  <p> 
                    Forma:
                    <select class="specSelect chItem" id="sphere${tid}"
                      onchange="updateLit('sphere', 'sphere${tid}', '${tid}')">
            `;

            for (let c of ['Domború', 'Homorú', 'Sima']) {
              let selected = decodeURIComponent(litSphere) == c ? 'selected' : '';
              output += `
                <option value="${c}" ${selected}>${c}</option>
              `;
            }

            output += `
                      </select>
                    </p>
                  </div>
            `;

            output += `
                  <div>
                    <p> 
                      Méret:
                      <select class="specSelect chItem" id="size${tid}"
                        onchange="${selQuan}">
            `;

            for (let c of litSizes) {
              let pure = c.replace(/\s/g, '').replace(/mm/g, '');
              console.log(litSize, litSizes, c);
              let selected = pure == litSize ? 'selected' : '';
              output += `
                <option value="${pure}" ${selected}>
                  ${c}
                </option>
              `;
            }

            output += `
                      </select>
                    </p>
                  </div>
            `;
          }

          output += `
                <div>
                  <p> 
                    Szín:
                    <select class="specSelect chItem" id="color${tid}"
                      onchange="chColor(this, '${tid}')">
          `;

          for (let c of ['Fekete', 'Fehér', 'Kék', 'Piros', 'Zöld', 'Sárga']) {
            let selected = decodeURIComponent(color) == c ? 'selected' : '';
            output += `
              <option value="${c}" ${selected}>${c}</option>
            `;
          }

          output += `
                    </select>
                  </p>
                </div>
                <div>
                  <p>
                    Mennyiség:
                    <select class="specSelect chItem" id="quantity${tid}"
                      onchange="${selQuan}">
          `;

          for (let i = 1; i <= 10; i++) {
            let selected = quantity == i ? 'selected' : '';
            output += `
              <option value="${i}" ${selected}>${i}db</option>
            `;
          }

          output += `
                    </select>
                  </p>
                </div>
              <div>
                <p class="bold">Összesen: <span id="totpHolder_${tid}">
                  ${quantity * actualPrice}</span> Ft
                </p>
              </div>
            </div>
            <div class="clear"></div>
          </div>`;
        resolve([output, quantity * actualPrice]);
        });
      });      
      queries.push(sqlQuery);
    }

    // Build output if every promise has finished the SQL query
    Promise.all(queries).then(values => {
      let output = '<section class="keepBottom animate__animated animate__fadeIn" id="mcs">';
      let finalPrice = 0;
      for (let v of values) {
        output += v[0];
        finalPrice += v[1];
      }

      // If total price is above 15.000Ft give a 3% discount
      let discount = 1;
      if (finalPrice > 15000) {
        discount = 0.97;
      }

      let ePriceText = '<span id="extraPrice"></span>';
      let extraPrice = 0; 
      if (finalPrice < 500){
        extraPrice = 500 - finalPrice;
        finalPrice += extraPrice;
        ePriceText = `<span id="extraPrice">(+${extraPrice} Ft felár)</span>`;
      }

      finalPrice = `
        <span id="fPrice">
          ${Math.round(finalPrice * discount)}
        </span>
        Ft
      `;

      if (discount == 0.97) {
        finalPrice += '<span id="discount">(3% kedvezmény)</span>';
      } else {
        finalPrice += '<span id="discount"></span>';
      }

      output += `
        <p class="align bold" id="finalPrice">
          <span style="color: #4285f4;">
            Végösszeg:
          </span>
          ${finalPrice}
          ${ePriceText}
        </p>
        <div class="infoBox" id="infoLogin"></div>
        <button class="fillBtn btnCommon centerBtn" id="buyCart">Tovább a fizetéshez</button> 
      `;
      output += '</section>';
      output += `
        <script type="text/javascript">
          let isLoggedIn = ${req.user.id ? true : false};
        </script>
      `;
      resolve(output);
    });
  });
}

module.exports = buildCartSection;
