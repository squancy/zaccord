// Calculate the final price of a product, given its initial price + parameters
function calcPrice(price, rvasVal, surusegVal, scaleVal, fvasVal) {
  // Convert degrees to radians
  rvasVal *= Math.PI / 180
  surusegVal *= Math.PI / 180
  fvasVal *= Math.PI / 180

  // Formula for calculating the price with the given params
  // Parameters values in the formula are degrees (converted to rads)
  let nPrice = (price *
    ((1 / (Math.sin(rvasVal) * 140 + 0.51130880187)) +
    (Math.sin(surusegVal) / 1.3 + 0.73690758206) +
    (Math.pow(scaleVal, 2)) +
    (Math.sin(fvasVal) * 8 + 0.83246064094) - 3));

  return Math.round(nPrice);
}

module.exports = calcPrice;
