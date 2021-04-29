// Give a very naive and rough estimate about which package size should be used
const constants = require('./constants.js');
const PACKAGE_WIDTH = constants.packageWidth;
const BOX_SIZES = constants.boxSizes.map(x => x.map(y => y - PACKAGE_WIDTH));

function getPackageDimensions(volumes, sizes) {
  volumes = volumes.map(x => x / 1000); // mm^3 to cm^3
  sizes = sizes.map(x => [x[0] / 10, x[1] / 10, x[2] / 10]); // mm^2 to cm^2
  let totalVolume = volumes.reduce((x, y) => x + y);
  let notFits1 = false;
  let notFits2 = false;
  let notFits3 = false;
  let notFits4 = false;
  for (let d of sizes) {
    for (let i = 0; i < BOX_SIZES.length; i++) {
      let bs = BOX_SIZES[i].sort((a, b) => a - b);
      for (let j = 0; j < d.length; j++) {
        let ds = d.sort((a, b) => a - b);
        let isLarger = ds[0] > bs[0] || ds[1] > bs[1] || ds[2] > bs[2];
        if (i == 0 && isLarger) notFits1 = true;
        if (i == 1 && isLarger) notFits2 = true;
        if (i == 2 && isLarger) notFits3 = true;
        if (i == 3 && isLarger) notFits4 = true;
      }
    }
  }

  if (totalVolume < 1440 && !notFits1) {
    return [18, 16, 5];
  } else if (totalVolume < 1512 && !notFits2) {
    return [18, 7, 12];
  } else if (totalVolume < 4500 && !notFits3) {
    return [15, 20, 15];
  } else if (totalVolume < 7500 && !notFits4) {
    return [15, 20, 25];
  } else {
    return [30, 30, 20];
  }
}

module.exports = getPackageDimensions;
