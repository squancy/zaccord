const sizeOf = require('image-size');
const fs = require('fs');
const constants = require('./constants.js');
const PRINT_COLORS = constants.printColors;
const LIT_FORMS = constants.litForms;

function validateLitParams(paramObj) {
  console.log(paramObj);
  // Validate color
  if (PRINT_COLORS.indexOf(paramObj.color) < 0) {
    return false;

  // Validate sphere
  } else if (LIT_FORMS.indexOf(paramObj.sphere) < 0) {
    return false;
  }

  // Validate size
  let filePath = __dirname.replace('/src/js/includes', '') + '/printUploads/lithophanes/' + 
    paramObj.file;
  let sizes = sizeOf(filePath);
  let ratio = Math.min(sizes.width / sizes.height, sizes.height / sizes.width);
  let firstParam = Number(paramObj.size.split('x')[0]);
  let secondParam = Number(paramObj.size.split('x')[1]);
  if (firstParam * ratio - secondParam > 0.01) {
    return false;

  // Validate quantity
  } else if (paramObj.q < 1 || paramObj.q > 10) {
    return false;

  // Make sure file exists
  } else if (!fs.existsSync(filePath)) {
    return false;
  }

  return true;
}

module.exports = validateLitParams;
