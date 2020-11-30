// Maximum printable size is 220mm (width, height, depth)
function checkStlSize(actualSize) {
  if (actualSize[0] > 220 || actualSize[1] > 220 || actualSize[2] > 220) {
    return false;
  } 
  return true;
}

module.exports = checkStlSize;
