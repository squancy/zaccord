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
    var open = '160px';
    var wideTop = '160px';
    var wideTopDef = '110px';
  } else {
    var def = '140px';
    var open = '190px';
    var wideTop = '200px';
    var wideTopDef = '150px';
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
  _('toggleLower').style.display = disp;
}

// When category btn is clicked display only items with that category
function sortByCat(cat, cid, isEye = false) {
  let data = {
    'cat': cat
  };

  // Make that btn highlighted
  let categories = document.getElementsByClassName('scat');
  for (let i = 0; i < categories.length; i++) {
    if (i === cid) {
      categories[i].style.backgroundColor = '#ececec';
      categories[i].style.color = '#4285f4';
    } else {
      categories[i].style.backgroundColor = 'white';
      categories[i].style.color = '#545454';
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
      _('ms').style.marginTop = '190px';
    } else {
      _('ms').style.marginTop = '140px';
    }
  } else {
    if (!isEye) {
      _('ms').style.marginTop = '160px';
    } else {
      _('ms').style.marginTop = '110px';
    }
  }

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
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }).catch(err => {
    _('dynamicShowcase').innerHTML = '<p>Hoppá... hiba történt a rendezés során</p>';
  });
}

// Implement hortizontal scrolling when arrows are clicked
let scrollAmount = 0;
function scrollHor(dir) {
  let step = _('catBox').scrollWidth / 9;
  if (dir === 'left') {
    if (scrollAmount >= step) scrollAmount -= step;
    else scrollAmount = 0;
    _('catBox').scrollTo({
      top: 0,
      left: scrollAmount,
      behavior: 'smooth'
    });
  } else {
    if (_('catBox').scrollWidth - _('catBox').offsetWidth - scrollAmount > step) {
      scrollAmount += step;
    } else {
      scrollAmount = _('catBox').scrollWidth - _('catBox').offsetWidth;
    }
    _('catBox').scrollTo({
      top: 0,
      left: scrollAmount,
      behavior: 'smooth'
    });
  }
}
