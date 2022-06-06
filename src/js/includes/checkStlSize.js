const constants = require('./constants.js');
const PRINT_SIZES_PLA = constants.printSizesPLA;

function checkStlSize(actualSize) {
  let sortedSizes = actualSize.sort((a, b) => a - b);
  if (sortedSizes[0] > PRINT_SIZES_PLA[0] || sortedSizes[1] > PRINT_SIZES_PLA[1] || sortedSizes[2] > PRINT_SIZES_PLA[2]) {
    return false;
  } 
  return true;
}

module.exports = checkStlSize;
