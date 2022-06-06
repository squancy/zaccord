// Returns true if element is in viewport
function isElementInViewport(el) {
  let rect = el.getBoundingClientRect();
  let elemTop = rect.top;
  let elemBottom = rect.bottom;

  let isVisible = elemTop < window.innerHeight && elemBottom >= 100;
  return isVisible;
}

class SectionFade {
  constructor(elName) {
    this.isFaded = false;
    this.elName = elName;
  }

  sectionFadeIn() {
    if (isElementInViewport(_(this.elName))) {
      this.isFaded = true;
      fadeInEl(this.elName);
    }
  }

  get isInViewport() {
    return isElementInViewport(_(this.elName));
  }
}

// Add fade in class to element and set animation duration to 1s
function fadeInEl(id) {
  _(id).style = '--animate-duration: 1s;';
  if (Array.from(_(id).classList).indexOf('animate__animated') < 0) {
    _(id).classList.add('animate__animated');
  }

  if (Array.from(_(id).classList).indexOf('animate__fadeIn') < 0) {
    _(id).classList.add('animate__fadeIn');
  }
}

// If the page is reloaded and the elements are in viewport animate them without scrolling
let sections = [
  new SectionFade('cpFadeHolder'),
  new SectionFade('litFadeHolder'),
  new SectionFade('fdmFadeHolder'),
  new SectionFade('slaFadeHolder'),
  new SectionFade('matFadeHolder'),
  new SectionFade('infoFadeHolder')
];

for (let el of sections) {
  el.sectionFadeIn();
}

// During scrolling check if the elements are in viewport
// If yes, perform a fade in animation
window.addEventListener('scroll', function fadeInSection(e) {
  for (let el of sections) {
    if (el.isInViewport && !el.isFaded) {
      el.sectionFadeIn(); 
    }
  }
});

const scrollHeight = Math.max(
  document.body.scrollHeight, document.documentElement.scrollHeight,
  document.body.offsetHeight, document.documentElement.offsetHeight,
  document.body.clientHeight, document.documentElement.clientHeight
);

// Jump to upload area
let links = document.getElementsByClassName('jumpToPrint');
let bottomLink = document.getElementsByClassName('goToQuote');
let el = _('getQuote');
let pos = (el.offsetTop - el.scrollTop + el.clientTop);
addToLinks(links, 0);
addToLinks(bottomLink, pos);

function addToLinks(links, pos) {
  for (let link of links) {
    link.addEventListener('click', function jumpToPrint(e) {
      $('html, body').animate({
        scrollTop: pos
      }, 500);
    });
  }
}
