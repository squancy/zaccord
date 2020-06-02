function calcPrice(price, rvas, suruseg, scale, fvas) {
  let actualPrice = price;
  if (rvas != 0.12) {
    actualPrice += Math.round(-(price * (rvas / 2)));
  }

  if (suruseg != 10) { 
    actualPrice += Math.round(price * (suruseg / 500));
  }

  if (scale != 1) {
    actualPrice += Math.round((price * scale - price) / 5); 
  }

  if (fvas != 0.4) {
    actualPrice += Math.round(fvas / 20 * price); 
  }
  return actualPrice;
}

module.exports = calcPrice;
