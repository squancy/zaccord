const parseTime = require('./includes/parseTime.js');
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
  });
}

module.exports = sendPrototype;
