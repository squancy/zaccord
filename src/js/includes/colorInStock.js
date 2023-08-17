// Get all colors and whether they're in stock or not
const colorInStock = (conn) => {
  return new Promise((resolve, reject) => {
    let colors = {};
    let cQuery = 'SELECT material, color, in_stock FROM colors';
    conn.query(cQuery, [], (err, result, field) => {
      if (err) {
        reject(err);
        return;
      }

      for (let i = 0; i < result.length; i++) {
        if (result[i].material in colors) {
          colors[result[i].material][result[i].color] = result[i].in_stock;
        } else {
          colors[result[i].material] = {[result[i].color]: result[i].in_stock};
        }
      }

      resolve(colors);
    });
  });
}

module.exports = colorInStock;
