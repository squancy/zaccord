const ITEMCOUNT = 15;

// Implement fade in/out animation of a blue strip when hovering over a menu item
const items = ['cart', 'register', 'login', 'bny'];
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
