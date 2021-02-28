const constants = require('./includes/constants.js');
const ADMIN_UNAME = constants.adminUname;
const ADMIN_PASSWORD = constants.adminPassword;

// Build the index page from fixed products
// NOTE: you may want to change the admin user and password
const buildAdminPage = (conn, formData) => {
  return new Promise((resolve, reject) => {
    let user = formData.user;
    let pass = formData.pass;

    if (user != ADMIN_UNAME || pass != ADMIN_PASSWORD) {
      reject('hibás user vagy jelszó');
      return;
    } else {
      resolve('success')
    }
  });
}

module.exports = buildAdminPage;
