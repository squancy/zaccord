let paylike = Paylike('6fbb909f-0183-4d0b-b804-6e567c160a3a');

let plForm = document.querySelector('form#checkout');

let plError = _('plErrorStat');
let plSubmit = plForm.querySelector('input[type=submit]');

let plEmail = plForm.querySelector('input[name=email]');
let plName = plForm.querySelector('input[name=name]');

Paylike.assistNumber(plForm.querySelector('input.card-number'));
Paylike.assistExpiry(plForm.querySelector('input.card-expiry'));

let plFinished = false;
let plAmount = Number(_('fPrice').innerText) * 100;

let formCont = document.getElementsByClassName('plFormCont')[0];

let ifr = document.createElement("iframe");
ifr.setAttribute('id', 'tif');
formCont.appendChild(ifr);

_('plBtn').value = 'Fizetés - ' + _('fPrice').innerText + ' Ft';

_('paylikeCont').addEventListener('click', function openTransaction(e) {
  if (plFinished) return;
  _('exitBtn').setAttribute('onclick', 'exitCont("plOuter")');
  _('overlay').style.opacity = '1';
  _('plOuter').style.opacity = '1';
  _('plOuter').style.height = 'auto';
  _('plOuter').style.top = '70px';
  _('overlay').style.height = document.body.scrollHeight + "px";
  _('exitBtn').style.display = 'block';
  document.body.style.overflow = 'hidden';

  // Center box
  updateHorizontalPos('plOuter');
});

window.addEventListener('resize', e => {
  if (_('plOuter').style.opacity === '1') {
    updateHorizontalPos('plOuter');
  }
});

function startAgain(e) {
  _('unsuccAuth').style.display = 'none';
  _('checkout').style.display = 'block';
  plError.innerHTML = '';
}

plForm.addEventListener('submit', function(e){
  e.preventDefault();

  plSubmit.disabled = true;
  plSubmit.value = 'Folyamatban...';
  plError.innerHTML = '';

  paylike.pay(plForm, {
    currency: 'HUF',
    amount: plAmount,
    locale: 'hu'
  }, function(err, r){
    plSubmit.value = 'Fizetés - ' + _('fPrice').innerText + ' Ft';
    plSubmit.disabled = false;

    if (err) {
      // If an error is returned then check if 3-D secure is required
      // If it is, redirect user to the URL returned back
      console.log(err)
      if (err.code === 30) {
        let ACSurl = err.tds.url;
        let pareq = err.tds.pareq;
        let oid = err.tds.oid;
        let returnUrl = 'https://gateway.paylike.io/acs-response';

        let iframeDoc = _('tif').contentDocument || _('tif').contentWindow.document;
        let content = `
          <p style="text-align: center; color: #4285f4; font-size: 20px; font-family: sans-serif;">
            Egy kis türelmet...
          </p>
          <form method="POST" action="${ACSurl}">
            <input type="hidden" name="PaReq" value="${pareq}">
            <input type="hidden" name="TermUrl" value="${returnUrl}">
            <input type="hidden" name="MD" value="${oid}">
            <input type="submit" id="sm" style="display: none;">
          </form>
        `;

        iframeDoc.open();
        iframeDoc.write(content);
        iframeDoc.close();

        $("#tif").contents().find("#sm").click();
        _('checkout').style.display = 'none';
        _('tif').style.display = 'block';

        window.addEventListener('message', function(e) {
          let pares = e.data && e.data.pares;
          console.log(pares);
          paylike.pay(plForm, {
            currency: 'HUF',
            amount: plAmount,
            tds: { pares: pares },
            locale: 'hu'
          }, function(err, r) {
            if (err) {
              _('tif').style.display = 'none';
              _('unsuccAuth').style.display = 'block';
              iframeDoc.open();
              iframeDoc.write('');
              iframeDoc.close();
              ifr.setAttribute('src', 'about:blank');
            }
          });
        });
      }
      plError.innerHTML = '<p>' + err + '</p>';
      return;
    }

    exitCont('plOuter');
    _('plInfoHolder').innerHTML = `
      <br>
      <span class="blue">
        A bankkártyádat sikeresen felvettük a rendszerbe!
      </span>
    `;

    transactionID = r.transaction.id;
  });
});
