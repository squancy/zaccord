let basePrice = Number(_('priceHolder').innerHTML);

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

  let surusegValues = [];
  let quantityValues = [];
  let colorValues = ['Fekete', 'Fehér', 'Kék', 'Zöld', 'Sárga', 'Piros'];
  for (let i = 10; i <= 100; i += 10) {
    surusegValues.push(i);
    quantityValues.push(i / 10);
  }

  let scaleValues = [2];
  for (let i = 0.7; i <= 1.3; i += 0.3) {
    scaleValues.push(Number(i.toFixed(2)));
  }

  let fvasValues = [];
  for (let i = 0.4; i <= 3.6; i += 0.8) {
    fvasValues.push(Number(i.toFixed(2)));
  }

  // Validation on client-side
  _('status').innerHTML = '';
  if ([0.12, 0.16, 0.2, 0.28].indexOf(rvas) < 0) {
    _('status').innerHTML = '<p>A rétegvastagság értéke nem megfelelő</p>'; 
    return;
  } else if (surusegValues.indexOf(suruseg) < 0) {
    _('status').innerHTML = '<p>A sűrűség értéke nem megfelelő</p>'; 
    return 
  } else if (colorValues.indexOf(color) < 0) {
    _('status').innerHTML = '<p>A szín értéke nem megfelelő</p>'; 
    return 
  } else if (scaleValues.indexOf(scale) < 0) {
    _('status').innerHTML = '<p>A méretezés értéke nem megfelelő</p>'; 
    return 
  } else if (fvasValues.indexOf(fvas) < 0) {
    _('status').innerHTML = '<p>A falvastagság értéke nem megfelelő</p>'; 
    return 
  } else if (quantityValues.indexOf(quantity) < 0) {
    _('status').innerHTML = '<p>A mennyiség értéke nem megfelelő</p>'; 
    return 
  }

  // Add selected item to the cart by adding it to cookies
  let value = {
    ['id_' + id]: id,
    ['content_' + id]: {
      ['rvas_' + id]: rvas,
      ['suruseg_' + id]: suruseg,
      ['color_' + id]: color,
      ['scale_' + id]: scale,
      ['fvas_' + id]: fvas,
      ['quantity_' + id]: quantity
    }
  };

  // If the same two products have the same configs update quantity by 1
  // Basically implements an object equality comparison on content and updates it
  _('succBox').innerHTML = '';
  _('status').innerHTML = '';
  if (getCookie('cartItems')) {
    let itemsSoFar = JSON.parse(getCookie('cartItems'));
    let props = Object.keys(itemsSoFar).filter(prop => {
      return prop.split('_')[2] == itemId && prop[0] == 'c';
    }).map(prop => prop.replace('content_', ''));
    
    // Do not allow more than 15 different items in cart
    if (props.length >= 15) {
      _('status').innerHTML = '<p>Egyszerre maximum 15 különböző termék rendelhető</p>'; 
      return;
    }

    let cnt = 0;
    for (let i = 0; i < props.length; i++) {
      let y = 0;
      let objKeys = Object.keys(value['content_' + id]);
      let ind = objKeys.indexOf('quantity_' + id);
      objKeys.splice(ind, 1);
      for (let p1 of objKeys) {
        let cid = props[cnt];
        let begin = p1.split('_')[0];
        if (value['content_' + id][p1] == itemsSoFar['content_' + cid][begin + '_' + cid]) {
          if (y == 4) {
            // Maximum quantity for a single item is 10
            if (itemsSoFar['content_' + cid]['quantity_' + cid] + quantity > 10) {
              _('status').innerHTML = '<p>Egyféle termékből maximum 10db rendelhető</p>'; 
              return;
            }
            itemsSoFar['content_' + cid]['quantity_' + cid] += quantity;
            setCookie('cartItems', JSON.stringify(itemsSoFar), 365);
            _('succBox').innerHTML = '<p>A terméket sikeresen a kosárba helyezted</p>';
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

  _('succBox').innerHTML = '<p>A terméket sikeresen a kosárba helyezted</p>';
}

// Update price in the DOM, in real-time
function updateTotPrice(cartId, newPrice, oldPrice) {
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

  if (sumOfSums > 15000) sumOfSums *= 0.97;
  _('fPrice').innerHTML = Math.round(sumOfSums);

  // Also update the new parameter in cookies
  let contentSoFar = JSON.parse(getCookie('cartItems'))
  let names = ['rvas', 'suruseg', 'scale', 'color', 'quantity', 'fvas'];
  for (let name of names) {
    let currentVal = _(name + cartId).value;
    contentSoFar['content_' + cartId][name + '_' + cartId] = currentVal;
  }
  console.log(contentSoFar);
  setCookie('cartItems', JSON.stringify(contentSoFar), 365);
}

function calculatePrice(price, id = '') {
  let rvasVal = Number(_('rvas' + id).value);
  let surusegVal = Number(_('suruseg' + id).value);
  let scaleVal = Number(_('scale' + id).value);
  let fvasVal = Number(_('fvas' + id).value);
  if ((surusegVal == 10 && rvasVal == 0.12 && scaleVal == 1 && fvasVal == 0.4)
    || rvasVal == 0.12) {
    var rvasP = 0;
  } else {
    var rvasP = Math.round(-(price * (rvasVal / 2)));
  }

  if ((surusegVal == 10 && rvasVal == 0.12 && scaleVal == 1 && fvasVal == 0.4)
    || surusegVal == 10) { 
    var surusegP = 0;
  } else {
    var surusegP = Math.round(price * (surusegVal / 500));
  }

  if ((surusegVal == 10 && rvasVal == 0.12 && scaleVal == 1 && fvasVal == 0.4)
    || scaleVal == 1) {
    var scaleP = 0;
  } else {
    var scaleP = Math.round((price * scaleVal - price) / 5); 
  }

  if ((surusegVal == 10 && rvasVal == 0.12 && scaleVal == 1 && fvasVal == 0.4)
    || fvasVal == 0.4) {
    var fvasP = 0;
  } else {
    var fvasP = Math.round(fvasVal / 20 * price); 
  }

  return rvasP + surusegP + scaleP + fvasP;
}

function getPriceHolder(id) {
  if (id) {
    return _('priceHolder_' + id);
  } else {
    return _('priceHolder');
  }
}

function updatePrice(isInCart, price, domElement) {
  let id = isInCart ? isInCart : '';
  let newPrice = price + calculatePrice(price, id); 
  domElement.innerHTML = newPrice;
  return newPrice;
}

function updateSpecs(e, price, isInCart = false) {
  let value = Number(e.value);
  let domElement = getPriceHolder(isInCart);
  
  var newPrice = updatePrice(isInCart, price, domElement);
  updateTotPrice(isInCart, newPrice, price);
}

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
}

// User buys the single item
function buyItem(id) {
  let rvas = _('rvas').value;
  let suruseg = _('suruseg').value;
  let color = _('color').value;
  let scale = _('scale').value;
  let fvas = _('fvas').value;
  let q = _('quantity').value;
  window.location.href = `
    /buy?product=${id}&rvas=${rvas}&suruseg=${suruseg}&color=${color}&scale=${scale} &fvas=${fvas}&q=${q}
  `;
}
