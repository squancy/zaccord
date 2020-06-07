// Build the index page from fixed products
const buildAdminPage = (conn, formData) => {
  return new Promise((resolve, reject) => {
    let user = formData.user;
    let pass = formData.pass;

    if (user != 'ADMIN_USER' || pass != 'ADMIN_PASS') {
      reject('hibás user vagy jelszó');
      return;
    } else {
      resolve('success')
    }
  });
}

module.exports = buildAdminPage;
