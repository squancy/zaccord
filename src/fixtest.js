const fixfix = (conn) => {
  return new Promise((resolve, reject) => {
    let fq = 'SELECT id, img_showcase FROM fix_products';
    conn.query(fq, function (err, result, fields) {
      if (err) {
        reject(err);
        return;
      }
      
      let fg = 'UPDATE fix_products SET img_url = ? WHERE id = ?';
      let mini = [];
      let ids = [];
      for (let i = 0; i < result.length; i++) {
        let live_img = 'images/' + result[i].img_showcase.split(',')[0];
        mini.push(live_img);
        ids.push(result[i].id);
      }

      for (let i = 0; i < mini.length; i++) {
        conn.query(fg, [mini[i], ids[i]], function (err, result, fields) {
          if (err) console.log(err)
        });
      }
      resolve ('success')
    });
  });
}

module.exports = fixfix;
