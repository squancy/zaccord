const http = require('http');
const path = require('path');
const fs = require('fs');
const url = require('url');
const mv = require('mv');
const HTMLParser = require('node-html-parser');
const randomstring = require("randomstring");
const resizeImg = require('resize-img');
const formidable = require('formidable');
const sizeOf = require('image-size');
const validateEmail = require('email-validator');
const conn = require('./src/js/connectDb.js');
const StlThumbnailer = require('node-stl-to-thumbnail');
const parseCookies = require('./src/js/includes/parseCookies.js');
const sendConfEmail = require('./src/js/sendConfEmail.js');
const createSession = require('./src/js/includes/createSession.js');
const userRegister = require('./src/js/registerLogic.js');
const buyItem = require('./src/js/buyItem.js');
const updateStatus = require('./src/js/updateStatus.js');
const changeDeliveryInfo = require('./src/js/chDelInfo.js');
const changePassword = require('./src/js/chPassword.js');
const userLogin = require('./src/js/loginLogic.js');
const genOrder = require('./src/js/includes/genOrder.js');
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
const buildLithophane = require('./src/js/buildLithophane.js');

const helpers = require('./src/js/includes/helperFunctions.js');
const addCookieAccept = helpers.addCookieAccept;
const loggedIn = helpers.loggedIn;
const addHeader = helpers.addHeader;
const addTemplate = helpers.addTemplate;
const generateTemplate = helpers.generateTemplate;
const imgError = helpers.imgError;
const fileResponse = helpers.fileResponse;
const getContentType = helpers.getContentType;
const checkData = helpers.checkData;
const errorFormResponse = helpers.errorFormResponse;
const pageCouldNotLoad = helpers.pageCouldNotLoad;
const commonData = helpers.commonData;

// Note: change ADMIN constants if you want to use that feature

// Store user id in a session
let d = new Date();
d.setTime(d.getTime() + 365 * 24 * 60 * 60 * 1000); // 1 year
let userSession = createSession('user');

const server = http.createServer((req, res) => {
  userSession(req, res, () => {});
  var userID = req.user.id;

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
      let cFile = files['file[]'];
      if (!Array.isArray(cFile) && !cFile.size) {
        imgError(res, userID, 'cFile', 'Válassz egy fájlt');
        return;
      } else if (cFile.length > 5) {
        imgError(res, userID, 'sfupload', 'Maximum 5db fájlt tölthetsz fel');
        return;
      } else if (err) {
        imgError(res, userID, 'sfupload', 'Hiba történt');
        return;
      }

      if (!Array.isArray(cFile)) {
        cFile = [cFile];  
      }
      
      let filePaths = [];
      let promises = [];

      // Check if only images are uploaded
      let allImgs = true;
      for (let i = 0; i < cFile.length; i++) {
        let sp = cFile[i].name.split('.');
        if (['png', 'jpg', 'jpeg'].indexOf(sp[sp.length - 1].toLowerCase()) < 0) {
          allImgs = false;
          break;
        }
      }

      // Make sure no more than 1 img is uploaded
      if (cFile.length > 1 && allImgs) {
        imgError(res, userID, 'sfupload', 'Egyszerre csak 1 képet tölthetsz fel');
        return; 
      }

      let uploadFnames = [];

      for (let i = 0; i < cFile.length; i++) {
        let oldpath = cFile[i].path;
        let splitted = cFile[i].name.split('.');
        let extension = splitted[splitted.length - 1].toLowerCase();

        if (['png', 'jpg', 'jpeg', 'stl'].indexOf(extension) < 0) {
          reject('Hibás fájlkiterjesztés');
          return;
        } 

        // If user is not logged in file prefix is 12 char random string, otherwise it's the uid
        let prefix = randomstring.generate(12);
        if (userID) prefix = userID;

        // Upload files to server
        var isLit = false;
        if (extension === 'stl') {
          var uploadFileName = prefix + '_' + Date.now() + '_' + i; 
          var newpath = __dirname + '/printUploads/' + uploadFileName + '.stl';
        } else {
          isLit = true;
          var uploadFileName = prefix + '_' + Date.now() + '_lit_' + i; 
          var newpath = __dirname + '/printUploads/lithophanes/' + uploadFileName + '.'
            + extension;
        }

        uploadFnames.push(uploadFileName);

        let send = newpath.substr(1);
        let move = new Promise((resolve, reject) => {
          mv(oldpath, newpath, err => {
            if (err) {
              reject('Hiba a fájlok átvitelekor');
              return;
            }

            // Create thumbnail from .stl file: used instead of a product image
            if (extension === 'stl') {
              let thumbnailer = new StlThumbnailer({
                filePath: newpath,
                requestThumbnails: [
                  {
                    width: 500,
                    height: 500
                  }
                ] 	
              }).then(function(thumbnails) {
                thumbnails[0].toBuffer(function(err, buf) {      
                  fs.writeFileSync(__dirname + '/printUploads/thumbnails/' + uploadFnames[i] +
                    '.png', buf);
                  resolve('success');
                });
              });
            } else {
              // Resize image: max width and height is 1920
              // Calc the desired width and height while keeping the same aspect ratio
              let dimensions = sizeOf(newpath);
              let width = dimensions.width;
              let height = dimensions.height;

              if (width <= 1920 && height <= 1920) {
                resolve('success');
              } else {
                // Set width and heigth of image; make sure the dimensions are within the range
                if (width > 1920 && height <= 1920) {
                  var options = {
                    width: 1920
                  }; 
                } else if (width <= 1920 && height > 1920) {
                   var options = {
                    height: 1920
                  };                  
                } else {
                  var options = {
                    width: 1920,
                    height: Math.round(1920 * Math.min(width / height, height / width))
                  };
                }

                // Resize img and write file
                (async () => {
                  const image = await resizeImg(fs.readFileSync(newpath), options);

                  fs.writeFileSync(newpath, image);
                  resolve('success');
                })();
              }
            }
          });
        });

        filePaths.push(newpath);
        promises.push(move);
      }

      // Build custom print page
      if (!isLit) {
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
      } else {
        Promise.all(promises).then(data => {
          buildLithophane(conn, userID, filePaths).then(data => {
            console.log('hello')
            let content = fs.readFileSync('src/lithophane.html');
            content += data;
            content += addTemplate(userID);
            res.writeHead(200, {'Content-Type': 'text/html'});
            res.end(content);
          }).catch(err => {
            // TODO
            console.log(err);
            imgError(res, userID, 'sizeError', err);
          });
        });
      }
    });
  } else if (req.url === '/validateOrder' && req.method.toLowerCase() === 'post') {
    let body = '';
    req.on('data', data => {
      body += data;
      checkData(body, req);
    });

    // User buys a product -> validate data on server side & push to db
    req.on('end', () => {
      let formData = JSON.parse(body);
      buyItem(conn, formData, req, res, userSession).then(data => {
        res.writeHead(200, {'Content-Type': 'application/json'});
        res.end('{"success": true}');
      }).catch(err => {
        console.log(err);
        errorFormResponse(res, err);
      })
    });
  } else if (req.url === '/ADMIN_LOGIN_URL' && req.method.toLowerCase() === 'post') {
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
      });
    });

  // NOTE: change the following URL if you want to use this feature
  // It should match with the URL seen in admin.js
  } else if (req.url === '/CONF_EMAIL_SEND_URL' && req.method.toLowerCase() === 'post') {
    // Send an confirmation email to the customer if the package is ready
    let body = '';
    req.on('data', data => {
      body += data;
      checkData(body, req);
    });

    req.on('end', () => {
      let formData = JSON.parse(body);
      let uid = formData.uid;
      
      sendConfEmail(conn, uid).then(data => {
        res.writeHead(200, {'Content-Type': 'application/json'});
        res.end('{"success": true}');
      }).catch(err => {
        console.log(err);
        errorFormResponse(res, err);
      });
    });
  } else if (req.url === '/STATUS_UPDATE_URL' && req.method.toLowerCase() === 'post') {
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
  } else if (req.url === '/moreOrders' && req.method.toLowerCase() === 'post') {
    // Make sure user is logged in
    if (!req.user.id) {
      errorFormResponse(res, 'Nem vagy bejelentkezve');
    }

    let body = '';
    req.on('data', data => {
      body += data;
      checkData(body, req);
    });

    // Send JSON response with more orders
    req.on('end', () => {
      genOrder(conn, req.user.id).then(data => {
        res.writeHead(200, {'Content-Type': 'text/html'});
        res.end(data);
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
    } else if (['.png', '.jpg', '.jpeg'].indexOf(extension) > - 1 
      && (req.url.includes('printUploads') || req.url.includes('icon-'))) {
      fileResponse('image/png', req.url, res);
    } else if (extension === '.json' && req.url.includes('manifest')) {
      fileResponse('application/json', req.url, res);
    } else if (extension === '.js' && req.url.includes('sworker')) {
      fileResponse('text/javascript', req.url, res);
    } else if (extension === '.xml') {
      fileResponse('application/xml', req.url, res);
    }

    // Make sure user is not logged in when visiting /login and /register pages
    if (['/register', '/login'].indexOf(req.url) > -1 && req.user.id) {
      res.writeHead(302, {
        'Location': '/'
      });
      res.end();
    }

    // Read files that are directly stored on the server under [name].html
    fs.readFile(filePath, (err, content) => {
      if (err) {
        // Page not found -> display custom 404 page
        if (err.code == 'ENOENT') {
          // Build pages dynamically that are not stored on the server 
          if (req.url.substr(0, 14) === '/item/product=') {
            let itemId = Number(req.url.substr(14));
            let content = fs.readFileSync('src/item.html');
            buildItemSection(conn, itemId, req).then(data => {
              // Add custom, dynamic title & description meta tag
              let dataBack = data[0];
              let title = data[1];
              let description = data[2];
              let root = HTMLParser.parse(content);

              // Set title
              root.querySelector('title').childNodes[0].rawText = title;
              let descTag = root.querySelectorAll('meta')
                .filter(v => v.rawAttrs.includes('name="description"'));

              // Set description meta tag
              descTag[0].rawAttrs = `name="description" content="${description}"`;
              content = root.toString();
              content += addCookieAccept(req);
              commonData(content, userID, dataBack, res);
            }).catch(error => {
              console.log(error);
              imgError(res, userID, 'parcel');
            });
          } else if (req.url.substr(0, 13) === '/buy?product=') {
            // User buys a product
            let q = url.parse(req.url, true).query;
  
            let content = fs.readFileSync('src/buy.html');
            content += addCookieAccept(req);
            buildBuySection(conn, q, req).then(data => {
              commonData(content, userID, data, res);
            }).catch(err => {
              console.log(err);
              imgError(res, userID, 'shop', err);
            });
          // Admin page login authentication
          } else if (req.url.substr(0, 14) === '/ADMIN_VALIDATE_URL') {
            let q = url.parse(req.url, true); 
            let qdata = q.query;
            let user = decodeURIComponent(qdata.user);
            let pass = decodeURIComponent(qdata.pass);

            // Make sure username and password are correct
            if (user != 'ADMIN_UNAME' || pass != 'ADMIN_PASS') {
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
            return;
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
            console.log(err)
            pageCouldNotLoad(res, userID);
          });
        } else if (req.url === '/cart') {
          // Build user cart page
          let content = fs.readFileSync('src/cart.html');
          content += addCookieAccept(req);
          buildCartSection(conn, req).then(data => {
            commonData(content, userID, data, res);
          }).catch(err => {
            console.log(err)
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
