// Build the index page from fixed products
// NOTE: you may want to change the admin user and password
const buildAdminPage = (conn, formData) => {
  return new Promise((resolve, reject) => {
    let user = formData.user;
    let pass = formData.pass;

    if (user != 'USERNAME' || pass != 'PASSWORD') {
      reject('hibás user vagy jelszó');
      return;
    } else {
      resolve('success')
    }
  });
}

module.exports = buildAdminPage;
