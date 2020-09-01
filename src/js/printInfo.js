// Returns true if element is in viewport
function isElementInViewport(el) {
    let rect = el.getBoundingClientRect();
    let elemTop = rect.top;
    let elemBottom = rect.bottom;

    let isVisible = elemTop < window.innerHeight && elemBottom >= 100;
    return isVisible;
}

// Add fade in class to element and set animation duration to 1s
function fadeInEl(id) {
  _(id).style = '--animate-duration: 1s;';
  _(id).classList = 'animate__animated animate__fadeIn';
}

let isFadedFirst = false;
let isFadedSecond = false;

// If the page is reloaded and the elements are in viewport animate them without scrolling
if (isElementInViewport(_('cpFadeHolder'))) {
  isFadedFirst = true;
  fadeInEl('cpFadeHolder');
}

if (isElementInViewport(_('litFadeHolder'))) {
  isFadedSecond = true;
  fadeInEl('litFadeHolder');
}

// During scrolling check if the elements are in viewport
// If yes, perform a fade in animation
window.addEventListener('scroll', function fadeInSection(e) {
  if (isElementInViewport(_('cpFadeHolder')) && !isFadedFirst) {
    fadeInEl('cpFadeHolder');
    isFadedFirst = true;
  } else if (isElementInViewport(_('litFadeHolder')) && !isFadedSecond) {
    fadeInEl('litFadeHolder')
    isFadedSecond = true;
  }
});
