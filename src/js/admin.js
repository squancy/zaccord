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
        window.location.href = '/ADMIN_LOGIN_PAGE?user=' + u + '&pass=' + p;
      } else {
        _('status').innerText = 'hibás bejelentkezési adatok';
      }
    });
  });
}

if (_('hr_0')) {
  let i = 0;
  let priceSum = 0;
  while (_('hr_' + i)) {
    if (!_('hr_' + i)) break; 
    let cuid =  _('uid_' + i) ? _('uid_' + i).innerText : NaN;
    let cot = _('ot_' + i) ? _('ot_' + i).innerText : NaN;
    let nuid = _('uid_' + (i + 1)) ? _('uid_' + (i + 1)).innerText : NaN;
    let not = _('ot_' + (i + 1)) ? _('ot_' + (i + 1)).innerText : NaN;
    let puid = _('uid_' + (i - 1)) ? _('uid_' + (i - 1)).innerText : NaN;
    let pot = _('ot_' + (i - 1)) ? _('ot_' + (i - 1)).innerText : NaN;

    if (cuid == nuid && cot == not)  {
      _('hr_' + i).style.display = 'none';
      priceSum += Number(_('allp_' + i).innerText);
    }

    if ((cuid != nuid || cot != not) && (cuid != puid || cot != pot)) {
      let cPrice = Number(_('allp_' + i).innerText);
      _('allp_' + i).innerText = cPrice + sprices[i];
    }

    if ((cuid != nuid || cot != not) && (cuid == puid && cot == pot)) {
      _('totpHolder_' + i).style.display = 'block';
      _('totp_' + i).innerText = priceSum + Number(_('allp_' + i).innerText) + sprices[i];
      priceSum = 0;
    }
    i++;
  }
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
