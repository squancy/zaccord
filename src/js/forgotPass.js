// Validate temporary password reedem and push to server side
_('submitBtn').addEventListener('click', function submitEmail(e) {
  let email = _('email').value;
  _('email').style.marginBottom = '0px';
  if (!email.length) {
    _('errStatus').innerHTML = '<p>Adj meg egy email címet</p>';
    return;
  } else {
    let data = {
      'email': email
    };

    _('succStatus').innerHTML = '';
    _('errStatus').innerHTML = '';

    fetch('/validateForgotPass', {
      headers: {
        'Content-Type': 'application/json'
      },
      method: 'POST',
      body: JSON.stringify(data)
    }).then(response => response.json()).then(data => {
      if (data.success) {
        _('succStatus').innerHTML = `<p>Ideiglenes jelszó sikeresen idényelve</p>`;
        _('email').value = '';
      } else {
        _('errStatus').innerHTML = data.error;
      }
    });
  }
});
