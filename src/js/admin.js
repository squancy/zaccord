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
      if (priceSum + Number(_('allp_' + i).innerText) < 500) {
        extraPrice = 500 - (priceSum + Number(_('allp_' + i).innerText));
      }
      _('totp_' + i).innerText = priceSum + Number(_('allp_' + i).innerText) + sprices[i]
        + extraPrice;
      priceSum = 0;
    }

    if (cuid == nuid && cot == not)  {
      _('box_' + i).style.borderBottom = 'none';
      _('box_' + (i + 1)).style.borderTop = 'none';
      _('box_' + i).style.borderRadius = '0';
      
      if (cot != pot && i > 0) {
        _('box_' + i).style.borderRadius = '30px 30px 0 0';
      } else if (i > 0) {
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
function sendConfEmail(uid) {
  let data = {
    'uid': uid
  };

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
  });
}
