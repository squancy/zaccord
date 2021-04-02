// Push customer contact information to db 
const constants = require('./includes/constants.js');
const parseTime = require('./includes/parseTime.js');
const sendOwnerEmails = require('./includes/sendOwnerEmails.js');
const sendPrototype = (conn, formData) => {
  return new Promise((resolve, reject) => {
    let name = formData.name;
    let email = formData.email;
    let tel = formData.tel;
    let message = formData.message;
    
    let iQuery = `INSERT INTO prototype (name, email, mobile, message, date)
      VALUES (?, ?, ?, ?, ?)`;
    let date = new Date().toMysqlFormat();
    conn.query(iQuery, [name, email, tel, message, date], (err, result, field) => {
      if (err) {
        reject('Hiba történt a küldés közben');
        return;
      } 
      resolve('success');
    });

    // Send email to owners
    let subject = 'Új prototípus kapcsolatfelvétel érkezett!';
    let content = 'Már nagyon dől a zsé, ez nagy rendelés lesz!';
    content += `
      ${name}
      <br>
      ${email}
      <br>
      ${tel}
      <br>
      ${message}
      <br>
    `;
    sendOwnerEmails(subject, content);
  });
}

module.exports = sendPrototype;
