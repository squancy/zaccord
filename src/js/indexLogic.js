const escapeVars = require('./includes/escapeVars.js');
const produceShowcaseOutput = require('./includes/itemGenerator.js');

// Build the index page from fixed products 
// TODO: use an async library to reduce the callback hell and better deal w. async queries
const buildMainSection = (conn) => {
  return new Promise((resolve, reject) => {
    // Check if used in search query
    let isDefault = false;
    let sQuery = 'SELECT * FROM fix_products WHERE is_best = 1 ORDER BY priority ASC';

    let catToNum = {};
    
    // Build category slider
    conn.query('SELECT DISTINCT category FROM fix_products', (e, res, f) => {
      if (e) {
        reject('Egy nem várt hiba történt, kérlek próbáld újra');
        return;
      }

      conn.query(sQuery, function (err, result, fields) {
        if (err) {
          reject('Egy nem várt hiba történt, kérlek próbáld újra');
          return;
        }

        // Create html output 
        let output = `
          <div class="topHolder">
            <div class="topShrink">
              <div class="topInner">
                <input type="text" autocomplete="off" class="searchBox"
                  placeholder="Mit szeretnél megtalálni?"
                  onkeyup="searchForItem()" id="sfi" />
                <div class="categoryImg" onclick="toggleCategory()" id="categoryImg">
                  <img src="/images/vmenu.png">
                </div>
              </div>
              <div class="cbCont flexDiv trans" id="cbCont">
                <div class="arrows trans" id="larr" onclick="scrollHor('left')">
                  <img src="/images/larr.png">
                </div>
                <div class="catBox" id="catBox">
                  <div onclick="sortByCat('Legnépszerűbb', 0)" class="scat"
                    style="background-color: #ececec; color: #4285f4;">
                    Legnépszerűbb
                  </div>
        `;

        for (let i = 0; i < res.length; i++) {
          // Build table for getting the respective number value for a category
          catToNum[res[i].category] = (i + 1);

          output += `
            <div onclick="sortByCat('${res[i].category}', ${i + 1})" class="scat">
              ${res[i].category}
            </div>
          `; 
        }

        output += `
                  <div onclick="sortByCat('Összes', ${res.length + 1})" class="scat">
                    Összes
                  </div>
                </div>
                <div class="arrows trans" id="rarr" onclick="scrollHor('right')">
                  <img src="/images/rarr.png">
                </div>
              </div>
            </div>
          </div>
          <div class="clear"></div>
          <div class="wideShowcase" id="wideShowcase">
            <div class="bgShowcase bgCommon">
              <div class="darken"></div>
              <div class="textCenter">
                <p class="mainText lh gotham align" style="padding: 10px;">
                  3D nyomtatott termékek a Zaccordon
                </p>
              </div>
            </div>
          </div>
          <p class="mainTitle" style="margin-top: 40px; margin-bottom: 0;" id="popProds">
            Legnépszerűbb Termékek
          </p>
          <section class="mainShowcase keepBottom animate__animated animate__fadeIn" id="ms">
            <div class="dynamicShowcase" id="dynamicShowcase">
      `;

        // Loop through all fixed items in the db
        for (let i = 0; i < result.length; i++) {
          output += produceShowcaseOutput(result, isDefault, i, false, true);
        }

       
        // Add the 4 newest products after most popular ones
        let newestQuery = 'SELECT * FROM fix_products ORDER BY date_added DESC LIMIT 4';
        conn.query(newestQuery, function displayNewItems(err, newRes, fields) {
          if (err) {
            reject('Egy nem várt hiba történt, kérlek próbáld újra');
            return;
          }

          output += `
            </div>
            <section class="mainShowcase" id="toggleLower">
              <hr class="hrStyle" style="margin-top: 0;">
              <p class="mainTitle" style="margin-top: 20px;">Újdonságok</p>
              <div class="dynamicShowcase newies">
          `;

          for (let i = 0; i < newRes.length; i++) {
            let url = newRes[i].url;
            let imgUrl = newRes[i].img_url;
            let prodName = newRes[i].name;
            let price = newRes[i].price;

            output += `
              <a href="/${url}">
                <div class="cartImgHolder bgCommon newProds lazy" data-bg="/${imgUrl}"
                  style="background-color: rgb(53, 54, 58);"
                  onclick="window.location.href = '/${url}'">
                </div>
                <span class="gotham align">
                  <p>${prodName}</p>
                  <p>${price} Ft</p>
                </span>
              </a>
            `;
          }

          output += '</div>';

          // Finally, select products from other categories 
          output += `
            <hr class="hrStyle">
            <p class="mainTitle" style="margin-top: 20px;">További termékek</p>
            <div class="dynamicShowcase">
          `;
     
          let uniqueCategories = `SELECT DISTINCT category FROM fix_products ORDER BY RAND()`;
          let promises = [];
          let catRes = conn.query(uniqueCategories, (err, catRes, fields) => {
            for (let i = 0; i < catRes.length; i++) {
              if (err) {
                reject('Egy nem várt hiba történt, kérlek próbáld újra');
                return;
              }

              let currentCat = catRes[i].category;
              let moreQuery = `
                SELECT * FROM fix_products WHERE category = ? ORDER BY RAND() LIMIT 4
              `;

              let innerRes = new Promise((resolve, reject) => {
                conn.query(moreQuery, [currentCat], (err, innerRes, fields) => {
                  if (err) {
                    reject('Egy nem várt hiba történt, kérlek próbáld újra');
                    return;
                  }
                 
                  let output = '';
                  if (!innerRes.length) resolve('');
                  output += `
                    <div style="width: 100%; justify-content: center; margin-bottom: 10px;"
                      class="flexDiv">
                      <div class="gotham font22 align" style="margin-top: 0;">
                        ${currentCat}
                      </div>
                      <div class="seeMore trans"
                        onclick="sortByCat('${currentCat}', ${catToNum[currentCat]}, true)">
                        <img src="/images/icons/eye.png">
                      </div>
                    </div>
                  `;

                  for (let i = 0; i < innerRes.length; i++) {
                    output += produceShowcaseOutput(innerRes, isDefault, i, true);
                  }

                  resolve(output);
                });
              });
              promises.push(innerRes);
            }

            Promise.all(promises).then(data => {
              for (let d of data) {
                output += d;
              }
              output += `
                    </div>
                  </section>
                </section>
              `;

              // Add lazy load of images
              output += `
                <script src="/js/includes/lazyLoad.js"></script>
                <script type="text/javascript">
                  var ll = new LazyLoad({
                    elements_selector: ".lazy",
                  });
                </script>
              `;

              resolve(output);
            });
          });
        });
      });
    });
  });
}

module.exports = buildMainSection;
