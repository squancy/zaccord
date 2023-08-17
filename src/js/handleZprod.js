const util = require('util');
const randomstring = require('randomstring');

async function handleZprod(conn, data) {
  const query = util.promisify(conn.query).bind(conn);

  let type = data.type;

  if (type == 'generate') {
    let price = data.price;
    let expiry = data.expiry;

    // Generate unique URL
    let url = randomstring.generate({
      length: 24,
      charset: 'alphanumeric'
    });
  
    let date = new Date();
    date = new Date(date.getTime() - date.getTimezoneOffset() * 60 * 1000).toMysqlFormat();
    try {
      let res = await query(`INSERT INTO z_prod (price, url, is_live, creation_date, expiry) 
        VALUES (?, ?, ?, ?, ?)`, [price, url, 1, date, expiry]);
      return {
        status: 'success',
        url,
        date
      }
    } catch (err) {
      return {
        status: 'error', 
        message: 'SQL Insertion failed'
      };
    }
  } else if (type == 'delete') {
    let url = data.url;  
    try {
      let res = await query('DELETE FROM z_prod WHERE url = ?', [url]);
      return {
        status: 'success'
      };
    } catch (e) {
      return {
        status: 'error',
        message: 'SQL deletion failed'
      };
    }
  } else if (type == 'check') {
    try {
      let allZprods = await query('SELECT * FROM z_prod');
      let currentDate = new Date();
      for (let el of allZprods) {
        if ((currentDate - new Date(el.creation_date)) / 1000 / 3600 / 24 > el.expiry) {
          try {
            let updateQuery = await query('UPDATE z_prod SET is_live = 0 WHERE url = ?', [el.url]);
          } catch (e) {
            return {
              status: 'error',
              message: 'SQL update query failed'
            }
          }
        }
      }
    } catch (e) {
      return {
        status: 'error',
        message: 'SQL query field'
      };
    }
  }
}

module.exports = handleZprod;
