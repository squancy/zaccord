// Countries for billing
let countries = ["Albánia", "Andorra", "Argentína", "Ausztrália", "Ausztria", "Azerbajdzsán",
    "Belgium", "Bosznia-Hercegovina", "Brazília", "Bulgária", "Kanada", "Chile", "Kína",
    "Horvátország", "Kuba", "Ciprus", "Cseh köztársaság", "Dánia", "Egyiptom", "Észtország",
    "Faroe-szigetek", "Finnország", "Franciaország", "Grúzia", "Németország", "Gibraltár",
    "Görögország", "Hong Kong", "Magyarország", "Izland", "India", "Indonézia", "Irán", "Irak",
    "Írország", "Izrael", "Olaszország", "Japán", "Kazahsztán", "Dél-Koreai Köztársaság",
    "Kuwait",
    "Lettország", "Liechtenstein", "Litvánia", "Luxemburg", "Makedónia", "Malajzia", "Málta",
    "Mexikó", "Monaco", "Marokkó", "Hollandia", "Új-Zéland", "Norvégia", "Paraguay",
    "Fülöp-szigetek", "Lengyelország", "Portugália", "Katar", "Románia", "Oroszország",
    "San Marino", "Szaud-Arábia", "Szlovákia", "Szlovénia", "Dél-afrikai Köztársaság",
    "Spanyolország", "Svédország", "Svájc", "Thaiföld", "Tunézia", "Törökország",
    "Türkmenisztán",
    "Ukrajna", "Egyesült Arab Emirátusok", "Egyesült Királyság", "Amerikai Egyesült Államok",
    "Uruguay", "Üzbégisztán", "Vatikáni városállam", "Venezuela", "Vietnám", "Szerbia",
    "Koszovó",
    "Montenegró"];

// User submits order, process their request
function submitOrder() {
  let uvet = _('uvet').checked; 
  let transfer = _('transfer').checked;
  let name = _('name').value;
  let pcode = Number(_('pcode').value);
  let city = _('city').value;
  let address = _('address').value;
  let mobile = _('mobile').value;

  _('errStatus').innerHTML = '';
  _('succStatus').innerHTML = '';

  // Make sure payment option is selected & delivery data is filled in
  let authType = null;
  let billingType = 'same';
  if (!uvet && !transfer) {
    statusFill('errStatus', 'Kérlek válassz egy fizetési módot');
    return;
  } else if (!name || !pcode || !city || !address || !mobile) {
    statusFill('errStatus', 'Kérlek töltsd ki a szállítási adatokat');
    return;
  } else if (!Number.isInteger(pcode) || pcode < 1000 || pcode > 9985) {
    statusFill('errStatus', 'Kérlek valós irányítószámot adj meg');
    return;
  } else if (!isLoggedIn && !_('email').value && !_('pass').value && !_('emailReg').value
      && !_('passReg').value && !_('repassReg').value) {
    statusFill('errStatus', 'Regisztrálj vagy jelentkezz be');
    return;
  } else if (!isLoggedIn && (_('email').value || _('pass').value)
      && (_('emailReg').value || _('passReg').value || _('repassReg').value)) {
    statusFill('errStatus', 'Egyszerre próbálsz bejelentkezni és regisztrálni');
    return;
  } else if (!isLoggedIn && (_('email').value || _('pass').value)) {
    // Validate login on client side
    if (!_('email').value || !_('pass').value) {
      statusFill('errStatus', 'Tölts ki minden bejelentkezéshez szükséges adatot');
      return;
    }
    authType = 'login';
  } else if (!isLoggedIn && (_('emailReg').value || _('passReg').value || 
        _('repassReg').value)) {
    // Validate registration on client side
    let email = _('emailReg').value;
    let pass = _('passReg').value;
    let passConf = _('repassReg').value;
    if (!regVal(email, pass, passConf, 'errStatus', 'submitBtn')) return;
    authType = 'register';
  } else if (_('billingName') && (_('billingName').value || _('billingPcode').value ||
        _('billingCity').value || _('billingAddress').value || _('billingCompname') &&
        (_('billingCompname').value || _('billingCompnum').value))) {
    let isComp = false;
    if (_('billingCompname') && (_('billingCompname').value || _('billingCompnum').value 
          || _('buyAsComp').checked)) {
      isComp = true;
    }

    if (!validateComp(isComp)) return;
    else if (!isComp) billingType = 'diffNo';
    else billingType = 'diffYes';
  }

  /*
     Add payment & delivery data + login/registration credentials to the 1st element of the
     array
   */
  data[0].payment = 'transfer';
  data[0].name = name;
  data[0].pcode = pcode;
  data[0].city = city;
  data[0].address = address;
  data[0].mobile = mobile;
  data[0].authType = authType;
  data[0].billingType = billingType;
  data[0].billingName = _('billingName') ? _('billingName').value : '';
  data[0].billingCountry = _('billingCountry') ? _('billingCountry').value : '';
  data[0].billingPcode = _('billingPcode') ? _('billingPcode').value : '';
  data[0].billingCity = _('billingCity') ? _('billingCity').value : '';
  data[0].billingAddress = _('billingAddress') ? _('billingAddress').value : '';
  data[0].billingCompname = _('billingCompname') ? _('billingCompname').value : '';
  data[0].billingCompnum = _('billingCompname') ? _('billingCompnum').value : '';

  if (authType) {
    data[0].email = _('email').value;
    data[0].pass = _('pass').value;
    data[0].emailReg = _('emailReg').value;
    data[0].passReg = _('passReg').value;
    data[0].repassReg = _('repassReg').value;
  }

  if (typeof isLit !== 'undefined') {
    data[0].isLit = true;
  } else {
    data[0].isLit = false;
  }

  if (uvet) data[0].payment = 'uvet';
  console.log(data);

  // Send data to server for further validation
  fetch('/validateOrder', {
    headers: {
      'Content-Type': 'application/json'
    },
    method: 'POST',
    body: JSON.stringify(data)
    }).then(response => response.json()).then(data => {
      if (data.success) {
        // On successful order remove items from the cookies (if order was not a single item)
        window.scrollTo(0, 0);
        if (isFromCart && !isFromCP) setCookie('cartItems', '', 365);
        _('main').classList = 'flexDiv';
        _('main').style.flexDirection = 'column';
        _('main').style.alignItems = 'center';
        _('main').innerHTML = `
          <img src="/images/icons/deliver.png" width="100">

          <p class="gotham font24" style="color: #4285f4;">Sikeres rendelés!</p>
          <p class="align dgray lh">
            A termék(ek) legkésőbb a rendelés napjától számított 5. munkanapon házhoz lesznek
            szállítva.<br>
            Köszönjük, hogy a Zaccordot választottad!
          </p>
          <button class="btnCommon fillBtn" style="margin: 20px auto;"
          onclick="window.location.href='/'">
            Vissza a főoldalra
          </button>
        `;
    } else {
      _('errStatus').innerHTML = '<p>Egy nem várt hiba történt, kérlek próbáld újra</p>';
    }
  }).catch(err => {
    console.log(err);
    _('errStatus').innerHTML = '<p>Egy nem várt hiba történt, kérlek próbáld újra</p>';
  });
}

// Validate parameters if user has a different billing address
function validateComp(isComp) {
  let billingName = _('billingName').value;
  let billingCountry = _('billingCountry').value;
  let billingPcode = Number(_('billingPcode').value);
  let billingCity = _('billingCity').value;
  let billingAddress = _('billingAddress').value;
  if (!billingName || !billingCountry || !billingPcode || !billingCity || !billingAddress) {
    statusFill('errStatus', 'Kérlek tölts ki minden számlázási adatot'); 
    return false;
  } else if (!Number.isInteger(billingPcode) || billingPcode < 1000 || billingPcode > 9985) {
    statusFill('errStatus', 'Kérlek valós irányítószámot adj meg'); 
    return false;
  }

  if (!isComp) {
    return true;
  } else {
    let compName = _('billingCompname').value;
    let compNum = _('billingCompnum').value;
    if (!compName || !compNum) {
      statusFill('errStatus', 'Kérlek tölts ki minden céges számlázási adatot'); 
      return false; 
    }
    return true;
  }
}

let compAdded = false;

// Toggle 'different billing address' form
_('diffBilling').addEventListener('click', function toggleForm(e) { 
    if (this.getAttribute('data-status') != 'close') {
    _('diffBilling').innerText = 'Megegyező számlázási cím';
    _('billingForm').style.display = 'flex';
    if (_('bac')) _('bac').style.display = 'block';
    _('diffBilling').classList = `
    btnCommon fillBtn pad centr animate__animated animate__fadeIn
    `;

    _('billingForm').innerHTML = `
    <input type="text" class="dFormField" id="billingName" placeholder="Név"> 
    `; 

    _('billingHolder').classList = `animate__animated animate__fadeIn`;

    let res = '<select id="billingCountry" class="dFormField" style="margin-top: 0;">';
    for (let i = 0; i < countries.length; i++) {
    let selected = '';
    if (countries[i] === 'Magyarország') selected = 'selected';
    res += `<option value="${countries[i]}" ${selected}>${countries[i]}</option>`;
    }

    res += '</section>';
    res += `
      <input type="text" class="dFormField" id="billingPcode" placeholder="Irányítószám"> 
      <input type="text" class="dFormField" id="billingCity" placeholder="Város"> 
      <input type="text" class="dFormField" id="billingAddress"
      placeholder="Cím (hsz., em., ajtó)"> 
      `;

    if (!compAdded) {
      _('billingHolder').innerHTML += `
        <div class="align" style="margin: 10px 0 20px 0;" id="bac">
          <label class="chCont">Cégként vásárolok
            <input type="checkbox" id="buyAsComp" onchange="companyBilling()">
            <span class="cbMark"></span>
          </label>
        </div>
      `;
      compAdded = true;
    }

    _('billingForm').innerHTML += res;
    _('billingForm').classList = 'animate__animated animate__fadeIn';
    this.setAttribute('data-status', 'close');
  } else {
    _('diffBilling').innerText = 'Eltérő számlázási cím';
    _('billingHolder').classList = `animate__animated animate__fadeOut`;
    _('diffBilling').classList = `
      btnCommon fillBtn pad centr animate__animated animate__fadeIn
    `;
    _('billingForm').classList = 'animate__animated animate__fadeOut';
    _('billingForm').addEventListener('animationend', () => {
      if (_('billingForm').getAttribute('data-status') === 'close'
        && _('diffBilling').innerText[0] === 'E') {
        _('billingForm').style.display = 'none';
        if (_('bac')) {
          _('bac').style.display = 'none';
          _('buyAsComp').checked = false;
          isShow = !isShow;
        }
      }
    });
    this.setAttribute('data-status', 'open');
  }
});

_('diffBilling').addEventListener('animationend', () => {
  _('diffBilling').classList = `btnCommon fillBtn pad centr`;
});

// Remove an element from DOM
function removeElement(id) {
  var elem = document.getElementById(id);
  if (!elem) return;
  return elem.parentNode.removeChild(elem);
}

function createInput(id, ph) {
  let inp = document.createElement('input');
  inp.type = 'text';
  inp.className = 'dFormField';
  inp.id = id;
  inp.placeholder = ph;
  return inp; 
}

// Toggle display company billing info
let isShow = false;
function companyBilling() {
  if (!isShow) {
    let compName = createInput('billingCompname', 'Cégnév');
    let compNum = createInput('billingCompnum', 'Adószám');
    _('billingForm').appendChild(compName); 
    _('billingForm').appendChild(compNum); 
    isShow = true;
  } else {
    removeElement('billingCompname'); 
    removeElement('billingCompnum'); 
    isShow = false;
  }
}
