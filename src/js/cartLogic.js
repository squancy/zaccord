const parseCookies = require('./includes/parseCookies.js');
const calcPrice = require('./includes/calcPrice.js');
const escapeVars = require('./includes/escapeVars.js');
const calcLitPrice = require('./includes/calcLitPrice.js');
const shouldAllowSLA = require('./includes/allowSLA.js');
const calcSLAPrice = require('./includes/calcSLAPrice.js');
const getColors = require('./includes/getColors.js');
const getMaterials = require('./includes/getMaterials.js');
const fs = require('fs');
const path = require('path');
const constants = require('./includes/constants.js');
const specParams = require('./includes/specParams.js');
const shipping = require('./includes/shippingConstants.js');
const LAYER_WIDTH_VALUES = specParams.layerHeight;
const INFILL_VALUES = specParams.infill;
const LAYER_WIDTH_VALUES_SLA = specParams.layerHeightSLA;
const INFILL_VALUES_SLA = specParams.infillSLA;
const PRINT_TECHS = constants.printTechs;
const LIT_FORMS = constants.litForms;
const SCALE_VALUES = specParams.scale;
const WALL_WIDTH_VALUES = specParams.wallWidth;
const SLA_MULTIPLIER = constants.slaMultiplier;
const MAX_QUANTITY = constants.maxQuantity;
const MIN_QUANTITY = constants.minQuantity;
const DISCOUNT = constants.discount;
const FREE_SHIPPING_LIMIT = shipping.freeShippingLimit;

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

    let matPromise = getMaterials(conn);
    let colorsPromise = getColors(conn);

    Promise.all([matPromise, colorsPromise]).then(vals => {
      const PRINT_MULTS = vals[0];
      const [PCOLORS, _] = vals[1];

      // If not empty then loop through all items
      let cart = JSON.parse(cookies['cartItems']);
      let keys = Object.keys(cart).filter(prop => prop[0] != 'i');
      let queries = [];
      let tidsArr = [];
      for (let key of keys) {
        let tid = key.replace('content_', '');
        tidsArr.push(tid);
        let dbId = escapeVars(tid.split('_')[1]);
        let content = cart['content_' + tid]; 

        let rvas = content['rvas_' + tid];
        let suruseg = decodeURIComponent(content['suruseg_' + tid]);
        let color = content['color_' + tid];
        let scale = content['scale_' + tid];
        let fvas = content['fvas_' + tid];
        let quantity = content['quantity_' + tid];
        let printMat = content['printMat_' + tid];
        let printTech = content['tech_' + tid];

        //let isCP = printTech == 'FDM' || printTech == 'SLA';
        let isSLA = printTech == 'SLA';

        // Get the item from db & make sure it exists
        let isLit = content.hasOwnProperty('sphere_' + tid);
        let isCP = tid.split('_').length > 2 && !isLit;
        let isFixProd = !isLit && !isCP;
        let allowSLA;
        let sqlQuery = new Promise((resolve, reject) => {
          conn.query("SELECT * FROM fix_products WHERE id = ? LIMIT 1", [dbId],
          function (err, result, fields) {
            if (err) {
              reject('Egy nem várt hiba történt, kérlek próbáld újra');
              return;
            }

            // Check if cookie item is a saved custom print
            if (isCP && tid.split('_').length > 2
              && !content.hasOwnProperty('file_' + tid)) {
              // Make sure there is such a file  
              let fPath = path.join(__dirname.replace(path.join('src', 'js'), ''),
                'printUploads', tid + '.stl');
              let tPath = path.join(__dirname.replace(path.join('src', 'js'), ''),
                'printUploads', 'thumbnails', tid + '.png');
              if (!fs.existsSync(fPath) || !fs.existsSync(tPath)) {
                reject('Nem létezik ilyen fájl');
                return;
              }

              var url = 'uploadPrint?file=' + tid;
              var imgUrl = 'printUploads/thumbnails/' + tid + '.png';
              var productName = 'Bérnyomtatott Termék';
              var price = Number(content['price_' + tid]);
              allowSLA = shouldAllowSLA(fPath, scale);

            // Check if cookie item is a lithophane
            } else if (result.length === 0 && content.hasOwnProperty('sphere_' + tid)) {
              let lithophaneFile = content['file_' + tid];

              // Make sure file exists
              let fPath = path.join(__dirname.replace(path.join('src', 'js'), ''),
                'printUploads', 'lithophanes', lithophaneFile);

              // No such lithophane
              if (!fs.existsSync(fPath)) {
                reject('Nem létezik ilyen fájl');
                return;
              }

              var url = 'uploadPrint?image=' + tid;
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
              let cp = printMat ? printMat : false;
              if (printTech == 'SLA') {
                var actualPrice = calcSLAPrice(Math.round(price * SLA_MULTIPLIER), rvas, suruseg, scale);
              } else {
                var actualPrice = calcPrice(PRINT_MULTS, price, rvas, suruseg, scale, fvas, cp);
              }
              if (isFixProd) {
                var selQuan = `updateSpecs(this, ${price}, '${tid}')`;
              } else if (isLit) {
                var selQuan = `updateSpecs(this, ${price}, '${tid}', true)`;
              } else if (printTech != 'SLA') {
                var selQuan = `updateSpecs(this, ${price}, '${tid}', false, true)`;
              } else {
                var selQuan = `updateSpecs(this, ${price}, '${tid}', false, true, true)`;
              }
            } else {
              var actualPrice = calcLitPrice(content['size_' + tid]);
              var selQuan = `updateSpecs(this, ${price}, '${tid}', true)`;
              let splitted = litSize.split('x');

              // Calculate the ratio of width and height of lithophane
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
                <img src="/images/icons/moreClose.svg" class="topRight trans"
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

                <div class="flexDiv prodInfo" id="uniqueCont_${tid}">
                  <div id="unitPrice_${tid}">
                    <p>Egységár: <span id="priceHolder_${tid}">${actualPrice}</span> Ft</p>
                  </div>
            `;
            
            if (!isLit) {
              if (printTech != 'SLA') {
                output += `
                      <div>
                        <p>
                          Rétegvastagság:
                          <select class="specSelect chItem" id="rvas${tid}"
                            onchange="updateSpecs(this, ${price}, '${tid}', false, ${isCP})">
                `;
                
                for (let vas of LAYER_WIDTH_VALUES) {
                  let selected = vas == rvas ? 'selected' : '';
                  output += `<option value="${vas.toFixed(2)}" ${selected}>${vas.toFixed(2)}mm</option>`;
                }

                output += `            
                          </select>
                        </p>
                      </div>
                      <div>
                        <p>
                          Sűrűség:
                          <select class="specSelect chItem" id="suruseg${tid}"
                            onchange="updateSpecs(this, ${price}, '${tid}', false, ${isCP})">
                `;

                for (let i of INFILL_VALUES) {
                  let selected = i == suruseg ? 'selected' : '';
                  output += `
                    <option value="${i}" ${selected}>${i}%</option>
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
                          Rétegvastagság:
                          <select class="specSelect chItem" id="rvas${tid}"
                            onchange="updateSpecs(this, ${price}, '${tid}', false, ${isCP}, true)">
                `;
                
                for (let lw of LAYER_WIDTH_VALUES_SLA) {
                  let selected = lw == rvas ? 'selected' : '';
                  output += `<option value="${lw.toFixed(2)}" ${selected}>${lw.toFixed(2)}mm</option>`;
                }

                output += ` 
                          </select>
                        </p>
                      </div>
                      <div>
                        <p>
                          Sűrűség:
                          <select class="specSelect chItem" id="suruseg${tid}"
                            onchange="updateSpecs(this, ${price}, '${tid}', false, ${isCP}, true)">
                `;

                for (let i of INFILL_VALUES_SLA) {
                  let selected = i == suruseg ? 'selected' : '';
                  output += `
                    <option value="${i}" ${selected}>${i}</option>
                  `;
                }

                output += `
                          </select>
                        </p>
                      </div>
                `;
              }

              output += `
                    <div id="scaleDiv_${tid}">
                      <p>
                        Méretezés:
                        <select class="specSelect chItem" id="scale${tid}"
                          onchange="updateSpecs(this, ${price}, '${tid}', false, ${isCP}, ${isSLA})">
              `;

              for (let sc of SCALE_VALUES) {
                let selected = sc == scale ? 'selected' : '';
                output += `
                  <option value="${sc.toFixed(1)}" ${selected}>x${sc.toFixed(1)}</option>
                `; 
              }

              output += `
                        </select>
                      </p>
                    </div>
              `;

              if (printTech != 'SLA') {
                output += `
                    <div>
                      <p>
                        Falvastagság:
                        <select class="specSelect chItem" id="fvas${tid}"
                          onchange="updateSpecs(this, ${price}, '${tid}', false, ${isCP})">
                `;

                for (let ww of WALL_WIDTH_VALUES) {
                  let selected = ww.toFixed(1) == fvas ? 'selected' : '';
                  output += `
                    <option value="${ww.toFixed(1)}" ${selected}>${ww.toFixed(1)}mm</option>
                  `; 
                }

                output += `
                          </select>
                        </p>
                      </div>
                `;
                
                if (isCP) {
                  output += `
                    <div>
                      <p>
                        Anyag:
                        <select class="specSelect chItem" id="printMat${tid}"
                          onchange="updateSpecs(this, ${price}, '${tid}', false, ${isCP})">

                  `;
                  
                  for (let pm of Object.keys(PRINT_MULTS).map(e => e.toUpperCase())) {
                    let selected = pm == printMat ? 'selected' : '';
                    output += `<option value="${pm}" ${selected}>${pm}</option>`;
                  }
                  
                  output += `
                        </select>
                      </p>
                    </div>
                  `;
                }
              }
            } else {
              output += `
                  <div>
                    <p> 
                      Forma:
                      <select class="specSelect chItem" id="sphere${tid}"
                        onchange="updateLit('sphere', 'sphere${tid}', '${tid}')">
              `;

              for (let c of LIT_FORMS) {
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
                  <div id="colorDiv_${tid}">
                    <p> 
                      Szín:
                      <select class="specSelect chItem" id="color${tid}"
                        onchange="chColor(this, '${tid}')">
            `;
            
            let cols;
            if (printTech == 'SLA') {
              cols = PCOLORS['gyanta (resin)'];
            } else if (isLit || isFixProd) {
              cols = PCOLORS['pla'];
            } else {
              cols = PCOLORS[printMat.toLowerCase()];
            }

            for (let c of cols) {
              let selected = decodeURIComponent(color) == c ? 'selected' : '';
              output += `
                <option value="${c}" ${selected}>${c}</option>
              `;
            }

            output += `
                      </select>
                    </p>
                  </div>
                  <div id="quantityDiv_${tid}">
                    <p>
                      Mennyiség:
                      <select class="specSelect chItem" id="quantity${tid}"
                        onchange="${selQuan}">
            `;

            for (let i = MIN_QUANTITY; i <= MAX_QUANTITY; i++) {
              let selected = quantity == i ? 'selected' : '';
              output += `
                <option value="${i}" ${selected}>${i}db</option>
              `;
            }

            output += `
                      </select>
                    </p>
                  </div>
            `;

            if (isCP) {
              output += `
                  <div id="printTechDiv_${tid}">
                    <p>
                      Technológia:
                      <select class="specSelect chItem" id="printTech${tid}"
                        onchange="changeTech('${printTech}', '${tid}', ${price})">
              `;

              for (let tech of PRINT_TECHS) {
                if (!allowSLA && tech == 'SLA') continue;
                let selected = printTech == tech ? 'selected' : '';
                output += `
                  <option value="${tech}" ${selected}>${tech}</option>
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

        let discount = 1;
        if (finalPrice > FREE_SHIPPING_LIMIT) {
          discount = DISCOUNT;
        }

        let ePriceText = '<span id="extraPrice"></span>';
        let extraPrice = 0; 
        if (finalPrice < 800) {
          extraPrice = 800 - finalPrice;
          finalPrice += extraPrice;
          ePriceText = `<span id="extraPrice">(+${extraPrice} Ft felárral együtt)</span>`;
        }

        finalPrice = `
          <span id="fPrice">
            ${Math.round(finalPrice * discount)}
          </span>
          Ft
        `;

        if (discount == DISCOUNT) {
          finalPrice += `
            <span id="discount">(${Math.round((1 - DISCOUNT) * 100)}% kedvezmény)</span>
          `;
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
            function attachHandlers() {
              let tidsArr = Array.from('${tidsArr}'.split(','));
              for (let id of tidsArr) {
                if (document.getElementById('scale' + id)) {
                  document.getElementById('scale' + id).addEventListener('change', (e) => toggleTechAllowance(id));
                }
                
                if (document.getElementById('printTech' + id) && document.getElementById('printTech' + id).value == 'FDM') {
                  document.getElementById('printMat' + id).addEventListener('change', (e) => matChange(id));
                }
              }
            }

            attachHandlers();

            const PCOLORS = ${JSON.stringify(PCOLORS)};
            const PRINT_MULTS = ${JSON.stringify(PRINT_MULTS)};

            function matChange(id) {
              let newColors = '';
              let currentColor = document.getElementById('color' + id).value;
              let currentMat = document.getElementById('printMat' + id).value.toLowerCase();
              let sel;
              if (PCOLORS[currentMat].indexOf(currentColor) > -1) {
                sel = currentColor;
              } else {
                sel = PCOLORS[currentMat][0];
              }

              for (let color of PCOLORS[currentMat]) {
                let selected = sel == color ? 'selected' : '';
                newColors += '<option value="' + color + '" ' + selected + '>' + color + '</option>';
              }

              document.getElementById('color' + id).innerHTML = newColors;
              chColor(document.getElementById('color' + id), id);
            }
          </script>
        `;
        resolve(output);
      });
    });
  });
}

module.exports = buildCartSection;
