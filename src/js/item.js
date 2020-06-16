if (_('priceHolder')) {
  var basePrice = Number(_('priceHolder').innerHTML);
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

  // Make sure all parameters have a valid value
  let surusegValues = [10];
  let quantityValues = [];
  let colorValues = ['Fekete', 'Fehér', 'Kék', 'Zöld', 'Sárga', 'Piros'];
  for (let i = 20; i <= 80; i += 20) {
    surusegValues.push(i);
  }

  let scaleValues = [2];
  for (let i = 0.7; i <= 1.3; i += 0.3) {
    scaleValues.push(Number(i.toFixed(2)));
  }

  let fvasValues = [];
  for (let i = 0.8; i <= 2.4; i += 0.4) {
    fvasValues.push(Number(i.toFixed(2)));
  }

  // Validation on client-side
  _('status').innerHTML = '';
  if ([0.12, 0.2, 0.28].indexOf(rvas) < 0) {
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
  } else if (quantity % 1 !== 0 || quantity < 1 || quantity > 10) {
    _('status').innerHTML = '<p>A mennyiség értéke nem megfelelő</p>'; 
    return 
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
      ['quantity_' + id]: quantity
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

  if (sumOfSums > 15000) {
    sumOfSums *= 0.97;
  } else if (sumOfSums < 1000) {
    let extraPrice = 1000 - sumOfSums;
    sumOfSums += extraPrice;
    _('extraPrice').innerHTML = `(+${extraPrice} Ft felár)`;
  } else {
    _('extraPrice').innerHTML = '';
  }

  _('fPrice').innerHTML = Math.round(sumOfSums);
  manageDiscountTxt(Math.round(sumOfSums));

  // Also update the new parameter in cookies
  let contentSoFar = JSON.parse(getCookie('cartItems'))
  let names = ['rvas', 'suruseg', 'scale', 'color', 'quantity', 'fvas'];
  for (let name of names) {
    let currentVal = _(name + cartId).value;
    console.log(name + '_' + cartId)
    contentSoFar['content_' + cartId][name + '_' + cartId] = encodeURIComponent(currentVal);
  }
  setCookie('cartItems', JSON.stringify(contentSoFar), 365);
}

// Calculate the price while changing the parameters
function calculatePrice(price, id = '') {
  let rvasVal = Number(_('rvas' + id).value);
  let surusegVal = Number(_('suruseg' + id).value);
  let scaleVal = Number(_('scale' + id).value);
  let fvasVal = Number(_('fvas' + id).value);
 
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

function getPriceHolder(id) {
  if (id) {
    return _('priceHolder_' + id);
  } else {
    return _('priceHolder');
  }
}

function updatePrice(isInCart, price, domElement) {
  let id = isInCart ? isInCart : '';
  let newPrice = calculatePrice(price, id); 
  domElement.innerHTML = newPrice;
  return newPrice;
}

function manageDiscountTxt(newPrice) {
  if (newPrice > 15000) {
    _('discount').innerHTML = '(3% kedvezmény)';
  } else {
    _('discount').innerHTML = '';
  }
}

function updateSpecs(e, price, isInCart = false) {
  let value = Number(e.value);
  let domElement = getPriceHolder(isInCart);
  
  var newPrice = updatePrice(isInCart, price, domElement);
  updateTotPrice(isInCart, newPrice, price);
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
}

// User buys a single item: save specs and redirect to buy page
function buyItem(id) {
  let rvas = _('rvas').value;
  let suruseg = _('suruseg').value;
  let color = _('color').value;
  let scale = _('scale').value;
  let fvas = _('fvas').value;
  let q = _('quantity').value;

  // If user is not logged in display error msg
  if (!isLoggedIn) {
    _('info').innerHTML = '<p>A vásárláshoz kérlek jelentkezz be</p>';  
  } else {
    window.location.href = `
      /buy?product=${id}&rvas=${rvas}&suruseg=${suruseg}&color=${encodeURIComponent(color)}&scale=${scale} &fvas=${fvas}&q=${q}`;
  }
}

let stlView = null;
let isMobile = mobileCheck();

// Handle the displaying & hiding of pop-up 3D stl viewer
function viewIn3D(stlPath) {
  // Get window width & height
  const width  = window.innerWidth || document.documentElement.clientWidth || 
    document.body.clientWidth;
  const height = window.innerHeight|| document.documentElement.clientHeight|| 
    document.body.clientHeight;

  if (_('overlay').style.display == 'block') {
    _('overlay').style.display = 'none';
    _('viewBox').style.display = 'none';
    _('exitBtn').style.display = 'none';
    document.body.style.overflow = 'auto';
  } else {
    _('overlay').style.display = 'block';
    _('viewBox').style.display = 'block';
    document.body.style.overflow = 'hidden';
    
    if (!isMobile) {
      _('viewBox').style.width = width / 2 + 'px';
      _('viewBox').style.height = height / 2 + 'px';
      _('viewBox').style.top = height / 4 + 'px';
      _('viewBox').style.left = width / 4 + 'px';
      _('exitBtn').style.display = 'block';
      _('exitBtn').style.left = width * (3 / 4) - 44 + 'px';
      _('exitBtn').style.top = height / 4 + 24 + 'px';
    } else {
      console.log(isMobile)
      _('viewBox').style.width = width / 1.1 + 'px';
      _('viewBox').style.height = height / 2 + 'px';
      _('viewBox').style.top = height / 4 + 'px';
      _('viewBox').style.left = width / 22 + 'px';
      _('exitBtn').style.display = 'block';
      _('exitBtn').style.left = width * (21 / 22) - 44 + 'px';
      _('exitBtn').style.top = height / 4 + 24 + 'px';
    }
    

    if (!stlView) {
      // Use a 3rd party library for viewing .stl files
      _('stlLoader').style.display = 'block';
      stlView = new StlViewer(document.getElementById("viewBox"), {
        all_loaded_callback: () => {
          _('stlLoader').style.display = 'none';
          stlView.set_scale(0, 0.6);
        },
        models: [
          {
            'id': 0,
            'filename': stlPath,
            'color': '#cccccc',
          }
        ]
      });
    }
  }
}
