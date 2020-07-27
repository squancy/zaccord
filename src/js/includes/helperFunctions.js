const fs = require('fs');
const parseCookies = require('./parseCookies.js');

/*
  Common helper functions used in app.js
*/

// Add cookie accept file if user has not yet accepted it
function addCookieAccept(req) {
  let cookies = parseCookies(req);
  if (cookies.cookieAccepted === 'false' || !cookies.cookieAccepted) {
    return fs.readFileSync('src/includes/cookie.html');
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
    var content = fs.readFileSync('src/includes/header.html');
  } else {
    var content = fs.readFileSync('src/includes/headerLogged.html');
  }
  return content;
}

// Add header and footer to every page
function addTemplate(userID) {
  let content = addHeader(userID);
  content += fs.readFileSync('src/includes/footer.html');
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
  let content = fs.readFileSync('src/printUpload.html');
  content += generateTemplate(fname, text);
  content += addTemplate(userID);
  res.writeHead(200, {'Content-Type': 'text/html'});
  res.end(content);
}

// Server response for .stl and .png files: set proper content type
function fileResponse(contentType, url, res) {
  res.writeHead(200, {'Content-Type': contentType});
  let path = url.substr(1);
  try {
    var content = fs.readFileSync(path);
  } catch (e) {
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
    case '.png':
      return 'image/png';
    case '.jpg':
      return 'image/jpg';
    case '.stl':
      return 'application/netfabb';
    case '.png':
      return 'image/png';
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
  res.writeHead(200, {'Content-Type': 'application/json'});
  res.end(JSON.stringify(responseData));
}

function pageCouldNotLoad(res, userID) {
  let content = fs.readFileSync('src/index.html');
  content += generateTemplate('notLoad', 'Nem sikerült az oldal betöltése')
  commonData(content, userID, '', res);
}

function commonData(content, userID, data, res) {
  content += data;
  content += addTemplate(userID);
  res.writeHead(200, {'Content-Type': 'text/html'});
  res.end(content, 'utf8');
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
  'commonData': commonData
};
