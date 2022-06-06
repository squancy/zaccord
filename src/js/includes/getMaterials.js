// Get every material and their associated price weight relative to PLA
const getMaterials = (conn) => {
  return new Promise((resolve, reject) => {
    let matQuery = 'SELECT * FROM materials';
    conn.query(matQuery, [], (err, result, field) => {
      if (err) {
        reject(err);
        return;
      }

      let materials = {};
      for (let i = 0; i < result.length; i++) {
        materials[result[i].name] = result[i].mult;
      }
      
      resolve(materials);
    });
  });
}

module.exports = getMaterials;
