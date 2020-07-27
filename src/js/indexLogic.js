const escapeVars = require('./includes/escapeVars.js');

// Produce general html output for a single item based on db results
function produceShowcaseOutput(result, isDefault, i, isUneven = false) {
  let id = result[i].id;
  let url = result[i].url;
  let imgUrl = result[i].img_url;
  let productName = result[i].name;
  let price = result[i].price;
  let size = result[i].size.replace(/x/g, 'mm x ') + 'mm';
  let desc = result[i].description.split('.')[0];
  if (desc.search('<a') > -1) {
    desc = result[i].description.split('Tulajdonságok')[0]
      .replace(/<a.*?>/, '').replace('</a>', '');
  }
  if (isDefault) {
    var bgStyle = `style="background-color: rgb(53, 54, 58);" data-bg="/${imgUrl}"`;
  } else {
    var bgStyle = `style="background-image: url('/${imgUrl}')"`;
  }

  let stylePadding = '';
  if (isUneven) {
    if (i % 2 != 0) {
      stylePadding = 'style="padding-right: 0;"';
    } else {
      stylePadding = 'style="padding-right: 5px;"';
    }
  }

  let output = `
    <a href="/${url}" class="align" ${stylePadding}>
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
        <p>${price} Ft</p>
      </span>
    </a>
  `;

  return output;
}

// Build the index page from fixed products & also used to build output when searching
// TODO: this page implements the UI of the index page + searching & category filter
// If would be a good idea to separate these tasks into different sections & files
// Thus simplifying the code

// TODO: use an async library to reduce the callback hell and better deal w. async queries
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
      var sQuery = `SELECT * FROM fix_products WHERE name LIKE '${sValue}%'`;
    }

    let bestProdIds = [];
    let searchIds = [];
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
        let output = '';
        if (!sValue && !isEmpty) {
          output = `
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
                      style="background-color: #ececec;">
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
        `;

        // Display showcase img when on the main page
        if (!sValue || sValue === 'Legnépszerűbb') {
          output += `
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
          `; 
        }

        output += `
            <section class="mainShowcase keepBottom animate__animated animate__fadeIn" id="ms">
              <div class="dynamicShowcase" id="dynamicShowcase">
          `;
        }

        // Loop through all fixed items in the db
        for (let i = 0; i < result.length; i++) {
          searchIds.push(result[i].id);
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
                  style="background-color: rgb(53, 54, 58);"
                  onclick="window.location.href = '/${url}'">
                </div>
              `;
            }

            output += '</div>';

            // Finally, select products from other categories that are not yet displayed
            let flatIds = bestProdIds.join(',');

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
                  SELECT * FROM fix_products WHERE is_best = 0 AND category = ?
                  AND id NOT IN (?) ORDER BY RAND() LIMIT 4
                `;

                let innerRes = new Promise((resolve, reject) => {
                  conn.query(moreQuery, [currentCat, flatIds], (err, innerRes, fields) => {
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
        } else {
          // If, while searching, there is no output try to search in desc
          // TODO: figure out a way to make the NOT IN caluses in the queries work
          if (result.length < 4) {
            let cntSoFar = 4 - result.length;
            let flatIds = searchIds.join("','");
            let sQuery = `
              SELECT * FROM fix_products WHERE name LIKE '%${sValue}%' AND id NOT IN (?)
              LIMIT ${cntSoFar} 
            `;
            conn.query(sQuery, [flatIds], (err, result, fields) => {
              if (err) {
                reject('Egy nem várt hiba történt, kérlek próbáld újra');
                return;
              }

              for (let i = 0; i < result.length; i++) {
                if (searchIds.indexOf(result[i].id) > -1) continue;
                searchIds.push(result[i].id);
                output += produceShowcaseOutput(result, isDefault, i);
                cntSoFar--;
              }

              // Try description as a last chance
              flatIds = "'" + searchIds.join("','") + "'";
              let dQuery = `
                SELECT * FROM fix_products WHERE description LIKE '%${sValue}%'
                AND id NOT IN (?) LIMIT ${cntSoFar}
              `;
              conn.query(dQuery, [flatIds], (err, result, fields) => {
                if (err) {
                  reject('Egy nem várt hiba történt, kérlek próbáld újra');
                  return;
                }

                for (let i = 0; i < result.length; i++) {
                  if (searchIds.indexOf(result[i].id) > -1) continue;
                  output += produceShowcaseOutput(result, isDefault, i);
                }                
                
                // If still no result display error msg
                if (!output) {
                  output = `
                    <div>
                      <img src="/images/icons/nofound.png" class="emptyCart">
                      <p class="dgray font18">Sajnos nincs ilyen termékünk...</p>
                    </div>
                  `;
                }
                resolve(output);
              });
            });
          } else {
            output += `
                </section>
              </div>
            `;
            resolve(output);
          }
        }
      });
    });
  });
}

module.exports = buildMainSection;
