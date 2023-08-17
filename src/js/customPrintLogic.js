const NodeStl = require('node-stl');
const genSpecs = require('./includes/genSpecs.js');
const checkStlSize = require('./includes/checkStlSize.js');
const cookieFuncs = require('./includes/cookieFuncs.js');
const isVisited = require('./includes/isVisited.js');
const genQuan = require('./includes/genQuan.js');
const randomstring = require('randomstring');
const constants = require('./includes/constants.js');
const getColors = require('./includes/getColors.js');
const getInStock = require('./includes/getInStock.js');
const getCMAT = require('./includes/getCMAT.js');
const getMaterials = require('./includes/getMaterials.js');
const specParams = require('./includes/specParams.js');
const colorInStock = require('./includes/colorInStock.js');
const calcCPPrice = constants.calcCPPrice;
const getCoords = constants.getCoords;
const SLA_MULTIPLIER = constants.slaMultiplier;
const PRINT_SIZES_PLA = constants.printSizesPLA;
const PRINT_SIZES_SLA = constants.printSizesSLA;

const LAYER_HEIGHT = specParams.layerHeight;
const INFILL = specParams.infill;
const SCALE = specParams.scale;
const WALL_WIDTH = specParams.wallWidth;
const LAYER_HEIGHT_SLA = specParams.layerHeightSLA;
const INFILL_SLA = specParams.infillSLA;

// Check if model fits the size of SLA printing 
function shouldAllowSLA(box) {
  let boxSorted = box.sort((a, b) => a - b);
  return (box[0] > PRINT_SIZES_SLA[0] || box[1] > PRINT_SIZES_SLA[1] || box[2] > PRINT_SIZES_SLA[3]) ? false : true
}

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
    let cnt = 0;
    let subVolumes = [];

    let allowSLA = true;
    
    let stlWidth = '';
    if (filePaths.length === 1) {
      stlWidth = 'style="min-width: 100%;"';
    } else if (filePaths.length === 2) {
      stlWidth = 'style="min-width: calc(50% - 6px);"';
    } else {
      stlWidth = 'style="min-width: calc(33% - 6px);"';
    }
    
    let isMoreFiles = filePaths.length > 1;
    let extraMarginDown = '20px';
    if (isMoreFiles) {
      extraMarginDown = '0px';
    }
    
    for (let i = 0; i < filePaths.length; i++) {
      let path = filePaths[i];
      let stl = new NodeStl(path, {density: 1.27}); // PLA has 1.27 g/cm^3 density
      let volume = (stl.volume).toFixed(2); // cm^3
      let weight = (stl.weight).toFixed(2); // gramm
      subVolumes.push(volume);
      let area = stl.area;
      totVolume += Number(volume);
      let [W, H, D] = getCoords(path);
      let boxVolume = stl.boundingBox.reduce((a, c) => a * c);
      sizeMM = stl.boundingBox.map(a => a.toFixed(2) + 'mm x ').join(' ');

      if (allowSLA) allowSLA = shouldAllowSLA(stl.boundingBox);
      let subSize = stl.boundingBox.map(a => a.toFixed(2) + 'mm x ').join(' ');
      subSize = subSize.substr(0, subSize.length - 3);

      let basePrice = calcCPPrice(volume, area / 100);
      let subpriceText = '';
      if (isMoreFiles) {
        subpriceText = `
          <p class="gotham align">
            <span class="blue gotham">Ár:</span>
            <span id="subprice_${i}">${Math.round(basePrice)}</span> Ft
          </p>
          <p class="gotham align">
            <span class="blue gotham">Méret:</span>
            <span id="subsize_${i}">
              ${subSize}
            </span>
          </p>
          <p class="gotham align">
            <span class="blue gotham">Térfogat:</span>
            <span id="subvolume_${i}">${Number(volume).toFixed(2)}</span>cm<sup>3</sup>
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
      
      // Make sure that model is not too large 
      if (!checkStlSize(stl.boundingBox)) {
        reject(`A maximális méret ${PRINT_SIZES_PLA[0]}mm x ${PRINT_SIZES_PLA[1]}mm x ${PRINT_SIZES_PLA[2]}mm lehet`);
        return;
      }

      let centerOfMass = stl.centerOfMass.map(x => x.toFixed(2) + 'mm'); // mm
      let fname = path.split('/');
      fname = fname[fname.length - 1].replace('.stl', '');
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
    sizeMM = sizeMM.substr(0, sizeMM.length - 3);

    // Build html output
    let content = `
      <textarea id="techVal" style="display: none;">FDM</textarea>
      <section class="keepBottom" style="overflow-x: revert;">
        <div class="flexDiv" style="margin-bottom: ${extraMarginDown}; flex-wrap: wrap;">
          ${stlContainers}
        </div>
        <div class="loadImg" id="status">
          <img src="/images/icons/loader.gif" style="margin-bottom: 0;">
        </div>
        <div id="colorPicker" class="flexDiv animate__animated animate__fadeIn"
          style="display: none;">
          <!--
          <div class="colorPick" onclick="chooseColor('#0089ff', 0, true)"
            style="background-color: #4285f4;">
          </div>
          <div class="colorPick" onclick="chooseColor('#ffffff', 1, true)"
            style="background-color: #ffffff;">
          </div>
          <div class="colorPick" onclick="chooseColor('#ff0000', 2, true)"
            style="background-color: #dc143c;">
          </div>
          -->
          <div class="colorPick bgCommon" onclick="chooseDisplay('flat', 0)"
            style="background-image: url('/images/flat.png')">
          </div>
          <div class="colorPick bgCommon" onclick="chooseDisplay('smooth', 1)"
            style="background-image: url('/images/smooth.png')">
          </div>
          <div class="colorPick bgCommon" onclick="chooseDisplay('wireframe', 2)"
            style="background-image: url('/images/wireframe.png')">
          </div>
        </div>
        <div class="flexDiv" id="customProps" style="flex-wrap: wrap; margin-top: 10px;">
          <div>
            <p>
              <span class="blue gotham">Végösszeg:</span>
              <span id="priceHolder">${Math.round(totalPrice)}</span> Ft
            </p>
          </div>
          <div>
            <p>
              <span class="blue gotham">Össztérfogat:</span>
              <span id="weightHolder">${totVolume.toFixed(2)}cm<sup>3</sup></span>
            </p>
          </div>
          <div style="display: ${!isMoreFiles ? 'block' : 'none'};">
            <p>
              <span class="blue gotham">Méret:</span>
              <span id="sizeHolder">${sizeMM}</span>
            </p>
          </div>
        </div>
    `;

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
          <div class="printTechTitle">FDM</div>
          <div class="font14">
            (${PRINT_SIZES_PLA[0]}mm x ${PRINT_SIZES_PLA[1]}mm x ${PRINT_SIZES_PLA[2]}mm)
          </div>
        </div>
        <div class="slaChoice align techOther trans ${disableSLAClass}" id="slaChoice">
          <div class="printTechTitle">SLA</div>
          <div class="font14">
            (${PRINT_SIZES_SLA[0]}mm x ${PRINT_SIZES_SLA[1]}mm x ${PRINT_SIZES_SLA[2]}mm)
          </div>
        </div>
      </div>
    `;

    let p1 = genSpecs(conn, totalPrice, sizeMM, false, true);
    let p2 = getMaterials(conn);
    let p3 = getColors(conn);
    let p4 = getCMAT(conn);
    let p5 = colorInStock(conn);

    Promise.all([p1, p2, p3, p4, p5]).then(vals => {
      let specs = vals[0];
      const PRINT_MATS = vals[1];
      let [colors, hex_codes] = vals[2];
      let CMAT = vals[3];
      let COLOR_IN_STOCK = vals[4];

      content += `
        <div class="specChBox trans" id="specChMat">
          <div class="specChBoxTitle gothamBold font22">Nyomtatás anyaga</div>
          <div class="specChImgBox">
            <img src="/images/specChImg/materials.jpg">
          </div>
          <div class="specChLongDesc gothamNormal">
            A nyomat ebből az anyagból fog készülni. Különböző anyagoknak más
            kémiai és fizikai tulajdonságaik vannak, így ez nagyban befolyásolja
            a végeredményt. Olyan szempontokat érdemes figyelembe venni, mint a
            hőnek vagy UV fénynek való kitettség, kell-e, hogy rugalmas legyen
            vagy, hogy mekkora terhelésnek lesz kitéve.
          </div>
          <div class="specChProps gothamNormal">
            <div>Hőállóság</div>
            <div>Szakítószilárdság</div>
            <div>Rugalmasság</div>
          </div>
          <div class="specChValBox font32 blue">
            <p data-value="PLA" id="chmat">PLA</p>
            <p class="otherPrice">Ár: ${Math.round(totalPrice)} Ft</p>
          </div>
        </div>

        <div class="specChDD" id="specChMatDD" data-open="closed">
      `;

      let matPairs = [
        {
          'npair': ['pla', 'PLA'],
          'desc': 'Alacsony költségű műanyag olyan prototípusokhoz, amik nem lesznek terhelve és hőnek kitéve'
        },
        {
          'npair': ['petg', 'PETG'],
          'desc': 'Alacsony költségű műanyag funkcionális alkatrészekhez'
        },
        {
          'npair': ['tpu_soft', 'TPU (SOFT - A70)'],
          'desc': 'Shore A70-es keménységű, rugalmas anyag flexibilis tárgyakhoz'
        },
        {
          'npair': ['tpu_medium', 'TPU (MEDIUM - A85)'],
          'desc': 'Shore A85-ös keménységű, rugalmas anyag flexibilis tárgyakhoz'
        },
        {
          'npair': ['tpu_hard', 'TPU (HARD - A95)'],
          'desc': 'Shore A95-ös keménységű, rugalmas anyag flexibilis tárgyakhoz'
        },
        {
          'npair': ['asa', 'ASA'],
          'desc': 'Erős, UV fény ellenálló anyag kinti prototípusokhoz'
        },
        {
          'npair': ['wood', 'WOOD'],
          'desc': 'PLA filament hozzáadott faforgáccsal a fa-szerű hatásért'
        },
        {
          'npair': ['metal', 'METAL'],
          'desc': 'PLA filament hozzáadott fémforgáccsal a fémes hatásért'
        },
        {
          'npair': ['magicpla', 'MAGIC PLA'],
          'desc': 'Többszínű, szivárványos PLA filament'
        },
        {
          'npair': ['nylon', 'NYLON'],
          'desc': 'Erős, hőálló anyag funkcionális prototípusokhoz'
        },
        {
          'npair': ['carbon_fiber', 'CARBON FIBER'],
          'desc': 'Erős, szénszállal erősített anyag funkcionális prototípusokhoz'
        }
      ];

      for (let obj of matPairs) {
        let highlight = obj['npair'][0] == 'pla' ? 'specChHl' : '';
        content += `
          <div class="specChDDItem trans ${highlight}" data-value="${obj['npair'][1]}">
            <div>
              <img src="/images/specChImg/${obj['npair'][0]}.jpg">
            </div>
            <div class="gothamNormal font20 p10">
              ${obj['npair'][1]}
            </div>
            <div class="gothamNormal"></div>
            <div class="gothamNormal font14">
              ${obj['desc']}
            </div>
          </div>
        `;
      }

      content += `
        </div>

        <div class="specChBox trans" id="specChColor">
          <div class="specChBoxTitle gothamBold font22">Szín</div>
          <div class="specChImgBox">
            <img src="/images/specChImg/colors.jpg" id="colorCh">
          </div>
          <div class="specChLongDesc gothamNormal">
            A nyomtatási anyag színe. Jelenleg egy terméket csak egy színnel
            tudunk nyomtatni, vagyis egy modellen belül csak egy szín
            alkalmazható.
          </div>
          <div class="specChProps gothamNormal">
            <div>Megjelenés</div>
            <div>Szállítási idő</div>
            <div>Felületminőség</div>
          </div>
          <div class="specChValBox font32 blue">
            <p data-value="Fehér" id="chcolor">Fehér</p>
            <p class="otherPrice">Ár: ${Math.round(totalPrice)} Ft</p>
          </div>
        </div>

        <div class="specChDD" id="specChColorDD" data-open="closed">
      `;

      for (let pair of CMAT['pla']) {
        let color = Object.keys(pair)[0];
        let highlight = color == 'Fehér' ? 'specChHl' : '';
        content += `
          <div class="specChDDItem trans ${highlight}" data-value="${color}">
            <div>
              <img src="/images/colors/${pair[color]}">
            </div>
            <div class="gothamNormal font20 p10">
              ${color}
            </div>
            <div class="gothamNormal"></div>
            <div>
              <p>${COLOR_IN_STOCK['pla'][color]}</p>
            </div>
          </div>
        `;
      }

      content += `
        </div>

        <div class="specChBox trans" id="specChLh">
          <div class="specChBoxTitle gothamBold font22">Rétegvastagság</div>
          <div class="specChImgBox">
            <img src="/images/specChImg/layerHeight.jpg">
          </div>
          <div class="specChLongDesc gothamNormal">
            A 3D nyomtatás egy additív gyártási folyamat, tehát a modellek
            rétegekből épülnek fel. Az egymást követő rétegeknek vastagsága van,
            ezt hívjuk rétegvastagságnak. Minél kisebb a rétegek közötti
            távolság, annál pontosabb és részletesebb lesz a kívánt modell,
            viszont ezzel együtt drasztikusan megemelkedik a nyomtatási idő.
          </div>
          <div class="specChProps gothamNormal">
            <div>Megjelenés</div>
            <div>Nyomtatási idő</div>
            <div>Felületminőség</div>
          </div>
          <div class="specChValBox font32 blue">
            <p data-value="0.20" id="chlh">0.20mm</p>
            <p class="otherPrice">Ár: ${Math.round(totalPrice)} Ft</p>
          </div>
        </div>

        <div class="specChDD" id="specChLhDD" data-open="closed">
      `;
      
      let lhPairs = [
        ['lh12', '0.12mm'],
        ['lh20', '0.20mm'],
        ['lh28', '0.28mm']
      ];

      for (let pair of lhPairs) {
        let highlight = pair[1] == '0.20mm' ? 'specChHl' : '';
        content += `
          <div class="specChDDItem trans ${highlight}"
            data-value="${pair[1].replace('mm', '')}">
            <div>
              <img src="/images/specChImg/${pair[0]}.jpg">
            </div>
            <div class="gothamNormal font20 p10">
              ${pair[1]}
            </div>
            <div class="gothamNormal"></div>
          </div>
        `;
      }

      content += `
        </div>

        <div class="specChBox trans" id="specChLhSLA" style="display: none">
          <div class="specChBoxTitle gothamBold font22">Rétegvastagság</div>
          <div class="specChImgBox">
            <img src="/images/specChImg/sla_lh.jpg">
          </div>
          <div class="specChLongDesc gothamNormal">
            A 3D nyomtatás egy additív gyártási folyamat, tehát a modellek
            rétegekből épülnek fel. Az egymást követő rétegeknek vastagsága van,
            ezt hívjuk rétegvastagságnak. Minél kisebb a rétegek közötti
            távolság, annál pontosabb és részletesebb lesz a kívánt modell,
            viszont ezzel együtt drasztikusan megemelkedik a nyomtatási idő.
          </div>
          <div class="specChProps gothamNormal">
            <div>Megjelenés</div>
            <div>Nyomtatási idő</div>
            <div>Felületminőség</div>
          </div>
          <div class="specChValBox font32 blue">
            <p data-value="0.05" id="chlhSLA">0.05mm</p>
            <p class="otherPrice">Ár: ${Math.round(totalPrice)} Ft</p>
          </div>
        </div>

        <div class="specChDD" id="specChLhDDSLA" data-open="closed">
      `;

      let lhPairsSLA = [
        ['lh12', '0.05mm'],
        ['lh20', '0.07mm'],
        ['lh28', '0.10mm']
      ];

      for (let pair of lhPairsSLA) {
        let highlight = pair[1] == '0.05mm' ? 'specChHl' : '';
        content += `
          <div class="specChDDItem trans ${highlight}"
            data-value="${pair[1].replace('mm', '')}">
            <div>
              <img src="/images/specChImg/${pair[0]}.jpg">
            </div>
            <div class="gothamNormal font20 p10">
              ${pair[1]}
            </div>
            <div class="gothamNormal"></div>
          </div>
        `;
      }
      
      content += `
        </div>

        <div class="specChBox trans" id="specChInf">
          <div class="specChBoxTitle gothamBold font22">Sűrűség</div>
          <div class="specChImgBox">
            <img src="/images/specChImg/density.jpg">
          </div>
          <div class="specChLongDesc gothamNormal">
            A 3D-s modell belső telítettségét jelenti. Ahogy nő a sűrűség értéke,
            annál több anyag kell a termék elkészítéséhez, de annál masszívabb is
            lesz. Szoborszerű vagy kevésbé használatos tárgyaknál felesleges a
            termék sűrű kitötlése, viszont rendszeresen használt eszközöknél
            érdemes beállítani egy nagyobb értéket. A sűrűség növelésével nő a
            nyomtatási idő és a modell tömege is.
          </div>
          <div class="specChProps gothamNormal">
            <div>Stabilitás</div>
            <div>Nyomtatási idő</div>
            <div>Tömeg</div>
          </div>
          <div class="specChValBox font32 blue">
            <p data-value="20" id="chinf">20%</p>
            <p class="otherPrice">Ár: ${Math.round(totalPrice)} Ft</p>
          </div>
        </div>

        <div class="specChDD" id="specChInfDD" data-open="closed">
      `;

      for (let i of INFILL) {
        let highlight = i == 20 ? 'specChHl' : '';
        content += `
          <div class="specChDDItem trans ${highlight}" data-value="${i}">
            <div>
              <img src="/images/specChImg/infill${i}.jpg">
            </div>
            <div class="gothamNormal font20 p10">
              ${i}%
            </div>
            <div class="gothamNormal"></div>
          </div>
        `;
      }
      
      content += `
        </div>

        <div class="specChBox trans" id="specChInfSLA" style="display: none">
          <div class="specChBoxTitle gothamBold font22">Sűrűség</div>
          <div class="specChImgBox">
            <img src="/images/specChImg/sla_infill.jpg">
          </div>
          <div class="specChLongDesc gothamNormal">
            A 3D-s modell belső telítettségét jelenti. Ahogy nő a sűrűség értéke,
            annál több anyag kell a termék elkészítéséhez, de annál masszívabb is
            lesz. Szoborszerű vagy kevésbé használatos tárgyaknál felesleges a
            termék sűrű kitötlése, viszont rendszeresen használt eszközöknél
            érdemes beállítani egy nagyobb értéket. A sűrűség növelésével nő a
            nyomtatási idő és a modell tömege is.
          </div>
          <div class="specChProps gothamNormal">
            <div>Stabilitás</div>
            <div>Nyomtatási idő</div>
            <div>Tömeg</div>
          </div>
          <div class="specChValBox font32 blue">
            <p data-value="Tömör" id="chinfSLA">Tömör</p>
            <p class="otherPrice">Ár: ${Math.round(totalPrice)} Ft</p>
          </div>
        </div>

        <div class="specChDD" id="specChInfDDSLA" data-open="closed">
      `;

      for (let s of INFILL_SLA) {
        let highlight = s == 'Tömör' ? 'specChHl' : '';
        let i = s == 'Tömör' ? 100 : 10;
        content += `
          <div class="specChDDItem trans ${highlight}" data-value="${s}">
            <div>
              <img src="/images/specChImg/infill${i}.jpg">
            </div>
            <div class="gothamNormal font20 p10">
              ${s}
            </div>
            <div class="gothamNormal"></div>
          </div>
        `;
      }
      
      content += `
        </div>

        <div class="specChBox trans" id="specChScale">
          <div class="specChBoxTitle gothamBold font22">Méretezés</div>
          <div class="specChImgBox">
            <img src="/images/specChImg/scale.jpg">
          </div>
          <div class="specChLongDesc gothamNormal">
            A tárgy méreteinek kicsinyítését, nagyítását jelenti az
            alapértelmezetthez képest. Az összes tengely mentén való
            méretváltozással járó folyamat. Például egy 10mm x 10mm x 10mm-es
            termék x0.5-ös méretezéssel 5mm x 5mm x 5mm-es lesz.
          </div>
          <div class="specChProps gothamNormal">
            <div>Méret</div>
            <div>Nyomtathatóság</div>
            <div>Kicsinyítés</div>
          </div>
          <div class="specChValBox font32 blue">
            <p data-value="1.0" id="chscale">x1.0</p>
            <p class="otherPrice">Ár: ${Math.round(totalPrice)} Ft</p>
          </div>
        </div>

        <div class="specChDD" id="specChScaleDD" data-open="closed">
      `;

      for (let i of SCALE) {
        let highlight = i == 10 ? 'specChHl' : '';
        content += `
          <div class="specChDDItem trans ${highlight}" data-value="${(i).toFixed(1)}">
            <div>
              <img src="/images/specChImg/scale_ch.jpg">
            </div>
            <div class="gothamNormal font20 p10">
              x${(i).toFixed(1)}
            </div>
            <div class="gothamNormal"></div>
          </div>
        `; 
      }
      
      content += `
        </div>

        <div class="specChBox trans" id="specChShell">
          <div class="specChBoxTitle gothamBold font22">Falvastagság</div>
          <div class="specChImgBox">
            <img src="/images/specChImg/wall_thickness.jpg">
          </div>
          <div class="specChLongDesc gothamNormal">
            A termék külső, tömör falának vastagsága. A nagyobb falvastagság
            stabilitást ad a tárgynak, de növeli a nyomtatási időt. Fontos hogy
            ezen érték változtatása nem befolyásolja a termék méreteit, hiszen a
            nyomtató befelé vastagítja meg a falakat.
          </div>
          <div class="specChProps gothamNormal">
            <div>Stabilitás</div>
            <div>Nyomtathatóság</div>
            <div>Tartás</div>
          </div>
          <div class="specChValBox font32 blue">
            <p data-value="1.2" id="chshell">1.2mm</p>
            <p class="otherPrice">Ár: ${Math.round(totalPrice)} Ft</p>
          </div>
        </div>

        <div class="specChDD" id="specChShellDD" data-open="closed">
      `;

      for (let i of WALL_WIDTH) {
        let highlight = i == 12 ? 'specChHl' : '';
        content += `
          <div class="specChDDItem trans ${highlight}" data-value="${i.toFixed(1)}">
            <div>
              <img src="/images/specChImg/shells${(i * 10).toFixed(1) == 8 ? '08' : (i * 10).toFixed(0)}.jpg">
            </div>
            <div class="gothamNormal font20 p10">
              ${i.toFixed(1)}mm
            </div>
            <div class="gothamNormal"></div>
          </div>
        `;
      }

      content += `
        </div>
      `;
    
      content += `
        <hr class="hrStyle">
        <br>
        <div style="display: none;">${specs}</div>
      `;

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
          let subVolumes = Array.from('${subVolumes}'.split(','));
          let subPricesSLA = subPrices.map(x => Math.round(x * ${SLA_MULTIPLIER}));
          let basePriceSLA = subPricesSLA.reduce((acc, val) => acc + val);
          let thumbs = [];
          let sizeCnt = 0;
          let modelIDs = [];
          let CMAT = ${JSON.stringify(CMAT)};

          const PCOLORS = ${JSON.stringify(colors)};
          const HEX_COLORS = ${JSON.stringify(hex_codes)};
          const PRINT_MULTS = ${JSON.stringify(PRINT_MATS)};
          const COLOR_IN_STOCK = ${JSON.stringify(COLOR_IN_STOCK)};

          // Loop over file paths and extract file names used for thumbnails & .stl
          for (let f of Array.from('${filePaths}'.split(','))) {
            let x = f.split('/');
            arr.push('/' + x[x.length - 2] + '/' + x[x.length - 1]);
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
              return window.location.href.split('?file=')[1].split(',')[i];
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
            if (_('color').value.toLowerCase().includes('átlátszó')) {
              models[i].set_opacity(0, 0.5);
            } 
            chooseColor('#' + colorMaps[colorVal]);
            // if (typeof fbq !== 'undefined') fbq('track', 'AddToCart');
          }

          function setOpacity(opacity) {
            for (let i = 0; i < models.length; i++) {
              models[i].set_opacity(0, opacity);
            }
          }

          function setOpacityAll() {
            if (_('color').value.toLowerCase().includes('átlátszó')) {
              setOpacity(0.5);
            } else {
              setOpacity(1);
            }
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
              // highlightBtn(id);

              if (_('fdmChoice').classList.value.includes('techChosen')) {
                _('printMat').value = 'PLA';
                chgMat(hexToName[color]);
                updateCookie('printMat');
              } else {
                updateCookie('color');
              }
            } else {
              let hexToNum = {
                '#0089ff': 0,
                '#ffffff': 1,
                '#ff0000': 2
              };
              // highlightBtn(hexToNum[color]);
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

          // Make sure all file IDs exist in cookies: if not redirect to another page
          const FILE_IDS = window.location.href.split('?file=')[1].split(',');
          const COOKIE_IDS = Object.keys(JSON.parse(getCookie('cartItems'))).map(e => e.replace('content_', ''));
          for (let fid of FILE_IDS) {
            if (COOKIE_IDS.indexOf(fid) < 0) {
              window.location.replace('/print');
            }
          }
        </script>
      `;
      resolve(content);
    });
  });
}

module.exports = buildCustomPrint;
