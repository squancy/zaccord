const util = require('util');
const fs = require('fs').promises;
const path = require('path');
const helpers = require('./includes/helperFunctions.js');
const addCookieAccept = helpers.addCookieAccept;

async function buildBlog(conn, blogID, req) {
  // Promisify conn.query so that it can be used with an async/await function
  const query = util.promisify(conn.query).bind(conn);

  let res = (await query('SELECT * FROM blog WHERE id = ?', [blogID]))[0];
  let title = res.title;
  let author = res.author;
  let categories = res.categories.split(',').map(e => e.trim()).join(', ');
  let htmlPath = res.content_path;
  let summary = res.summary;
  let lastUpdate = res.last_update.split(' ')[0];
  let date = res.date;

  let content = `
    <!DOCTYPE html>
    <html lang="hu">
      <head>
        <title>${title} - Zaccord 3D Nyomtatás Blog</title>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link rel="stylesheet" href="/animate/animate.css">
        <link rel="stylesheet" href="/style/style.css">
        <link rel="stylesheet" href="/style/nprogress.css">
        <meta name="description" content="${summary}">
        <meta name="keywords" content="${title.replace(' ', ',')}, ${summary.replace(' ', ',')}">
        <meta name="author" content="Mark Frankli">
        <script src="/js/includes/mobileCheck.js" async></script>
        <script src="/js/includes/short.js" defer></script>
        <script src="/js/includes/year.js" defer></script>
        <script src="/js/includes/nprogress.js"></script>
        <script src="/js/includes/hload.js"></script>
        <script src="/js/main.js" defer></script>
        <script src="/js/includes/registerSW.js"></script>
        <script src="/js/includes/cookie.js" defer></script>
        <link rel="icon" type="image/x-icon" href="/images/icons/logo.svg">
        <link rel="shortcut icon" href="/images/icons/logo.svg" type="image/x-icon">

        <link rel="manifest" href="/manifest.json">
        <meta name="apple-mobile-web-app-capable" content="yes">
        <meta name="apple-mobile-web-app-status-bar-style" content="white">
        <meta name="apple-mobile-web-app-title" content="Zaccord">
        <link rel="apple-touch-icon" href="/images/icons/icon-152x152.png">
        <meta name="theme-color" content="#ffffff" />
      </head>
      <body>
        <section class="keepBottom lh ofv blogSection">
  `;

  content += `
    <h1 class="gotham fontNorm font34 blogPageTitle" style="margin-top: 0;">${title}</h1>
    <div class="blogHeaderCont notoSans">
      <div><span class="hideSeekBlog">Írta:</span> ${author}</div>
      <div><span class="hideSeekBlog">Kulcsszavak:</span> ${categories}</div> 
      <div>Utoljára frissítve: ${lastUpdate}</div> 
    </div>
    <div class="clear"></div>
    <hr class="hrStyle">
    <div class="lh2" style="font-weight: 300;">
  `;

  content += await fs.readFile(path.join(__dirname, '..', 'blogContent', path.join(htmlPath) + '.html'), 'utf-8');
  content += `
    <hr class="hrStyle">
    <p class="font18 align ttt notoSans">
      3D nyomtatáshoz látogass el a <a class="blueLink font18" href="/print">bérnyomtatás</a> vagy
      a <a class="blueLink font18" href="/prototype">prototípusgyártás</a> oldalra.
    </p>
  `;
  content += '</div>'
  content += addCookieAccept(req);

  content += `
        </section>
      </body>
    </html>
    <script src="/js/includes/lazyLoad.js"></script>
    <script type="text/javascript">
      var ll = new LazyLoad({
        elements_selector: ".lazy",
        callback_loaded: (el) => el.style.backgroundColor = 'white'
      });
    </script>
  `;

  return content;
}

module.exports = buildBlog;
