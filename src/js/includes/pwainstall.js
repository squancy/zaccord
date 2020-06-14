function _(el) {
  return document.getElementById(el);
}

let deferredPrompt;

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;

  if (getCookie('cookieAccepted') === 'true' && getCookie('pwaClosed') !== 'false' &&
    !getCookie('pwaClosed')) {
    _('installPrompt').style.display = 'block';
  }
});

_('exitPwa').addEventListener('click', (e) => {
  _('installPrompt').style.display = 'none';
  setCookie('pwaClosed', 'true', 7);
});

_('pwaBtn').addEventListener('click', (e) => {
  deferredPrompt.prompt();
  deferredPrompt.userChoice.then((choiceResult) => {
    if (choiceResult.outcome === 'accepted') {
      _('installPrompt').style.display = 'none';
    }
  });
});
