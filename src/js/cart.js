// User can change the color of an item in the cart
function chColor(e, id) {
  let value = encodeURIComponent(e.value);

  // Change the value in the cookie
  let cartSoFar = JSON.parse(getCookie('cartItems'));
  cartSoFar['content_' + id]['color_' + id] = value;
  setCookie('cartItems', JSON.stringify(cartSoFar), 365);
  return true;
}

// Remove item from cart: remove from cookies & UI
function removeItem(tid) { 
  _('cartItem_' + tid).style.display = 'none';
  let cookieContent = JSON.parse(getCookie('cartItems'));
  delete cookieContent['id_' + tid];
  delete cookieContent['content_' + tid];
  
  // Also delete file from server if the item is a custom print or a lithophane
  // First, determine extension for lithophanes
  let extension = '';
  if (tid.indexOf('_lit_') > -1) {
    let box = document.querySelector('#cartItem_' + tid + ' > .itemLeftCenter > a > div');
    let url = box.style.backgroundImage;
    if (url.indexOf('.png') > -1) {
      extension = 'png';
    } else if (url.indexOf('.jpg') > -1) {
      extension = 'jpg';
    } else if (url.indexOf('.jpeg') > -1) {
      extension = 'jpeg';
    }
  }

  // Extension for stl files
  /*
    This checks if the extension so far is empty (meaning it's not a lithophane) and the
    filename is not in the form of a fixed product (meaning it's a custom print stl file)
  */
  if (!extension && (tid.match(/_/g) || []).length > 1) {
    extension = 'stl';
  }

  // Do not delete fix product files 
  if (extension) {
    let fileObj = {
      'fname': tid,
      'ext': extension
    };

    fetch('/delCartFile', {
      headers: {
        'Content-Type': 'application/json'
      },
      method: 'POST',
      body: JSON.stringify(fileObj)
    }).then(response => {
      return true;
    });
  }

  // If it was the last item in cart display 'your cart is empty' page
  setCookie('cartItems', JSON.stringify(cookieContent), 365);
  updateCartNum();
  if (Object.keys(cookieContent).length === 0) {
    _('mcs').innerHTML = `
      <section class="keepBottom">
        <div>
          <img src="/images/empty_cart.png" class="emptyCart">
        </div>
      </section> 
    `;
    return;
  }

  // Subtract item price from total price
  let cPrice = Number(_('totpHolder_' + tid).innerHTML); 
  let fPrice = Number(_('fPrice').innerHTML);
  if (fPrice - cPrice * 0.97 > FREE_SHIPPING_LIMIT) {
    _('fPrice').innerHTML = Math.round(fPrice - cPrice * 0.97);
  } else if (fPrice > FREE_SHIPPING_LIMIT && fPrice - cPrice * 0.97 <= FREE_SHIPPING_LIMIT) {
    _('fPrice').innerHTML = Math.round(fPrice * (1 / 0.97)) - cPrice;
    _('discount').innerHTML = '';
  } else {
    _('fPrice').innerHTML = fPrice - cPrice;
  }
}

// User buys the content of the cart
if (_('buyCart')) {
  _('buyCart').addEventListener('click', function buyCart(e) {
    window.location.href = '/buy?product=cart';
  });
}

// Set isFirstVisit cookie to false in order to avoid repeated items in cart
setCookie('isVisited', 'yes', 365);
localStorage.setItem('refresh', '');
