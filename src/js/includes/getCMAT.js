// Get all colors & their associated image URLs grouped by materials
const getCMAT = (conn) => {
  return new Promise((resolve, reject) => {
    let colors = {};
    let cQuery = 'SELECT material, color, images FROM colors';
    conn.query(cQuery, [], (err, result, field) => {
      if (err) {
        reject(err);
        return;
      }

      for (let i = 0; i < result.length; i++) {
        if (result[i].material in colors) {
          colors[result[i].material].push({[result[i].color]: result[i].images});
        } else {
          colors[result[i].material] = [{[result[i].color]: result[i].images}];
        }
      }

      for (let color of Object.keys(colors)) {
        colors[color] = colors[color].sort((a, b) => Object.keys(a)[0].localeCompare(Object.keys(b)[0]));
      }

      resolve(colors);
    });
  });
}

module.exports = getCMAT;
