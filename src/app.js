const http = require('http');
const path = require('path');
const fs = require('fs');
const url = require('url');
const mv = require('mv');
const randomstring = require("randomstring");
const formidable = require('formidable');
const validateEmail = require('email-validator');
const conn = require('./src/js/connectDb.js');
const StlThumbnailer = require('node-stl-to-thumbnail');
const parseCookies = require('./src/js/includes/parseCookies.js');
const createSession = require('./src/js/includes/createSession.js');
const userRegister = require('./src/js/registerLogic.js');
const buyItem = require('./src/js/buyItem.js');
const updateStatus = require('./src/js/updateStatus.js');
const changeDeliveryInfo = require('./src/js/chDelInfo.js');
const changePassword = require('./src/js/chPassword.js');
const userLogin = require('./src/js/loginLogic.js');
const forgotPassword = require('./src/js/forgotPassword.js');
const buildItemSection = require('./src/js/itemLogic.js');
const buildCartSection = require('./src/js/cartLogic.js');
const buildMainSection = require('./src/js/indexLogic.js');
const buildAccountSection = require('./src/js/accountLogic.js');
const buildPrintSection = require('./src/js/printLogic.js');
const buildCustomPrint = require('./src/js/customPrintLogic.js');
const buildBuySection = require('./src/js/buyLogic.js');
const buildAdminPage = require('./src/js/adminLogic.js');
const buildAdminSection = require('./src/js/adminSectionLogic.js');

// Note: change ADMIN constants if you want to use that feature

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

// Store user id in a session
let d = new Date();
d.setTime(d.getTime() + 365 * 24 * 60 * 60 * 1000); // 1 year
let userSession = createSession('user');

const server = http.createServer((req, res) => {
  userSession(req, res, () => {});
  let userID = req.user.id;

  /*
    Implement searching on the main page; every time the user types in something -> fetch to
    server and build new output
  */
  if (req.url === '/search' && req.method === 'POST') {
    let body = '';
    req.on('data', data => {
      body += data;
      checkData(body, req);
    });

    req.on('end', () => {
        let searchData = JSON.parse(body);
        let sValue = searchData.value;
        let empty = false;
        if (searchData.hasOwnProperty('isEmpty') && searchData.isEmpty) empty = true;
        let content = addTemplate(userID);
        buildMainSection(conn, sValue, empty).then(data => {
          content += data;
          res.writeHead(200, {'Content-Type': 'text/html'});
          res.end(data);
      }).catch(err => {
        console.log(err);
        errorFormResponse(res, 'Hoppá... hiba történt a keresés közben');
      });
    });
  } else if (req.url === '/validateRegister' && req.method === 'POST') {
    // Make sure user is not alreday logged in
    if (req.user.id) {
      errorFormResponse(res, 'Már be vagy jelentkezve');
    }

    // Perform server-side validation of user data
    let body = '';
    req.on('data', data => {
      body += data;
      checkData(body, req);
    });

    req.on('end', () => {
      let formData = JSON.parse(body);
      let responseData = {};

      // Now validate form data
      if (!formData.email || !formData.pass || !formData.passConf) {
        errorFormResponse(res, 'Kérlek tölts ki minden mezőt');
      } else if (!validateEmail.validate(formData.email)) {
        errorFormResponse(res, 'Kérlek valós e-mailt adj meg');
      } else if (formData.pass != formData.passConf) {
        errorFormResponse(res, 'A jelszavak nem egyeznek');
      } else if (formData.pass.length < 6) {
        errorFormResponse(res, 'A jelszónak minimum 6 karakterből kell állnia');
      } else {
        /*
          If form is valid push data to db; also encrypt password & get additional infos about
          user
        */
        
        userRegister(conn, formData, req).then(data => {
          // Auto log in user after successful registration
          userSession(req, res, function uSession() {
            req.user.id = data;
            responseData.success = '<p>Sikeres regisztráció</p>';
            res.writeHead(200, {'Content-Type': 'application/json'});
            res.end(JSON.stringify(responseData));
          });
        }).catch(err => {
          errorFormResponse(res, err);
        });
      }
    });
  } else if (req.url === '/validateLogin' && req.method === 'POST') {
    // Make sure user is not alreday logged in
    if (req.user.id) {
      errorFormResponse(res, 'Már be vagy jelentkezve');
    }

    // Implement login system; perform server-side checks & respond to client
    let body = '';
    req.on('data', data => {
      body += data;
      checkData(body, req);
    }); 
   
    req.on('end', () => {
      let formData = JSON.parse(body);
      let responseData = {};

      if (!formData.email || !formData.pass) {
        errorFormResponse(res, 'Kérlek tölts ki minden mezőt');
        return;
      }

      // Now send data to server to process it; generate a session id for user
      userLogin(conn, formData, req).then(data => {
        userSession(req, res, function uSession() {
          req.user.id = data;
          responseData.success = data;
          res.writeHead(200, {'Content-Type': 'application/json'});
          res.end(JSON.stringify(responseData));
        });
      }).catch(err => {
        errorFormResponse(res, err);
      });
    });
  } else if (req.url === '/logout') {
    // User logout system: empty session & redirect to main page
    req.user.id = '';
    res.writeHead(302, {
      'Location': '/'
    });
    res.end();
  } else if (req.url === '/delValidation' && req.method === 'POST') {
    // Make sure user is logged in
    if (!req.user.id) {
      errorFormResponse(res, 'Nem vagy bejelentkezve');
    }

    let body = '';
    req.on('data', data => {
      body += data;
      checkData(body, req);
    });

    req.on('end', () => {
      let formData = JSON.parse(body);
      let responseData = {};

      // Validate postal code; other paramters are too ambiguous
      if (!Number.isInteger(formData.pcode) || formData.pcode < 1000 || formData.pcode > 9985) {
        errorFormResponse(res, 'Kérlek valós irányítószámot adj meg');
        return;
      } else {
        changeDeliveryInfo(conn, userID, formData).then(data => {
          res.writeHead(200, {'Content-Type': 'application/json'});
          res.end('{"success": true}');
        }).catch(err => {
          errorFormResponse(res, err);
        });
      }
    });
  } else if (req.url === '/passValidate' && req.method === 'POST') {
    // Make sure user is logged in
    if (!req.user.id) {
      errorFormResponse(res, 'Nem vagy bejelentkezve');
    }

    let body = '';
    req.on('data', data => {
      body += data;
      checkData(body, req);
    });

    req.on('end', () => {
      let formData = JSON.parse(body);
      let responseData = {};

      // User changes their password; validate on server side
      changePassword(conn, userID, formData).then(data => {
        res.writeHead(200, {'Content-Type': 'application/json'});
        res.end('{"success": true}');
      }).catch(err => {
        errorFormResponse(res, err);
      });
    });
  } else if (req.url === '/category' && req.method === 'POST') {
    // Sort fixed items on the main page by their category in db
    let body = '';
    req.on('data', data => {
      body += data;
      checkData(body, req);
    });

    req.on('end', () => {
      let formData = JSON.parse(body);
      let responseData = {};

      // User changes their password; validate on server side
      buildMainSection(conn, formData.cat, false, true).then(data => {
        res.writeHead(200, {'Content-Type': 'text/html'});
        res.end(data);
      }).catch(err => {
        console.log(err)
        errorFormResponse(res, 'Hoppá... hiba történt a rendezés során');
      });
    });
  } else if (req.url === '/uploadPrint' && req.method.toLowerCase() === 'post') {
    // Allow multiple files to be uploaded, max file size is 20MB
    const form = formidable({multiples: true, maxFileSize: 20 * 1024 * 1024});

    form.parse(req, (err, fields, files) => {
      // If user submits nothing or more than 10 files display error msg
      if (!Array.isArray(files.customPrint) && !files.customPrint.size) {
        imgError(res, userID, 'cFile', 'Válassz egy fájlt');
        return;
      } else if (err || files.customPrint.length > 10) {
        imgError(res, userID, 'sfupload', 'Maximum 10db fájlt tölthetsz fel');
        return;
      }

      if (!Array.isArray(files.customPrint)) {
        files.customPrint = [files.customPrint];  
      }
      
      let filePaths = [];
      let promises = [];

      for (let i = 0; i < files.customPrint.length; i++) {
        let oldpath = files.customPrint[i].path;

        // If user is not logged in file prefix is 12 char random string, otherwise it's the uid
        let prefix = randomstring.generate(12);
        if (userID) prefix = userID;

        // Upload file to server
        let uploadFileName = prefix + '_' + Date.now() + '_' + i; 
        let newpath = __dirname + '/printUploads/' + uploadFileName + '.stl';
        let send = newpath.substr(1);
        let move = new Promise((resolve, reject) => {
          mv(oldpath, newpath, err => {
            if (err) {
              reject('Hiba a fájlok átvitelekor');
            }

            // Create thumbnail from .stl file: used instead of a product image
            let thumbnailer = new StlThumbnailer({
              filePath: newpath,
              requestThumbnails: [
                {
                  width: 500,
                  height: 500
                }
              ] 	
            }).then(function(thumbnails){
              thumbnails[0].toBuffer(function(err, buf){      
                fs.writeFileSync(__dirname + '/printUploads/thumbnails/' + uploadFileName +
                  '.png', buf);
                resolve('success');
              });
            });
          });
        });
        filePaths.push(newpath);
        promises.push(move);
      }


      // Build custom print page
      Promise.all(promises).then(data => {
        buildCustomPrint(conn, userID, filePaths).then(data => {
          let content = fs.readFileSync('src/printUpload.html');
          content += data;
          content += addTemplate(userID);
          res.writeHead(200, {'Content-Type': 'text/html'});
          res.end(content);
        }).catch(err => {
          // Wrong size
          console.log(err);
          imgError(res, userID, 'sizeError', err);
        });
      });
    });
  } else if (req.url === '/validateOrder' && req.method.toLowerCase() === 'post') {
    // Make sure user is logged in
    loggedIn(req, res);

    let body = '';
    req.on('data', data => {
      body += data;
      checkData(body, req);
    });

    // User buys a product -> validate data on server side & push to db
    req.on('end', () => {
      let formData = JSON.parse(body);
      buyItem(conn, formData, req).then(data => {
        res.writeHead(200, {'Content-Type': 'application/json'});
        res.end('{"success": true}');
      }).catch(err => {
        console.log(err);
        errorFormResponse(res, err);
      })
    });
  } else if (req.url === '/adminLogin' && req.method.toLowerCase() === 'post') {
    // Admin page
    let body = '';
    req.on('data', data => {
      body += data;
      checkData(body, req);
    });

    req.on('end', () => {
      let formData = JSON.parse(body);
      buildAdminPage(conn, formData).then(data => {
        res.writeHead(200, {'Content-Type': 'application/json'});
        res.end('{"success": true}');
      }).catch(err => {
        console.log(err);
        errorFormResponse(res, err);
      })
    });
  } else if (req.url === '/updateOrderStatus' && req.method.toLowerCase() === 'post') {
    // On admin page we can update the status of an order: done / in progress
    let body = '';
    req.on('data', data => {
      body += data;
      checkData(body, req);
    });

    // User buys a product -> validate data on server side & push to db
    req.on('end', () => {
      let formData = JSON.parse(body);
      updateStatus(conn, formData).then(data => {
        res.writeHead(200, {'Content-Type': 'application/json'});
        res.end('{"success": true}');
      }).catch(err => {
        console.log(err);
        errorFormResponse(res, err);
      });
    });
  } else if (req.url === '/validateForgotPass' && req.method.toLowerCase() === 'post') {
    // If user submits a temporary password request validate email addr & send tmp password
    let body = '';
    req.on('data', data => {
      body += data;
      checkData(body, req);
    });

    // Send JSON response
    req.on('end', () => {
      let formData = JSON.parse(body);
      forgotPassword(conn, formData.email).then(data => {
        res.writeHead(200, {'Content-Type': 'application/json'});
        res.end('{"success": true}');
      }).catch(err => {
        console.log(err);
        errorFormResponse(res, err);
      });
    });
  } else {
    /*
      Render files that are either stored directly on the server or not fetched via a POST
      request
    */

    let filePath = path.join(__dirname, 'src', req.url === '/' ? 'index.html' : req.url);
    let extension = path.extname(filePath);

    let contentType = getContentType(extension);

    if (contentType == 'text/html' && !extension) {
      filePath += '.html';
      extension = '.html';
    }

    // Set the proper content-type for server response
    if (extension === '.stl') {
      fileResponse('application/netfabb', req.url, res);
    } else if (extension === '.png' && (req.url.includes('printUploads') ||
      req.url.includes('icon-'))) {
      fileResponse('image/png', req.url, res);
    } else if (extension === '.json' && req.url.includes('manifest')) {
      fileResponse('application/json', req.url, res);
    } else if (extension === '.js' && req.url.includes('sworker')) {
      fileResponse('text/javascript', req.url, res);
    }

    // Make sure user is not logged in when visiting /login and /register pages
    if (['/register', '/login'].indexOf(req.url) > -1 && req.user.id) {
      loggedIn(req, res);
    }

    console.log(req.url)

    // Read files that are directly stored on the server under [name].html
    fs.readFile(filePath, (err, content) => {
      if (err) {
        // Page not found -> display custom 404 page
        if (err.code == 'ENOENT') {
          // Build pages dynamically that are not stored on the server 
          if (req.url.substr(0, 14) === '/item/product=') {
            let itemId = Number(req.url.substr(14));
            let content = fs.readFileSync('src/item.html');
            content += addCookieAccept(req);
            buildItemSection(conn, itemId, req).then(data => {
              commonData(content, userID, data, res);
            }).catch(error => {
              console.log(error);
              imgError(res, userID, 'parcel');
            });
          } else if (req.url.substr(0, 13) === '/buy?product=') {
            // User buys a product
            let q = url.parse(req.url, true).query;
  
            let content = fs.readFileSync('src/buy.html');
            console.log('HHHH')
            content += addCookieAccept(req);
            buildBuySection(conn, q, req).then(data => {
              commonData(content, userID, data, res);
            }).catch(err => {
              console.log(err);
              imgError(res, userID, 'shop', err);
            });
          // Admin page login authentication
          } else if (req.url.substr(0, 14) === '/lick_weebshit') {
            let q = url.parse(req.url, true); 
            let qdata = q.query;
            let user = decodeURIComponent(qdata.user);
            let pass = decodeURIComponent(qdata.pass);

            // Make sure username and password are correct
            if (user != 'weebshit' || pass != 'HJ!RCY~KuK(xhX2-') {
              res.writeHead(200, {'Content-Type': 'text/html'});
              res.end('hiba', 'utf8');
            }

            // Build output
            let content = fs.readFileSync('src/adminOrders.html');
            buildAdminSection(conn).then(data => {
              content += data;
              res.writeHead(200, {'Content-Type': 'text/html'});
              res.end(content, 'utf8');
            });
          } else {
            imgError(res, userID, '404error');
          }

        // Server error
        } else {
          res.writeHead(500);
          res.end();
        }
      } else {
        // To every html file append footer, header and cookies (if not accepted)
        if (extension == '.html') {
          if (req.url != '/') {
            content += fs.readFileSync('src/includes/footer.html');
          }

          content += addCookieAccept(req);
          content += addHeader(userID);
        }

        // Build pages from database
        if (req.url === '/') {
          buildMainSection(conn).then(data => {
            content += data;
            content += fs.readFileSync('src/includes/footer.html');
            res.writeHead(200, {'Content-Type': contentType});
            res.end(content, 'utf8');
          }).catch(err => {
            pageCouldNotLoad(res, userID);
          });
        } else if (req.url === '/cart') {
          // Build user cart page
          let content = fs.readFileSync('src/cart.html');
          content += addCookieAccept(req);
          buildCartSection(conn, req).then(data => {
            commonData(content, userID, data, res);
          }).catch(err => {
            pageCouldNotLoad(res, userID);
          });
        } else if (req.url === '/account') {
          // Make sure user is logged in when visiting account page
          loggedIn(req, res);

          let content = fs.readFileSync('src/account.html');
          content += addCookieAccept(req);
          buildAccountSection(conn, userID).then(data => {
            commonData(content, userID, data, res);
          }).catch(err => {
            pageCouldNotLoad(res, userID);
          });
        } else if (req.url === '/print') {
          /*
            User does not need to be logged in for experimenting with custom print only for
            shopping
          */
          let content = fs.readFileSync('src/print.html');
          content += addCookieAccept(req);

          buildPrintSection(conn).then(data => {
            commonData(content, userID, data, res);
          }).catch(err => {
            pageCouldNotLoad(res, userID);
          });
        } else {
          res.writeHead(200, {
            'Content-Type': contentType,
            'Cache-Control': 'max-age=31536000'
          });
          res.end(content, 'utf8');
        }
      }
    });
  }
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => console.log('Server running...'));
