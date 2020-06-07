// User submits order, process their request
function submitOrder() {
  let uvet = _('uvet').checked; 
  let transfer = _('transfer').checked;
  let name = _('name').value;
  let pcode = Number(_('pcode').value);
  let city = _('city').value;
  let address = _('address').value;
  let mobile = _('mobile').value;
  
  _('errStatus').innerHTML = '';
  _('succStatus').innerHTML = '';

  // Make sure payment option is selected & delivery data is filled in
  if (!uvet && !transfer) {
    _('errStatus').innerHTML = '<p>Kérlek válassz egy fizetési módot</p>';
    return;
  } else if (!name || !pcode || !city || !address || !mobile) {
    _('errStatus').innerHTML = '<p>Kérlek töltsd ki a szállítási adatokat</p>';
    return;
  } else if (!Number.isInteger(pcode) || pcode < 1000 || pcode > 9985) {
    _('errStatus').innerHTML = '<p>Kérlek valós irányítószámot adj meg</p>';
    return;
  }

  // Add payment & delivery data to the 1st element of the array
  data[0].payment = 'transfer';
  data[0].name = name;
  data[0].pcode = pcode;
  data[0].city = city;
  data[0].address = address;
  data[0].mobile = mobile;
  if (uvet) data[0].payment = 'uvet';

  // Send data to server for further validation
  fetch('/validateOrder', {
    headers: {
      'Content-Type': 'application/json'
    },
    method: 'POST',
    body: JSON.stringify(data)
  }).then(response => response.json()).then(data => {
    if (data.success) {
      // On successful order remove items from the cookies (if order was not a single item)
      window.scrollTo(0, 0);
      if (isFromCart && !isFromCP) setCookie('cartItems', '', 365);
      _('main').innerHTML = '';
      _('whoosh').style.display = 'none';
      _('succStatus').innerHTML = `
        <p>
          Sikeres rendelés!<br>
          A termék(ek) legkésőbb a rendelés napjától számított 5. munkanapon házhoz lesznek
          szállítva. <br>
          Köszönjük, hogy a Zaccordot választottad!
        </p>
      `;
    } else {
      _('errStatus').innerHTML = '<p>Egy nem várt hiba történt, kérlek próbáld újra</p>';
    }
  }).catch(err => {
    console.log(err);
    _('errStatus').innerHTML = '<p>Egy nem várt hiba történt, kérlek próbáld újra</p>';
  });
}
