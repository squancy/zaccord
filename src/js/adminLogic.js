// Build the index page from fixed products
const buildAdminPage = (conn, formData) => {
  return new Promise((resolve, reject) => {
    let user = formData.user;
    let pass = formData.pass;

    // Note: change USER and PASS to your arbitrary username and password
    // These credentials should be the same as given in app.js
    if (user != 'USER' || pass != 'PASS') {
      reject('hibás user vagy jelszó');
      return;
    } else {
      resolve('success');
    }
  });
}

module.exports = buildAdminPage;
