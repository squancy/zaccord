function _(el) {
  return document.getElementById(el);
}

let deferredPrompt;
let st = new Date();

window.addEventListener('beforeinstallprompt', (e) => {
  function showAfterTime(e, secs) {
    // Make sure that pwa install suggestion only pops up after 'secs' seconds
    if (Math.round((new Date() - st) / 1000) < secs) return;

    e.preventDefault();
    deferredPrompt = e;

    if (getCookie('cookieAccepted') === 'true' && getCookie('pwaClosed') !== 'false' &&
      !getCookie('pwaClosed') && !getCookie('pwaInstalled')) {
      _('installPrompt').style.display = 'block';
    }
  }
  setInterval(() => showAfterTime(e, 480), 2000);
});

_('exitPwa').addEventListener('click', (e) => {
  _('installPrompt').classList = 'animate__animated animate__fadeOut';
  setCookie('pwaClosed', 'true', 7);
});

_('pwaBtn').addEventListener('click', (e) => {
  deferredPrompt.prompt();
  deferredPrompt.userChoice.then((choiceResult) => {
    if (choiceResult.outcome === 'accepted') {
      _('installPrompt').classList = 'animate__animated animate__fadeOut';
      setCookie('pwaInstalled', 'true', 365);
    }
  });
});
