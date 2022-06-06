const ITEMCOUNT = 15;

// Implement fade in/out animation of a blue strip when hovering over a menu item
const items = ['cart', 'register', 'login', 'bny', 'descTitle', 'specsTitle'];
for (let item of items) {
  if (_(item)) {
    _(item).addEventListener('mouseover', () => {
        animateElement(item + '_anim', 'fadeIn', 'fadeOut', 0.3, true);
      }
    );

    _(item).addEventListener('mouseleave', () => {
        animateElement(item + '_anim', 'fadeIn', 'fadeOut', 0.3, false);
      }
    );
  }
}

// Animate the pop-up price box when hovering over an item
function animateElement(element, start, end, dur, begin) {
  if (window.mobileCheck() && element != 'cookie') return;
  let el = _(element);
  if (element != 'cookie') {
    el.style.display = 'block';
  } else {
    setCookie('cookieAccepted', true, 365);
  }
  if (begin) {
    el.classList.remove('animate__' + end);
    el.classList.add('animate__' + start);
  } else {
    el.classList.remove('animate__' + start);
    el.classList.add('animate__' + end);
  }
  el.style.setProperty('--animate-duration', dur + 's');
}

// Handle category box dropdown menu
function toggleCategory() {
  if (window.mobileCheck()) {
    var def = '110px';  
    var open = '185px';
    var wideTop = '185px';
    var wideTopDef = '110px';
  } else {
    var def = '140px';
    var open = '200px';
    var wideTop = '225px';
    var wideTopDef = '140px';
  }

  if (_('cbCont').style.opacity === '1') {
    _('cbCont').style.opacity = '0';
    _('cbCont').style.height = '0';
    _('cbCont').style.overflow = 'hidden';
    _('categoryImg').style.backgroundColor = '';
    if (_('wideShowcase').style.display === 'none') _('ms').style.marginTop = def
    else _('wideShowcase').style.marginTop = wideTopDef;
  } else {
    _('cbCont').style.opacity = '1';
    _('cbCont').style.height = 'auto';
    _('cbCont').style.overflow = 'auto';
    _('categoryImg').style.backgroundColor = '#ececec';
    if (_('wideShowcase').style.display === 'none') _('ms').style.marginTop = open;
    else _('wideShowcase').style.marginTop = wideTop;
  }
}

function toggleLower(disp) {
  if (_('toggleLower')) _('toggleLower').style.display = disp;
}

// When category btn is clicked display only items with that category
function sortByCat(cat, cid, isEye = false) {
  let data = {
    'cat': cat
  };

  // Hide services
  let conts = document.getElementsByClassName('flexProtCont');
  for (let cont of Array.from(conts)) {
    cont.style.display = 'none';
  }

  // Make that btn highlighted
  let categories = document.getElementsByClassName('scat');
  for (let i = 0; i < categories.length; i++) {
    if (i === cid) {
      categories[i].style.borderColor = '#4285f4';
      categories[i].style.color = '#4285f4';
      categories[i].style.backgroundColor = 'rgb(236, 236, 236)';
    } else {
      categories[i].style.borderColor = '#d0d0d0';
      categories[i].style.backgroundColor = '#fff';
      categories[i].style.color = '#000';
    }
  }

  // Do not display new products & more products when using 'All' category
  if (cat === 'Összes') {
    toggleLower('none');
  } else {
    toggleLower('block');
  }

  toggleShowcase('hide');
  if (!window.mobileCheck()) {
    if (!isEye) { 
      _('ms').style.marginTop = '200px';
    } else {
      _('ms').style.marginTop = '140px';
    }
  } else {
    if (!isEye) {
      _('ms').style.marginTop = '185px';
    } else {
      _('ms').style.marginTop = '110px';
    }
  }

  // Change page url without reloading the page
  window.history.replaceState("category", "Zaccord - " + cat, "/?cat=" + cat);

  fetch('/category', {
    headers: {
      'Content-Type': 'application/json'
    },
    method: 'POST',
    body: JSON.stringify(data)
  }).then(response => {
    return response.text();
  }).then(data => {
    _('dynamicShowcase').innerHTML = data;
    ll.update();
    $('html, body').animate({
      scrollTop: 0
    }, 800);
  }).catch(err => {
    _('dynamicShowcase').innerHTML = '<p>Hoppá... hiba történt a rendezés során</p>';
  });
}

// Implement hortizontal scrolling when arrows are clicked
let scrollAmount = 0;
function scrollHor(dir) {
  let step = _('catBox').scrollWidth / 8;
  if (dir === 'left') {
    if (scrollAmount >= step) scrollAmount -= step;
    else scrollAmount = 0;
    $('#catBox').animate({
      scrollLeft: scrollAmount
    }, 300);
  } else {
    if (_('catBox').scrollWidth - _('catBox').offsetWidth - scrollAmount > step) {
      scrollAmount += step;
    } else {
      scrollAmount = _('catBox').scrollWidth - _('catBox').offsetWidth;
    }
    $('#catBox').animate({
      scrollLeft: scrollAmount
    }, 300);
  }
}

// Change the color of the text in navbar
function changeNavTextColor() {
  let url = window.location.href.split('/');
  let ending = url[url.length - 1];
  if (ending == 'cart') {
    _('cart').style.color = '#4285f4';
  } else if (ending == 'print') {
    _('bny').style.color = '#4285f4';
  } else if (ending == 'register' || ending == 'account') {
    _('register').style.color = '#4285f4';
  } else if (ending == 'prototype') {
    _('login').style.color = '#4285f4';
  }
}

// If user is on mobile change icon src
function changeNavIcons() {
  let icons = document.querySelectorAll('.hideSeek > a > img');
  let newIcons = ['cartBlue.svg', 'printerBlue.svg', 'protBlue.svg', 'loginBlue.svg'];
  let prefix = '/images/icons/';
  let url = window.location.href.split('/');
  let ending = url[url.length - 1];
  if (ending == 'cart') {
    icons[0].src = prefix + newIcons[0];
  } else if (ending == 'print') {
    icons[1].src = prefix + newIcons[1];
  } else if (ending == 'prototype') {
    icons[2].src = prefix + newIcons[2];
  } else if (ending == 'login') {
    icons[3].src = prefix + newIcons[3];
  }
}

if (window.matchMedia("(max-width: 768px)").matches) {
  changeNavIcons();
} else {
  changeNavTextColor();
}

// Change the color of category items randomly in a certain color range
// NOTE: Currently not used, may return to this version later.
function changeToRandColors() {
  // Generate random number in a given range
  function randNum(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  // Invert hex
  function invertColor(hex, bw) {
    if (hex.indexOf('#') === 0) {
      hex = hex.slice(1);
    }

    if (hex.length === 3) {
      hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
    }

    if (hex.length !== 6) {
      throw new Error('Invalid HEX color.');
    }
    var r = parseInt(hex.slice(0, 2), 16),
        g = parseInt(hex.slice(2, 4), 16),
        b = parseInt(hex.slice(4, 6), 16);

    if (bw) {
      return (r * 0.299 + g * 0.587 + b * 0.114) > 186
        ? '#000000'
        : '#FFFFFF';
    }

    r = (255 - r).toString(16);
    g = (255 - g).toString(16);
    b = (255 - b).toString(16);

    return "#" + padZero(r) + padZero(g) + padZero(b);
  }

  let categories = document.getElementsByClassName('scat');
  for (let i = 0; i < categories.length; i++) {
    let colorArr = catColors[randNum(0, catColors.length - 1)];
    let color = colorArr[randNum(0, colorArr.length - 1)];
    categories[i].style.backgroundColor = color;
    categories[i].style.color = invertColor(color.substr(1), true);
    console.log(color, invertColor(color.substr(1), true))
  }
}

// changeToRandColors();

// Toggle more items menu btn
function toggleMoreMenu() {
  let cont = _('mmContainer');
  if (cont.dataset.status == 'closed') {
    $("#mmOverlay").fadeIn(200);
    document.body.style.overflow = 'hidden'; 
    cont.dataset.status = 'opened';
  } else {
    $("#mmOverlay").fadeOut(200);
    document.body.style.overflow = 'auto';
    cont.dataset.status = 'closed';
  }
  $("#mmContainer").animate({ width:'toggle' }, 200);
}

_('mmOverlay').addEventListener('click', (e) => {
  if (_('mmContainer').dataset.status == 'opened') {
    hideOnClickOutside(_('mmContainer'), toggleMoreMenu);
  }
});

_('mmClose').addEventListener('click', function closeMenu(e) {
  _('mmContainer').dataset.status = 'opened';
  toggleMoreMenu();
});

function redirect(url) {
  window.location.href = url;
}

_('moreMenu').addEventListener('click', toggleMoreMenu);

let clinks = document.getElementsByClassName('contactLinks');
for (let clink of clinks) {
  clink.addEventListener('click', (e) => fbq('track', 'Contact'));
}

let vmen = document.getElementsByClassName('mainMenuCont')[0];
vmen.style.maxHeight = window.innerHeight - 120 + 'px';

if (_('goToColor')) {
  _('goToColor').addEventListener('click', (e) => {
    let printMat = _('printMat') ? _('printMat').value : 'PLA';
    window.location.href = '/colors#' + encodeURIComponent(_('color').value) + '_' + encodeURIComponent(printMat); 
  });
}
