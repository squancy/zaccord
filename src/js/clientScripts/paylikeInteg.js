const API_KEY = 'a1f2ad0d-d79c-47b7-84c0-ac8d7c7a6a3a';
let paylike = Paylike(API_KEY); // f096aba2-e6bd-4980-850b-c4c6dacac896

// Define possible error codes and their explanations
const errorCodes = [
  { INTERNAL_ERROR: 'Belső hiba történt' },
  { ENDPOINT_NOT_FOUND: 'Végpont nem található' },
  { VERSION_MISSING: 'Hiányzó verziószám' },
  { VERSION_UNSUPPORTED: 'Nem támogatott verzió' },
  { BODY_INVALID: 'Érvénytelen adatok' },
  { REQUEST_INVALID: 'Érvénytelen kérés' },
  { TOKEN_INVALID: 'Érvénytelen token' },
  { TOKEN_TYPE_UNEXPECTED: 'Nem ismert token típus' },
  { TEST_MODE_MIXED: 'Mixelt teszt mód' },
  { PAYMENT_INTEGRATION_KEY_UNKNOWN: 'Ismeretlen integrációs kulcs' },
  { PAYMENT_INTEGRATION_DISABLED: 'Fizetési integráció letiltva' },
  { PAYMENT_CHALLENGE_UNAVAILABLE: 'Fizetési challenge nem érhető el' },
  { PAYMENT_CARD_NUMBER_INVALID: 'Érvénytelen kártyaszám' },
  { PAYMENT_CARD_SCHEME_UNKNOWN: 'Ismeretlen kártyatípus' },
  { PAYMENT_CARD_SCHEME_UNSUPPORTED: 'Nem támogatott kártyatípus' },
  { PAYMENT_CARD_SECURITY_CODE_INVALID: 'Érvénytelen CVC kód' },
  { PAYMENT_CARD_EXPIRED: 'A kártya lejárt' },
  { PAYMENT_CARD_DISABLED: 'Letiltott kártya' },
  { PAYMENT_CARD_LOST: 'Elvesztett kártya' },
  { PAYMENT_AMOUNT_LIMIT: 'Nincs elég pénz a kártyán' },
  { PAYMENT_INSUFFICIENT_FUNDS: 'Nincs elég pénz a kártyán' },
  { PAYMENT_RECEIVER_BLOCKED: 'Fizetés fogadása tiltva van' },
  { PAYMENT_REJECTED_BY_ISSUER: 'Fizetés elutasítva a kibocsáltó által' },
  { PAYMENT_REJECTED: 'Fizetés elutasítva' },
  { TDSECURE_REQUIRED: 'TDSecure kód szükséges' },
  { TDSECURE_FAILED: 'Hibás TDSecure kód' },
  { TDSECURE_PARES_INVALID: 'Érvénytelen PaRes kód' },
];

// Get a specific error explanation by error code
function getErrorMessage(errorCode) {
  for (let i = 0; i < errorCodes.length; i++) {
    if (errorCodes[i][errorCode]) {
      return errorCodes[i][errorCode];
    }
  }
  return 'Egy nem várt hiba történt';
}

_('plAmountDyn').innerText = _('fPrice').innerText + ' Ft';

const plForm = document.querySelector('form#checkout');

const plError = _('plErrorStat');
const plSubmit = plForm.querySelector('input[type=submit]');
const plSubmitUI = _('plBtnUI');

const plEmail = plForm.querySelector('input[name=email]');
const plName = plForm.querySelector('input[name=name]');

// Library for auto-formatting card input
Paylike.assistNumber(plForm.querySelector('input.card-number'));
Paylike.assistExpiry(plForm.querySelector('input.card-expiry'));

let plFinished = false;

const formCont = document.getElementsByClassName('plFormCont')[0];
const checkoutContent = _('checkout').innerHTML;
const bottomContent = _('plBtnUI').innerHTML;

function submitForm() {
  $('#plBtn').click();
}

_('plBtnUI').setAttribute('onclick', 'submitForm()');

// Open popup window
_('paylikeCont').addEventListener('click', function openTransaction(e) {
  if (plFinished) return;
  _('exitBtn').setAttribute('onclick', 'exitCont("plOuter")');
  _('overlay').style.opacity = '1';
  _('plOuter').style.opacity = '1';
  _('plOuter').style.height = 'auto';
  _('plOuter').style.top = '70px';
  _('overlay').style.height = document.body.scrollHeight + 'px';
  _('exitBtn').style.display = 'block';
  document.body.style.overflow = 'hidden';

  // Center box
  updateHorizontalPos('plOuter');
});

window.addEventListener('resize', (e) => {
  if (_('plOuter').style.opacity === '1') {
    updateHorizontalPos('plOuter');
  }
});

// Reset UI and variables for a new try after an error
function startAgain(e) {
  _('unsuccAuth').style.display = 'none';
  _('checkout').innerHTML = checkoutContent;
  _('plBtnUI').innerHTML = bottomContent;
  _('plBtnUI').setAttribute('onclick', 'submitForm()');
  plError.innerHTML = '';
  $iframes = new Set();
}

// Implement newer version of 3-D secure manually for card compatibility
plForm.addEventListener('submit', function (e) {
  e.preventDefault();

  plSubmit.disabled = true;
  plSubmitUI.innerText = 'Folyamatban...';
  plError.innerHTML = '';

  // First get card credentials
  let types = ['pcn', 'pcsc'];
  let cardNumberSerialized = _('card-number').value.replace(/\s/g, '');
  let cardCodeSerialized = _('card-code').value.replace(/\s/g, '');
  let expiryMonth = Number(
    _('card-expiry').value.replace(/\s/g, '').split('/')[0]
  );
  let expiryYear = Number(
    _('card-expiry').value.replace(/\s/g, '').split('/')[1]
  );
  if (expiryYear < 2000) {
    expiryYear += 2000;
  }
  let values = [cardNumberSerialized, cardCodeSerialized];
  let tokenizedCredentials = [];
  let promises = [];

  // Fetch URL for tokenizing card credentials before sending them over the network
  for (let i = 0; i < 2; i++) {
    let data = {
      type: types[i],
      value: values[i],
    };

    let vaultPromise = new Promise((resolve, reject) => {
      fetch('https://vault.paylike.io', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept-Version': '1',
        },
        body: JSON.stringify(data),
      })
        .then((resp) => resp.json())
        .then((token) => resolve(token));
    });
    promises.push(vaultPromise);
  }

  // Wait for all token promises to resolve
  // Then fetch the URL for challenges
  Promise.all(promises).then((tokens) => {
    for (let obj of tokens) {
      tokenizedCredentials.push(obj);
    }

    let paymentData = {
      integration: {
        key: API_KEY,
      },
      amount: {
        currency: 'HUF',
        exponent: 2,
        value: Number(_('fPrice').innerText) * 100
      },

      card: {
        number: tokenizedCredentials[0],
        expiry: {
          month: expiryMonth,
          year: expiryYear
        },
        code: tokenizedCredentials[1],
      },
      hints: [],
      // test: {}
    };

    // Loop over all the challenges and solve them
    // After succeeding, save the transfer id (authorization id)
    loop(paymentData).then((data) => {
      if (data.error) {
        _('checkout').innerHTML = '';
        _('plBtnUI').innerText = 'Újrakezdés';
        _('unsuccAuthTxt').innerHTML = getErrorMessage(data.error);
        _('unsuccAuth').style.display = 'block';
        _('plBtnUI').setAttribute('onclick', 'startAgain()');
        return;
      }

      exitCont('plOuter');
      _('plInfoHolder').innerHTML = `
        <br>
        <span class='blue'>
          A bankkártyádat sikeresen felvettük a rendszerbe!
        </span>
      `;

      transactionID = data;
      return;
    });
  });
});

let $iframes = new Set();

// When a message is dispatched from the iframe to the parent window capture it
window.addEventListener('message', function (e) {
  for (const $iframe of $iframes) {
    if ($iframe.contentWindow !== e.source) continue;
    if (typeof e.data !== 'object' || e.data === null || !e.data.hints) {
      continue;
    }

    _('plBtnUI').innerText = 'Megerősítés';
    $iframe.resolve(e.data);
  }
});

// Recursively solve all challenges
// If an error occurs during the process return that back to the handler
function loop(payment, hints = []) {
  const response = fetch('https://b.paylike.io/payments', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept-Version': '1',
    },
    body: JSON.stringify({ ...payment, hints }),
  })
    .then((resp) => resp.json())
    .then((data) => {
      if (data.code) {
        return { error: data.code };
      }
      return data;
    });

  const newHints = response.then((response) => {
    if (response.error) return { error: response.error };
    else if (!Array.isArray(response.challenges)) return [];
    return performChallenge(payment, hints, response.challenges[0]);
  });

  // New hints are appended to prev hints (new hints last)
  // If we get an auth. id we are done; else make a recursive call with extended hints
  return Promise.all([response, newHints]).then(([response, newHints]) => {
    if (response.authorizationId !== undefined) {
      return response.authorizationId;
    } else {
      if (newHints.error) return { error: newHints.error };
      return loop(payment, [...hints, ...newHints]);
    }
  });
}

// Perform one of 3 challenge types:
// - fetch: fetch a URL
// - iframe / background-iframe: create iframe on client's device, submit a form inside of it
function performChallenge(payment, hints, challenge) {
  switch (challenge.type) {
    case 'fetch': {
      return fetch('https://b.paylike.io' + challenge.path, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept-Version': '1',
        },
        body: JSON.stringify({ ...payment, hints }),
      })
        .then((resp) => resp.json())
        .then((result) => result.hints);
    }

    case 'iframe':
    case 'background-iframe': {
      const hidden = challenge.type === 'background-iframe';
      const init = fetch('https://b.paylike.io' + challenge.path, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept-Version': '1',
        },
        body: JSON.stringify({ ...payment, hints }),
      })
      .then((resp) => resp.json())
      .then((data) => {
        return data;
      });

      const message = init.then(
        (init) =>
          new Promise((resolve) => {
            const { action, fields = {}, timeout } = init;
            const timer = timeout !== undefined && setTimeout(resolve, timeout);
            const name = 'challenge-frame';
            const $iframe = ce('iframe', {
              name,
              scrolling: 'auto',
              style: {
                border: 'none',
                width: '390px',
                height: '400px',
                display: hidden ? 'none' : 'block',
              },
              resolve,
            });

            const $form = ce(
              'form',
              {
                method: 'POST',
                action,
                target: name,
                style: { display: 'none' },
              },
              Object.entries(fields).map(([name, value]) =>
                ce('input', { type: 'hidden', name, value })
              )
            );

            $iframes.add($iframe);
            if (!action.includes('paylike.io')) {
              _('checkout').innerHTML = '';
            } else {
              _('checkout').innerHTML = `
                <img src='/images/icons/loader.gif' class='centerLoad'>
              `;
            }

            _('checkout').appendChild($iframe);
            document.body.appendChild($form);
            $form.submit();
            document.body.removeChild($form);
            const cleaned = message.then(() => {
              clearTimeout(timer);
              $iframes.delete($iframe);
              _('checkout').removeChild($iframe);
            });

            return Promise.all([message, cleaned]).then(([msg]) => msg);
          })
      );
      return Promise.all([init, message]).then(([init, message]) => {
        return [...(init.hints || []), ...((message && message.hints) || [])];
      });
    }
    default: {
      throw new Error(`Unsupported challenge type '${challenge.type}'`);
    }
  }
}

// Create a specific DOM element with optional fields and children
function ce(tag, opts = {}, children = []) {
  const { style = {}, ...attrs } = opts;
  const el = document.createElement(tag);
  Object.assign(el, attrs);
  Object.assign(el.style, style);
  for (const child of children) {
    el.appendChild(child);
  }
  return el;
}
