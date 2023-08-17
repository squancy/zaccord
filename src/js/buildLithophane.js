const genQuan = require('./includes/genQuan.js');
const cookieFuncs = require('./includes/cookieFuncs.js');
const genSpecs = require('./includes/genSpecs.js');
const isVisited = require('./includes/isVisited.js');

// Build page for uploaded images --> create a lithophane
const buildLithophane = (conn, userID, filePaths, width, height) => {
  return new Promise((resolve, reject) => {
    // Process uploaded images
    let output = `
      <section class="keepBottom">
        <div class="litHolder flexDiv">
    `;
   
    // Leave the opportunity to handle more files; currently only 1 image/upload is allowed
    for (let i = 0; i < filePaths.length; i++) {
      let index = filePaths[i].search('/printUploads/');
      let url = filePaths[i].substr(index);
      var fileBuy = url.replace('/printUploads/lithophanes/', '');
      let paddingTop = height / width * 100;
      output += `
        <div class="bgCommon litImg productItem"
          style="background-image: url('${url}'); padding-top: ${paddingTop}%"
          onclick="toggleLit('${url}', 'can_${i}', 'img_${i}')" id="img_${i}"
          data-src="${url}">
          <canvas id="can_${i}" style="display: none;">
          </canvas>
        </div>
      `; 
    } 

    output += '</div>';

    // Default price is the same for all lihophanes
    let totalPrice = 2990;

    // Build output
    output += `
      <p class="align note ddgray" style="display: none;" id="clickNote">
        Nyomj a képre a litofán nézetért
      </p>
      <div class="flexDiv" id="customProps" style="flex-wrap: wrap; margin-top: 10px;">
        <div>
          <p>
            <span class="blue gotham">Egységár:</span>
            <span id="priceHolder">${totalPrice}</span> Ft 
          </p>
        </div>
        <div>
          <p>
            <span class="blue gotham">Méret:</span>
            <span id="sizeHolder"></span>
          </p>
        </div>
      </div>
      <p class="align note ddgray" id="chargeNote" style="margin-bottom: 30px;">
        A litofánia (dombornyomott) nézethez kattints a képre
      </p>
    `;

    output += genQuan();
    genSpecs(conn, null, null, true).then(specs => {
      output += specs;
      output += `
        <p class="align">
          <a href="/lithophaneHelp" target="_blank" class="blueLink">
            Mit jelent a litofánia formája?
          </a>
        </p>

        <p class="align note ddgray">
          A specifikációk megváltoztatása árváltozást vonhat maga után!
        </p>

        <div class="specBox" style="justify-content: center;">
          <button class="fillBtn btnCommon threeBros" id="buyLit">
            Vásárlás
          </button> 
          <button class="fillBtn btnCommon threeBros" id="toCart">
            Tovább a kosárhoz
          </button>
          <button class="fillBtn btnCommon threeBros" id="newFile">
            Új fájl feltöltése 
          </button>
        </div>
      `;

      // Save the lithophane to cookies
      output += `<script type="text/javascript">`;
      output += cookieFuncs();
      output += isVisited();
      output += `
        let fileBuy = "${fileBuy}";
        // Initialize vars used globally
        let data = [];
        let arr = [];
        function _(el) {
          return document.getElementById(el);
        }

        function saveToCookies(ratio) {
          // Loop over file paths and extract file names 
          for (let f of Array.from('${filePaths}'.split(','))) {
            let x = f.split('/');
            arr.push('/' + x[x.length - 2] + '/' + x[x.length - 1])
          }

          // Make sure the num of items in cookies do not exceed 15
          let canGo = true;
          if (Object.keys(JSON.parse(getCookie('cartItems') || '{}')).length + 
            arr.length > 15 || !isFirstVisit) {
            canGo = false;
          }

          // Go through the files and push them to cookies for later display in the cart
          for (let i = 0; i < arr.length; i++) {
            let path = arr[i];
            
            // Unique id
            let extension = arr[i].split('/')[2].split('.')[1];
            let id = arr[i].split('/')[2].replace('.' + extension, '');

            if ((!getCookie('cartItems') ||
              !Object.keys(JSON.parse(getCookie('cartItems'))).length ||
              !JSON.parse(getCookie('cartItems'))['content_' + id]) && canGo) {

              // Build cookie object (later converted to str)
              fileBuy = id + '.' + extension;
              let value = {
                ['content_' + id]: {
                  ['sphere_' + id]: encodeURIComponent(_('sphere').value),
                  ['size_' + id]: '150x' + (150 * ratio).toFixed(2) + 'x2',
                  ['color_' + id]: encodeURIComponent(_('color').value),
                  ['file_' + id]: id + '.' + extension,
                  ['quantity_' + id]: _('quantity').value
                }
              };
              
              // Set value in cookies
              let itemsSoFar = getCookie('cartItems');
              if (!itemsSoFar) itemsSoFar = '{}';
              itemsSoFar = JSON.parse(itemsSoFar);
              setCookie('cartItems', JSON.stringify(Object.assign(itemsSoFar, value)), 365);
              updateCartNum();
            }
          }
        }

        document.getElementsByClassName('hrStyle')[0].style.margin = 0;

        window.onbeforeunload = function() {

        };
        </script>
      `;
      output += `
        </section>
      `;
      resolve(output);
    });
  });
}

module.exports = buildLithophane;
