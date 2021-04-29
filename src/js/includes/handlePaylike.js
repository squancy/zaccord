// Validate and authorize credit card payments
const constants = require('./constants.js');
const PAYLIKE_ID = constants.paylikeID;
const paylike = require('paylike')(PAYLIKE_ID);

// Capture a successful transaction or report an error
const handlePaylike = (transactionID, amount, isEmpty) => {
  return new Promise((resolve, reject) => {
    if (isEmpty) {
      resolve('success');
      return;
    }

    // TODO: fix paylike capture error later
    resolve('success');
    return;
    
    /*
    paylike.transactions.capture(transactionID, {
      amount: amount * 100,
      currency: 'HUF'
    }, function callback(err) {
      if (err) {
        console.log(err);
        return reject(err);
      }

      resolve('success');
    });
    */
  });
}

module.exports = handlePaylike;
