const NodeStl = require('node-stl');
const genSpecs = require('./includes/genSpecs.js');
const checkStlSize = require('./includes/checkStlSize.js');
const calcPrice = require('./includes/calcPrice.js');
const randomstring = require('randomstring');

// Build custom print page; add interactive .stl file viewer + customization
const buildCustomPrint = (conn, userID, filePaths) => {
  return new Promise((resolve, reject) => {
    // Get volume, bounding box, weight and center of mass (not yet used, might be later)
    let totalPrice = 0;
    let sizes = [];
    let sizeMM = 0;
    let paths = [];
    let subPrices = [];
    for (let i = 0; i < filePaths.length; i++) {
      let path = filePaths[i];
      let stl = new NodeStl(path);
      let volume = (stl.volume).toFixed(2); // cm^3
      let weight = (stl.weight).toFixed(2); // gramm
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
      totalPrice += calcPrice(Math.round(weight * 60), 0.2, 20, 1, 1.2);
      subPrices.push(Math.round(weight * 60));
      sizes.push(boxVolume);
      paths.push(fname);
    }

    // Only select the maximum size when having more models
    let maxSize = Math.max(...sizes);
    let label = 'Méret';
    if (filePaths.length > 1) {
      label = 'Legnagyobb méret';
    }
    sizeMM = sizeMM.substr(0, sizeMM.length - 3);

    // 1500 Ft extra charge when ordering a [price] < 1500 Ft product
    let chargeText = '<span id="charge"></span>';
    let chargeNote = '';
    let extraPrice = 0;
    if (totalPrice < 1000) {
      extraPrice = 1000 - totalPrice;
      chargeText = `<span id="charge">(+${extraPrice} Ft felár)</span>`;
      chargeNote = `
        <p class="align note">
          <span class="blue">Megjegyzés: </span> 1000 Ft alatti termékeknél 1000Ft - termékár
          felárat számolunk fel!
        </p>
      `;
    }

    // Build html output
    let content = `
      <section class="keepBottom">
        <div id="stlCont" style="margin: 0 0 20px 0;"></div>
        <div class="loadImg" id="status">
          <img src="/images/icons/loader.gif" style="margin-bottom: 0;">
        </div>
        <div id="colorPicker" class="flexDiv" style="display: none;">
          <div class="colorPick" onclick="chooseColor('#4285f4')"
            style="background-color: #4285f4;">
          </div>
          <div class="colorPick" onclick="chooseColor('#ffffff')"
            style="background-color: #ffffff;">
          </div>
          <div class="colorPick" onclick="chooseColor('#dc143c')"
            style="background-color: #dc143c;">
          </div>
          <div class="colorPick bgCommon" onclick="chooseDisplay('flat')"
            style="background-image: url('/images/flat.png')">
          </div>
          <div class="colorPick bgCommon" onclick="chooseDisplay('smooth')"
            style="background-image: url('/images/smooth.png')">
          </div>
          <div class="colorPick bgCommon" onclick="chooseDisplay('wireframe')"
            style="background-image: url('/images/wireframe.png')">
          </div>
        </div>
        <div class="flexDiv" id="customProps" style="flex-wrap: wrap; margin-top: 10px;">
          <div>
            <p>
              <span class="blue">Ár:</span>
              <span id="priceHolder">${totalPrice}</span> Ft ${chargeText}
            </p>
          </div>
          <div>
            <p>
              <span class="blue">${label}:</span>
              <span id="sizeHolder">${sizeMM}</span>
            </p>
          </div>
        </div>
      ${chargeNote}
    `;

    content += genSpecs(totalPrice, sizeMM);

    content += `
        <div class="specBox">
          <button class="borderBtn btnCommon" id="buyCP">Vásárlás</button> 
        </div>
        <div id="infoStat" class="infoBox"></div>

        <p class="align">
          <a href="/mitjelent" target="_blank" class="blueLink">Mit jelentenek ezek?</a>
        </p>

        <p class="align note">
          <span class="blue">Megjegyzés: </span> a specifikációk megváltoztatása
          árváltozást vonhat maga után!
        </p>

        <p class="align note">
          <span class="blue">Tipp: </span> ha nem szeretnél bajlódni a paraméterekkel, hagyd az
          alapbeállításokon!
        </p>
      </section>
    `;
      
    // JS content for displaying the interactive stl viewer
    content += `
      <script type="text/javascript">
        // Set cookie to a specific value
        function setCookie(cname, cvalue, exdays) {
          var d = new Date();
          d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
          var expires = "expires="+d.toUTCString();
          document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
        }

        // Get value of a specific cookie
        function getCookie(cname) {
          var name = cname + "=";
          var ca = document.cookie.split(';');
          for(var i = 0; i < ca.length; i++) {
            var c = ca[i];
            while (c.charAt(0) == ' ') {
              c = c.substring(1);
            }
            if (c.indexOf(name) == 0) {
              return c.substring(name.length, c.length);
            }
          }
          return "";
        }

        // Initialize vars used globally
        let data = [];
        let isLoggedIn = Boolean(${userID});
        let thName = 'ads';
        let paths = '${paths}';
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
        let canGo = true;
        if (Object.keys(JSON.parse(getCookie('cartItems') || '{}')).length + arr.length > 15) {
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
            x: i * 100
          };
          data.push(obj);
        }

        document.getElementsByClassName('hrStyle')[0].style.margin = 0;

        window.onbeforeunload = function() {
          return "Biztos vagy benne, hogy újratöltöd az oldalt?";
        };

        // Use a 3rd party library for viewing .stl files
        var stlView = new StlViewer(document.getElementById("stlCont"), {
          all_loaded_callback: stlFinished,
          models: data
        });

        function stlFinished() {
          document.getElementById('status').innerHTML = '';
          document.getElementById('colorPicker').style.display = 'flex';
        }

        function chooseDisplay (display) {
          for (let i = 0; i < ${filePaths.length}; i++) {
            stlView.set_display(i, display);
          }          
        }

        function chooseColor(color) {
          for (let i = 0; i < ${filePaths.length}; i++) {
            stlView.set_color(i, color);
          }
        }
      </script>
    `;
    resolve(content);
  });
}

module.exports = buildCustomPrint;
