// Use constant values from js/includes/constants.js
if (_('priceHolder')) {
  var basePrice = Number(_('priceHolder').innerHTML);
}

function displayErrorMsg(msg) {
  _('broHolder').style.marginBottom = '20px';
  statusFill('status', msg);
}

function calcLitPrice(size) {
  let firstCoord = size.split('x')[0].replace('mm', '');
  return LIT_PRICES[firstCoord];
}

function getModelSize() {
  return _('sizeHolder').innerText.replace(/(x)|(mm)/g, '').replace(/\s+/g, ',');
}

// Add item to cart
function addToCart(id) {
  let itemId = id;

  // Id is the current time in microsecs + the product id
  id = String(Date.now()) + '_' + id;
  let rvas = Number(_('rvas').value);  
  let suruseg = Number(_('suruseg').value);
  let color = _('color').value;
  let scale = Number(_('scale').value);
  let fvas = Number(_('fvas').value);
  let quantity = Number(_('quantity').value); 
  let modelSize = getModelSize();

  // Validation on client-side
  _('status').innerHTML = '';
  if (LAYER_WIDTH_VALUES.indexOf(rvas) < 0) {
    displayErrorMsg('A rétegvastagság értéke nem megfelelő');
    return;
  } else if (INFILL_VALUES.indexOf(suruseg) < 0) {
    displayErrorMsg('A sűrűség értéke nem megfelelő');
    return; 
  } else if (PCOLORS['pla'].indexOf(color) < 0) {
    displayErrorMsg('A szín értéke nem megfelelő');
    return; 
  } else if (SCALE_VALUES.indexOf(scale) < 0) {
    displayErrorMsg('A méretezés értéke nem megfelelő');
    return; 
  } else if (WALL_WIDTH_VALUES.indexOf(fvas) < 0) {
    displayErrorMsg('A falvastagság értéke nem megfelelő');
    return;
  } else if (!_('quantity').value || quantity % 1 !== 0) {
    displayErrorMsg('A mennyiség értéke nem megfelelő');
    return; 
  } else if (quantity < MIN_QUANTITY || quantity > MAX_QUANTITY) {
    displayErrorMsg(`Egyféle termékből maximum ${MAX_QUANTITY}db rendelhető`);
    return;
  }

  // Add selected item to the cart by adding it to cookies
  let value = {
    ['id_' + id]: id,
    ['content_' + id]: {
      ['rvas_' + id]: rvas,
      ['suruseg_' + id]: suruseg,
      ['color_' + id]: encodeURIComponent(color),
      ['scale_' + id]: scale,
      ['fvas_' + id]: fvas,
      ['size_' + id]: modelSize,
      ['quantity_' + id]: quantity,
      ['printMat_' + id]: 'PLA',
      ['tech_' + id]: 'FDM'
    }
  };

  // If the same two products have the same configs update quantity by [quantity]
  // Basically implements an object equality comparison on the content 
  _('succBox').innerHTML = '';
  _('status').innerHTML = '';
  if (getCookie('cartItems')) {
    let itemsSoFar = JSON.parse(getCookie('cartItems'));
    let props = Object.keys(itemsSoFar).filter(prop => {
      return prop.split('_')[2] == itemId && prop[0] == 'c';
    }).map(prop => prop.replace('content_', ''));

    for (let i = 0; i < props.length; i++) {
      let y = 0;
      let objKeys = Object.keys(value['content_' + id]);
      let ind = objKeys.indexOf('quantity_' + id);
      for (let p1 of objKeys) {
        let cid = props[i];
        let begin = p1.split('_')[0];
        if (value['content_' + id][p1] == itemsSoFar['content_' + cid][begin + '_' + cid]) {
          if (y == 4) {
            // Maximum quantity for a single item is MAX_QUANTITY
            let tmpQuantity = Number(itemsSoFar['content_' + cid]['quantity_' + cid]);
            if (tmpQuantity + quantity > MAX_QUANTITY) {
              displayErrorMsg(`Egyféle termékből maximum ${MAX_QUANTITY}db rendelhető`);
              return;
            }
            itemsSoFar['content_' + cid]['quantity_' + cid] = tmpQuantity + quantity;
            setCookie('cartItems', JSON.stringify(itemsSoFar), 365);
            statusFill('succBox', 'A terméket sikeresen a kosárba helyezted');
            _('broHolder').style.marginBottom = "20px";
            updateCartNum();
            return;
          }
        } else {
          break;
        }
        y++;
      }
    }
    setCookie('cartItems', JSON.stringify(Object.assign(itemsSoFar, value)), 365);
  } else {
    setCookie('cartItems', JSON.stringify(value), 365);
  }

  // Update the number of items in cart on UI
  updateCartNum();

  statusFill('succBox', 'A terméket sikeresen a kosárba helyezted');
  _('broHolder').style.marginBottom = "20px";

  // Add fb tracking for ads
  // fbq('track', 'AddToCart');
}

if (document.getElementsByClassName('bros').length > 0) {
  document.getElementsByClassName('bros')[1].addEventListener('click', function callback(e) {
    recordConversion(undefined, Number(_('priceHolder').innerHTML, 'g100CPHx9KUDEMDJxZMC'));
  });
}

// Update price in the DOM, in real-time
function updateTotPrice(cartId, newPrice, oldPrice, isLit = false, isCP = false, isSLA = false) {
  if (!cartId) {
    basePrice = Number(_('priceHolder').innerHTML);
    return;
  }
  let quantity = Number(_('quantity' + cartId).value);
  let totBefore = Number(_('totpHolder_' + cartId).innerHTML);
  _('totpHolder_' + cartId).innerHTML = newPrice * quantity;

  let cookieObj = JSON.parse(getCookie('cartItems'));
  let keys = Object.keys(cookieObj).filter(key => {
    return key[0] != 'i';
  });

  let sumOfSums = 0;
  for (let key of keys) {
    let id = key.replace('content_', '');
    sumOfSums += Number(_('totpHolder_' + id).innerHTML);
  }

  if (sumOfSums > FREE_SHIPPING_LIMIT) {
    sumOfSums *= DISCOUNT;
  } else {
    _('extraPrice').innerHTML = '';
  }

  _('fPrice').innerHTML = Math.round(sumOfSums);
  manageDiscountTxt(Math.round(sumOfSums));

  // Also update the new parameter in cookies
  let contentSoFar = JSON.parse(getCookie('cartItems'))
  let names = ['rvas', 'suruseg', 'scale', 'color', 'quantity', 'fvas'];
  if (isCP) {
    names.push('printMat');
  }
  if (isLit) names = ['sphere', 'size', 'color', 'quantity'];
  else if (isSLA) names = ['rvas', 'suruseg', 'scale', 'color', 'quantity'];
  for (let name of names) {
    let currentVal = _(name + cartId).value;
    contentSoFar['content_' + cartId][name + '_' + cartId] = encodeURIComponent(currentVal);
  }
  setCookie('cartItems', JSON.stringify(contentSoFar), 365);
}

// Calculate the price while changing the parameters
function calculatePrice(price, id = '', isLit, isCP) {
  if (!isLit) {
    let rvasVal = Number(_('rvas' + id).value);
    let surusegVal = Number(_('suruseg' + id).value);
    let scaleVal = Number(_('scale' + id).value);
    let fvasVal = Number(_('fvas' + id).value);
   
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

    // When calculating the price of a custom printed model also consider the filament material
    if (isCP) {
      let filamentMaterial = _('printMat' + id).value.toLowerCase();
      let fp = smoothPrice(Math.round(nPrice * PRINT_MULTS[filamentMaterial]));
      return fp < MIN_PRICE ? MIN_PRICE : fp;
    }

    let fp = Math.round(nPrice); 
    return fp < MIN_PRICE ? MIN_PRICE : fp;
  } else {
    return calcLitPrice(_('size' + id).value); 
  }
}

function getPriceHolder(id) {
  if (id) {
    return _('priceHolder_' + id);
  } else {
    return _('priceHolder');
  }
}

function updatePrice(isInCart, price, domElement, isLit, isCP = false, isSLA = false) {
  let id = isInCart ? isInCart : '';
  if (isSLA) {
    let lw = Number(_('rvas' + id).value);
    let infill = _('suruseg' + id).value;
    let scale = Number(_('scale' + id).value);
    var newPrice = calcSLAPrice(Math.round(price * SLA_MULTIPLIER), lw, infill, scale);
  } else {
    var newPrice = calculatePrice(price, id, isLit, isCP); 
  }
  domElement.innerHTML = newPrice;
  return newPrice;
}

function calcSLAPrice(p, lw, infill, scale) {
  let multiplier = infill == 'Tömör' ? 1 : 0.8;
  let fp = smoothPrice(Math.round(p * (1 / (lw * 70) + 0.7142857142857143) * multiplier * scale));
  return fp < MIN_PRICE ? MIN_PRICE : fp;
}

function manageDiscountTxt(newPrice) {
  if (newPrice > FREE_SHIPPING_LIMIT) {
    _('discount').innerHTML = `(${Math.round((1 - DISCOUNT) * 100)}% kedvezmény)`;
  } else {
    _('discount').innerHTML = '';
  }
}

function updateSpecs(e, price, isInCart = false, isLit = false, isCP = false, isSLA = false) {
  let value = Number(e.value);
  if (isLit) value = e.value;
  let domElement = getPriceHolder(isInCart);
  
  var newPrice = updatePrice(isInCart, price, domElement, isLit, isCP, isSLA);
  updateTotPrice(isInCart, newPrice, price, isLit, isCP, isSLA);

  updateCartNum();
  //fbq('track', 'CustomizeProduct');
}

// When changing the scale of the item the size also gets updated
function updateScale(e, price, scale, isInCart) {
  let value = Number(e.value); 
  let domElement = getPriceHolder(isInCart);
  scale = scale.split('x').map(x => x.replace(/mm/g, '').replace(' ', ''));

  if (value == 1) {
    let [s1, s2, s3] = scale;
    _('sizeHolder').innerHTML = `${s1}mm x ${s2}mm x ${s3}mm`;  
  }
  var newPrice = updatePrice(isInCart, price, domElement);
  let [s1, s2, s3] = scale;
  s1 *= value;
  s2 *= value;
  s3 *= value;
  _('sizeHolder').innerHTML = `${s1.toFixed(2)}mm x ${s2.toFixed(2)}mm x ${s3.toFixed(2)}mm`;  
  updateTotPrice(isInCart, newPrice, price);
  //fbq('track', 'CustomizeProduct');
}

// User buys a single item: save specs and redirect to buy page
function buyItem(id) {
  let rvas = _('rvas').value;
  let suruseg = _('suruseg').value;
  let color = _('color').value;
  let scale = _('scale').value;
  let fvas = _('fvas').value;
  let q = _('quantity').value;
  let size = getModelSize();

  if (!_('quantity').value) {
    displayErrorMsg('A mennyiség értéke nem megfelelő');
    return; 
  }

  window.location.href =
  `/buy?product=${id}&rvas=${rvas}&suruseg=${suruseg}&color=${encodeURIComponent(color)}&scale=${scale}&fvas=${fvas}&q=${q}&size=${size}&printMat=PLA&tech=FDM`;
  //fbq('track', 'InitiateCheckout');
}

if (typeof stlView === 'undefined') var stlView = null;
if (typeof isMobile === 'undefined') var isMobile = mobileCheck();

// Handle the displaying & hiding of pop-up 3D stl viewer
function viewIn3D(listOfPath) {
  // Get window width & height
  const width  = window.innerWidth || document.documentElement.clientWidth || 
    document.body.clientWidth;
  const height = window.innerHeight|| document.documentElement.clientHeight|| 
    document.body.clientHeight;

  if (_('overlay').style.opacity == '1') {
    _('overlay').style.opacity = '0';
    setTimeout(function removeOverlay() {
      _('overlay').style.height = '0';
      _('viewBox').style.height = '0';
    }, 500);
    _('viewBox').style.opacity = '0';
    _('exitBtn').style.display = 'none';
    document.body.style.overflow = 'auto';
  } else {
    _('overlay').style.height = document.body.scrollHeight + "px";
    _('overlay').style.opacity = '1';
    _('viewBox').style.opacity = '1';
    _('viewBox').style.height = 'auto';
    document.body.style.overflow = 'hidden';
    
    if (!isMobile) {
      _('viewBox').style.width = width / 1.3 + 'px';
      _('viewBox').style.height = height / 1.3 + 'px';
      _('viewBox').style.top = height / (26 / 3) + 'px';
      _('viewBox').style.left = width / (26 / 3) + 'px';
      _('exitBtn').style.display = 'block';
      _('exitBtn').style.left = width * (23 / 26) - 44 + 'px';
      _('exitBtn').style.top = height * (3 / 26) + 24 + 'px';
    } else {
      _('viewBox').style.width = width / 1.1 + 'px';
      _('viewBox').style.height = height / 1.4 + 'px';
      _('viewBox').style.top = height * (1 / 7) + 'px';
      _('viewBox').style.left = width / 22 + 'px';
      _('exitBtn').style.display = 'block';
      _('exitBtn').style.left = width * (21 / 22) - 44 + 'px';
      _('exitBtn').style.top = height * (1 / 7) + 24 + 'px';
    }
    

    if (!stlView) {
      // Use a 3rd party library for viewing .stl files
      _('stlLoader').style.display = 'block';
      stlView = new StlViewer(document.getElementById("viewBox"), {
        all_loaded_callback: () => {
          _('stlLoader').style.display = 'none';
          stlView.set_scale(0, 0.6);
        },
        models: listOfPath
      });
    }
  }
}

function incDec(qty, name, threshold, mul) {
  if (_('quantity').value * mul < threshold * mul) {
    _('quantity').value = Number(_('quantity').value) + qty;
    _(name == 'minus' ? 'plus' : 'minus').style.opacity = '1';
    _(name == 'minus' ? 'plus' : 'minus').style.cursor = 'pointer';
  }
  
  if (_('quantity').value == threshold) {
    _(name).style.opacity = '0.4';
    _(name).style.cursor = 'not-allowed';
  }
}

if (_('plus')) {
  _('plus').addEventListener('click', function increase(){
    incDec(1, 'plus', MAX_QUANTITY, 1);
  });

  _('minus').addEventListener('click', function decrease(){
    incDec(-1, 'minus', MIN_QUANTITY, -1);
  });
}

function clickClock(title, specs, show, hide) {
  _(title).style.display = 'block'; 
  _(title).classList.remove("animate__animated");
  _(show).style.height = 'auto';
  _(show).style.opacity = '1';

  _(hide).style.height = '0';
  _(hide).style.opacity = '0';
  _(specs).style.display = 'none';  
  _(specs).classList.add("animate__animated");
}


if (document.getElementsByClassName('itemSpecifications')[0]) {
  document.getElementsByClassName('itemSpecifications')[0].style.marginTop = '20px';

  document.getElementsByClassName('hrStyle')[0].style.marginTop = '0';
  if (document.getElementsByClassName('hrStyle')[1]) {
    document.getElementsByClassName('hrStyle')[1].style.display = 'none';
  }
}

if (_('specsTitle')) {
  _('descTitle').addEventListener('click', function clickDesc(e) {
    clickClock('descTitle_anim', 'specsTitle_anim', 'descHS', 'specsHS');
  });

  _('specsTitle').addEventListener('click', function clickSpecs(e) {
    clickClock('specsTitle_anim', 'descTitle_anim', 'specsHS', 'descHS');
  });
}

function updateLit(param, dom, id) {
  let soFar = JSON.parse(getCookie('cartItems'));
  soFar['content_' + id][param + '_' + id] = encodeURIComponent(_(dom).value);
  setCookie('cartItems', JSON.stringify(soFar), 365);
}
