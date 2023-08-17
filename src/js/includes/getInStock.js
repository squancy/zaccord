// Get all colors and whether they're in stock or not
const getInStock = (conn) => {
  return new Promise((resolve, reject) => {
    let colors = {};
    let cQuery = 'SELECT color, in_stock FROM colors';
    conn.query(cQuery, [], (err, result, field) => {
      if (err) {
        reject(err);
        return;
      }

      for (let i = 0; i < result.length; i++) {
        colors[result[i].color.toLowerCase()] = result[i].in_stock;
      }

      resolve(colors);
    });
  });
}

module.exports = getInStock;
