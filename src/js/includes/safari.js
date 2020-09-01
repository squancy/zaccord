// Resolve bug in Safari: user-select: none causes inputs to be uneditable
if (navigator.userAgent.indexOf('Safari') != -1 && 
  navigator.userAgent.indexOf('Chrome') == -1) {
  let safariStyle = document.createElement('style');
  let css = `
    input {
      -webkit-user-select: text;
    }

    _::-webkit-full-page-media, _:future, :root .galleria-image {
      border-radius: 30px;
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
