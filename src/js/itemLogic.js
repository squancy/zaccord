const genSpecs = require('./includes/genSpecs.js');
const escapeVars = require('./includes/escapeVars.js');

// Build page for a specific item
const buildItemSection = (conn, itemId, req) => {
  return new Promise((resolve, reject) => {
    // Select the item from db & make sure it exists
    itemId = Number(escapeVars(itemId));
    conn.query("SELECT * FROM fix_products WHERE id = ? LIMIT 1", [itemId],
    function (err, result, fields) {
      if (err) {
        reject('Egy nem várt hiba történt, kérlek próbáld újra')
        return;
      }

      // Invalid item id
      if (result.length === 0) {
        reject('Nincs ilyen termékünk');
        return;
      }

      // Create html output 
      let output = `
        <div class="overlay" id="overlay"></div>
        <img src="/images/exit.png" class="exitBtn trans" id="exitBtn" onclick="viewIn3D()">
        <div class="item3DViewer" id="viewBox">
          <img src="/images/icons/loader.gif" id="stlLoader" /> 
        </div>
        <section class="keepBottom animate__animated animate__fadeIn">
      `;

      // Get properties of item
      let id = result[0].id;
      let url = result[0].url;
      let imgUrl = result[0].img_url;
      let productName = result[0].name;
      let category = result[0].category;
      let price = result[0].price;
      let size = result[0].size.replace(/x/g, 'mm x ');
      size += 'mm';
      size = size.replace(/\smm/g, 'mm');
      let description = result[0].description.replace('<!--DATE-->', new Date().getFullYear());
      let stlPath = result[0].stl_path;
      let showcaseImgs = result[0].img_showcase.split(',');
      let showcase = '';
      let isBest = result[0].is_best;
      for (let img of showcaseImgs) {
        showcase += `<img src="/images/${img}" style="height: 0;">`;
      }
      
      let stlPaths = [];
      let pathList = stlPath.replace(/\s/g, '').split(',');
      for (let i = 0; i < pathList.length; i++) {
        stlPaths.push({
          'id': i,
          'filename': '/fixedStl/' + pathList[i] + '.stl',
          'color': '#999999',
          'x': i * 150
        });
      }

      let pathArg = JSON.stringify(stlPaths);

      let popularTxt = '';
      if (isBest) {
        popularTxt = `
          <p class="gotham ddgray">Népszerű termék</p>
        `;
      } else {
        popularTxt = `
          <p class="gotham ddgray">Kategória: ${category}</p>
        `;
      }
      
      output += `
        <div class="centerBox">
          <div class="leftAlignBox">
            <div class="galleria" id="galleria">
              ${showcase}
            </div>

            <p class="prodName hideSeek align lh" id="pname">${productName}</p>
            <div class="itemInfo">
              <p class="prodName hideText">${productName}</p>
              <p class="itemPrice">
                <span id="priceHolder">${price}</span> Ft
              </p>
              <p class="gotham">
                <span id="sizeHolder">${size}</span>
              </p>
              ${popularTxt}
              <p class="gotham font14 qty" style="margin-bottom: 0;">
                Mennyiség
              </p> 
              <div class="quantity buttons_added">
                <input type="button" value="-" class="minus" id="minus">
                <input type="number" step="1" min="1" max="" name="quantity" value="1"
                  title="Qty"
                  class="input-text qty text" size="4" pattern="" inputmode="" id="quantity"
                  readonly>
                  <input type="button" value="+" class="plus" id="plus">
              </div>

              <div class="broHolder flexDiv" id="broHolder">
                <button class="fillBtn btnCommon bros" onclick="buyItem(${id})">
                  Vásárlás
                </button> 
                <button class="fillBtn btnCommon bros" onclick="addToCart(${id})">
                  Kosárba
                </button>
                <button class="fillBtn btnCommon bros" id="view3D">
                  3D
                </button>
              </div>

              <div id="status" class="errorBox"></div>
              <div id="succBox" class="successBox"></div>
              <div id="info" class="infoBox"></div>
            </div>
          </div>
          <div class="clear"></div>

          <div class="contHolder flexDiv gotham">
            <div class="contTitle" id="descTitle">
              <div>
                Leírás            
              </div>
              <div class="hoverItem" id="descTitle_anim" style="display: block;"></div>
            </div>
            <div class="contTitle" id="specsTitle">
              <div>
                Specifikációk
              </div>
              <div class="hoverItem animate__animated animate__fadeOut" id="specsTitle_anim">
              </div>
            </div>
          </div>
          <hr class="hrStyle">
          <div id="descHS" class="descHS trans">
            <p>
              ${description}
            </p>
            <p class="ddgray">
              Az élő fényképek kivételével a termékfotók csak illusztrációk!
              A termék 3D nyomtatóval készül!
            </p>
          </div>
          <div id="specsHS" class="specsHS trans">
      `;          

      output += genSpecs(price, size);

      output += `
        <div class="clear"></div> 

        <p class="align">
          <a href="/mitjelent" class="blueLink">Mit jelentenek ezek?</a>
        </p>

        <p class="align note ddgray">
          A specifikációk megváltoztatása árváltozást vonhat maga után!
        </p>

        <p class="align note ddgray">
          Ha nem szeretnél bajlódni a paraméterekkel, hagyd az alapbeállításokon!
        </p>
      </div>
      `;

      // Give product suggestion from the same category
      let sQuery = `SELECT * FROM fix_products WHERE category = ? AND id != ? ORDER BY RAND()
        LIMIT 6`;
      conn.query(sQuery, [category, itemId], (err, result, fields) => {
        if (err) {
          reject('Egy nem várt hiba történt, kérlek próbáld újra');
          return;
        }

        // If there are no more items in the category do not display suggestions at all
        if (result.length === 0) {
          output += `
            </section>
          `;
          resolve(output);
        } else {
          // Provide suggestions
          output += `
            <hr class="hrStyle">
              <p id="spec" class="align gotham" style="font-weight: 500;">
                Ezek is érdekelhetnek
              </p>
              <div class="flexDiv" style="flex-wrap: wrap;">   
          `;

          for (let i = 0; i < result.length; i++) {
            let url = result[i].url;
            let imgUrl = result[i].img_url;

            output += `
              <div class="cartImgHolder bgCommon suggItem" 
                style="background-image: url('/${imgUrl}')"
                onclick="window.location.href='/${url}'">
              </div>
            `;           
          }

          output += `
              </div>
            </section>
          `;
        }

        output += `
          <script type="text/javascript">
            let isLoggedIn = ${req.user.id ? true : false};
            _('galleria').style.height = _('galleria').clientWidth + 'px';
            window.onresize = function resizeShowcase() {
              _('galleria').style.height = _('galleria').clientWidth + 'px';
            }

            _('view3D').addEventListener('click', function showModels(e) {
              viewIn3D(${pathArg});
            });
          </script>
        `;
        let descToTag = description.split('Tulajdons')[0].replace(/(\r\n|\n|\r)/gm, '')
        descToTag = descToTag.replace(/<a .*?>/, '').replace(/<\/a>/, '')
          .replace(/<br>/g, '');
        resolve([output, productName, descToTag]);
      });      
    });
  });
}

module.exports = buildItemSection;
