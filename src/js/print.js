// Change color of the stl model in the browser
if (_('color')) {
  _('color').addEventListener('change', function changeColor(e) {
    let v = _('color').value;
    let colorMaps = {
      'Fehér': '#ffffff',
      'Fekete': '#000000',
      'Kék': '#4285f4',
      'Piros': '#dc143c',
      'Sárga': '#ffff33',
      'Zöld': '#32cd32'
    };
    chooseColor(colorMaps[v]);
  });
}

// Update the price of the stl model if parameters are changed
function priceChange() {
  console.log(basePrice)
  let v = _('quantity').value;
  if (basePrice * v >= 1500) _('charge').style.display = 'none';
  else _('charge').style.display = 'inline-block';
  _('priceHolder').innerHTML = basePrice * v;
}

if (_('quantity') && _('fvas') && _('scale') && _('suruseg') && _('rvas')) {
  _('quantity').addEventListener('change', priceChange);
  _('fvas').addEventListener('change', priceChange);
  _('scale').addEventListener('change', priceChange);
  _('suruseg').addEventListener('change', priceChange);
  _('rvas').addEventListener('change', priceChange);

  // Change the value in the cookies as well
  _('quantity').addEventListener('change', () => updateCookie('quantity'));
  _('fvas').addEventListener('change', () => updateCookie('fvas'));
  _('scale').addEventListener('change', () => updateCookie('scale'));
  _('suruseg').addEventListener('change', () => updateCookie('suruseg'));
  _('rvas').addEventListener('change', () => updateCookie('rvas'));
  _('color').addEventListener('change', () => updateCookie('color'));

}

function updateCookie(param) {
  let soFar = JSON.parse(getCookie('cartItems'));
  for (let a of arr) {
    let id = a.split('/')[2].replace('.stl', '');
    soFar['content_' + id][param + '_' + id] = _(param).value;
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

    // If user is logged in allow him to buy the product
    if (isLoggedIn) {
      window.onbeforeunload = function() {};
      window.location.href =
      `/buy?product=cp&rvas=${rvas}&suruseg=${suruseg}&color=${color}&scale=${scale}&fvas=${fvas}&q=${quantity}&thName=${thName}&files=${paths}`;
    } else {
      _('infoStat').innerHTML = `
        <p>
          A várásláshoz kérlek jelentkezz be!
          Addig is, a nyomtatni kívánt termékeket megtalálod a kosaradban.
        </p>
      `;
    }
  });
}

// If user uploads stl files display loader
if (_('submitBtn')) {
  _('submitBtn').addEventListener('click', function displayLoader(e) {
    _('status').innerHTML = '<img src="/images/icons/loader.gif" style="margin-bottom: 0;">';
  });
}
