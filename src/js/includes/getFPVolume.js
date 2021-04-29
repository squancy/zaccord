// Get the volume of a fix product from db
const getFPVolume = (conn, itemID) => {
  return new Promise((resolve, reject) => {
    let sQuery = 'SELECT size FROM fix_products WHERE id = ?';
    conn.query(sQuery, [itemID], (err, result, field) => {
      if (err) {
        reject('Egy nem várt hiba történt, kérlek próbáld újra');
        return;
      }
      
      let sizeArr = result[0].size.split('x').map(x => Number(x));
      let volume = sizeArr.reduce((x, y) => x * y);
      resolve([volume, sizeArr]);
    });
  });
};

module.exports = getFPVolume;
