let bpSave = [basePrice, basePriceSLA];

function updateSubPrices(p) {
  if (subPrices.length > 1) {
    for (let i = 0; i < subPrices.length; i++) {
      let price;
      if (_('techVal').value == 'FDM') {
        price = calcP(subPrices[i]);
      } else {
        let params = getSLAParams();
        price = calcSLAPrice(subPrices[i] * 2.1, ...params);
      }
      _('subprice_' + i).innerText = price;
    }
  }
}

function hasBelow800() {
  for (let i = 0; i < subPrices.length; i++) {
    if (_('techVal').value == 'FDM' && calcP(subPrices[i]) === 800) {
      return true; 
    } else {
      let params = getSLAParams();
      if (calcSLAPrice(subPrices[i] * 2.1, ...params) === 800) {
        return true; 
      }
    }
  }
  return false;
}

function calcSLAPrice(p, lw, infill, scale) {
  let multiplier = infill == 'Tömör' ? 1 : 0.8;
  let fp = Math.round(p * (1 / (lw * 70) + 0.7142857142857143) * multiplier * scale);
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
const fdmIDs = ['rvasFDMBox', 'surusegFDMBox', 'fvasFDMBox', 'printMatBox']; 
const slaIDs = ['rvasSLABox', 'infillSLABox'];

function toggleTechs(ids1, ids2, box1, box2) {
  _('toggleDiv').classList.add('animate__fadeIn');
  for (let i1 of ids1) {
    _(i1).style.display = 'block';
  }

  for (let i2 of ids2) {
    _(i2).style.display = 'none';
  }

  _(box1).classList.add('techChosen');
  _(box1).classList.remove('techOther');
  _(box2).classList.add('techOther');
  _(box2).classList.remove('techChosen');
  updateCookie('techVal', null, 'tech');
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
    resetCookieValues('SLA');
    toggleTechs(slaIDs, fdmIDs, 'slaChoice', 'fdmChoice');
    basePrice = bpSave[1];
    updateSLAPrice();
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

function fdmChoice() {
  _('techVal').value = 'FDM';
  resetCookieValues('FDM');
  toggleTechs(fdmIDs, slaIDs, 'fdmChoice', 'slaChoice');
  basePrice = calcP(bpSave[0]);
  priceChange();
}

_('fdmChoice').addEventListener('click', fdmChoice);

_('slaChoice').addEventListener('click', (e) => {
  cookieIDs = localStorage.getItem('refresh').split('|||'); 
  toggleSLAAllowance('scale', cookieIDs, proceedSLA);
});

// Save base price (initial price) and base (initial weight) for further calculations
var baseWeight = Number(_('weightHolder').innerText.replace('cm3', ''));
var bwSave = baseWeight;

// Calculate the price of the custom print based on its parameters and initial price
function calcP(price) {
  let rvasVal = Number(_('rvas').value);
  let surusegVal = Number(_('suruseg').value);
  let scaleVal = Number(_('scale').value);
  let fvasVal = Number(_('fvas').value);
 
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

  let filamentMaterial = _('printMat').value;
  let multiplier;

  if (filamentMaterial == PRINT_MATERIALS[0]) {
    multiplier = 1;
  } else if (filamentMaterial == PRINT_MATERIALS[1]
    || filamentMaterial == PRINT_MATERIALS[2]) {
    multiplier = 1.36;
  } else {
    multiplier = 1.814;
  } 
  let fp = Math.round(nPrice * multiplier); 
  return fp < MIN_PRICE ? MIN_PRICE : fp;
}

// Change color of the stl model in the browser
let colorMaps = {};

for (let i = 0; i < PRINT_COLORS.length; i++) {
  pcolor = PRINT_COLORS[i];
  hcolor = HEX_ARR[i];
  colorMaps[pcolor] = hcolor;
}

// When clicking on the color selector circles change the color of the model as well
_('color').addEventListener('change', function changeColor(e) {
  let v = _('color').value;
  chooseColor(colorMaps[v].toLowerCase());
  //if (typeof fbq !== 'undefined') fbq('track', 'CustomizeProduct');
});

// Update the price of the stl model if parameters are changed
function priceChange() {
  let p = basePrice;
  if (_('techVal').value == 'SLA') {
    let [lw, infill, scale] = getSLAParams();
    p = calcSLAPrice(bpSave[1], lw, infill, scale);
  }
  let v = _('quantity').value;
  // Currently not used
  /*
  if (p * v >= 800) {
    _('charge').style.display = 'none';
  } else {
    _('charge').innerText = `(+${800 - p} Ft felár)`;
    _('charge').style.display = 'inline-block';
  }
  */
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
  } else {
    _('priceHolder').innerHTML = p * v;
  }
  updateSubPrices(p);
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
_('scale').addEventListener('change', priceChange);
_('suruseg').addEventListener('change', priceChange);
_('rvas').addEventListener('change', priceChange);

if (_('printMat')) {
  _('printMat').addEventListener('change', priceChange);
  _('printMat').addEventListener('change', () => updateCookie('printMat'));
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
  let fname = window.location.href.split('?file=')[1];
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
        _('printMat').value = printMatVal;
        fdmChoice();
      } else {
        _('rvasSLA').value = rvasVal;
        _('infillSLA').value = surusegVal;
        basePrice = basePriceSLA;
        proceedSLA(false);
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
});

// If user buys the model redirect them to the buy page
_('buyCP').addEventListener('click', function buyProduct(e) {
  // Get all parameters for custom printing
  let tech = document.getElementsByClassName('techChosen')[0].innerText.replace(/\s+/, '');
  if (tech == 'FDM') {
    var rvas = _('rvas').value;
    var suruseg = _('suruseg').value;
    var fvas = _('fvas').value;
    var printMat = _('printMat').value;
  } else {
    var rvas = _('rvasSLA').value;
    var suruseg = _('infillSLA').value;
    var fvas = null;
    var printMat = null;
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

_('toCart').addEventListener('click', (e) => goToURL('/cart'));
_('newFile').addEventListener('click', (e) => goToURL('/print'));
