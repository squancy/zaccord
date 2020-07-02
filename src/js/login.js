let startTime = new Date();

_('submitBtn').addEventListener('click', function loginSubmit(e) {
  let email = _('email').value;
  let pass = _('pass').value;

  // 5 min timeout
  let endTime = new Date();
  let timeDiff = endTime - startTime; 
  timeDiff /= 1000;

  _('submitBtn').disabled = true;

  // Validation on client side
  console.log('rr')
  if (!email || !pass) {
    statusFill('errStatus', 'Kérlek tölts ki minden mezőt');
    _('submitBtn').disabled = false;
    return;
  } else if (Math.round(timeDiff) >= 300) {
    statusFill('errStatus', 'Túllépted az időkorlátot, kérlek frissítsd az oldalt');
    _('submitBtn').disabled = false;
    return;
  }

  _('lstatus').innerHTML = '<img src="/images/icons/loader.gif" width="24">';

  let data = {
    'email': email,
    'pass': pass
  };

  // Send data to server for validation
  fetch('/validateLogin', {
    headers: {
      'Content-Type': 'application/json'
    },
    method: 'POST',
    body: JSON.stringify(data)
  }).then(response => {
    return response.json();
  }).then(data => {
    // Check for errors on the server side as well
    if (data.hasOwnProperty('success') && data.success) {
      window.location.href = '/';
    } else if (data.error){
      _('errStatus').innerHTML = data.error;
      _('lstatus').innerHTML = '';
    }
    _('submitBtn').disabled = false;
  }).catch(err => {
    // Something went wrong
    statusFill('errStatus', 'Egy nem várt hiba történt, kérlek próbáld újra');
    _('submitBtn').disabled = false;
    _('lstatus').innerHTML = '';
  });
});
