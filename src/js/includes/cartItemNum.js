// Update the number of items in the cart
function updateCartNum() {
  let cookieObj = JSON.parse(getCookie('cartItems') || '{}');
  let contentObj = Object.keys(JSON.parse(getCookie('cartItems') || '{}')).filter(v => {
    return !v.startsWith('id_');
  });

  let numOfItemsInCart = 0;
  for (let i = 0; i < contentObj.length; i++) {
    let id = contentObj[i].replace('content_', '');
    numOfItemsInCart += Number(cookieObj[contentObj[i]]['quantity_' + id]);
  }

  function makeStyling(id) {
    if (numOfItemsInCart > 99) {
      _(id).style.fontSize = '7px';
      _(id).style.lineHeight = '2.6';
    } else {
      _(id).style.fontSize = '11px';
      _(id).style.lineHeight = '1.65';
    }
    _(id).innerText = numOfItemsInCart;
    _(id).style.display = 'inline-block';
  }

  makeStyling('cartItemNum');
  makeStyling('cartItemNumMob');
}

updateCartNum();
