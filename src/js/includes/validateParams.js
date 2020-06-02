// Validate customization parameters
function validateParams(obj) {
  let colorArr = ['fekete', 'fehér', 'kék', 'sárga', 'zöld', 'piros'];
  for (let k of Object.keys(obj)) {
    if (k === 'rvas' && [0.12, 0.16, 0.2, 0.28].indexOf(Number(obj[k])) < 0) {
      return false;
    } else if (k === 'suruseg' && (obj[k] % 10 !== 0 || obj[k] <= 0 || obj[k] > 100)) {
      return false;
    } else if (k === 'color' && colorArr.indexOf(obj[k].toLowerCase()) < 0) {
      return false;
    } else if (k === 'scale' && [0.7, 1.0, 1.3].indexOf(Number(obj[k])) < 0) {
      return false;
    } else if (k === 'fvas' && [0.4, 1.2, 2.0, 2.8, 3.6].indexOf(Number(obj[k])) < 0) {
      return false;
    } else if ((k === 'q' || k === 'quantity') &&
      (obj[k] % 1 !== 0 || obj[k] < 1 || obj[k] > 10)) {
      return false;
    }
  }
  return true;
}

module.exports = validateParams;
