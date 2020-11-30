// Resolve bug in Safari: user-select: none causes inputs to be uneditable
function isSafari() {
  return /Safari/.test(navigator.userAgent) && /Apple Computer/.test(navigator.vendor);
}
if (isSafari()) {
  let safariStyle = document.createElement('style');
  let css = `
    input {
      -webkit-user-select: text;
    }

    _::-webkit-full-page-media, _:future, :root .galleria-image {
      border-radius: 30px;
    }

    .galleria-image img {
      border-radius: 0px !important;
    }

    .galleria-stage {
      border-radius: 30px !important;
      z-index: 999999 !important;
    }

    .logo {
      margin-top: 1.5px;
    }

    @media only screen and (max-width: 900px) {
      .categoryImg {
        margin-top: 2px;
      }
    }
  `;
  safariStyle.type = 'text/css';

  document.head.appendChild(safariStyle);
  safariStyle.appendChild(document.createTextNode(css));
}
