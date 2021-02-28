const constants = require('./constants.js');
const sendEmail = require('./sendEmail');
const OWNER_EMAILS = constants.ownerEmails;
const sendOwnerEmails = (subject, content) => {
  return new Promise((resolve, reject) => {
    for (let i = 0; i < OWNER_EMAILS.length; i++) {
      sendEmail('info@zaccord.com', content, OWNER_EMAILS[i], subject);
    }
    resolve('success');
  });
}

module.exports = sendOwnerEmails;
