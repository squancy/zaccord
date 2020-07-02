function calcLitPrice(size) {
  let firstCoord = size.split('x')[0].replace('mm', '');
  let sizesObj = {
    '100': 3490,
    '150': 4990,
    '200': 7990
  };
  return sizesObj[firstCoord];
}

module.exports = calcLitPrice;
