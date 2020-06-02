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
  if (!email || !pass) {
    _('errStatus').innerHTML = '<p>Kérlek tölts ki minden mezőt</p>';
    return;
  }

  if (Math.round(timeDiff) >= 300) {
    errStatus.innerHTML = '<p>Túllépted az időkorlátot, kérlek frissítsd az oldalt</p>';
    return;
  }

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
    }
    _('submitBtn').disabled = false;
  }).catch(err => {
    // Something went wrong
    _('errStatus').innerHTML = '<p>Egy nem várt hiba történt, kérlek próbáld újra</p>'; 
    _('submitBtn').disabled = false;
  });
});
