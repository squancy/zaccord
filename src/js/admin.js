// Change the admin url if you want
if (_('ok')) {
  _('ok').addEventListener('click', function submitLogin(e) {
    let data = {
      'user': _('user').value,
      'pass': _('pass').value
    };

    fetch('/adminLogin', {
      headers: {
        'Content-Type': 'application/json'
      },
      method: 'POST',
      body: JSON.stringify(data)
    }).then(response => response.json()).then(data => {
      if (data.success) {
        let u = encodeURIComponent(_('user').value);
        let p = encodeURIComponent(_('pass').value);
        window.location.href = '/lick_weebshit?user=' + u + '&pass=' + p;
      } else {
        _('status').innerHTML = '<p>Hibás bejelentkezési adatok</p>';
      }
    });
  });
}

function hideU(i) {
  _('transT_' + i).style.display = 'none';
  _('pers_' + i).style.display = 'none';
  _('bot_' + i).style.display = 'none';
  _('binfo_' + i).style.display = 'none';
}

if (_('box_0')) {
  let i = 0;
  let priceSum = 0;
  while (_('box_' + i)) {
    if (!_('box_' + i)) break; 
    let cuid =  _('uid_' + i) ? _('uid_' + i).innerText : NaN;
    let cot = _('ot_' + i) ? _('ot_' + i).innerText : NaN;
    let nuid = _('uid_' + (i + 1)) ? _('uid_' + (i + 1)).innerText : NaN;
    let not = _('ot_' + (i + 1)) ? _('ot_' + (i + 1)).innerText : NaN;
    let puid = _('uid_' + (i - 1)) ? _('uid_' + (i - 1)).innerText : NaN;
    let pot = _('ot_' + (i - 1)) ? _('ot_' + (i - 1)).innerText : NaN;

    if ((cuid != nuid || cot != not) && (cuid != puid || cot != pot)) {
      let cPrice = Number(_('allp_' + i).innerText);
      _('allp_' + i).innerText = cPrice + sprices[i];
    }

    if ((cuid != nuid || cot != not) && (cuid == puid && cot == pot)) {
      _('totpHolder_' + i).style.display = 'block';
      let extraPrice = 0;
      if (priceSum + Number(_('allp_' + i).innerText) < 800) {
        extraPrice = 800 - (priceSum + Number(_('allp_' + i).innerText));
      }
      let moneyHandle = 0;
      //if (priceSum + Number(_('allp_' + i).innerText) > 15000) moneyHandle = -390;
      _('totp_' + i).innerText = priceSum + Number(_('allp_' + i).innerText) + sprices[i]
        + extraPrice + moneyHandle;
      priceSum = 0;
    }

    if (cuid == nuid && cot == not)  {
      _('box_' + i).style.borderBottom = 'none';
      _('box_' + (i + 1)).style.borderTop = 'none';
      _('box_' + i).style.borderRadius = '0';
      
      if (cot != pot && i > 0) {
        _('box_' + i).style.borderRadius = '30px 30px 0 0';
      } else if (i > 0 || (_('box_0') && _('box_1') && !_('box_2'))) {
        if ((_('box_0') && _('box_1') && !_('box_2'))) {
          _('box_' + (i + 1)).style.borderRadius = '0 0 30px 30px';
        }
        hideU(i);
      }
      priceSum += Number(_('allp_' + i).innerText);
    } else {
      _('box_' + i).style.marginBottom = '20px';
    }

    if (cot != not && cot == pot && i > 0 && _('box_' + (i + 1))) {
      _('box_' + i).style.borderRadius = '0 0 30px 30px';
      _('box_' + i).style.marginBottom = '20px';
      hideU(i);
    }

    i++;
  }
}

if (_('box_0')) {
  _('box_0').style.borderTopLeftRadius = '30px';
  _('box_0').style.borderTopRightRadius = '30px';
}

_('genZprod').addEventListener('click', (e) => {
  const re = new RegExp('^[0-9]+$');
  let price = Number(_('zprodPrice').value);
  let expiry = Number(_('zprodExpiry').value);

  if (!re.test(price) || !re.test(expiry)) {
    _('genStatus').innerText = 'Az ár és az érvényesség csak számok lehetnek'; 
    return false;
  }

  let data = {
    price,
    expiry,
    type: 'generate'
  };

  fetch('/handleZprod', {
    headers: {
      'Content-Type': 'application/json'
    },
    method: 'POST',
    body: JSON.stringify(data)
  }).then(response => response.json()).then(data => {
    if (data.status == 'success') {
      let newChild = `
        <tr id="zprod_${data.url}">
          <td>
            <a href="/z-product?id=${data.url}">${data.url}</a>
            <button onclick="copyURL('${data.url}')">copy</button>
          </td>
          <td>${price}</td>
          <td>1</td>
          <td>${data.date}</td>
          <td>${expiry}</td>
          <td><button onclick="deleteZprod('${data.url}')">X</button></td>
        </tr>
      `;
      let template = document.createElement('template');
      newChild = newChild.trim(); 
      template.innerHTML = newChild;
      _('zprodTbl').parentNode.insertBefore(template.content.firstChild, _('zprodTbl').nextSibling);  
    } else {
      _('genStatus').innerText = data.message;
    }
  });
});

async function copyURL(id) {
  await navigator.clipboard.writeText(window.location.hostname + '/z-product?id=' + id);
}

function deleteZprod(url) {
  let data = {
    url,
    type: 'delete'
  }

  fetch('/handleZprod', {
    headers: {
      'Content-Type': 'application/json'
    },
    method: 'POST',
    body: JSON.stringify(data)
  }).then(response => response.json()).then(data => {
    if (data.status == 'success') {
      _('zprod_' + url).outerHTML = ''; 
    } else {
      _('genStatus').innerText = data.message;
    }
  });
}

function updateStatus(i, boxID) {
  let val = _('ch_' + boxID).value;
  let data = {
    'oid': i,
    'val': val
  }

  fetch('/updateOrderStatus', {
    headers: {
      'Content-Type': 'application/json'
    },
    method: 'POST',
    body: JSON.stringify(data)
  }).then(response => response.json()).then(data => {
    if (data.success) {
      if (_('ch_' + boxID).value == 1) {
        _('ch_' + boxID).value = 0;
      } else {
        _('ch_' + boxID).value = 1;
      }
      if (_('ch_' + boxID).value == 0) _('box_' + boxID).style.opacity = '0.3';  
      else _('box_' + boxID).style.opacity = '1';  
    }
  });  
}

// Send confirmation email to customer when the package is ready
// NOTE: change the url if you want to use this feature
function sendConfEmail(uid, delType) {
  let data = {
    'uid': uid,
    'delType': delType
  };

  // Make sure GLS packet tracker code is not empty 
  let glsCode = _('glsCode_' + uid).value;
  if (!glsCode) {
    alert('Add meg a csomagkövetési kódot!');
    return false;
  } else {
    data.glsCode = glsCode;
  }

  fetch('/sendConfEmail', {
    headers: {
      'Content-Type': 'application/json'
    },
    method: 'POST',
    body: JSON.stringify(data)
  }).then(response => response.json()).then(data => {
    if (data.success) {
      _('seHolder_' + uid).innerHTML = 'Email sikeresen elküldve';
    } else {
      _('seHolder_' + uid).innerHTML = 'Hiba történt';
    }
  }).catch(err => {
    console.log(err);
    alert(err);
  });
}

let CURRENT_URL = window.location.href.split('#')[0];
let isFirst = true;
function jumpToOrder() {
  let searchValue = _('searchOrder').value;
  let hashtag = '#';
  if (CURRENT_URL.includes('#')) hashtag = '';
  window.location.href = CURRENT_URL + hashtag + searchValue;
}

function generateInvoice(ID, p) {
  let data = {
    uniqueID: ID,
    shippingPrice: p,
    isElectronic: false
  };

  fetch('/genInvoice', {
    headers: {
      'Content-Type': 'application/json'
    },
    method: 'POST',
    body: JSON.stringify(data)
  }).then(response => response.json()).then(msg => {
    if (msg.success) {
      _('invGen_' + ID).innerHTML = 'siker';
    } else {
      _('invGen_' + ID).innerHTML = 'úú ezt nagyon elbasztam';
    }
  });
}

function markAll() {
  let i = 0;
  while (_('ch_' + i)) {
    if (!_('ch_' + i).checked) {
      $("#ch_" + i).click(); 
    }
    i++;
  }
}

function delFromExcel(id) {
  let name = _('customerName_' + id).innerText;
  let pcode = _('postalCode_' + id).innerText;
  let city = _('city_' + id).innerText;
  let address = _('address_' + id).innerText;
  let mobile = _('mobile_' + id).innerText;
  let email = _('email_' + id).innerText;
  
  let data = {
    name, pcode, city, address, mobile, email 
  };

  _('excelDel_' + id).innerHTML = 'Folyamatban...';
  
  fetch('/delFromExcel', {
    headers: {
      'Content-Type': 'application/json'
    },
    method: 'POST',
    body: JSON.stringify(data)
  }).then(response => response.json()).then(msg => {
    if (msg.status == 'success') {
      _('excelDel_' + id).innerHTML = 'Siker';
    } else {
      _('excelDel_' + id).innerHTML = 'Hiba';
    }
  }).catch(err => {
    console.log(err);
    _('excelDel_' + id).innerHTML = 'Hiba';
  });
}

function downloadSTLs() {
  _('downloadStatus').innerHTML = 'Várjál mert csomagol';
  fetch('/downloadSTLs', {
    headers: {
      'Content-Type': 'application/json'
    },
    method: 'POST'
  }).then(response => response.json()).then(msg => {
    _('downloadStatus').innerHTML = '';
    if (msg.success) {
      let el = document.createElement('a');
      el.setAttribute('href', '/tmpZips/tmp.zip');
      el.setAttribute('download', 'zaccord_stl.zip');
      el.style.display = 'none';
      document.body.appendChild(el);
      el.click();
      //document.body.removeChild(el);
    } else {
      console.log(e);
    }
  }).catch(e => {
    console.log(e);
  });
}

function roundHUF(val) {
  if (val % 10 != 0 && val % 5 != 0) {
    let lastDigit = val % 10;
    if ([1, 2].indexOf(lastDigit) > -1) {
      val -= lastDigit;
    } else if ([3, 4, 6, 7].indexOf(lastDigit) > -1) {
      val += 5 - lastDigit;
    } else {
      val += 10 - lastDigit;
    }
  }

  return val;
}

function createPacket(id, n, ppID, isPP, dt) {
  // Round price in HUF
  let cont = document.getElementsByClassName('totalPrice_' + id);
  if (cont[cont.length - 1] === undefined || !cont[cont.length - 1].innerText) {
    var val = roundHUF(Number(_('allp_' + n).innerText));
  } else {
    var val = roundHUF(Number(cont[cont.length - 1].innerText));
  }
  console.log(val, 'totalPrice_' + id);
  let fullname = String(_('customerName_' + id).innerText);
  let splitFullname = fullname.split(' ');
  let surname = splitFullname[0];
  let name = '';
  for (let i = 1; i < splitFullname.length; i++) {
    if (i == splitFullname.length - 1) {
      name += splitFullname[i];
    } else {
      name += splitFullname[i] + ' ';
    }
  }
  
  let data = {
    number: String(_('id_' + id).innerText), 
    name: name,
    surname: surname,
    email: String(_('email_' + id).innerText),
    phone: String(_('mobile_' + id).innerText),
    currency: 'HUF',
    value: val,
    weight: 0.5,
    eshop: 'Zaccord'
  };

  if (_('paymentType_' + id).innerText == 'utánvét') {
    data['cod'] = val;
  }

  if (isPP) {
    data['addressId'] = ppID;
  } else {
    // Try to separate house number from street name
    const regex = /^([^\d]*[^\d\s]) *(\d.*)$/g;
    const found = regex.exec(_('address_' + id).innerText);
    let streetName = found[1];
    let houseNumber = '';
    for (let i = 2; i < found.length; i++) {
      houseNumber += found[i]; 
      houseNumber += i == found - 1 ? '' : ' ';
    }

    data['street'] = streetName;
    data['city'] = String(_('city_' + id).innerText);
    data['zip'] = String(_('postalCode_' + id).innerText);
    data['houseNumber'] = houseNumber;
    data['addressId'] = dt == 'DPD' ? 805 : 4159;
  }

  _('plink_' + id).innerHTML = 'Feldolgozás';

  fetch('/createPacket', {
    headers: {
      'Content-Type': 'application/json'
    },
    method: 'POST',
    body: JSON.stringify(data)
  }).then(resp => resp.json()).then(data => {
    if (data.success) {
      _('plink_' + id).innerHTML = 'Elküldve';
      alert('Sikeresen elküldve');
    } else {
      alert('Hiba történt');
      console.log(data);
    }
  });
}
