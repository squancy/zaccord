const NodeStl = require('node-stl');
const genSpecs = require('./includes/genSpecs.js');
const checkStlSize = require('./includes/checkStlSize.js');
const calcPrice = require('./includes/calcPrice.js');
const cookieFuncs = require('./includes/cookieFuncs.js');
const isVisited = require('./includes/isVisited.js');
const genQuan = require('./includes/genQuan.js');
const randomstring = require('randomstring');

// Build custom print page; add interactive .stl file viewer + customization
const buildCustomPrint = (conn, userID, filePaths) => {
  return new Promise((resolve, reject) => {
    // Get volume, bounding box, weight and center of mass (not yet used, might be later)
    let totalPrice = 0;
    let sizes = [];
    let sizeMM = 0;
    let subPrices = [];
    let totWeight = 0;
    for (let i = 0; i < filePaths.length; i++) {
      let path = filePaths[i];
      let stl = new NodeStl(path);
      let volume = (stl.volume).toFixed(2); // cm^3
      let weight = (stl.weight).toFixed(2); // gramm
      totWeight += Number(weight);
      let boxVolume = stl.boundingBox.reduce((a, c) => a * c);
      if (boxVolume > sizeMM) {
        sizeMM = stl.boundingBox.map(a => a.toFixed(2) + 'mm x ').join(' ');
      }
      
      // Make sure size is between the printer's boundaries: 5mm - 200mm
      if (!checkStlSize(stl.boundingBox)) {
        reject('Hibás méretezés');
        return;
      }

      let centerOfMass = stl.centerOfMass.map(x => x.toFixed(2) + 'mm'); // mm
      let fname = path.split('/');
      fname = fname[fname.length - 1].replace('.stl', '');
      totalPrice += calcPrice(Math.round(weight * 100 + weight * 1300 / 60), 0.2, 20, 1, 1.2);
      subPrices.push(Math.round(weight * 100 + weight * 1300 / 60));
      sizes.push(boxVolume);
    }

    // Only select the maximum size when having more models
    let maxSize = Math.max(...sizes);
    let label = 'Méret';
    if (filePaths.length > 1) {
      label = 'Legnagyobb termék mérete';
    }
    sizeMM = sizeMM.substr(0, sizeMM.length - 3);

    // 1500 Ft extra charge when ordering a [price] < 1500 Ft product
    let chargeText = '<span id="charge"></span>';
    let dp = 'display: none';
    let extraPrice = 0;
    if (totalPrice < 500) {
      extraPrice = 500 - totalPrice;
      chargeText = `<span id="charge">(+${extraPrice} Ft felár)</span>`;
      dp = 'display: block';
    }

    let chargeNote = `
      <p class="align note ddgray" id="chargeNote" style='${dp}'>
        500 Ft alatti termékeknél 500Ft - termékár
        felárat számolunk fel!
      </p>
    `;

    // Build html output
    let content = `
      <section class="keepBottom">
        <div id="stlCont" style="margin: 0 0 20px 0;"></div>
        <div class="loadImg" id="status">
          <img src="/images/icons/loader.gif" style="margin-bottom: 0;">
        </div>
        <div id="colorPicker" class="flexDiv animate__animated animate__fadeIn"
          style="display: none;">
          <div class="colorPick" onclick="chooseColor('#4285f4', 0, true)"
            style="background-color: #4285f4;">
          </div>
          <div class="colorPick" onclick="chooseColor('#ffffff', 1, true)"
            style="background-color: #ffffff;">
          </div>
          <div class="colorPick" onclick="chooseColor('#dc143c', 2, true)"
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
              <span class="blue gotham">Ár:</span>
              <span id="priceHolder">${totalPrice}</span> Ft ${chargeText}
            </p>
          </div>
          <div>
            <p>
              <span class="blue gotham">Becsült Tömeg:</span>
              <span id="weightHolder">${totWeight.toFixed(2)}g</span>
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
    
    content += genQuan(chargeNote);
    content += genSpecs(totalPrice, sizeMM);

    content += `
        <div class="specBox">
          <button class="fillBtn btnCommon" id="buyCP" style="margin-right: 0;">
            Vásárlás
          </button> 
        </div>
        <div id="infoStat" class="infoBox"></div>

        <p class="align">
          <a href="/mitjelent" target="_blank" class="blueLink">Mit jelentenek ezek?</a>
        </p>

        <p class="align note ddgray">
          A specifikációk megváltoztatása árváltozást vonhat maga után!
          Több termék esetén ezek változtatása minden egyes termékre értendő!
        </p>

        <p class="align note ddgray">
          Ha nem szeretnél bajlódni a paraméterekkel, hagyd az alapbeállításokon!
        </p>
      </section>
    `;
      
    // JS content for displaying the interactive stl viewer
    content += `
      <script type="text/javascript">
    `;

    content += cookieFuncs();
    content += isVisited();
    content += `
        // Initialize vars used globally
        let data = [];
        let arr = [];
        let subPrices = Array.from('${subPrices}'.split(','));
        let thumbs = [];

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
        console.log(isFirstVisit);
        let canGo = true;
        if (Object.keys(JSON.parse(getCookie('cartItems') || '{}')).length + arr.length > 15
          || !isFirstVisit) {
          canGo = false;
        }

        // Go through the files and push them to cookies for later display in the cart
        for (let i = 0; i < arr.length; i++) {
          let path = arr[i];
          
          // Unique id
          let id = arr[i].split('/')[2].replace('.stl', '');
          if ((!getCookie('cartItems') ||
            !Object.keys(JSON.parse(getCookie('cartItems'))).length ||
            !JSON.parse(getCookie('cartItems'))['content_' + id]) && canGo) {

            // Build cookie object (later converted to str)
            let value = {
              ['content_' + id]: {
                ['rvas_' + id]: _('rvas').value,
                ['suruseg_' + id]: _('suruseg').value,
                ['color_' + id]: encodeURIComponent(_('color').value),
                ['scale_' + id]: _('scale').value,
                ['fvas_' + id]: _('fvas').value,
                ['quantity_' + id]: _('quantity').value,
                ['price_' + id]: subPrices[i]
              }
            };
            
            // Set value in cookies
            let itemsSoFar = getCookie('cartItems');
            if (!itemsSoFar) itemsSoFar = '{}';
            itemsSoFar = JSON.parse(itemsSoFar);
            setCookie('cartItems', JSON.stringify(Object.assign(itemsSoFar, value)), 365);
          }

          // Also build .stl file name array used for displaying them interactively
          let obj = {
            id: i,
            filename: path,
            color: "#ffffff",
            x: i * 220
          };
          data.push(obj);
        }

        document.getElementsByClassName('hrStyle')[0].style.margin = 0;

        // Use a 3rd party library for viewing .stl files
        var stlView = new StlViewer(document.getElementById("stlCont"), {
          all_loaded_callback: stlFinished,
          models: data
        });

        function stlFinished() {
          document.getElementById('status').innerHTML = '';
          document.getElementById('colorPicker').style.display = 'flex';

          // Set color of model
          let soFar = JSON.parse(getCookie('cartItems'));
          let id = localStorage.getItem('refresh');
          let colorVal = decodeURIComponent(soFar['content_' + id]['color_' + id]);
          chooseColor(colorMaps[colorVal]);
        }

        function chooseDisplay (display, id) {
          for (let i = 0; i < ${filePaths.length}; i++) {
            stlView.set_display(i, display);
          }          
          highlightBtn(id);
        }

        function chooseColor(color, id, isRev = false) {
          for (let i = 0; i < ${filePaths.length}; i++) {
            stlView.set_color(i, color);
          }

          let hexToName = {
            '#ffffff': 'Fehér',
            '#dc143c': 'Piros',
            '#4285f4': 'Kék'
          };

          if (isRev) {
            _('color').value = hexToName[color];
            highlightBtn(id);
          } else {
            let hexToNum = {
              '#4285f4': 0,
              '#ffffff': 1,
              '#dc143c': 2
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
      </script>
    `;
    resolve(content);
  });
}

module.exports = buildCustomPrint;
