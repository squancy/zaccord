let bpSave = [basePrice, basePriceSLA];
let currentMat = _('printMat').value.toLowerCase();
let colorMaps = HEX_COLORS[currentMat];

let specChObj = {
  'specChLh': 'specChLhDD',
  'specChInf': 'specChInfDD',
  'specChShell': 'specChShellDD',
  'specChMat': 'specChMatDD',
  'specChColor': 'specChColorDD',
  'specChScale': 'specChScaleDD',
  'specChLhSLA': 'specChLhDDSLA',
  'specChInfSLA': 'specChInfDDSLA'
}

function getAttrVal(id) {
  return _(id).getAttribute('data-value');
}

function setAttrVal(id, v) {
  _(id).setAttribute('data-value', v);
  let val = v;
  if (id == 'chlh' || id == 'chlhSLA' || id == 'chshell') {
    val = v + 'mm';
  } else if (id == 'chinf') {
    val = v + '%';
  } else if (id == 'chscale') {
    val = 'x' + v;
  } 
  
  _(id).innerText = val;

  let postfix = id.includes('SLA') ? 'SLA' : '';
  let child;
  let type = id.replace('ch', '');
  type = (type[0].toUpperCase() + type.slice(1)).replace('SLA', '');
  let nid = 'specCh' + type;
  for (let c of _(nid + 'DD' + postfix).children) {
    if (c.getAttribute('data-value') == v) {
      child = c;
      break;
    }
  }
  
  handleChClick(child, _(nid + 'DD' + postfix).children, nid + postfix);
}

function updateSubPrices() {
  if (subPrices.length > 1) {
    for (let i = 0; i < subPrices.length; i++) {
      let price;
      if (_('techVal').value == 'FDM') {
        price = calcP(subPrices[i]);
      } else {
        let params = getSLAParams();
        price = calcSLAPrice(subPrices[i] * SLA_MULTIPLIER, ...params);
      }
      _('subprice_' + i).innerText = price;
    }
  }
}

function genUIColors(selectedColor, mat) {
  let ncolors = '';
  for (let pair of CMAT[mat]) {
    let currentColor = Object.keys(pair)[0];
    let highlight = currentColor == selectedColor ? 'specChHl' : '';
    if (Number(COLOR_IN_STOCK[mat][currentColor])) {
      var stockColor = 'green'; 
      var stockText = 'Raktáron'
    } else {
      var stockColor = 'red'; 
      var stockText = 'Nincs raktáron'
    }
    let imgStyle = '';
    if (mat == 'gyanta (resin)') {
      imgStyle = 'width: auto; height: 60px;';
    }
    ncolors += `
      <div class="specChDDItem trans ${highlight}" data-value="${currentColor}">
        <div>
          <img src="/images/colors/${pair[currentColor]}" style="${imgStyle}">
        </div>
        <div class="gothamNormal font20 p10">
          ${currentColor}
        </div>
        <div class="gothamNormal"></div>
        <div class="gothamNormal">
          <p style="color: ${stockColor}">${stockText}</p>
        </div>
      </div>
    `; 
  }
  
  return ncolors;
}

function attachColorListeners() {
  for (let child of _('specChColorDD').children) {
    child.addEventListener('click', (e) => handleChClick(child, _('specChColorDD').children, 'specChColor'));
  }
}

function chgMat(currentColor) {
  currentMat = _('printMat').value.toLowerCase();
  colorMaps = HEX_COLORS[currentMat];
  let newColors = '';
  let selectedColor;
  if (PCOLORS[currentMat].indexOf(currentColor) > -1) {
    selectedColor = currentColor; 
  } else {
    selectedColor = PCOLORS[currentMat][0];
  }

  for (let color of PCOLORS[currentMat]) {
    let selected = color == selectedColor ? 'selected' : '';
    newColors += `<option value="${color}" ${selected}>${color}</option>`;
  }

  _('color').innerHTML = newColors;
  _('specChColorDD').innerHTML = genUIColors(selectedColor, currentMat);
  setAttrVal('chcolor', selectedColor);
  updateCookie('color');
  attachColorListeners();
}

function hasBelow800() {
  for (let i = 0; i < subPrices.length; i++) {
    if (_('techVal').value == 'FDM' && calcP(subPrices[i]) === 800) {
      return true; 
    } else {
      let params = getSLAParams();
      if (calcSLAPrice(subPrices[i] * SLA_MULTIPLIER, ...params) === 800) {
        return true; 
      }
    }
  }
  return false;
}

function calcSLAPrice(p, lw, infill, scale) {
  let multiplier = infill == 'Tömör' ? 1 : 0.8;
  let fp = smoothPrice(Math.round(p * (1 / (lw * 70) + 0.7142857142857143) * multiplier * scale));
  return fp < MIN_PRICE ? MIN_PRICE : fp;
}

function getSLAParams() {
  return [Number(_('rvasSLA').value), _('infillSLA').value, Number(_('scale').value)];
}

function updateSLAPrice() {
  let [lw, infill, scale] = getSLAParams();
  let nPrice = calcSLAPrice(basePrice, lw, infill, scale);
  priceChange();
}

function updateSLASpecs(contID, cookieID) {
  updateCookie(contID, null, cookieID);
  basePrice = bpSave[1];
  updateSLAPrice();
}

// Toggle SLA/FDM printing specifications
const fdmIDs = ['rvasFDMBox', 'surusegFDMBox', 'fvasFDMBox', 'printMatBox', 'specChLh', 'specChInf', 'specChShell', 'specChMat']; 
const slaIDs = ['rvasSLABox', 'infillSLABox', 'specChLhSLA', 'specChInfSLA'];

function toggleTechs(ids1, ids2, box1, box2) {
  _('toggleDiv').classList.add('animate__fadeIn');
  for (let i1 of ids1) {
    _(i1).style.display = 'flex';
  }

  for (let i2 of ids2) {
    _(i2).style.display = 'none';
  }

  for (let key of Object.keys(specChObj)) {
    _(specChObj[key]).style.display = 'none';
    _(specChObj[key]).setAttribute('data-open', 'closed');
  }

  _(box1).classList.add('techChosen');
  _(box1).classList.remove('techOther');
  _(box2).classList.add('techOther');
  _(box2).classList.remove('techChosen');
  updateCookie('techVal', null, 'tech');
}

function fillTechColor(mat, sel) {
  let newColors = '';
  let ncolors = '';
  for (let i = 0; i < PCOLORS[mat].length; i++) {
    let color = PCOLORS[mat][i];
    let selected = color == sel ? 'selected' : '';
    newColors += `<option value="${color}" ${selected}>${color}</option>`;
  }

  _('color').innerHTML = newColors;
  _('specChColorDD').innerHTML = genUIColors(sel, mat);
  attachColorListeners();
  setAttrVal('chcolor', sel);
}

function resetCookieValues(tech) {
  let ids;
  if (tech == 'FDM') {
    ids = [{rvas: 'rvas'}, {suruseg: 'suruseg'}, {fvas: 'fvas'}, {printMat: 'printMat'}];
  } else {
    ids = [{rvasSLA: 'rvas'}, {infillSLA: 'suruseg'}];
  }

  for (let id of ids) {
    let key = Object.keys(id)[0];
    updateCookie(key, null, id[key]);
  }
}

function proceedSLA(shouldSkip) {
  if (!shouldSkip) {
    _('techVal').value = 'SLA';
    _('colorCh').setAttribute('src', 'images/specChImg/sla_colors.jpg');
    resetCookieValues('SLA');
    toggleTechs(slaIDs, fdmIDs, 'slaChoice', 'fdmChoice');
    basePrice = bpSave[1];
    updateSLAPrice();
    colorMaps = HEX_COLORS['gyanta (resin)'];
  }
}

function backToFDM(shouldSkip) {
  if (shouldSkip && _('techVal').value == 'SLA') {
    fdmChoice();
  }
}

_('toggleDiv').addEventListener('animationend', () => {
  _('toggleDiv').classList.remove('animate__fadeIn');
});

function fdmChoice(isClick = true) {
  _('techVal').value = 'FDM';
  _('colorCh').setAttribute('src', 'images/specChImg/colors.jpg');
  resetCookieValues('FDM');
  toggleTechs(fdmIDs, slaIDs, 'fdmChoice', 'slaChoice');
  basePrice = calcP(bpSave[0]);
  priceChange();
  if (isClick) {
    colorMaps = HEX_COLORS['pla'];
    fillTechColor('pla', PCOLORS['pla'][0]);
    updateCookie('color');
    chooseColor('#' + colorMaps[_('color').value]);
    _('printMat').value = currentMat = 'PLA';
    setAttrVal('chmat', 'PLA');
    updateCookie('printMat');
  }
}

_('fdmChoice').addEventListener('click', fdmChoice);

_('slaChoice').addEventListener('click', (e) => {
  if (_('slaChoice').classList.contains('slaDisabled')) return;
  let fromFDM = _('fdmChoice').classList.value.includes('techChosen');
  cookieIDs = localStorage.getItem('refresh').split('|||'); 
  toggleSLAAllowance('scale', cookieIDs, proceedSLA);
  if (fromFDM) {
    colorMaps = HEX_COLORS['gyanta (resin)'];
    fillTechColor('gyanta (resin)', PCOLORS['gyanta (resin)'][0]);
    updateCookie('color');
    chooseColor('#' + colorMaps[_('color').value]);
  }
});

// Save base price (initial price) and base (initial weight) for further calculations
var baseWeight = Number(_('weightHolder').innerText.replace('cm3', ''));
var bwSave = baseWeight;

// Calculate the price of the custom print based on its parameters and initial price
function calcP(price, rv = null, sv = null, scv = null, fv = null, mv = null) {
  let rvasVal = rv == null ? Number(_('rvas').value) : Number(rv);
  let surusegVal = sv == null ? Number(_('suruseg').value) : Number(sv);
  let scaleVal = scv == null ? Number(_('scale').value) : Number(scv);
  let fvasVal = fv == null ? Number(_('fvas').value) : Number(fv);
 
  // Convert degrees to radians
  rvasVal *= Math.PI / 180;
  surusegVal *= Math.PI / 180;
  fvasVal *= Math.PI / 180;

  // Formula for calculating the price with the given params
  // Parameters values in the formula are degrees (converted to rads)
  let nPrice = (price * scaleVal *
    ((1 / (Math.sin(rvasVal) * 140 + 0.51130880187)) +
    (Math.sin(surusegVal) / 1.3 + 0.73690758206) +
    (Math.sin(fvasVal) * 8 + 0.83246064094) - 2));

  let filamentMaterial = mv == null ? _('printMat').value.toLowerCase() : mv.toLowerCase();
  let fp = smoothPrice(Math.round(nPrice * PRINT_MULTS[filamentMaterial]));
  return fp < MIN_PRICE ? MIN_PRICE : fp;
}

// Change color of the stl model in the browser

// When clicking on the color selector circles change the color of the model as well
_('color').addEventListener('change', function changeColor(e) {
  let v = _('color').value;
  chooseColor('#' + colorMaps[v].toLowerCase());
  setOpacityAll();
  //if (typeof fbq !== 'undefined') fbq('track', 'CustomizeProduct');
});

function updateSubVolumes() {
  if (subVolumes.length > 1) {
    for (let i = 0; i < subVolumes.length; i++) {
      _('subvolume_' + i).innerText = `${(Number(subVolumes[i]) * _('scale').value).toFixed(2)}`;
    }
  }
}

function updateSubSizes() {
  if (subSizes.length > 3) {
    for (let i = 0; i < subSizes.length; i++) {
      if ((i + 1) % 3 == 0) {
        let ss = [];
        for (let s of [subSizes[i - 2], subSizes[i - 1], subSizes[i]]) {
          ss.push((s * _('scale').value).toFixed(2));
        }
        _('subsize_' + ((i + 1) / 3 - 1)).innerText = `${ss[0]}mm x ${ss[1]}mm x ${ss[2]}mm`;
      }
    }
  } 
}

// Update the price of the stl model if parameters are changed
function priceChange() {
  updateSubPrices();
  let p = calcP(subPrices[0]);
  if (_('techVal').value == 'SLA') {
    let [lw, infill, scale] = getSLAParams();
    p = calcSLAPrice(bpSave[1], lw, infill, scale);
  }
  if (subPrices.length > 1) {
    p = 0;
    for (let i = 0; i < subPrices.length; i++) {
      p += Number(_('subprice_' + i).innerText); 
    }
  }
  let v = _('quantity').value;
  if (subPrices.length > 1 && hasBelow800()) {
    // Loop through subprices to calc final price
    let totPrice = 0;
    for (let i = 0; i < subPrices.length; i++) {
      if (_('techVal').value == 'FDM') {
        totPrice += calcP(Number(subPrices[i]));
      } else {
        let params = getSLAParams();
        totPrice += calcSLAPrice(subPricesSLA[i], ...params);
      }
    }
    _('priceHolder').innerHTML = totPrice;
    updateOPrice(totPrice);
  } else {
    _('priceHolder').innerHTML = p * v;
    updateOPrice(p * v);
  }
  updateSubVolumes();
  updateSubSizes();
}

function chgMatColor(selectedColor) {
  chooseColor('#' + colorMaps[selectedColor].toLowerCase());
  setOpacityAll();
}

// Add event listeners to parameters & update the UI based on these changes
_('scale').addEventListener('change', toggleAllowance);
_('scale').addEventListener('change', (e) => {
  let cookieIDs = localStorage.getItem('refresh').split('|||'); 
  toggleSLAAllowance('scale', cookieIDs, backToFDM);
});

_('plus').addEventListener('click', priceChange);
_('minus').addEventListener('click', priceChange);
_('fvas').addEventListener('change', priceChange);
_('rvas').addEventListener('change', priceChange);
_('scale').addEventListener('change', priceChange);
_('suruseg').addEventListener('change', priceChange);
_('specChLhDD').addEventListener('change', priceChange);
_('quantity').addEventListener('keyup', () => {
  let timeout = setTimeout(() => {
    let v = Number(_('quantity').value);
    if (v >= MIN_QUANTITY && v <= MAX_QUANTITY) {
      priceChange();
      clearTimeout(timeout);
    }
  }, 50);
});

if (_('printMat')) {
  _('printMat').addEventListener('change', priceChange);
  _('printMat').addEventListener('change', () => updateCookie('printMat'));
  _('printMat').addEventListener('change', () => chgMat(_('color').value));
  _('printMat').addEventListener('change', () => chgMatColor(_('color').value));
}

// Change the value in the cookies as well
_('plus').addEventListener('mouseup', () => updateCookie('quantity', 1));
_('minus').addEventListener('mouseup', () => updateCookie('quantity', -1));
_('fvas').addEventListener('change', () => updateCookie('fvas'));
_('scale').addEventListener('change', () => updateCookie('scale'));
_('scale').addEventListener('change', () => updateWeight());
_('suruseg').addEventListener('change', () => updateCookie('suruseg'));
_('rvas').addEventListener('change', () => updateCookie('rvas'));
_('color').addEventListener('change', () => updateCookie('color'));
_('quantity').addEventListener('change', () => updateCookie('quantity'));

// Update the estimated weight of the model (only incorporates the scaling)
function updateWeight() {
  let scale = Number(_('scale').value);
  _('weightHolder').innerHTML = (scale * baseWeight).toFixed(2) + 'cm<sup>3</sup>';
}

/*
  If the page is viewed for the 1st time set 'refresh' in the localStorage to the ID of the
  model
*/
if (window.location.href.includes('?file=')) {
  let fname = window.location.href.split('?file=')[1].replaceAll(',', '|||');
  localStorage.setItem('refresh', fname);
}

window.addEventListener('DOMContentLoaded', function() {
  if (!localStorage.getItem('refresh')) {
    let tmp = arr.map(path => {
      let pieces = path.split('/');
      return pieces[pieces.length - 1].replace('.stl', '');
    });
    let res = '';
    for (let i = 0; i < tmp.length; i++) {
      let delimeter = i == tmp.length - 1 ? '' : '|||';
      res += tmp[i] + delimeter;
    }
    localStorage.setItem('refresh', res);
  } else {
    /*
      If the page is reloaded for the nth time update the UI with already saved data in the
      cookies
    */
    // First extract the values stored in cookies
    let soFar = JSON.parse(getCookie('cartItems'));
    for (let i = 0; i < localStorage.getItem('refresh').split('|||').length; i++) {
      let id = getID(i);
      let rvasVal = decodeURIComponent(soFar['content_' + id]['rvas_' + id]);
      let surusegVal = decodeURIComponent(soFar['content_' + id]['suruseg_' + id]);
      let colorVal = decodeURIComponent(soFar['content_' + id]['color_' + id]);
      let scaleVal = decodeURIComponent(soFar['content_' + id]['scale_' + id]);
      let fvasVal = decodeURIComponent(soFar['content_' + id]['fvas_' + id]);
      let quantityVal = decodeURIComponent(soFar['content_' + id]['quantity_' + id]);
      let printMatVal = decodeURIComponent(soFar['content_' + id]['printMat_' + id]);
      let printTech = decodeURIComponent(soFar['content_' + id]['tech_' + id]);

      _('quantity').value = quantityVal;
      _('scale').value = scaleVal;
      _('color').value = colorVal;

      // Handle SLA and FDM separately
      // Set the values of <select> elements with saved values
      if (printTech == 'FDM') {
        // Distinguish 0.2 and 0.20 because they are handled as strings
        if (String(rvasVal) == '0.2') rvasVal = '0.20';
        _('rvas').value = rvasVal;
        _('suruseg').value = surusegVal;
        _('fvas').value = fvasVal;
        _('printMat').value = currentMat = printMatVal;
        fdmChoice(false);
        chgMat(colorVal);
        chgMatColor(colorVal);

        // Update UI
        setAttrVal('chlh', rvasVal);
        setAttrVal('chinf', surusegVal);
        setAttrVal('chscale', scaleVal);
        setAttrVal('chshell', fvasVal);
        setAttrVal('chmat', printMatVal);
      } else {
        _('rvasSLA').value = rvasVal;
        _('infillSLA').value = surusegVal;
        basePrice = basePriceSLA;
        proceedSLA(false);
        fillTechColor('gyanta (resin)', colorVal);
        setAttrVal('chlhSLA', rvasVal);
        setAttrVal('chinfSLA', surusegVal);
        setAttrVal('chscale', scaleVal);
      }

      // Update quantity & weight
      updateQtyUI();
      updateWeight();
    
      // Update & format the size of the model (format: [s1]mm x [s2]mm x [s3]mm)
      let sc = Number(_('scale').value);
      let s1, s2, s3;
      [s1, s2, s3] = _('sizeHolder').innerText.replace(/mm/g, '').split(' x ');
      [s1, s2, s3] = [(s1 * sc).toFixed(2), (s2 * sc).toFixed(2), (s3 * sc).toFixed(2)];
      _('sizeHolder').innerText = `${s1}mm x ${s2}mm x ${s3}mm`;
    }
  }

  let cookieIDs = localStorage.getItem('refresh').split('|||'); 
  toggleSLAAllowance('scale', cookieIDs, (shouldSkip) => {
    if (!shouldSkip) {
      _('slaChoice').classList.remove('slaDisabled');
    }
  });

  updatePriceDiffs();
});

// If user buys the model redirect them to the buy page
_('buyCP').addEventListener('click', function buyProduct(e) {
  // Get all parameters for custom printing
  let tech = document.getElementsByClassName('techChosen')[0].innerText.replace(/\s+/, '').slice(0, 3);
  if (tech == 'FDM') {
    var rvas = _('rvas').value;
    var suruseg = _('suruseg').value;
    var fvas = _('fvas').value;
    var printMat = _('printMat').value;
  } else {
    var rvas = _('rvasSLA').value;
    var suruseg = _('infillSLA').value;
    var fvas = null;
    var printMat = 'Gyanta (Resin)';
  }

  let paths = arr.map(v => v.split('/')[2].replace('.stl', ''));
  let size = _('sizeHolder').innerText.replace(/(mm)|(x)/g, '').replace(/\s+/g, ',');
  let color = _('color').value;
  let scale = _('scale').value;
  let quantity = _('quantity').value;

  window.location.href =
  `/buy?product=cp&rvas=${rvas}&suruseg=${suruseg}&color=${color}&scale=${scale}&fvas=${fvas}&q=${quantity}&printMat=${printMat}&size=${size}&tech=${tech}&files=${paths}`;
  //fbq('track', 'InitiateCheckout');
});

function goToURL(url) {
  window.location.href = url;
}

function handleChClick(child, children, key) {
  if (!child.getAttribute('class').includes('specChHl')) {
    let prevAttr = child.getAttribute('class');
    child.setAttribute('class', prevAttr + ' specChHl');
  }
  
  for (let c of children) {
    if (c == child) continue;
    let prevAttr = c.getAttribute('class').replace('specChHl', '').replace('  ', ' ');
    c.removeAttribute('class');
    c.setAttribute('class', prevAttr);
  }
  
  let postfix = key.includes('SLA') ? 'SLA' : '';
  let ID = 'ch' + key.replace('specCh', '').replace('SLA', '').toLowerCase() + postfix;
  _(ID).innerText = (child.children)[1].innerText.replace(/(\r\n|\n|\r)/gm, '').trim();
  _(ID).setAttribute('data-value', child.getAttribute('data-value'));
  
  let IDpairs = {
    'specChLh': 'rvas',
    'specChInf': 'suruseg',
    'specChColor': 'color',
    'specChScale': 'scale',
    'specChShell': 'fvas',
    'specChMat': 'printMat',
    'specChLhSLA': 'rvasSLA',
    'specChInfSLA': 'infillSLA'
  };
  
  $('#' + IDpairs[key]).val(child.getAttribute('data-value'));
  _(IDpairs[key]).dispatchEvent(new Event('change'));
  updatePriceDiffs();
}

for (let key of Object.keys(specChObj)) {
  _(key).addEventListener('click', (e) => handleDropDown(specChObj[key]));
  for (let child of _(specChObj[key]).children) {
    child.addEventListener('click', (e) => handleChClick(child, _(specChObj[key]).children, key));
  }
}

var currentDD = undefined;
const specChIDs = [
  'specChLh', 'specChInf', 'specChColor', 'specChScale',
  'specChShell', 'specChMat', 'specChLhSLA', 'specChInfSLA'
];

function closeDDs(ddID) {
  if (!ddID) return;

  for (let oid of specChIDs) {
    if (oid.endsWith('SLA')) {
      oid = oid.replace('SLA', '');
      var postfix = 'SLA';
    } else {
      var postfix = '';
    }
    if (oid + 'DD' + postfix == ddID) continue;   
    $('#' + oid + 'DD' + postfix).slideUp('fast', (e) => {});
    _(oid + 'DD' + postfix).setAttribute('data-open', 'closed');
  }
}

document.body.addEventListener('click', (e) => {
  let clickedInside = false;
  let allIDs = specChIDs.slice();
  for (let id of specChIDs) {
    if (id.endsWith('SLA')) {
      allIDs.push(id.replace('SLA', '') + 'DDSLA');
    } else {
      allIDs.push(id + 'DD');
    }
  }

  for (let oid of allIDs) {
    if (document.querySelector('#' + oid).contains(e.target)) {
      clickedInside = true;
      break;
    }
  }
  if (!clickedInside) currentDD = '.';
  closeDDs(currentDD);
});

function handleDropDown(ddID) {
  currentDD = ddID;
  if (_(ddID).getAttribute('data-open') == 'closed') {
    $('#' + ddID).slideDown('fast', (e) => {}); 
    _(ddID).setAttribute('data-open', 'open');
  } else {
    $('#' + ddID).slideUp('fast', (e) => {}); 
    _(ddID).setAttribute('data-open', 'closed');
  }
}

_('toCart').addEventListener('click', (e) => goToURL('/cart'));
_('newFile').addEventListener('click', (e) => goToURL('/print'));

const ORIG_TEXTS = [];
for (let el of document.getElementsByClassName('specChLongDesc')) {
  ORIG_TEXTS.push(el.innerText);
}

function createParams(id, v) {
  let idToPos = {
    'specChLhDD': 0,
    'specChInfDD': 1,
    'specChScaleDD': 2,
    'specChShellDD': 3,
    'specChMatDD': 4
  };

  let arr = [null, null, null, null, null];
  arr[idToPos[id]] = v
  return arr;
}

function createParamsSLA(id, v) {
  let idToPos = {
    'specChLhDDSLA': 0,
    'specChInfDDSLA': 1,
    'specChScaleDD': 2
  };

  let arr = [
    Number(_('rvasSLA').value), _('infillSLA').value, Number(_('scale').value)
  ];

  arr[idToPos[id]] = v;

  return arr;
}

function updatePriceDiffs() {
  let currentPrice = Number(_('priceHolder').innerText);
  let tval = _('techVal').value;
  if (tval == 'FDM') {
    var arr = [
      'specChLhDD', 'specChInfDD', 'specChColorDD', 'specChScaleDD',
      'specChShellDD', 'specChMatDD'
    ];
  } else {
    var arr = [
      'specChLhDDSLA', 'specChInfDDSLA', 'specChColorDD', 'specChScaleDD'
    ];
  }

  for (let contID of arr) {
    for (let child of _(contID).children) {
      let v = child.getAttribute('data-value');
      if (tval == 'FDM') {
        if (contID == 'specChColorDD') {
          var newPrice = currentPrice;
        } else {
          let id = _(contID).getAttribute('id');
          var newPrice = 0;
          for (let sp of subPrices) {
            newPrice += calcP(sp, ...createParams(id, v)) * Number(_('quantity').value);
          }
        }
      } else {
        if (contID == 'specChColorDD') {
          var newPrice = currentPrice;
        } else {
          let id = _(contID).getAttribute('id');
          var newPrice = 0;
          for (let sp of subPricesSLA) {
            newPrice += calcSLAPrice(sp, ...createParamsSLA(id, v)) * Number(_('quantity').value);
          }
        }
      }

      let sign = newPrice - currentPrice >= 0 ? '+' : '-';
      child.children[2].innerText = `(${sign}${Math.abs(newPrice - currentPrice)} Ft)`;
      if (newPrice - currentPrice > 0) {
        child.children[2].setAttribute('style', 'color: green;');
      } else if (newPrice - currentPrice < 0) {
        child.children[2].setAttribute('style', 'color: red;');
      } else {
        child.children[2].setAttribute('style', 'color: black;');
      }
    }
  }
}
