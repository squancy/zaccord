// Maximum printable size is 200mm x 200mm x 200mm, minimum is 5mm x 5mm x 5mm
function checkStlSize(actualSize) {
  if (actualSize[0] < 5 || actualSize[1] < 5 || actualSize[2] < 5) {
    return false;
  } else if (actualSize[0] > 200 || actualSize[1] > 200 || actualSize[2] > 200) {
    return false;
  }
  return true;
}

module.exports = checkStlSize;
