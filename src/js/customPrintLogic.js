const NodeStl = require('node-stl');
const genSpecs = require('./includes/genSpecs.js');
const checkStlSize = require('./includes/checkStlSize.js');
const calcPrice = require('./includes/calcPrice.js');
const cookieFuncs = require('./includes/cookieFuncs.js');
const isVisited = require('./includes/isVisited.js');
const genQuan = require('./includes/genQuan.js');
const randomstring = require('randomstring');
const getPrice = require('./includes/modelPriceCalc/getPrice.js');
const constants = require('./includes/constants.js');
const calcCPPrice = constants.calcCPPrice;
const getPrintTime = constants.getPrintTime;
const getCoords = constants.getCoords;

// Check if model fits the size of SLA printing (115 x 65 x 150)
function shouldAllowSLA(box) {
  return (box[0] > 115 || box[1] > 65 || box[2] > 150) ? false : true
}

// In this version of the code there is no extra price for products below 800 Ft
// Since the minimum price of a model is 1K Ft

// Build custom print page; add interactive .stl file viewer + customization
const buildCustomPrint = (conn, userID, filePaths) => {
  return new Promise((resolve, reject) => {
    // Get volume, bounding box, weight and center of mass (not yet used, might be later)
    let totalPrice = 0;
    let sizes = [];
    let sizeMM = 0;
    let subPrices = [];
    let subSizes = [];
    let totVolume = 0;
    let stlContainers = '';
    let totPrintTime = 0;
    let cnt = 0;
    let largestVolume = 0;

    let allowSLA = true;
    
    let stlWidth = '';
    if (filePaths.length === 1) {
      stlWidth = 'style="min-width: 100%;"';
    } else if (filePaths.length === 2) {
      stlWidth = 'style="min-width: calc(50% - 6px);"';
    } else {
      stlWidth = 'style="min-width: calc(33% - 6px);"';
    }
    
    /*
    function formatPrintTime(timeInSec) {
      if (timeInSec / 3600 < 1) {
        return Math.round(timeInSec / 60) + ' perc';
      } else {
        return Math.round(timeInSec / 3600) + ' óra';
      }
    }
    */
    
    let isMoreFiles = filePaths.length > 1;
    let extraMarginDown = '20px';
    if (isMoreFiles) {
      extraMarginDown = '0px';
    }

    
    for (let i = 0; i < filePaths.length; i++) {
      let path = filePaths[i];
      let stl = new NodeStl(path, {density: 1.27}); // PLA has 1.27 g/mm^3 density
      let volume = (stl.volume).toFixed(2); // cm^3
      let weight = (stl.weight).toFixed(2); // gramm
      totVolume += Number(volume);
      let [W, H, D] = getCoords(path);
      let boxVolume = stl.boundingBox.reduce((a, c) => a * c);
      if (boxVolume > largestVolume) {
        sizeMM = stl.boundingBox.map(a => a.toFixed(2) + 'mm x ').join(' ');
        largestVolume = boxVolume;
      }

      if (allowSLA) allowSLA = shouldAllowSLA(stl.boundingBox);

      let basePrice = calcCPPrice(W, H, D);
      let subpriceText = '';
      if (isMoreFiles) {
        subpriceText = `
          <p class="gotham align">
            <span class="blue gotham">Ár:</span>
            <span id="subprice_${i}">${basePrice}</span> Ft
          </p>
        `;
      }

      stlContainers += `
        <div ${stlWidth}>
          <div class="stlCont">
            <div id="stlCont_${i}" style="height: 400px;"></div>
          </div>
          ${subpriceText}
        </div>
      `;
      
      // Make sure size max 220mm
      if (!checkStlSize(stl.boundingBox)) {
        reject('A maximális méret 220mm x 220mm x 220mm lehet');
        return;
      }

      let centerOfMass = stl.centerOfMass.map(x => x.toFixed(2) + 'mm'); // mm
      let fname = path.split('/');
      fname = fname[fname.length - 1].replace('.stl', '');
      totPrintTime += getPrintTime(W, H, D);
      totalPrice += basePrice;
      subPrices.push(basePrice);
      subSizes.push(stl.boundingBox.map(x => x.toFixed(2)));
      sizes.push(boxVolume);
      cnt++;
    }
    
    // Calculate the ratio of sub prices to the total price
    let subPriceRatios = [];
    for (let price of subPrices) {
      subPriceRatios.push(price / totalPrice);
    }

    // Only select the maximum size when having more models
    let maxSize = Math.max(...sizes);
    let label = 'Méret';
    if (filePaths.length > 1) {
      label = 'Legnagyobb termék mérete';
    }
    sizeMM = sizeMM.substr(0, sizeMM.length - 3);

    // 800 Ft extra charge when ordering a [price] < 800 Ft product 
    let chargeText = '<span id="charge"></span>';
    let dp = 'display: none';
    let extraPrice = 0;
    if (totalPrice < 800) {
      extraPrice = 800 - totalPrice;
      chargeText = `<span id="charge">(+${extraPrice} Ft felár)</span>`;
      dp = 'display: block';
    }

    let chargeNote = `
      <p class="align note ddgray" id="chargeNote" style='${dp}'>
        Ha az egész rendelés ára kevesebb mint 800 Ft, akkor annyi felárat számolunk fel, hogy
        az minimum 800 Ft legyen.
      </p>
    `;

    // Build html output
    let content = `
      <textarea id="techVal" style="display: none;">FDM</textarea>
      <section class="keepBottom">
        <div class="flexDiv" style="margin-bottom: ${extraMarginDown}; flex-wrap: wrap;">
          ${stlContainers}
        </div>
        <div class="loadImg" id="status">
          <img src="/images/icons/loader.gif" style="margin-bottom: 0;">
        </div>
        <div id="colorPicker" class="flexDiv animate__animated animate__fadeIn"
          style="display: none;">
          <div class="colorPick" onclick="chooseColor('#0089ff', 0, true)"
            style="background-color: #4285f4;">
          </div>
          <div class="colorPick" onclick="chooseColor('#ffffff', 1, true)"
            style="background-color: #ffffff;">
          </div>
          <div class="colorPick" onclick="chooseColor('#ff0000', 2, true)"
            style="background-color: #dc143c;">
          </div>
          <div class="colorPick bgCommon" onclick="chooseDisplay('flat', 3)"
            style="background-image: url('/images/flat.png')">
          </div>
          <div class="colorPick bgCommon" onclick="chooseDisplay('smooth', 4)"
            style="background-image: url('/images/smooth.png')">
          </div>
          <div class="colorPick bgCommon" onclick="chooseDisplay('wireframe', 5)"
            style="background-image: url('/images/wireframe.png')">
          </div>
        </div>
        <div class="flexDiv" id="customProps" style="flex-wrap: wrap; margin-top: 10px;">
          <div>
            <p>
              <span class="blue gotham">Végösszeg:</span>
              <span id="priceHolder">${totalPrice}</span> Ft ${chargeText}
            </p>
          </div>
          <div>
            <p>
              <span class="blue gotham">Becsült Térfogat:</span>
              <span id="weightHolder">${totVolume.toFixed(2)}cm<sup>3</sup></span>
            </p>
          </div>
          <div>
            <p>
              <span class="blue gotham">${label}:</span>
              <span id="sizeHolder">${sizeMM}</span>
            </p>
          </div>
        </div>
    `;

    /*
      <div>
        <p>
          <span class="blue gotham">Nyomtatási Idő:</span>
          <span id="weightHolder">${formatPrintTime(totPrintTime)}</span>
        </p>
      </div>
    */

    let afterWorkNote = `
      <p class="align note ddgray">
        Az ár tartalmazza az utómunkát!
      </p>
    `;
    
    content += genQuan(afterWorkNote);
    
    let disableSLAClass = allowSLA ? '' : 'slaDisabled';
    content += `
      <div class="fdmOrSla gotham flexDiv font18">
        <div class="fdmChoice align techChosen trans" id="fdmChoice">
          FDM
        </div>
        <div class="slaChoice align techOther trans ${disableSLAClass}" id="slaChoice">
          SLA
        </div>
      </div>
    `;

    content += genSpecs(totalPrice, sizeMM, false, true);

    content += `
        <div class="specBox" style="justify-content: center;">
          <button class="fillBtn btnCommon threeBros" id="buyCP">
            Vásárlás
          </button> 
          <button class="fillBtn btnCommon threeBros" id="toCart">
            Tovább a kosárhoz
          </button>
          <button class="fillBtn btnCommon threeBros" id="newFile">
            Új fájl feltöltése 
          </button>
        </div>
        <div id="infoStat" class="infoBox"></div>

        <p class="align">
          <a href="/mitjelent" target="_blank" class="blueLink">Segítség a specifikációkhoz</a>
        </p>

        <p class="align note ddgray">
          A specifikációk megváltoztatása árváltozást vonhat maga után és
          több termék esetén ezek változtatása minden egyes termékre értendő!
        </p>

        <p class="align note ddgray">
          FDM és SLA nyomtatáshoz a maximum méretek rendre 220mm x 220mm x 220mm és 115mm x 65mm x
          150mm.
        </p>
      </section>
    `;
      
    // JS content for displaying the interactive stl viewer
    content += `
      <script type="text/javascript">
    `;

    // TODO: set isFirstVisit on cart page as well

    content += cookieFuncs();
    content += isVisited();
    content += `
        // Initialize vars used globally
        let data = [];
        let arr = [];
        let subPriceRatios = Array.from('${subPriceRatios}'.split(','));
        let subPrices = Array.from('${subPrices}'.split(','));
        let subSizes = Array.from('${subSizes}'.split(','));
        let subPricesSLA = subPrices.map(x => Math.round(x * 2.1));
        let basePriceSLA = subPricesSLA.reduce((acc, val) => acc + val);
        let thumbs = [];
        let sizeCnt = 0;
        let modelIDs = [];

        // Loop over file paths and extract file names used for thumbnails & .stl
        for (let f of Array.from('${filePaths}'.split(','))) {
          let x = f.split('/');
          arr.push('/' + x[x.length - 2] + '/' + x[x.length - 1])
          thumbs.push('/' + x[x.length - 2] + '/thumbnails/' +
            x[x.length - 1].replace('.stl', '') + '.png');
        }

        function _(el) {
          return document.getElementById(el);
        }

        // Make sure the num of items in cookies do not exceed 15
        let canGo = true;
        if (Object.keys(JSON.parse(getCookie('cartItems') || '{}')).length + arr.length > 15
          || !isFirstVisit) {
          canGo = false;
        }

        let models = [];

        // Go through the files and push them to cookies for later display in the cart
        for (let i = 0; i < arr.length; i++) {
          let path = arr[i];
          
          // Unique id
          let id = arr[i].split('/')[2].replace('.stl', '');
          modelIDs.push(id);
          if ((!getCookie('cartItems') ||
            !Object.keys(JSON.parse(getCookie('cartItems'))).length ||
            !JSON.parse(getCookie('cartItems'))['content_' + id]) && canGo) {
            
            let modelSize = subSizes[sizeCnt] + ',' + subSizes[sizeCnt + 1] + ',' +
              subSizes[sizeCnt + 2];

            // Build cookie object (later converted to str)
            let value = {
              ['content_' + id]: {
                ['rvas_' + id]: _('rvas').value,
                ['suruseg_' + id]: _('suruseg').value,
                ['color_' + id]: encodeURIComponent(_('color').value),
                ['scale_' + id]: _('scale').value,
                ['fvas_' + id]: _('fvas').value,
                ['quantity_' + id]: _('quantity').value,
                ['price_' + id]: subPrices[i],
                ['printMat_' + id]: _('printMat').value,
                ['size_' + id]: modelSize,
                ['tech_' + id]: 'FDM'
              }
            };

            sizeCnt += 3;
            
            // Set value in cookies
            let itemsSoFar = getCookie('cartItems');
            if (!itemsSoFar) itemsSoFar = '{}';
            itemsSoFar = JSON.parse(itemsSoFar);
            setCookie('cartItems', JSON.stringify(Object.assign(itemsSoFar, value)), 365);
          }

          // Also build .stl file name array used for displaying them interactively
          let obj = {
            id: 0,
            filename: path,
            color: "#ffffff"
          };

          // Use a 3rd party library for viewing .stl files
          let stlView = new StlViewer(document.getElementById("stlCont_" + i), {
            all_loaded_callback: () => stlFinished(i),
            models: [obj]
          });

          data.push(obj);
          models.push(stlView);
        }

        function getID(i) {
          if (window.location.href.includes('?file=')) {
            return window.location.href.split('?file=')[1];
          } else {
            return localStorage.getItem('refresh').split('|||')[i];
          }
        }

        document.getElementsByClassName('hrStyle')[0].style.margin = 0;

        function stlFinished(i) {
          document.getElementById('status').innerHTML = '';
          document.getElementById('colorPicker').style.display = 'flex';

          // Set color of model
          let soFar = JSON.parse(getCookie('cartItems'));
          let id = getID(i);
          let colorVal = decodeURIComponent(soFar['content_' + id]['color_' + id]);
          chooseColor(colorMaps[colorVal]);
          // if (typeof fbq !== 'undefined') fbq('track', 'AddToCart');
        }

        function chooseDisplay(display, id) {
          for (let i = 0; i < models.length; i++) {
            models[i].set_display(0, display);
          }          
          highlightBtn(id);
        }

        function chooseColor(color, id, isRev = false) {
          for (let i = 0; i < models.length; i++) {
            models[i].set_color(0, color);
          }

          let hexToName = {
            '#ffffff': 'Fehér',
            '#ff0000': 'Piros',
            '#0089ff': 'Kék'
          };

          if (isRev) {
            _('color').value = hexToName[color];
            highlightBtn(id);
            updateCookie('color');
          } else {
            let hexToNum = {
              '#0089ff': 0,
              '#ffffff': 1,
              '#ff0000': 2
            };
            highlightBtn(hexToNum[color]);
          }
        }

        function highlightBtn(id) {
          let btns = document.getElementsByClassName('colorPick');
          for (let i = 0; i < btns.length; i++) {
            if (i === id) {
              btns[i].style.border = '2px solid #4285F4';
            } else {
              btns[i].style.border = '2px solid #dfdfdf';
            }
          }
        }
      
        function allowSLAUI(shouldSkip) {
          if (!shouldSkip) {
            _('slaChoice').classList.remove('slaDisabled');
          } else {
            _('slaChoice').classList.add('slaDisabled');
          }
        }

        function toggleAllowance(e) {
          let cookieIDs = localStorage.getItem('refresh').split('|||'); 
          let freshIDs = arr.map(path => {
            return path.split('printUploads')[1].replace('/', '').replace('.stl', '');
          });
          toggleSLAAllowance('scale', cookieIDs[0].length == 0 ? freshIDs : cookieIDs, allowSLAUI);
        }

        window.addEventListener('DOMContentLoaded', toggleAllowance);
      </script>
    `;
    resolve(content);
  });
}

module.exports = buildCustomPrint;
