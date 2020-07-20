function _(el) {
  return document.getElementById(el);
}

let deferredPrompt;

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;

  if (getCookie('cookieAccepted') === 'true' && getCookie('pwaClosed') !== 'false' &&
    !getCookie('pwaClosed') && !getCookie('pwaInstalled')) {
    _('installPrompt').style.display = 'block';
  }
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
