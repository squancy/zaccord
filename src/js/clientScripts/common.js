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
  //if (typeof fbq !== 'undefined') fbq('track', 'CustomizeProduct');
}

// Whatever value the user changes in connection with the model save them to cookies
function updateCookie(param, qty = null, cookieID = null) {
  let soFar = JSON.parse(getCookie('cartItems'));
  let cachedIDs = localStorage.getItem('refresh').split('|||');
  for (let i = 0; i < arr.length; i++) {
    let a = arr[i];
    let id = a.split('/')[2].replace('.stl', '').replace('.jpg', '').replace('.jpeg', '')
      .replace('.png', '');

    // If id is not found look for the refreshed ID
    if (!soFar['content_' + id]) {
      id = cachedIDs[i];
    }

    // Value incrementation is delayed since the function is in item.js
    // So manual updating of the quantity needs to be implemented here
    if (param == 'quantity') {
      if (Number(_(param).value) + qty < 1 || Number(_(param).value) + qty > 10) return;
      let v = encodeURIComponent(Number(_(param).value) + qty);
      soFar['content_' + id][param + '_' + id] = v;
    } else {
      let cid = cookieID ? cookieID : param;
      soFar['content_' + id][cid + '_' + id] = encodeURIComponent(_(param).value);
    }
  } 
  setCookie('cartItems', JSON.stringify(soFar), 365);
  updateCartNum();
  //fbq('track', 'CustomizeProduct');
}