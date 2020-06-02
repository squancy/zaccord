const NodeStl = require('node-stl');
const genSpecs = require('./includes/genSpecs.js');

// Build custom print page; add interactive .stl file viewer + customization
const buildCustomPrint = (conn, userID, filePaths) => {
  return new Promise((resolve, reject) => {
    // Get volume, bounding box, weight and center of mass (not yet used, might be later)
    let totalPrice = 0;
    let sizes = [];
    let sizeMM = 0;
    let actualSize;
    for (let i = 0; i < filePaths.length; i++) {
      let x = filePaths[i].substr(2);
      let stl = new NodeStl(x);
      let volume = (stl.volume).toFixed(2); // cm^3
      let weight = (stl.weight).toFixed(2); // gramm
      let boxVolume = stl.boundingBox.reduce((a, c) => a * c);
      if (boxVolume > sizeMM) {
        sizeMM = stl.boundingBox.map(a => a.toFixed(2) + 'mm x ').join(' ');
        actualSize = stl.boundingBox;
      }
      let centerOfMass = stl.centerOfMass.map(x => x.toFixed(2) + 'mm'); // mm
      totalPrice += Math.round(volume * 50);
      sizes.push(boxVolume);
    }

    // Only select the maximum size when having more models
    let maxSize = Math.max(...sizes);
    let label = 'Méret';
    if (filePaths.length > 1) {
      label = 'Legnagyobb méret';
    }
    sizeMM = sizeMM.substr(0, sizeMM.length - 3);

    // Maximum printable size is 200mm x 200mm x 200mm, minimum is 5mm x 5mm x 5mm
    if (actualSize[0] < 5 || actualSize[1] < 5 || actualSize[2] < 5) {
      reject('A modellnek minimum 5mm x 5mm x 5mm méretűnek kell lennie');
      return;
    } else if (acualSize[0] > 200 || actualSize[1] > 200 || actualSize[2] > 200) {
      reject('A modellnak maximum 200mm x 200mm x 200mm méretűnek kell lennie');
      return; 
    }

    // 1500 Ft extra charge when ordering a [price] < 1500 Ft product
    let chargeText = '';
    let chargeNote = '';
    if (totalPrice < 1500) {
      totalPrice += 1500;
      chargeText = '(+ 1500Ft felár)';
      chargeNote = `
        <p class="align note">
          <span class="blue">Megjegyzés: </span> 1500 Ft alatti termékeknél plusz 1500 Ft
          felárat számolunk fel!
        </p>
      `;
    }

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
          <button class="borderBtn btnCommon">Vásárlás</button> 
        </div>

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
    content += `
      <script type="text/javascript">
        let data = [];
        let filePaths = Array.from('${filePaths}'.split(','));
        for (let i = 0; i < ${filePaths.length}; i++) {
          let path = filePaths[i].substr(1);
          let obj = {
            id: i,
            filename: path,
            color: "#ffffff"
          };
          data.push(obj);
        }

        document.getElementsByClassName('hrStyle')[0].style.margin = 0;
        
        var stlView = new StlViewer(document.getElementById("stlCont"), {
          all_loaded_callback: stlFinished,
          models: data
        });

        function stlFinished() {
          document.getElementById('status').innerHTML = '';
          document.getElementById('colorPicker').style.display = 'flex';
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
