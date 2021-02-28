_('submitBtn').addEventListener('click', function sendCredentials(e) {
  let name = _('name').value;
  let email = _('email').value;
  let tel = _('mobile').value;
  let message = _('message').value;
  _('pstatus').innerHTML = '';
  _('succstat').innerHTML = '';
  if (!name || !email || !tel) {
    statusFill('pstatus', 'Kérlek add meg a neved, telefonszámod és email címed');
  } else {
    let data = {
      'name': name,
      'email': email,
      'tel': tel,
      'message': message
    };

    // Send data to server for validation
    fetch('/validatePrototype', {
      headers: {
        'Content-Type': 'application/json'
      },
      method: 'POST',
      body: JSON.stringify(data)
    }).then(response => {
      return response.json();
    }).then(data => {
      // Check for errors on the server side as well
      console.log(data)
      if (data.hasOwnProperty('success')) {
        statusFill('succstat', data.success);
      } else {
        statusFill('pstatus', 'Egy nem várt hiba történt, kérlek próbáld újra');
      }
      _('submitBtn').disabled = false;
    }).catch(err => {
      // Something went wrong
      console.log(err)
      statusFill('pstatus', 'Egy nem várt hiba történt, kérlek próbáld újra');
      _('submitBtn').disabled = false;
    });
  }
});
