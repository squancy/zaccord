// Build the index page from fixed products
// NOTE: change user and pass to your needs
const buildAdminPage = (conn, formData) => {
  return new Promise((resolve, reject) => {
    let user = formData.user;
    let pass = formData.pass;

    if (user != 'USER' || pass != 'PASS') {
      reject('hibás user vagy jelszó');
      return;
    } else {
      resolve('success')
    }
  });
}

module.exports = buildAdminPage;
