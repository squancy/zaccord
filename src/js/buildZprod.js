const util = require('util');

async function buildZprod(conn, id) {
  const query = util.promisify(conn.query).bind(conn); 
  let output = '';

  // First make sure the z-product is live and exists
  try {
    var checkQuery = await query('SELECT * FROM z_prod WHERE url = ? AND is_live = 1', [id]);
    if (checkQuery.length == 0) {
      return {
        status: 'error',
        content: 'No such live z-product in database'
      }
    }
  } catch (e) {
    return {
      status: 'error',
      content: 'SQL query failed'
    }
  }

  return {
    status: 'success',
    content: output,
    price: checkQuery[0].price
  };
}

module.exports = buildZprod;
