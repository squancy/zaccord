// Save base price (initial price) and base (initial weight) for further calculations
if (_('weightHolder')) {
  var baseWeight = Number(_('weightHolder').innerText.replace('g', ''));
  var bwSave = baseWeight;
}

// Calculate the price of the custom print based on its parameters and initial price
function calcP(price) {
  let rvasVal = Number(_('rvas').value);
  let surusegVal = Number(_('suruseg').value);
  let scaleVal = Number(_('scale').value);
  let fvasVal = Number(_('fvas').value);
 
  // Convert degrees to radians
  rvasVal *= Math.PI / 180
  surusegVal *= Math.PI / 180
  fvasVal *= Math.PI / 180

  // Formula for calculating the price with the given params
  // Parameters values in the formula are degrees (converted to rads)
  let nPrice = (price * scaleVal *
    ((1 / (Math.sin(rvasVal) * 140 + 0.51130880187)) +
    (Math.sin(surusegVal) / 1.3 + 0.73690758206) +
    (Math.sin(fvasVal) * 8 + 0.83246064094) - 2));
  
  return Math.round(nPrice);
}

// Change color of the stl model in the browser
let colorMaps = {
  'Fehér': '#ffffff',
  'Fekete': '#000000',
  'Kék': '#4285f4',
  'Piros': '#dc143c',
  'Arany': '#ffff33',
  'Zöld': '#32cd32'
};

// When clicking on the color selector circles change the color of the model as well
if (_('color') && _('stlCont_0')) {
  _('color').addEventListener('change', function changeColor(e) {
    let v = _('color').value;
    chooseColor(colorMaps[v]);
  });
}

// Update the price of the stl model if parameters are changed
function priceChange() {
  let v = _('quantity').value;
  if (basePrice * v >= 500) {
    _('charge').style.display = 'none';
    _('chargeNote').style.display = 'none';
  } else {
    _('charge').innerText = `(+${500 - basePrice} Ft felár)`;
    _('charge').style.display = 'inline-block';
    _('chargeNote').style.display = 'block';
  }
  _('priceHolder').innerHTML = basePrice * v;
}

// Add event listeners to parameters & update the UI based on these changes
if (_('quantity') && _('fvas') && _('scale') && _('suruseg') && _('rvas')) {
  _('plus').addEventListener('click', priceChange);
  _('minus').addEventListener('click', priceChange);
  _('fvas').addEventListener('change', priceChange);
  _('scale').addEventListener('change', priceChange);
  _('suruseg').addEventListener('change', priceChange);
  _('rvas').addEventListener('change', priceChange);

  // Change the value in the cookies as well
  _('plus').addEventListener('mouseup', () => updateCookie('quantity', 1));
  _('minus').addEventListener('mouseup', () => updateCookie('quantity', -1));
  _('fvas').addEventListener('change', () => updateCookie('fvas'));
  _('scale').addEventListener('change', () => updateCookie('scale'));
  _('scale').addEventListener('change', () => updateWeight());
  _('suruseg').addEventListener('change', () => updateCookie('suruseg'));
  _('rvas').addEventListener('change', () => updateCookie('rvas'));
  _('color').addEventListener('change', () => updateCookie('color'));
}

// Update the estimated weight of the model (only incorporates the scaling)
function updateWeight() {
  let scale = Number(_('scale').value);
  _('weightHolder').innerText = (scale * baseWeight).toFixed(2) + 'g';
}

// Update quantity UI
function updateQtyUI() {
  _('minus').style.opacity = '1';
  _('minus').style.cursor = 'pointer';
  
  if (_('quantity').value == 10) {
    _('plus').style.opacity = '0.4';
    _('plus').style.cursor = 'not-allowed';
  } else if (_('quantity').value == 1) {
    _('minus').style.opacity = '0.4';
    _('minus').style.cursor = 'not-allowed';
  }
}

/*
  If the page is viewed for the 1st time set 'refresh' in the localStorage to the ID of the
  model
*/
if (typeof arr !== 'undefined' && _('rvas')) {
  window.addEventListener('DOMContentLoaded', function() {
    if (!localStorage.getItem('refresh')) {
      let tmp = arr[0].split('/');
      tmp = tmp[tmp.length - 1].replace('.stl', '');
      localStorage.setItem('refresh', tmp);
    } else {
      /*
        If the page is reloaded for the nth time update the UI with already saved data in the
        cookies
      */
      // First extract the values stored in cookies
      let soFar = JSON.parse(getCookie('cartItems'));
      let id = localStorage.getItem('refresh');
      let rvasVal = decodeURIComponent(soFar['content_' + id]['rvas_' + id]);
      let surusegVal = decodeURIComponent(soFar['content_' + id]['suruseg_' + id]);
      let colorVal = decodeURIComponent(soFar['content_' + id]['color_' + id]);
      let scaleVal = decodeURIComponent(soFar['content_' + id]['scale_' + id]);
      let fvasVal = decodeURIComponent(soFar['content_' + id]['fvas_' + id]);
      let quantityVal = decodeURIComponent(soFar['content_' + id]['quantity_' + id]);

      // Set the values of <select> elements with saved values
      _('rvas').value = rvasVal;
      _('suruseg').value = surusegVal;
      _('color').value = colorVal;
      _('scale').value = scaleVal;
      _('fvas').value = fvasVal;
      _('quantity').value = quantityVal;

      // Do a price update
      let nPrice = calcP(basePrice);
      basePrice = nPrice;
      _('priceHolder').innerText = nPrice * quantityVal;

      // Add extra price if needed
      if (nPrice * quantityVal < 500) {
        _('charge').innerText = `(+${500 - nPrice} Ft felár)`;
      } else {
        _('charge').innerText = '';
      }

      // Toggle extra price text
      if (nPrice * quantityVal < 500) {
        _('chargeNote').style.display = 'block';
      } else {
        _('chargeNote').style.display = 'none';
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
  });
}

// Whatever value the user changes in connection with the model save them to cookies
function updateCookie(param, qty = null) {
  let soFar = JSON.parse(getCookie('cartItems'));
  for (let a of arr) {
    let id = a.split('/')[2].replace('.stl', '').replace('.jpg', '').replace('.jpeg', '')
      .replace('.png', '');

    // If id is not found look for the refreshed ID
    if (!soFar['content_' + id]) {
      id = localStorage.getItem('refresh');
    }

    // Value incrementation occurs delayed since the function is in item.js
    // So manual updating of the quantity needs to be implemented here
    if (param == 'quantity') {
      if (Number(_(param).value) + qty < 1 || Number(_(param).value) + qty > 10) return;
      let v = encodeURIComponent(Number(_(param).value) + qty);
      soFar['content_' + id][param + '_' + id] = v;
    } else {
      soFar['content_' + id][param + '_' + id] = encodeURIComponent(_(param).value);
    }
  } 
  setCookie('cartItems', JSON.stringify(soFar), 365);
}

// If user buys the model redirect them to the buy page
if (_('buyCP')) {
  _('buyCP').addEventListener('click', function buyProduct(e) {
    // Get all parameters for custom printing
    let rvas = _('rvas').value;
    let suruseg = _('suruseg').value;
    let color = _('color').value;
    let scale = _('scale').value;
    let fvas = _('fvas').value;
    let quantity = _('quantity').value;
    let paths = arr.map(v => v.split('/')[2].replace('.stl', ''));

    window.location.href =
    `/buy?product=cp&rvas=${rvas}&suruseg=${suruseg}&color=${color}&scale=${scale}&fvas=${fvas}&q=${quantity}&files=${paths}`;
  });
}

// If user uploads stl files display loader
if (_('submitBtn')) {
  _('submitBtn').addEventListener('click', function displayLoader(e) {
    _('status').innerHTML = '<img src="/images/icons/loader.gif" style="margin-bottom: 0;">';
  });
}

function goToURL(url) {
  window.location.href = url;
}

if (_('toCart') && _('newFile')) {
  _('toCart').addEventListener('click', (e) => goToURL('/cart'));
  _('newFile').addEventListener('click', (e) => goToURL('/print'));
}
