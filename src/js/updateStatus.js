const buildMainSection = (conn, formData) => {
  return new Promise((resolve, reject) => {
    let oid = formData.oid;
    let val = formData.val;
    let uQuery = 'UPDATE orders SET status = ? WHERE id = ? LIMIT 1';
    conn.query(uQuery, [val, oid], (err, result, field) => {
      if (err) {
        reject('hiba történt');
        return;
      }
      
      resolve('success');
    });
  });
}

module.exports = buildMainSection;
