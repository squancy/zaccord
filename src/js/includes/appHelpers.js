/*
  Helper functions for app.js
*/

const helpers = require('./helperFunctions.js');
const HTMLParser = require('node-html-parser');
const StlThumbnailer = require('node-stl-to-thumbnail');
const randomstring = require('randomstring');
const validateEmail = require('email-validator');
const errorFormResponse = helpers.errorFormResponse;
const litDimensions = helpers.litDimensions;
const imgError = helpers.imgError;
const returnPageWithData = helpers.returnPageWithData;
const pageCouldNotLoad = helpers.pageCouldNotLoad;
const conn = require('../connectDb.js');
const resizeImg = require('resize-img');
const sendPrototype = require('../sendPrototype.js');
const userRegister = require('../registerLogic.js');
const path = require('path');
const mv = require('mv');
const fs = require('fs');
const constants = require('./constants.js');
const DEFAULT_CP_IMG = constants.defaultCpImg;
const basePath = constants.basePath;

function buildPage(req, res, conn, userID, buildFunc, htmlPath) {
  buildFunc(conn).then(data => {
    returnPageWithData(htmlPath, data, userID, res);
  }).catch(err => {
    console.log(err);
    pageCouldNotLoad(res, userID);
  });
}

function validateParams(formData) {
  // Validates prototype parameters
  if (!formData.email || !formData.name || !formData.tel || !formData.message) {
    return 'Kérlek tölts ki minden mezőt';
  } else if (!validateEmail.validate(formData.email)) {
    return 'Kérlek valós e-mailt adj meg';
  } else {
    return 'success';
  }
}

function validateRegisterParams(formData) {
  // Validate params for user sign up
  if (!formData.email || !formData.pass || !formData.passConf) {
    return 'Kérlek tölts ki minden mezőt';
  } else if (!validateEmail.validate(formData.email)) {
    return 'Kérlek valós e-mailt adj meg'
  } else if (formData.pass != formData.passConf) {
    return 'A jelszavak nem egyeznek';
  } else if (formData.pass.length < 6) {
    return 'A jelszónak minimum 6 karakterből kell állnia';
  } else {
    return 'success';
  }
}

function toClientPrototype(res, stat, req, formData) {
  let responseData = {};
  if (stat != 'success') {
    errorFormResponse(res, stat);
  } else {
    sendPrototype(conn, formData, req).then(data => {
      // Auto log in user after successful registration
      responseData.success = 'Sikeres kapcsolatfelvétel<br>Hamarosan részletes árajánlattal jelentkezünk számodra';
      res.writeHead(200, {'Content-Type': 'application/json'});
      res.end(JSON.stringify(responseData));
    }).catch(err => {
      errorFormResponse(res, err);
    });
  }
}

function toClientRegister(res, stat, req, formData, userSession) {
  let responseData = {}; 
  if (stat != 'success') {
    errorFormResponse(res, stat);
  } else {
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
}

function validatePcode(pcode) {
  // Validates a Hungarian post code
  if (!Number.isInteger(pcode) || pcode < 1000 || pcode > 9985) {
    return false;
  }
  return true;
}

function validateUploadFile(cFile, err) {
  // Make sure that the number of files to be uploaded is between 1 and 5 (both inclusive)
  if (!Array.isArray(cFile) && !cFile.size) {
    return ['cFile', 'Válassz egy fájlt'];
  } else if (cFile.length > 5) {
    return ['sfupload', 'Maximum 5db fájlt tölthetsz fel'];
  } else if (err) {
    return ['sfupload', 'Hiba történt'];
  }
  return 'success';
}

function isAllImages(cFile) {
  // Check if only images are uploaded
  for (let i = 0; i < cFile.length; i++) {
    let sp = cFile[i].name.split('.');
    if (['png', 'jpg', 'jpeg'].indexOf(sp[sp.length - 1].toLowerCase()) < 0) {
      return false;
    }
  }
  return true;
}

function isMoreImages(cFile, allImgs) {
  if (cFile.length > 1 && allImgs) {
    return true;
  }
  return false;
}

function getFilePaths(extension, prefix, i) {
  // Return the path on the server where the file will be moved and the filename itself
  let timestamp = Number((Date.now() / 1000).toFixed(0)) % 1000;
  if (extension === 'stl') {
    var isLit = false;
    var uploadFileName = prefix + '_' + timestamp + '_' + i; 
    var newpath = path.join(basePath(__dirname), 'printUploads', uploadFileName + '.stl');
  } else {
    var isLit = true;
    var uploadFileName = prefix + '_' + timestamp + '_lit_' + i; 
    var newpath = path.join(basePath(__dirname), 'printUploads', 'lithophanes',
      uploadFileName + '.' + extension);
  }
  return [uploadFileName, newpath, isLit];
}

function createDefaultThumbnail(fname) {
  // Moves a default stock photo as the STL thumbnail to a permanent location
  return new Promise((resolve, reject) => {
    let source = DEFAULT_CP_IMG;
    let destination = path.join(basePath(__dirname), 'printUploads', 'thumbnails', 
      fname + '.png');
    fs.copyFile(source, destination, (err) => {
      if (err) {
        reject('Hiba az alapértelmezett thumbnail készítése közben');
      }
      resolve('success');
    });
  });
}

function createThumbnail(fname) {
  // Creates a thumbnail from an STL file
  return new Promise((resolve, reject) => {
    let thumbnailer = new StlThumbnailer({
      filePath: path.join(basePath(__dirname), 'printUploads', fname + '.stl'), 
      requestThumbnails: [
        {
          width: 500,
          height: 500
        }
      ] 	
    }).then(function(thumbnails) {
      thumbnails[0].toBuffer(function(err, buf) {      
        fs.writeFile(path.join(basePath(__dirname), 'printUploads', 'thumbnails',
          fname + '.png'), buf, function (err) {
          if (err) reject('Hiba a thumbnail készítése közben');
          resolve('success');
        });
      });
    });
  });
}

function resizeLitImage(newpath) {
  return new Promise((resolve, reject) => {
    let [width, height] = litDimensions(newpath);

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
  }); 
}

function parseUploadFiles(form, req, res, userID) {
  // Validate & upload files to server
  return new Promise((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      let cFile = files['file[]'];
      let isError = validateUploadFile(cFile, err);
      if (isError != 'success') {
        imgError(res, userID, isError[0], isError[1]); 
        reject(isError[0]);
        return;
      }
      
      if (!Array.isArray(cFile)) {
        cFile = [cFile];  
      }
      
      let filePaths = [];
      let promises = [];
      let allImgs = isAllImages(cFile);
      let origFnames = {};

      // Make sure that only 1 image is uploaded
      if (isMoreImages(cFile, allImgs)) {
        imgError(res, userID, 'sfupload', 'Egyszerre csak 1 képet tölthetsz fel');
        reject('Egyszerre csak 1 képet tölthetsz fel');
        return;
      }

      let uploadFnames = [];
      for (let i = 0; i < cFile.length; i++) {
        let oldpath = cFile[i].path;
        let splitted = cFile[i].name.split('.');
        let extension = splitted[splitted.length - 1].toLowerCase();
        let uploadFileSize = cFile[i].size;
        
        // Make sure the extension is valid
        if (['png', 'jpg', 'jpeg', 'stl'].indexOf(extension) < 0) {
          reject('Hibás fájlkiterjesztés');
          return;
        } 

        // If user is not logged in file prefix is 1 char random string, otherwise it's the uid
        let prefix = randomstring.generate(1);
        if (userID) prefix = userID;

        // Upload files to server
        var [uploadFileName, newpath, isLit] = getFilePaths(extension, prefix, i);

        uploadFnames.push(uploadFileName);
        origFnames[uploadFileName] = cFile[i].name;
        
        let send = newpath.substr(1);
        let move = new Promise((resolve, reject) => {
          mv(oldpath, newpath, err => {
            if (err) {
              console.log(err);
              reject('Hiba a fájlok átvitelekor');
              return;
            }

            // Create thumbnail from .stl file: used instead of a product image
            /*
              NOTE: since the stl thumbnailer cannot handle files bigger than 10-15MB large stl
              files do not get a thumbnail but a default low res img
            */
            if (extension === 'stl') {
              if (uploadFileSize > 10 * 1024 * 1024) {
                createDefaultThumbnail(uploadFnames[i]).then(res => {
                  resolve('success');
                }).catch(err => {
                  console.log(err);
                  reject('Hiba az alapértelmezett thumbnail készítése közben');
                });
              } else {
                createThumbnail(uploadFnames[i]).then(res => {
                  resolve('success');
                }).catch(err => {
                  reject('Hiba a thumbnail készítése közben');
                });
              }
            } else {
              // Resize image: max width and height is 1920
              // Calc the desired width and height while keeping the same aspect ratio
              resizeLitImage(newpath).then(res => {
                resolve('success');
              }).catch(err => {
                reject('Hiba a litofán kép átméretezése közben');
              });
            }
          });
        });

        filePaths.push(newpath);
        promises.push(move);
        resolve([promises, isLit, filePaths, newpath, origFnames]);
      }
    }); 
  });
}

function isProtectedFile(url) {
  if (url.includes(path.join('js', 'includes', 'constants.js')) ||
      url.includes(path.join('js', 'includes', 'sendEmail.js')) ||
      url.includes(path.join('js', 'includes', 'adminLogic.js')) ||
      url.includes(path.join('js', 'includes', 'createSession.js'))) {
    return true;
  }
  return false;
}

function setDynamicMeta(data, content) {
  let title = data[1];
  let description = data[2];
  let root = HTMLParser.parse(content);

  // Set title
  root.querySelector('title').childNodes[0].rawText = title;
  let descTag = root.querySelectorAll('meta')
    .filter(v => v.rawAttrs.includes('name="description"'));

  // Set description meta tag
  descTag[0].rawAttrs = `name="description" content="${description}"`;
  return root.toString();
}

function urlRedirect(host, res, pattern, redirect) {
  if (host == pattern || (pattern instanceof RegExp && host.match(pattern))) {
    console.log("Redirected " + host);
    res.writeHead(302, {
      'location': redirect
    });
    res.end();
  }
}

module.exports = {
  'validateParams': validateParams,
  'toClientPrototype': toClientPrototype,
  'validateRegisterParams': validateRegisterParams,
  'toClientRegister': toClientRegister,
  'validatePcode': validatePcode,
  'parseUploadFiles': parseUploadFiles,
  'setDynamicMeta': setDynamicMeta,
  'isProtectedFile': isProtectedFile,
  'urlRedirect': urlRedirect,
  'buildPage': buildPage
};
