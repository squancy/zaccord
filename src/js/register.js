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
  if (!regVal(email, pass, passConf, 'errStatus', 'submitBtn')) {
    return;
  } else {
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
      } else if (data.hasOwnProperty('success') && data.success) {
        _('email').value = ''; 
        _('pass').value = '';
        _('passConf').value = '';
        successStatus.innerHTML = data.success;

        // Change header to logged in
        _('register').innerText = 'Fiók';
        _('register').href = '/account';
        _('login').innerText = 'Prototípusgyártás';
        _('login').href = '/prototype';

        // Update highlighted icon color
        if (window.matchMedia("(max-width: 768px)").matches) {
          document.querySelectorAll('.hideSeek > a > img')[2].src =
            '/images/icons/protBlack.svg';
        } else {
          _('register').style.color = '#000';
        }
        //fbq('track', 'CompleteRegistration');
      }
    }).catch(err => {
      // Something unexpected happened, report error
      errStatus.innerHTML = '<p>Egy nem várt hiba történt, kérlek próbáld újra</p>'; 
      _('loader').innerHTML = '';
      _('submitBtn').disabled = false;
    });
  }
});
