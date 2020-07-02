const escapeVars = require('./includes/escapeVars.js');

// Produce general html output for a single item based on db results
function produceShowcaseOutput(result, isDefault, i) {
  let id = result[i].id;
  let url = result[i].url;
  let imgUrl = result[i].img_url;
  let productName = result[i].name;
  let price = result[i].price;
  let size = result[i].size.replace(/x/g, 'mm x ') + 'mm';
  let desc = result[i].description.split('.')[0];
  if (isDefault) {
    var bgStyle = `style="background-color: rgb(53, 54, 58);" data-bg="/${imgUrl}"`;
  } else {
    var bgStyle = `style="background-image: url('/${imgUrl}')"`;
  }

  let output = `
    <a href="/${url}" class="align">
      <div class="productItem bgCommon lazy" id="pi_${id}"
        ${bgStyle}
        onmouseenter="animateElement('priceTag_${id}', 'fadeIn', 'fadeOut', 0.3, true)"
        onmouseleave="animateElement('priceTag_${id}', 'fadeIn', 'fadeOut', 0.3, false)">

        <div class="priceShow animate__animated gothamNormal" id="priceTag_${id}">
          <p>${size}</p>
          <p class="oflow">${desc}</p>
        </div>
      </div>
      <span class="gotham">
        <p>${productName}</p>
        <p>${price}Ft</p>
      </span>
    </a>
  `;

  return output;
}

// Build the index page from fixed products & also used to build output when searching
const buildMainSection = (conn, sValue = null, isEmpty = false, isCat = false) => {
  return new Promise((resolve, reject) => {
    // Check if used in search query
    let isDefault = false;
    if ((!sValue) || sValue === 'Legnépszerűbb') {
      var sQuery = 'SELECT * FROM fix_products WHERE is_best = 1 ORDER BY priority ASC';
      if (sValue != 'Legnépszerűbb') isDefault = true;
    } else if (sValue === 'Összes') {
      var sQuery = 'SELECT * FROM fix_products ORDER BY priority ASC';
    } else if (isCat) {
      sValue = escapeVars(sValue);
      isDefault = true;
      var sQuery = `SELECT * FROM fix_products WHERE category = '${sValue}' ORDER BY
        priority ASC`; 
    } else {
      sValue = escapeVars(sValue);
      var sQuery = `SELECT * FROM fix_products WHERE name LIKE '%${sValue}%' OR description
        LIKE '%${sValue}%'`;
    }

    let bestProdIds = [];
    
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
        let output = '';
        if (!sValue && !isEmpty) {
          output = `
            <div class="topHolder">
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
                    style="background-color: #ececec;">
                    Legnépszerűbb
                  </div>
          `;

          for (let i = 0; i < res.length; i++) {
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
            <div class="clear"></div>
            <section class="mainShowcase keepBottom animate__animated animate__fadeIn" id="ms">
              <div class="dynamicShowcase" id="dynamicShowcase">
          `;
        }

        // Loop through all fixed items in the db
        for (let i = 0; i < result.length; i++) {
          bestProdIds.push(result[i].id);
          output += produceShowcaseOutput(result, isDefault, i);
        }
        
        if (!sValue && !isEmpty && sValue != 'Összes') {
          // Add the 4 newest products after most popular ones
          let newestQuery = 'SELECT * FROM fix_products ORDER BY date_added DESC LIMIT 4';
          conn.query(newestQuery, function displayNewItems(err, newRes, fields) {
            if (err) {
              reject('Egy nem várt hiba történt, kérlek próbáld újra');
              return;
            }

            if ((!sValue) || sValue === 'Legnépszerűbb') {
              output += `
                </div>
              `;
            }

            output += `
              <section class="mainShowcase" id="toggleLower">
                <hr class="hrStyle" style="margin-top: 0;">
                <p class="mainTitle" style="margin-top: 20px;">Újdonságok</p>
                <div>
            `;

            for (let i = 0; i < newRes.length; i++) {
              bestProdIds.push(newRes[i].id);
              let url = result[i].url;
              let imgUrl = result[i].img_url;

              output += `
                <div class="cartImgHolder bgCommon newProds lazy" data-bg="/${imgUrl}"
                  style="background-color: rgb(53, 54, 58);">
                </div>
              `;
            }

            output += '</div>';

            // Finally, select products from other categories that are not yet displayed
            let flatIds = bestProdIds.join(',');
            let moreQuery = `
              SELECT * FROM fix_products WHERE is_best = 0 AND id NOT IN (?)
              ORDER BY RAND()
            `;

            conn.query(moreQuery, [flatIds], function displayMore(err, moreRes, fields) {
              if (err) {
                reject('Egy nem várt hiba történt, kérlek próbáld újra');
                return;
              } 
            
              output += `
                <hr class="hrStyle">
                <p class="mainTitle" style="margin-top: 20px;">További termékek</p>
                <div class="dynamicShowcase">
              `;

              for (let i = 0; i < moreRes.length; i++) {
                output += produceShowcaseOutput(moreRes, isDefault, i);
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
        } else {
          // If, while searhing, there is no output display error msg
          if (!result.length && !output) {
            output = `
             <div>
                <img src="/images/icons/nofound.png" class="emptyCart">
                <p class="dgray font18">Sajnos nincs ilyen termékünk...</p>
              </div>
            `;
          }

          output += `
              </section>
            </div>
          `;
          resolve(output);
        }
      });
    });
  });
}

module.exports = buildMainSection;
