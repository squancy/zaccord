// Checks if an item with a given ID exists in db
const itemExists = (conn, itemID) => {
  return new Promise((resolve, reject) => {
    let iQuery = 'SELECT id FROM fix_products WHERE id = ? LIMIT 1';
    conn.query(iQuery, [itemID], (err, result, field) => {
      if (err) {
        reject('Nincs ilyen termék');
        return;
      } else if (result.length < 1) {
        reject('Nincs ilyen termék');
        return;
      }

      resolve('success');
    });
  });
}

module.exports = itemExists;
