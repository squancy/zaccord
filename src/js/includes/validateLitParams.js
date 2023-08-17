const sizeOf = require('image-size');
const fs = require('fs');
const path = require('path');
const constants = require('./constants.js');
const getColors = require('./getColors.js');
const LIT_FORMS = constants.litForms;
const MAX_QUANTITY = constants.maxQuantity;
const MIN_QUANTITY = constants.minQuantity;

function validateLitParams(conn, paramObj) {
  return new Promise((resolve, reject) => {
    getColors(conn).then(([colors, hex_codes]) => {
      const PRINT_COLORS = colors['pla'];
      // Validate color
      if (PRINT_COLORS.indexOf(paramObj.color) < 0) {
        resolve(false);

      // Validate sphere
      } else if (LIT_FORMS.indexOf(paramObj.sphere) < 0) {
        resolve(false);
      }

      // Validate size
      let filePath = path.join(__dirname.replace(path.join('src', 'js', 'includes'), ''),
        'printUploads', 'lithophanes/', paramObj.file);
      let sizes = sizeOf(filePath);
      let ratio = Math.min(sizes.width / sizes.height, sizes.height / sizes.width);
      let firstParam = Number(paramObj.size.split('x')[0]);
      let secondParam = Number(paramObj.size.split('x')[1]);
      if (firstParam * ratio - secondParam > 0.01) {
        resolve(false);

      // Validate quantity
      } else if (paramObj.q < MIN_QUANTITY || paramObj.q > MAX_QUANTITY) {
        resolve(false);

      // Make sure file exists
      } else if (!fs.existsSync(filePath)) {
        resolve(false);
      }

      resolve(true);
    });
  }).catch(err => {
    console.log(err);
    reject(err);
  });
}

module.exports = validateLitParams;
