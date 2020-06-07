// User can change their delivery infos
_('cDel').addEventListener('click', function changeDelInfo(e) {
  // Gather values 
  let name = _('name').value;
  let pcode = Number(_('pcode').value);
  let city = _('city').value;
  let address = _('address').value;
  let mobile = _('mobile').value;

  _('succStatusDel').innerHTML = '';
  _('errStatusDel').innerHTML = '';

  // Only postal code validation can be performed; other params are too ambiguous
  if (!Number.isInteger(pcode) || pcode < 1000 || pcode > 9985) {
    _('errStatusDel').innerHTML = '<p>Kérlek valós irányítószámot adj meg</p>';
    return;
  } else {
    // Send data to server for further validation
    let data = {
      'name': name,
      'pcode': pcode,
      'city': city,
      'address': address,
      'mobile': mobile
    };

    fetch('/delValidation', {
      headers: {
        'Content-Type': 'application/json'
      },
      method: 'POST',
      body: JSON.stringify(data)
    }).then(response => {
      return response.json();
    }).then(data => {
      if (data.success) { 
        _('succStatusDel').innerHTML = '<p>A szállítási adatok sikeresen megváltoztak</p>';
      } else if (data.error) {
        _('errStatusDel').innerHTML = data.error;
      } else {
        _('errStatusDel').innerHTML = '<p>Egy nem várt hiba történt, próbáld újra</p>';
      }
    }).catch(err => {
      _('errStatusDel').innerHTML = '<p>Egy nem várt hiba történt, próbáld újra</p>';
    });
  }
});

// Change password
_('cPass').addEventListener('click', function changePassword(e) {
  let cpass = _('cpass').value;
  let npass = _('pass').value;
  let rpass = _('rpass').value;

  _('errStatusPass').innerHTML = '';
  _('succStatusPass').innerHTML = '';

  // Make sure new password is at least 6 characters long
  if (npass.length < 6) {
    _('errStatusPass').innerHTML = `
      <p>A jelszónak minimum 6 karakter hosszúnak kell lennie</p>
    `;
    return;
  } else {
    // Send data to server for further validation
    let data = {
      'cpass': cpass,
      'npass': npass,
      'rpass': rpass
    };

    fetch('/passValidate', {
      headers: {
        'Content-Type': 'application/json'
      },
      method: 'POST',
      body: JSON.stringify(data)
    }).then(response => {
      return response.json();
    }).then(data => {
      if (data.error) {
        _('errStatusPass').innerHTML = data.error;
        return;
      }
      _('succStatusPass').innerHTML = '<p>Sikeresen megváltoztattad a jelszavad</p>';
    }).catch(err => {
      _('errStatusPass').innerHTML = '<p>Egy nem várt hiba történt, próbáld újra</p>';
    })
  }
});
