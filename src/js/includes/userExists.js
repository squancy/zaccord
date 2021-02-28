// Make sure user exists in db
function userExists(conn, userID) {
  return new Promise((resolve, reject) => {
    conn.query('SELECT id FROM users WHERE id = ? LIMIT 1', [userID], (err, result, field) => {
      if (err) {
        reject('unexpected error');
      }

      if (result.length < 1) {
        reject('user does not exist');
      }
      
      resolve('user exists');
    });
  });
}

module.exports = userExists;
