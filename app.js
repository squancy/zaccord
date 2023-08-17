const http = require('http');
const path = require('path');
const fs = require('fs');
const url = require('url');
const mv = require('mv');
const cron = require('node-cron');

const formidable = require('formidable');
const conn = require('./src/js/connectDb.js');
const parseCookies = require('./src/js/includes/parseCookies.js');
const sendConfEmail = require('./src/js/sendConfEmail.js');
const createSession = require('./src/js/includes/createSession.js');
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
const buildCategory = require('./src/js/buildCategory.js');
const buildSearch = require('./src/js/buildSearch.js');
const buildBlog = require('./src/js/buildBlog.js');
const sendOpinion = require('./src/js/sendOpinion.js');
const delCartFile = require('./src/js/delCartFile.js');
const buildReferencePage = require('./src/js/referenceLogic.js');
const buildColorsPage = require('./src/js/buildColors.js');
const buildRefImage = require('./src/js/buildRefImage.js');
const generateInvoice = require('./src/js/includes/generateInvoice.js');
const delFromExcel = require('./src/js/delFromExcel.js');
const downloadSTLs = require('./src/js/includes/downloadSTLs.js');
const packetaXML = require('./src/js/includes/packetaXML.js');
const getXMLPacketa = require('./src/js/includes/getXMLPacketa.js');
const buildBlogsSection = require('./src/js/buildBlogsSection.js').buildBlogsSection;
const handleZprod = require('./src/js/handleZprod.js');
const buildZprod = require('./src/js/buildZprod.js');

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
const returnToClient = helpers.returnToClient;
const fileServerResponse = helpers.fileServerResponse;
const loadStaticPage = helpers.loadStaticPage;
const responseCache = helpers.responseCache;
const returnPageWithData = helpers.returnPageWithData;
const litDimensions = helpers.litDimensions;
const sendCompressedFile = helpers.sendCompressedFile;
const gatherData = helpers.gatherData;

const appConsts = require('./src/js/includes/appHelpers.js');
const validateParams = appConsts.validateParams;
const toClientPrototype = appConsts.toClientPrototype;
const toClientRegister = appConsts.toClientRegister;
const validateRegisterParams = appConsts.validateRegisterParams;
const validatePcode = appConsts.validatePcode;
const parseUploadFiles = appConsts.parseUploadFiles;
const setDynamicMeta = appConsts.setDynamicMeta;
const isProtectedFile = appConsts.isProtectedFile;
const buildPage = appConsts.buildPage;

const constants = require('./src/js/includes/constants.js');
const successReturn = constants.successReturn;
const FILES_TO_CACHE = constants.filesToCache;
const ADMIN_LOGIN_URL = constants.adminLoginUrl;
const CONF_EMAIL_URL = constants.confEmailUrl;
const STATUS_UPDATE_URL = constants.statusUpdateUrl;
const ADMIN_PAGE_ACCESS = constants.adminPageAccess;
const ADMIN_UNAME = constants.adminUname;
const ADMIN_PASSWORD = constants.adminPassword;
const DOWNLOAD_STLS_URL = constants.downloadSTLsURL;

const BPAGES = ['/references', '/colors', '/blogs'];
const PAGE_LOOKUP = {
  '/references': {
    'func': buildReferencePage,
    'path': 'src/reference.html'
  },
  '/colors': {
    'func': buildColorsPage,
    'path': 'src/color.html'
  },
  '/blogs': {
    'func': buildBlogsSection,
    'path': 'src/blog.html'
  }
}

// Maybe integrate the app with a framework like Express but vanilla Node.js
// Seems to be more fun

// Store user id in a session
let d = new Date();
d.setTime(d.getTime() + 365 * 24 * 60 * 60 * 1000); // 1 year
let userSession = createSession('user');

// Run a cron job to check if there are any expired z-products
cron.schedule('* * * * *', () => {
  handleZprod(conn, {type: 'check'});
});

function redirectToWWW(req, res) {
  if (!req.headers.host.startsWith('www') && !req.headers.host.startsWith('localhost')) {
    res.writeHead(302, {
      'Location': 'https://www.' + req.headers.host + req.url
    });
    res.end();  
  }
}

const server = http.createServer((req, res) => {
  // Redirect to a www version of the URL if needed
  redirectToWWW(req, res);

  userSession(req, res, () => {});
  var userID = req.user.id;

  // Facebook & Google appends its own tracking part to the URL -> remove it
  if (req.url.includes('?fbclid=')) {
    req.url = req.url.replace(/\?fbclid=.+/, '');
  } else if (req.url.includes('?gclid=')) {
    req.url = req.url.replace(/\?gclid=.+/, '');
  }

  /*
    Implement searching on the main page; every time the user types in something -> fetch to
    server and build new output
  */
  if (req.url === '/search' && req.method === 'POST') {
    let body = [];
    gatherData(body, req);

    req.on('end', () => {
      let searchData = JSON.parse(body.join(''));
      let sValue = searchData.value;
      let content = addTemplate(userID);
      buildSearch(conn, sValue).then(data => {
        content += data;
        responseCache('text/html', res, true);
        res.end(data);
      }).catch(err => {
        console.log(err);
        errorFormResponse(res, 'Hoppá... hiba történt a keresés közben');
      });
    });
  } else if (req.url === '/delCartFile' && req.method === 'POST') {
    let body = [];
    gatherData(body, req);

    req.on('end', () => {
      let data = JSON.parse(body.join(''));
      let ext = data.ext; 
      let fname = data.fname;
     
      let prefixPath = __dirname;
      delCartFile(conn, fname, ext, prefixPath).then(result => {
        res.writeHead(200, {'Content-Type': 'application/json'});
        res.end(JSON.stringify({'status': 'success'}));
      });
    });
  } else if (req.url === '/delFromExcel' && req.method === 'POST') {
    let body = [];
    gatherData(body, req);

    req.on('end', () => {
      let formData = JSON.parse(body.join(''));
      delFromExcel(conn, formData).then(stat => {
        res.writeHead(200, {'Content-Type': 'application/json'});
        res.end(JSON.stringify({'status': stat}));
      });
    });
  } else if (req.url === '/validatePrototype' && req.method === 'POST') {
    // Perform server-side validation of user data
    let body = [];
    gatherData(body, req);

    req.on('end', () => {
      let formData = JSON.parse(body.join(''));
      let val = validateParams(formData);
      toClientPrototype(res, val, req, formData);
    });    
  } else if (req.url === '/validateRegister' && req.method === 'POST') {
    // Make sure user is not alreday logged in
    if (req.user.id) {
      errorFormResponse(res, 'Már be vagy jelentkezve');
    }

    // Perform server-side validation of user data
    let body = [];
    gatherData(body, req);

    req.on('end', () => {
      let formData = JSON.parse(body.join(''));
      let responseData = {};
      let val = validateRegisterParams(formData);
      toClientRegister(res, val, req, formData, userSession);
    });
  } else if (req.url === '/handleZprod' && req.method === 'POST') {
    let body = [];
    gatherData(body, req);

    req.on('end', () => {
      handleZprod(conn, JSON.parse(body.join(''))).then(resp => {
        res.writeHead(200, {'Content-Type': 'application/json'});
        res.end(JSON.stringify(resp));
      });
    });    

  } else if (req.url === '/validateLogin' && req.method === 'POST') {
    // Make sure user is not alreday logged in
    if (req.user.id) {
      errorFormResponse(res, 'Már be vagy jelentkezve');
    }

    // Implement login system; perform server-side checks & respond to client
    let body = [];
    gatherData(body, req);
   
    req.on('end', () => {
      let formData = JSON.parse(body.join(''));
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
  } else if (req.url === '/sendOpinion' && req.method === 'POST') {
    let body = [];
    gatherData(body, req);

    req.on('end', () => {
      let formData = JSON.parse(body.join(''));
      let responseData = {};

      let opinion = formData.opinion;
      returnToClient(sendOpinion, [conn, opinion], null, res, successReturn);
    });
  } else if (req.url === '/createPacket' && req.method === 'POST') {
    let body = [];
    gatherData(body, req);

    req.on('end', () => {
      let formData = JSON.parse(body.join(''));
      let responseData = {};
      let xmlBody = getXMLPacketa(formData, 'createPacket');

      returnToClient(packetaXML, [formData, xmlBody], null, res, successReturn);
    });
  } else if (req.url === '/delValidation' && req.method === 'POST') {
    // Make sure user is logged in
    if (!req.user.id) {
      errorFormResponse(res, 'Nem vagy bejelentkezve');
    }

    let body = [];
    gatherData(body, req);

    req.on('end', () => {
      let formData = JSON.parse(body.join(''));
      let responseData = {};

      // Validate postal code; other paramters are too ambiguous
      if (validatePcode(formData.pcode)) {
        returnToClient(changeDeliveryInfo, [conn, userID, formData], null, res, successReturn);
      } else {
        errorFormResponse(res, 'Kérlek valós irányítószámot adj meg');
      }
    });
  } else if (req.url === '/passValidate' && req.method === 'POST') {
    // Make sure user is logged in
    if (!req.user.id) {
      errorFormResponse(res, 'Nem vagy bejelentkezve');
    }

    let body = [];
    gatherData(body, req);

    req.on('end', () => {
      let formData = JSON.parse(body.join(''));
      let responseData = {};

      // User changes their password; validate on server side
      returnToClient(changePassword, [conn, userID, formData], null, res, successReturn);
    });
  } else if (req.url === '/category' && req.method === 'POST') {
    // Sort fixed items on the main page by their category in db
    let body = [];
    gatherData(body, req);

    req.on('end', () => {
      let formData = JSON.parse(body.join(''));
      let responseData = {};

      let errorMsg = 'Hoppá... hiba történt a rendezés során';
      returnToClient(buildCategory, [conn, formData.cat], errorMsg, res);
    });
  } else if (req.url === '/uploadPrint' && req.method.toLowerCase() === 'post') {
    // Allow multiple files to be uploaded, max file size is 100MB
    const form = formidable({multiples: true, maxFileSize: 100 * 1024 * 1024});
    parseUploadFiles(form, req, res, userID).then(data => {
      let promises = data[0];
      let isLit = data[1];
      let filePaths = data[2];
      let newpath = data[3];

      // Build custom print page
      if (!isLit) {
        Promise.all(promises).then(data => {
          buildCustomPrint(conn, userID, filePaths).then(data => {
            let files = '';
            for (let i = 0; i < filePaths.length; i++) {
              let sp = filePaths[i].split('/');
              let id = sp[sp.length - 1].replace('.stl', '');
              files += i == filePaths.length - 1 ? id : id + ',';
            }
            returnPageWithData('src/printUpload.html', data, userID, res, '/uploadPrint?file=' + files);
          }).catch(err => {
            // Wrong size
            console.log(err);
            imgError(res, userID, 'sizeError', err);
          });
        });
      } else {
        Promise.all(promises).then(data => {
          let [width, height] = litDimensions(newpath);
          
          let sp = filePaths[0].split('/');
          let id = sp[sp.length - 1].replace('.png', '').replace('.jpg', '').replace('.jpeg', '');
          buildLithophane(conn, userID, filePaths, width, height).then(data => {
            returnPageWithData('src/lithophane.html', data, userID, res, '/uploadPrint?image=' + id);
          }).catch(err => {
            console.log(err);
            imgError(res, userID, 'sizeError', err);
          });
        });
      }
    }).catch(err => {
      // Error occurred during the upload
      console.log(err);
    });
  } else if (req.url === '/validateOrder' && req.method.toLowerCase() === 'post') {
    let body = [];
    gatherData(body, req);

    // User buys a product -> validate data on server side & push to db
    req.on('end', () => {
      let formData = JSON.parse(body.join(''));
      let paramArr = [conn, formData, req, res, userSession];
      returnToClient(buyItem, paramArr, null, res, successReturn);
    });
  } else if (req.url === ADMIN_LOGIN_URL && req.method.toLowerCase() === 'post') {
    // Admin page
    let body = [];
    gatherData(body, req);

    req.on('end', () => {
      let formData = JSON.parse(body.join(''));
      returnToClient(buildAdminPage, [conn, formData], null, res, successReturn);
    });

  // NOTE: change the following URL if you want to use this feature
  // It should match with the URL seen in admin.js
  } else if (req.url === CONF_EMAIL_URL && req.method.toLowerCase() === 'post') {
    // Send an confirmation email to the customer if the package is ready
    let body = [];
    gatherData(body, req);

    req.on('end', () => {
      let formData = JSON.parse(body.join(''));
      let uid = formData.uid;
      let delType = formData.delType;
      let glsCode = formData.glsCode;
      
      returnToClient(sendConfEmail, [conn, uid, delType, glsCode], null, res, successReturn);
    });
  } else if (req.url === DOWNLOAD_STLS_URL && req.method.toLowerCase() === 'post') {
    req.on('data', data => {
    });

    req.on('end', () => {
      returnToClient(downloadSTLs, [conn], null, res, successReturn);
    });
  } else if (req.url === STATUS_UPDATE_URL && req.method.toLowerCase() === 'post') {
    // On admin page we can update the status of an order: done / in progress
    let body = [];
    gatherData(body, req);

    // User buys a product -> validate data on server side & push to db
    req.on('end', () => {
      let formData = JSON.parse(body.join(''));
      returnToClient(updateStatus, [conn, formData], null, res, successReturn);
    });
  } else if (req.url === '/validateForgotPass' && req.method.toLowerCase() === 'post' &&
    !req.user.id) {
    // If user submits a temporary password request validate email addr & send tmp password
    let body = [];
    gatherData(body, req);

    // Send JSON response
    req.on('end', () => {
      let formData = JSON.parse(body.join(''));
      returnToClient(forgotPassword, [conn, formData.email], null, res, successReturn);
    });
  } else if (req.url === '/genInvoice' && req.method.toLowerCase() === 'post') {
    let body = [];
    gatherData(body, req);

    req.on('end', () => {
      let formData = JSON.parse(body.join(''));
      returnToClient(generateInvoice, [conn, formData], null, res, successReturn);
    });
  } else if (req.url === '/moreOrders' && req.method.toLowerCase() === 'post') {
    // Make sure user is logged in
    if (!req.user.id) {
      errorFormResponse(res, 'Nem vagy bejelentkezve');
    }

    let body = [];
    gatherData(body, req);

    // Send JSON response with more orders
    req.on('end', () => {
      returnToClient(genOrder, [conn, req.user.id], null, res);
    });
  } else {
    /*
      Render files that are either stored directly on the server or not fetched via a POST
      request
    */
   
    let ending = path.join(req.url === '/' ? 'index.html' : req.url.replace('src', ''));
    let filePath = path.join(__dirname, 'src', ending);
    let extension = path.extname(filePath);

    let contentType = getContentType(extension);
    if (extension == '.gcode' || extension == '.zip') {
      filePath = path.join(__dirname, req.url.replace('src', ''));
    }

    if (contentType == 'text/html' && !extension) {
      filePath += '.html';
      extension = '.html';
    }

    // Set the proper content-type for server response
    fileServerResponse(extension, req, res, fileResponse); 

    // Make sure user is not logged in when visiting /login and /register pages
    if ((['/register', '/login'].indexOf(req.url) > -1 && req.user.id)
      || req.url.substr(0, 8) === '/?fbclid' || isProtectedFile(req.url) ||
      (req.url == '/forgotPassword' && req.user.id)) {
      res.writeHead(302, {
        'Location': '/'
      });
      res.end();
      return;
    }

    // Read files that are directly stored on the server under [name].html
    fs.readFile(filePath, (err, content) => {
      if (err) {
        // Page not found -> display custom 404 page
        if (err.code == 'ENOENT') {
          // Build pages dynamically that are not stored on the server 
          if (req.url.substr(0, 14) === '/item/product=') {
            let itemId = Number(req.url.substr(14));
            let content = fs.readFileSync(path.join('src', 'item.html'));
            buildItemSection(conn, itemId, req).then(data => {
              // Add custom, dynamic title & description meta tag
              let dataBack = data[0];
              content = setDynamicMeta(data, content);
              content += addCookieAccept(req);
              commonData(content, userID, dataBack, res);
            }).catch(error => {
              console.log(error);
              imgError(res, userID, 'parcel');
            });
          } else if (req.url.substr(0, 9) === '/blog?id=') {
            let blogID = Number(req.url.substr(9));
            let content = '';
            buildBlog(conn, blogID, req).then(data => {
              commonData(content, userID, data, res);
            }).catch(err => {
              console.log(err);
              pageCouldNotLoad(res, userID);
            });
          } else if (req.url.substr(0, 13) === '/refImage?id=') {
            let content = fs.readFileSync(path.join('src', 'refImage.html'));
            let id = Number(req.url.substr(13));
            content += addCookieAccept(req);
            buildRefImage(conn, id).then(data => {
              commonData(content, userID, data, res);
            }).catch(err => {
              console.log(err);
              pageCouldNotLoad(res, userID);
            });
          } else if (req.url.substr(0, 14) === '/z-product?id=') {
            let content = fs.readFileSync(path.join('src', 'buy.html'));
            let id = req.url.substr(14);
            content += addCookieAccept(req);
            buildZprod(conn, id).then(data => {
              if (data.status == 'success') {
                let q = {
                  product: 'zprod',
                  price: data.price
                }

                req.user.id = '';
                userID = null;

                buildBuySection(conn, q, req).then(data => {
                  commonData(content, userID, data, res);
                }).catch(err => {
                  console.log(err);
                  imgError(res, userID, 'shop', err);
                });
              } else {
                pageCouldNotLoad(res, userID);
              }
            }).catch(err => {
              console.log(err);
              pageCouldNotLoad(res, userID);
            });
          } else if (req.url.substr(0, 13) === '/buy?product=') {
            // User buys a product
            let q = url.parse(req.url, true).query;
  
            let content = fs.readFileSync(path.join('src', 'buy.html'));
            content += addCookieAccept(req);
            buildBuySection(conn, q, req).then(data => {
              commonData(content, userID, data, res);
            }).catch(err => {
              console.log(err);
              imgError(res, userID, 'shop', err);
            });
          } else if (req.url.substr(0, 6) === '/?cat=') {
            let cat = decodeURIComponent(req.url.substr(6));
            let content = fs.readFileSync(path.join('src', 'index.html'));
            content += addCookieAccept(req);
            content += addHeader(userID);
            buildMainSection(conn, cat).then(data => {
              content += data;
              content += fs.readFileSync(path.join('src', 'includes', 'footer.html'));
              res.writeHead(200, {'Content-Type': contentType});
              res.end(content, 'utf8');
            }).catch(err => {
              console.log(err);
              pageCouldNotLoad(res, userID);
            });
          } else if (req.url.substr(0, 18) === '/uploadPrint?file=') {
            let fnames = [];
            for (let file of req.url.split('uploadPrint?file=')[1].split(',')) {
              fnames.push(path.join(__dirname, 'printUploads', file + '.stl'));
            }
            buildCustomPrint(conn, userID, [...fnames]).then(data => {
              returnPageWithData(path.join('src', 'printUpload.html'), data, userID, res);
            }).catch(err => {
              console.log(err);
              pageCouldNotLoad(res, userID);
            });
          } else if (req.url.substr(0, 19) === '/uploadPrint?image=') {
            // Check if file exists with a .jpg, .jpeg or .png extension
            // Use sync queries for managable code and it does not block that much
            let fname = path.join(__dirname, 'printUploads', 'lithophanes', req.url.substr(19));
            if (fs.existsSync(fname + '.jpg')) {
              fname += '.jpg';
            } else if (fs.existsSync(fname + '.jpeg')) {
              fname += '.jpeg';
            } else {
              fname += '.png';
            }

            let [width, height] = litDimensions(fname);

            buildLithophane(conn, userID, [fname], width, height).then(data => {
              returnPageWithData(path.join('src', 'lithophane.html'), data, userID, res);
            }).catch(err => {
              console.log(err);
              pageCouldNotLoad(res, userID);
            });
          } else if (BPAGES.indexOf(req.url.toLowerCase()) > -1) {
            let url = req.url.toLowerCase();
            buildPage(req, res, conn, userID, PAGE_LOOKUP[url]['func'], PAGE_LOOKUP[url]['path'])
          } else if (req.url.substr(0, 14) === ADMIN_PAGE_ACCESS) {
            // Admin page login authentication
            let q = url.parse(req.url, true); 
            let qdata = q.query;
            let user = decodeURIComponent(qdata.user);
            let pass = decodeURIComponent(qdata.pass);

            // Make sure username and password are correct
            if (user != ADMIN_UNAME || pass != ADMIN_PASSWORD) {
              responseCache('text/html', res, true);
              res.end('hiba', 'utf8');
            }

            // Build output
            let content = fs.readFileSync('src/adminOrders.html');
            buildAdminSection(conn).then(data => {
              content += data;
              responseCache('text/html', res, true);
              res.end(content, 'utf8');
            });
          } else {
            // File is not found in src/path/to/file so it may be under path/to/file
            let fname = filePath.replace('src/', '');
            fs.readFile(fname, (err, content) => {
              if (err) {
                imgError(res, userID, '404error');
              } else {
                let extension = path.extname(fname);
                let contentType = getContentType(extension);
                res.end(content, contentType);
              }
            });
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
            content += fs.readFileSync(path.join('src', 'includes', 'footer.html'));
          }

          content += addCookieAccept(req);
          content += addHeader(userID);
        }

        // Build pages from database
        if (req.url === '/') {
          buildMainSection(conn).then(data => {
            content += data;
            content += fs.readFileSync(path.join('src', 'includes', 'footer.html'));
            res.writeHead(200, {'Content-Type': contentType});
            res.end(content, 'utf8');
          }).catch(err => {
            console.log(err);
            pageCouldNotLoad(res, userID);
          });
        } else if (req.url === '/cart') {
          // Build user cart page
          let content = fs.readFileSync(path.join('src', 'cart.html'));
          content += addCookieAccept(req);
          loadStaticPage(buildCartSection, [conn, req], content, userID, res, null, true);
        } else if (req.url === '/account') {
          // Make sure user is logged in when visiting account page
          loggedIn(req, res);

          let content = fs.readFileSync(path.join('src', 'account.html'));
          content += addCookieAccept(req);
          loadStaticPage(buildAccountSection, [conn, userID], content, userID, res);
        } else if (req.url === '/print') {
          /*
            User does not need to be logged in for experimenting with custom print only for
            shopping
          */
          let content = fs.readFileSync(path.join('src', 'print.html'));
          content += addCookieAccept(req);
          loadStaticPage(buildPrintSection, [conn, req], content, userID, res);
        } else {
          // Cache page for faster load
          // Also compress text-based resources
          let cacheType;
          if (FILES_TO_CACHE.indexOf(filePath) > -1) {
            // Cache constant files and resources
            responseCache(contentType, res, true, 'public');
            res.end(content, 'utf8');
          } else if (['text/javascript', 'text/css', 'text/html'].indexOf(contentType) > -1) {
            let appendAsset = contentType == 'text/html';
            let cc = 'no-cache';
            if (FILES_TO_CACHE.indexOf(filePath) > -1) cc = 'public';
            sendCompressedFile(filePath, res, req, contentType, appendAsset, userID, cc);
          } else { 
            // Check resource in cache and if it's unchanged load if from there
            responseCache(contentType, res, true, 'no-cache');
            res.end(content, 'utf8');
          }
        }
      }
    });
  }
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => console.log('Server running...'));
