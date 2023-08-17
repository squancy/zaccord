const produceShowcaseOutput = require('./includes/itemGenerator.js');
const buildCategory = require('./buildCategory.js');

const CONTACT_FORM = `
  <div class="mtsix" style="width: calc(100% - 40px); max-width: 1300px; margin: 0 auto;">
    <hr class="hrStyle">
    <h2 class="gotham font26 align fontNorm" id="getQuote">
      Kapcsolatfelvétel
    </h2>
    <h2 class="align font18 lh fontNorm gothamNormal">
      Egyedi nyomtatás, kérdés vagy speciális igény esetén bátran vedd fel velünk a kapcsolatot!
    </h2>
    <div class="flexDiv" style="flex-wrap: wrap;" id="normalDiv">
      <input type="text" class="dFormField" id="name" placeholder="Név" value="">
      <input type="email" class="dFormField" id="email" placeholder="Email">
      <input type="text" class="dFormField protmob" id="mobile"
        placeholder="Telefonszám" value="">
      <textarea placeholder="CAD modell URL, termékkel szembeni elvárások: anyag, szín, technológia stb."
        id="message" class="dFormField" style="width: 100%; height: 100px;"></textarea>
    </div>
    <button class="fillBtn btnCommon" id="submitBtn" style="display: block; margin: 0 auto;">
      Küldés
    </button>
    <div id="pstatus" class="align errorBox gothamNormal lh" style="margin-top: 20px;"></div>
    <div id="succstat" class="align successBox gothamNormal lh" style="margin-top: 20px;"></div>
  </div>
`;

// Build the index page from fixed products 
// TODO: use an async library to reduce the callback hell and better deal w. async queries
const buildMainSection = (conn, cat) => {
  return new Promise((resolve, reject) => {
    // Check if used in search query
    let isDefault = true;
    let sQuery = 'SELECT * FROM fix_products WHERE is_best = 1 ORDER BY priority ASC';

    let catToNum = {};
    
    // Build category slider
    let catQuery = 'SELECT DISTINCT category FROM fix_products ORDER BY category ASC';
    conn.query(catQuery, (e, res, f) => {
      if (e) {
        reject('Egy nem várt hiba történt, kérlek próbáld újra 1', e);
        return;
      }

      conn.query(sQuery, function (err, result, fields) {
        if (err) {
          reject('Egy nem várt hiba történt, kérlek próbáld újra 2');
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
                  <img src="/images/icons/vmenu.svg">
                </div>
              </div>
              <div class="cbCont flexDiv trans" id="cbCont">
                <div class="arrows trans" id="larr" onclick="scrollHor('left')">
                  <img src="/images/larr.png" width="25" height="25">
                </div>
                <div class="catBox" id="catBox">
                  <a href="/?cat=Legnépszerűbb" class="pseudoLink">
                    <div onclick="sortByCat('Legnépszerűbb', 0)" class="scat"
                      style="background-color: #ececec; color: #4285f4; border-color: #4285f4;">
                      Legnépszerűbb
                    </div>
                  </a>
        `;

        for (let i = 0; i < res.length; i++) {
          // Build table for getting the respective number value for a category
          catToNum[res[i].category] = (i + 1);

          output += `
            <a href="/?cat=${res[i].category}" class="pseudoLink">
              <div onclick="sortByCat('${res[i].category}', ${i + 1})" class="scat">
                ${res[i].category}
              </div>
            </a>
          `; 
        }

        output += `
                  <a href="/?cat=Összes" class="pseudoLink">
                    <div onclick="sortByCat('Összes', ${res.length + 1})" class="scat">
                      Összes
                    </div>
                  </a>
                </div>
                <div class="arrows trans" id="rarr" onclick="scrollHor('right')">
                  <img src="/images/rarr.png" width="25" height="25">
                </div>
              </div>
            </div>
          </div>
          <div class="clear"></div>
        `;

        // Only further products on a category page
        // Only display the top of the landing page on the index page
        let popProdsStyle = 'display: inline-block;';
        let catToggle = 'display: none;';
        let moreShow = 'diplay: none;';
        let furtherShow = 'display: flex;';
        let showcaseStyle = 'display: block';
        if (cat) {
          popProdsStyle = 'display: none;';
          catToggle = 'display: block';
          moreShow = 'display: flex;';
          furtherShow = 'display: none;';
          showcaseStyle = 'height: 0px; visibility: hidden;';
        } 

        output += `
          <div class="wideShowcase" id="wideShowcase" style="${showcaseStyle}">
            <div class="bgShowcase bgCommon">
              <div class="darken"></div>
              <div class="textCenter">
                <h1 class="mainText lh gotham align fontNorm" style="padding: 10px;">
                  Precíz 3D nyomtatás a Zaccordon
                  <button class="fillBtn instantQuote gotham" onclick="location.href = '/print'">
                    Azonnali árajánlat
                  </button>
                </h1>
              </div>
            </div>
          </div>

          <div class="flexProtCont" style="margin-top: 20px; ${furtherShow}">
            <div class="bgService bgCommon" id="cprintService">
              <div class="darken keepRounded"></div>
              <div class="textCenter pad lh">
                <h2 class="serviceTxt align font34 gotham servMain servMain fontNorm">Bérnyomtatás</h2>
                <h3 class="serviceTxt align gotham fontNorm font16">
                  FDM és SLA nyomtatás számos színnel és anyaggal. Az intelligens algoritmus
                  segítségével azonnal láthatod az árat és megrendelheted a feltöltött
                  termékeket.
                </h3>
                <div class="flexDiv btnAlign">
                  <button class="whiteBtn gotham font18 trans" onclick="redirect('/print')">További információ</button>
                  <button class="whiteBtn gotham font18 trans" onclick="redirect('/printHelp')">Segítség</button>
                </div>
              </div>
            </div>

            <div class="bgService bgCommon" id="protService">
              <div class="darken keepRounded"></div>
              <div class="textCenter pad lh">
                <h2 class="serviceTxt align font34 gotham servMain fontNorm">Prototípusgyártás</h2>
                <h3 class="serviceTxt align gotham fontNorm font16">
                  A 3D nyomtatott kisszériás prototípusgyártás egy sokkal költséghatékonyabb és gyorsabb
                  módja a nullsorozatok gyártásának. Egyedi rendelésekhez bátran vedd fel
                  felünk a kapcsolatot.
                </h3>
                <div class="flexDiv btnAlign">
                  <button class="whiteBtn gotham font18 trans" onclick="redirect('/prototype')">
                    További információ
                  </button>
                  <button class="whiteBtn gotham font18 trans" onclick="redirect('/prototype#getInCont')">
                    Kapcsolatfelvétel
                  </button>
                </div>
              </div>
            </div>
          </div>

          <h2 class="gotham align font34 printTech fontNorm" id="printTech" style="${popProdsStyle}">
            Nyomtatási Technológiák
          </h2>

          <div class="flexProtCont" style="${furtherShow}">
            <div class="bgService bgCommon" id="fdmService">
              <div class="darken keepRounded"></div>
              <div class="textCenter pad lh">
                <h2 class="serviceTxt align font34 gotham servMain fontNorm">FDM</h2>
                <h3 class="serviceTxt align gotham fontNorm font16">
                  Az FDM nyomtatási technológia kiváló a rapid prototypinghoz és
                  költséghatékony modellezéshez. Ez esetben a nyomtató olvadt filamentből
                  készíti el a terméket rétegről-rétegre.
                </h3>
                <div class="flexDiv btnAlign">
                  <button class="whiteBtn gotham font18 trans" onclick="redirect('/mitjelent')">További információ</button>
                </div>
              </div>
            </div>
            <div class="bgService bgCommon" id="slaService">
              <div class="darken keepRounded"></div>
              <div class="textCenter pad lh">
                <h2 class="serviceTxt align font34 gotham servMain fontNorm">SLA</h2>
                <h3 class="serviceTxt align gotham fontNorm font16">
                  Kiváló választás lehet apróbb vagy nagyobb pontosságot igénylő modellekhez,
                  hiszen minősége a fröccsöntött műanyagéval vetekszik. Ilyenkor a nyomtató
                  műgyantából állítja elő a terméket, ami utána UV-fénnyel lesz kezelve.
                </h3>
                <div class="flexDiv btnAlign">
                  <button class="whiteBtn gotham font18 trans" onclick="redirect('/mitjelent')">További információ</button>
                </div>
              </div>
            </div>

            <div class="greyBoxCont">
              <div class="indexGreyBox">
                <p class="gotham boxTitle">Bérnyomtatás</p>
                <div class="greyBoxText">
                  <p class="gothamNormal lh">
                    Ha szeretnél nyomtatni, de nem férsz hozzá egy saját 3D nyomtatóhoz, akkor bátran
                    vedd igénybe a teljesen automatizált <a class="blueLink" href="/print">bérnyomtatás</a> szolgáltatásunkat.
                  </p>
                  <br>
                  <p class="gothamNormal lh">
                    Nincs más dolgod, mint feltölteni a modellről készült STL fájlt és azonnal meg is rendelheted
                    azt. Szabd teljesen személyre a modelled a színtől kezdve egészen a rétegvastagságig!
                  </p>
                  <br>
                  <p class="gothamNormal lh">
                    Nem kell várnod hosszú napokat egy egyedileg adott árajánlatért, hiszen ezt a terhet
                    teljesen levesszük a válladról. Az algoritmus azonnal megmondja mennyibe kerül a termék,
                    így magad döntheted el, hogy megvásárolod vagy nem.
                  </p>
                </div>
              </div>
              <div class="greyBoxImg bgCommon" id="gbi_1"></div>
            </div>

            <div class="greyBoxCont">
              <div class="indexGreyBoxLeft">
                <p class="gotham boxTitleLeft">Modellezés</p>
                <div class="greyBoxTextLeft">
                  <p class="gothamNormal lh">
                    Amennyiben csak egy elképzeléssel rendelkezel, modellel viszont nem, akkor vedd igénybe egy
                    3D modellező munkatársunk segítségét a kidolgozásban.
                  </p>
                  <br>
                  <p class="gothamNormal lh">
                    Tervrajzok, képek, leírások, vagy mindössze egy ötlet alapján végezzük el a 3D modellezést
                    egy részletes konzultáció után.
                  </p>
                  <br>
                  <p class="gothamNormal lh">
                    Gyakori alkalmazás lehet törött eszközök, alkatrészek modellezése képek és egy mérettáblázat
                    alapján, amiket utána kinyomtatunk és elküldünk a megrendelőnek.
                  </p>
                </div>
              </div>
              <div class="greyBoxImgLeft bgCommon" id="gbi_2"></div>
            </div>

            <div class="greyBoxCont">
              <div class="indexGreyBox">
                <p class="gotham boxTitle">Gyártás</p>
                <div class="greyBoxText">
                  <p class="gothamNormal lh">
                    Termékfejlesztés, <a href="/prototype" class="blueLink">prototípus- és sorozatgyártás</a> esetén
                    fordulj bizalommal több éves tapasztalattal rendelkező csapatunkhoz.
                  </p>
                  <br>
                  <p class="gothamNormal lh">
                    Egy termék piacra dobása előtti legfontosabb mérföldkő a prototípus elkészítése, esetleg annak
                    kisszériás gyártása.
                  </p>
                  <br>
                  <p class="gothamNormal lh">
                    A 3D nyomtatás erre egy kiváló technológia, gyorsaságából és költséghatékonyságából adódóan.
                    Emellett a kész termék elkészülte előtt kulcsfontosságú a potenciális vásárlók kezébe adni valami kézzel
                    foghatót.
                  </p>
                </div>
              </div>
              <div class="greyBoxImg bgCommon" id="gbi_5"></div>
            </div>

            <div class="greyBoxCont">
              <div class="indexGreyBoxLeft">
                <p class="gotham boxTitleLeft">Termékek</p>
                <div class="greyBoxTextLeft">
                  <p class="gothamNormal lh">
                    A Zaccordon számos előre kinyomtatott termék közül válogathatsz, rengeteg kategóriában.
                    Sokszor olyan termékekkel is találkozhatsz, amiket nem lehet kapni hétköznapi boltokban
                    vagy csak sokkal drágábban, mint az oldalon.
                  </p>
                  <br>
                  <p class="gothamNormal lh">
                    Minden terméket biológiailag lebomló PLA filamentből nyomtatunk, így nincsen akkora ökológiai
                    lábnyoma, mint a hagyományos műanyagnak.
                  </p>
                  <br>
                  <p class="gothamNormal lh">
                    A szobroktól és vázáktól kezdődően a szappantartóig szinte minden hétköznapi tárgyat megtalálsz
                    a webshopban. Minden terméket egy külön modellező tervezett, így vásárlásoddal az ő munkájukat is támogatod.
                  </p>
                </div>
              </div>
              <div class="greyBoxImgLeft bgCommon" id="gbi_4"></div>
            </div>


            <div class="greyBoxCont">
              <div class="indexGreyBox">
                <p class="gotham boxTitle">Litofánia</p>
                <div class="greyBoxText">
                  <p class="gothamNormal lh">
                    A <a href="/print" class="blueLink">litofánia</a> egy tökéletes személyes ajándék lehet szinte
                    bármilyen alkalomra.
                    Lepd meg szeretteidet egyedi, dombornyomott ajándékkal, amit azonnal megrendelhetsz az oldalon
                    keresztül.
                  </p>
                  <br>
                  <p class="gothamNormal lh">
                    A nyomtató egy sík vagy görbe felületre készíti el a dombornyomott képet, ami háttérvilágítás
                    után tisztán látható lesz. 
                  </p>
                  <br>
                  <p class="gothamNormal lh">
                    Gyakran használják lámpák vagy egyéb fényforrások búrájaként, így amikor felkapcsoljuk a lámpát
                    a különböző rétegvastagságú felületek különböző mértékben engedik át a fényt, és előtűnik a monokróm kép.
                  </p>
                </div>
              </div>
              <div class="greyBoxImg bgCommon" id="gbi_3"></div>
            </div>
          </div>
          
          <p class="gotham align font34" style="margin-top: 60px; margin-bottom: 0; ${popProdsStyle}"
            id="popProds">
            Legnépszerűbb Termékek
          </p>
        `;

        output += `
          <section class="mainShowcase keepBottom animate__animated animate__fadeIn" id="ms">
            <div class="dynamicShowcase" id="dynamicShowcase">
        `;
         
        if (!cat) {
          var prodElements = new Promise((resolve, reject) => {
            let collectItems = '';
            // Loop through all fixed items in the db
            for (let i = 0; i < result.length; i++) {
              collectItems += produceShowcaseOutput(result, isDefault, i, false, true);
            }
            resolve(collectItems);
          });
        } else {
          // If URL is a simple category only display products in that category
          var prodElements = new Promise((resolve, reject) => {
            let collectItems = '';
            buildCategory(conn, cat).then(data => {
              collectItems += data;
              resolve(collectItems);
            }).catch(err => {
              reject('Hiba');
            });
          }); 
        }

        prodElements.then(data => {
          output += data;

          // Add the 4 newest products after most popular ones
          let newestQuery = 'SELECT * FROM fix_products ORDER BY date_added DESC LIMIT 4';
          conn.query(newestQuery, function displayNewItems(err, newRes, fields) {
            if (err) {
              reject('Egy nem várt hiba történt, kérlek próbáld újra 3');
              return;
            }
            
            output += `
              </div>
              <section class="mainShowcase" id="toggleLower" style="${catToggle}">
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
              <hr class="hrStyle" style="${catToggle}">
              <p class="mainTitle" style="margin-top: 20px; ${catToggle}">További Termékek</p>
              <div class="dynamicShowcase" style="${moreShow}">
            `;
       
            let uniqueCategories = `SELECT DISTINCT category FROM fix_products ORDER BY RAND()`;
            let promises = [];
            let catRes = conn.query(uniqueCategories, (err, catRes, fields) => {
              for (let i = 0; i < catRes.length; i++) {
                if (err) {
                  reject('Egy nem várt hiba történt, kérlek próbáld újra 4');
                  return;
                }
                
                let currentCat = catRes[i].category;
                let moreQuery = `
                  SELECT * FROM fix_products WHERE category = ? ORDER BY RAND() LIMIT 4
                `;

                let innerRes = new Promise((resolve, reject) => {
                  conn.query(moreQuery, [currentCat], (err, innerRes, fields) => {
                    if (err) {
                      reject('Egy nem várt hiba történt, kérlek próbáld újra 5');
                      return;
                    }
                   
                    let output = '';
                    if (!innerRes.length) {
                      resolve('');
                    }

                    output += `
                      <div style="width: 100%; justify-content: center; margin-bottom: 10px;"
                        class="flexDiv">
                        <div class="gotham font22 align" style="margin-top: 0;">
                          ${currentCat}
                        </div>
                        <div class="seeMore trans"
                          onclick="sortByCat('${currentCat}', ${catToNum[currentCat]}, true)">
                          <img src="/images/icons/eye.svg" width="24" height="24"
                            alt="További termékek a(z) ${currentCat} kategóriában">
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

                output += CONTACT_FORM;

                // Add lazy load of images
                output += `
                  <script src="/js/includes/lazyLoad.js"></script>
                  <script type="text/javascript">
                    var ll = new LazyLoad({
                      elements_selector: ".lazy",
                      callback_loaded: (el) => el.style.backgroundColor = 'white'
                    });

                    for (let el of Array.from(document.getElementsByClassName('pseudoLink'))) {
                      el.addEventListener('click', (e) => {
                        e.preventDefault();
                      });
                    }
                  </script>
                `;

                resolve(output);
              });
            });
          });
        });
      });
    });
  });
}

module.exports = buildMainSection;
