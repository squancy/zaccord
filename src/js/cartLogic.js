const parseCookies = require('./includes/parseCookies.js');
const calcPrice = require('./includes/calcPrice.js');

// Build the index page from fixed products
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
      let dbId = tid.split('_')[1];
      let content = cart['content_' + tid]; 
      let rvas = content['rvas_' + tid];
      let suruseg = content['suruseg_' + tid];
      let color = content['color_' + tid];
      let scale = content['scale_' + tid];
      let fvas = content['fvas_' + tid];
      let quantity = content['quantity_' + tid];

      /*
        Check for the integrity of these values: if a value is empty do not display the item
        This will cause an error when ordering a product
        Cookie values might be changed on the client-side
      */
      if (!content || !rvas || !suruseg || !color || !scale || !fvas || !quantity) {
        continue;
      }

      let sqlQuery = new Promise((resolve, reject) => {
        conn.query("SELECT * FROM fix_products WHERE id = ? LIMIT 1", [dbId],
        function (err, result, fields) {
          if (err) {
            reject('Egy nem várt hiba történt, kérlek próbáld újra');
            return;
          }

          let id = result[0]['id'];
          let url = result[0]['url'];
          let imgUrl = result[0]['img_url'];
          let productName = result[0]['name'];
          let price = result[0]['price'];

          // Calculate the actual price of the product with all extras
          let actualPrice = calcPrice(price, rvas, suruseg, scale, fvas);

          let output = `
            <div class="cartItemHolder" id="cartItem_${tid}">
              <img src="/images/icons/delete.png" class="topRight"
                onclick="removeItem('${tid}')">
              <div class="itemLeftCenter">
                <a href="/${url}">
                  <div class="cartImgHolder bgCommon" style="background-image: url(/${imgUrl})">
                  </div>
                </a>
                <div style="padding: 10px;" class="hideText">
                  <p>
                    <a href="/${url}" class="linkTitle">${productName}</a>
                  </p>
                </div>
              </div>

              <div class="flexDiv prodInfo">
                <div>
                  <p>Egységár: <span id="priceHolder_${tid}">${actualPrice}</span> Ft</p>
                </div>
                <div>
                  <p>
                    Rétegvastagság:
                    <select class="specSelect chItem" id="rvas${tid}"
                      onchange="updateSpecs(this, ${price}, '${tid}')">
          `;
          
          for (let vas of [0.12, 0.16, 0.2, 0.28]) {
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
          `;

          for (let i = 10; i <= 100; i += 10) {
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
                    Szín:
                    <select class="specSelect chItem" id="color${tid}"
                      onchange="chColor(this, '${tid}')">
          `;

          for (let c of ['Fekete', 'Fehér', 'Kék', 'Piros', 'Zöld', 'Sárga']) {
            let selected = color == c ? 'selected' : '';
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
                      onchange="updateSpecs(this, ${price}, '${tid}')">
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
                  <p>
                    Falvastagság:
                    <select class="specSelect chItem" id="fvas${tid}"
                      onchange="updateSpecs(this, ${price}, '${tid}')">
          `;

          for (let i = 0.4; i <= 3.6; i += 0.8) {
            let selected = i == fvas ? 'selected' : '';
            output += `<option value="${i.toFixed(1)}" ${selected}>${i.toFixed(1)}mm</option>`; 
          }

          output += `
                    </select>
                  </p>
                </div>
                <div>
                  <p>Összesen: <span id="totpHolder_${tid}">
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
        <p class="align" id="finalPrice">
          <span style="color: #4285f4;">
            Végösszeg:
          </span>
          ${finalPrice}
        </p>
        <button class="borderBtn btnCommon centerBtn" id="buyCart">Vásárlás</button> 
      `;
      output += '</section>';
      resolve(output);
    });
  });
}

module.exports = buildCartSection;
