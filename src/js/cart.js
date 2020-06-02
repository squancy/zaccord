// User can change the color of an item in the cart
function chColor(e, id) {
  let value = e.value;

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

  // If it was the last item in cart display 'your cart is empty' page
  setCookie('cartItems', JSON.stringify(cookieContent), 365);
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
  if (fPrice - cPrice * 0.97 > 15000) {
    _('fPrice').innerHTML = Math.round(fPrice - cPrice * 0.97);
  } else {
    _('fPrice').innerHTML = Math.round(fPrice * 1.03092783505) - cPrice;
    _('discount').innerHTML = '';
  }
}
