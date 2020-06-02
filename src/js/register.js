// Validate emails with regex
function validateEmail(email) {
  if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)) {
    return true;
  }
  return false;
}

let startTime = new Date();

_('submitBtn').addEventListener('click', function validateForm(e) {
  // Get form values
  let email = _('email').value;
  let pass = _('pass').value;
  let passConf = _('passConf').value;
  let errStatus = _('errStatus');
  let successStatus = _('successStatus');

  // Validate form on client side; use lockdown after 5 minutes against BF
  let endTime = new Date();
  let timeDiff = endTime - startTime; 
  timeDiff /= 1000;

  errStatus.innerHTML = '';
  successStatus.innerHTML = '';
  if (Math.round(timeDiff) >= 300) {
    errStatus.innerHTML = '<p>Túllépted az időkorlátot, kérlek frissítsd az oldalt</p>';
    return;
  }

  _('submitBtn').disabled = true;

  if (!email || !pass || !passConf) {
    errStatus.innerHTML = '<p>Kérlek tölts ki minden mezőt</p>';
    _('submitBtn').disabled = false;
    return;
  } else if (!validateEmail(email)) {
    errStatus.innerHTML = '<p>Kérlek valós e-mailt adj meg</p>';
    _('submitBtn').disabled = false;
    return;
  } else if (pass.length < 6) {
    errStatus.innerHTML = '<p>A jelszónak minimum 6 karakterből kell állnia</p>';
    _('submitBtn').disabled = false;
    return;
  } else if (pass != passConf) {
    errStatus.innerHTML = '<p>A jelszavak nem egyeznek</p>';
    _('submitBtn').disabled = false;
    return;
  } else {
    _('email').value = ''; 
    _('pass').value = '';
    _('passConf').value = '';

    // If sign up is successful push data to server-side validation
    let data = {
      'email': email,
      'pass': pass,
      'passConf': passConf
    };

    _('loader').innerHTML = '<img src="/images/icons/loader.gif">';

    fetch('/validateRegister', {
      headers: {
        'Content-Type': 'application/json'
      },
      method: 'POST',
      body: JSON.stringify(data)
    }).then(response => {
      return response.json();
    }).then(data => {
      // Check errors on the server side as well
      _('loader').innerHTML = '';
      _('submitBtn').disabled = false;
      if (data.hasOwnProperty('error') && data.error) {
        errStatus.innerHTML = data.error;
        return;
      } else if (data.hasOwnProperty('success') && data.success) {
        successStatus.innerHTML = data.success;
        return;
      }
    }).catch(err => {
      // Something unexpected happened, report error
      errStatus.innerHTML = '<p>Egy nem várt hiba történt, kérlek próbáld újra</p>'; 
      _('loader').innerHTML = '';
      _('submitBtn').disabled = false;
    });
  }
 });
