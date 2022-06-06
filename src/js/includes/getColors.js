// Get all the available colors for every material from db
const getColors = (conn) => {
  return new Promise((resolve, reject) => {
    let colors = {};
    let hex_codes = {};
    let cQuery = 'SELECT material, color, hex_color FROM colors';
    conn.query(cQuery, [], (err, result, field) => {
      if (err) {
        reject(err);
        return;
      }

      for (let i = 0; i < result.length; i++) {
        if (result[i].material in colors) {
          colors[result[i].material].push(result[i].color);
        } else {
          colors[result[i].material] = [result[i].color];
        }
        

        if (result[i].material in hex_codes) {
          hex_codes[result[i].material][result[i].color] = result[i].hex_color.toLowerCase();
        } else {
          hex_codes[result[i].material] = {[result[i].color]: result[i].hex_color.toLowerCase()};
        }
      }

      for (let color of Object.keys(colors)) {
        colors[color] = colors[color].sort((a, b) => a.localeCompare(b));
      }

      resolve([colors, hex_codes]);
    });
  });
}

module.exports = getColors;
