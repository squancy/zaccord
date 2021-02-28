if (document.querySelector('.galleria')) {
  (function() {
    // Lightbox is currently omitted because it slows down the UI profoundly
    if (!window.mobileCheck()) {
      Galleria.configure({
        lightbox: true
      });
    } else {
      Galleria.configure({
        fullscreenDoubleTap: false
      });
    }

    Galleria.loadTheme('/includes/galleria/dist/themes/twelve/galleria.twelve.min.js');
    Galleria.run('.galleria');
  }()); 
}

