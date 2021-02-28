// Format order id into a more readable form (groups numbers by 3)
function formatOrderId(orderID) {
  let orderIDDisplay = '';
  for (let i = 0; i < String(orderID).length; i++) {
    if ((i + 1) % 3 === 0 && i != 8) {
      orderIDDisplay += orderID[i] + " ";
    } else {
      orderIDDisplay += orderID[i];
    }
  }
  return orderIDDisplay;
}

module.exports = formatOrderId;
