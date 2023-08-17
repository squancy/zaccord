const fs = require('graceful-fs');
const parseCookies = require('./parseCookies.js');
const sizeOf = require('image-size');
const compress = require('compression')
const CombinedStream = require('combined-stream');
const { Readable } = require('stream');
const minify = require('minify');
const path = require('path');

/*
  Common helper functions used in app.js
*/

// Response with optional caching options
function responseCache(contentType, res, isCache, cacheType = 'no-cache', forceReload = false) {
  if (!isCache) {
    res.writeHead(200, {'Content-Type': contentType});
  } else {
    if (!forceReload) {
      res.writeHead(200, {
        'Content-Type': contentType,
        'Cache-Control': 'max-age=31536000, ' + cacheType,
        'Vary': 'ETag, Content-Encoding'
      });
    } else {
      res.writeHead(200, {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      });
    }
  }
}

// Add cookie accept file if user has not yet accepted it
function addCookieAccept(req) {
  let cookies = parseCookies(req);
  if (cookies.cookieAccepted === 'false' || !cookies.cookieAccepted) {
    return fs.readFileSync(path.join('src', 'includes', 'cookie.html'));
  }
  return '';
}

// Checks if user is logged in; if not, redirects to home page
function loggedIn(req, res) {
  if (!req.user.id) {
    res.writeHead(302, {
      'Location': '/'
    });
    res.end();
  }
}

// Add header depending on user state (logged in/out)
function addHeader(userID) {
  if (!userID) {
    return fs.readFileSync(path.join('src', 'includes', 'header.html'));
  } else {
    return fs.readFileSync(path.join('src', 'includes', 'headerLogged.html'));
  }
}

// Add header and footer to every page
function addTemplate(userID) {
  let content = addHeader(userID);
  content += fs.readFileSync(path.join('src', 'includes', 'footer.html'));
  return content
}

function generateTemplate(fname, text) {
  return `
    <section class="keepBottom flexDiv" style="align-items: center;">
      <div>
        <img src="/images/${fname}.png" class="emptyCart">
        <p class="align" style="font-size: 32px; color: #ccc;">${text}</p>
      </div>
    </section>
  `;
}

// Display error page when uploading a file for custom print
function imgError(res, userID, fname, text = '') {
  let content = fs.readFileSync(path.join('src', 'printUpload.html'));
  content += generateTemplate(fname, text);
  content += addTemplate(userID);
  responseCache('text/html', res, true);
  res.end(content);
}

// Server response for .stl and .png files: set proper content type
function fileResponse(contentType, url, res) {
  responseCache(contentType, res, true);
  let path = url.substr(1);
  try {
    var content = fs.readFileSync(path);
  } catch (e) {
    console.log(e);
    if (typeof userID === 'undefined') var userID;
    imgError(res, userID, '404error');
  }
  res.end(content);
}

// Get the content type of the file being served
function getContentType(extension) {
  switch (extension) {
    case '.js':
      return 'text/javascript';
    case '.css':
      return 'text/css';
    case '.json':
      return 'application/json';
    case '.jpg':
      return 'image/jpg';
    case '.stl':
      return 'application/netfabb';
    case '.png':
      return 'image/png';
    case '.woff2':
      return 'font/woff2';
    case '.woff':
      return 'font/woff';
    case '.ttf':
      return 'font/ttf';
    case '.svg':
      return 'image/svg+xml';
    case '.txt':
      return 'text/plain';
    case '.gcode':
      return 'text/plain';
    case '.zip':
      return 'application/zip';
  }
  return 'text/html';
}

// Protect request from too large data
function checkData(body, req) {
  if (body.length > 1e6) {
    req.connection.destroy();
  }
}

// Respond with an error message to client during form validation
function errorFormResponse(res, msg) {
  let responseData = {
    'error': `<p>${msg}</p>`
  };
  responseCache('application/json', res, false);
  res.end(JSON.stringify(responseData));
}

function pageCouldNotLoad(res, userID) {
  let content = fs.readFileSync(path.join('src', 'index.html'));
  content += generateTemplate('notLoad', 'Nem sikerült az oldal betöltése')
  commonData(content, userID, '', res);
}

function commonData(content, userID, data, res, forceReload = false) {
  content += data;
  content += addTemplate(userID);
  responseCache('text/html', res, true, undefined, true);
  res.end(content, 'utf8');
}

// Parse data from server side and push to client side
function returnToClient(callback, paramArr, errorMsg = null, res, returnData = null) {
  callback(...paramArr).then(data => {
    responseCache('text/html', res, true);
    if (!returnData) {
      res.end(data);
    } else {
      res.end(returnData);
    }
  }).catch(err => {
    console.log(err);
    if (!errorMsg) {
      errorFormResponse(res, err);
    } else {
      errorFormResponse(res, errorMsg);
    }
  });
}

function fileServerResponse(extension, req, res, fileResponse) {
  if (extension === '.stl') {
    fileResponse('application/netfabb', req.url, res);
  } else if (['.png', '.jpg', '.jpeg'].indexOf(extension) > - 1 
    && (req.url.includes('printUploads') || req.url.includes('icon-'))) {
    fileResponse('image/png', req.url, res);
  } else if (extension === '.json' && req.url.includes('manifest')) {
    fileResponse('application/json', req.url, res);
  } else if (extension === '.js' && req.url.includes('sworker')) {
    fileResponse('text/javascript', req.url, res);
  } else if (extension === '.xml') {
    fileResponse('application/xml', req.url, res);
  } else if (extension === '.pdf') {
    fileResponse('application/pdf', req.url, res);
  } else if (extension == '.txt') {
    fileResponse('text/plain', req.url, res);
  }
}

function loadStaticPage(callback, paramArr, content, userID, res, conn, forceReload = false) {
  callback(...paramArr).then(data => {
    commonData(content, userID, data, res, forceReload);
  }).catch(err => {
    console.log(err)
    pageCouldNotLoad(res, userID);
  }); 
}

function returnPageWithData(src, data, userID, res, redirect = false) {
  let content = fs.readFileSync(src);
  content += data;
  content += addTemplate(userID);
  responseCache('text/html', res, true);
  if (redirect) {
    res.writeHead(301, {Location: redirect});
  }
  res.end(content);
}

function litDimensions(path) {
  let dimensions = sizeOf(path);
  let width = dimensions.width;
  let height = dimensions.height;
  return [width, height];
}

// Compress .js, .css and .html files with gzip
function sendCompressedFile(fname, response, request, contentType, append, userID, cacheType) {
  function next() {}
  compress({})(request, response, next);

  let headerPath = path.join(__dirname.replace(path.join('js', 'includes'), ''), 'includes',
    'header.html');
  let footerPath = path.join(__dirname.replace(path.join('js', 'includes'), ''), 'includes',
    'footer.html');
  if (userID) {
    headerPath = path.join(__dirname.replace(path.join('js', 'includes'), ''), 'includes',
      'headerLogged.html');
  }

  response.writeHead(200, {'Content-Type': contentType,
                           'Cache-control': 'max-age=31536000, ' + cacheType});
  if (append) {
    // Append footer and header to html files
    let combinedStream = CombinedStream.create();
    combinedStream.append(fs.createReadStream(fname));
    combinedStream.append(fs.createReadStream(headerPath));
    combinedStream.append(fs.createReadStream(footerPath));

    combinedStream.pipe(response);
  } else {
    // Minify .js and .css files before piping the stream -> turned out to be slower!!!
    // minify(fname, {}).then(data => Readable.from([data]).pipe(response));
    fs.createReadStream(fname).pipe(response);
  }
}

function gatherData(body, req) {
  req.on('data', data => {
    body.push(data);
    checkData(body, req);
  });
}

module.exports = {
  'addCookieAccept': addCookieAccept,
  'loggedIn': loggedIn,
  'addHeader': addHeader,
  'addTemplate': addTemplate,
  'generateTemplate': generateTemplate,
  'imgError': imgError,
  'fileResponse': fileResponse,
  'getContentType': getContentType,
  'checkData': checkData,
  'errorFormResponse': errorFormResponse,
  'pageCouldNotLoad': pageCouldNotLoad,
  'commonData': commonData,
  'returnToClient': returnToClient,
  'fileServerResponse': fileServerResponse,
  'loadStaticPage': loadStaticPage,
  'responseCache': responseCache,
  'returnPageWithData': returnPageWithData,
  'litDimensions': litDimensions,
  'sendCompressedFile': sendCompressedFile,
  'gatherData': gatherData
};
