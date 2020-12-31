const conn = require('./connectDb.js');

let query1 = 'SELECT * FROM fix_products';
conn.query(query1, (err, result, fields) => {
  if (err) console.log(err)

  for (let i = 0; i < result.length; i++) {
    let newShowcase = result[i].img_url.replace('images/', '') + ',' + result[i].img_showcase;
    let id = result[i].id;
    let q2 = 'UPDATE fix_products SET img_showcase = ? WHERE id = ? LIMIT 1'; 

    conn.query(q2, [newShowcase, id], (err, result, fields) => {
      if (err) console.log(err)

    });
  }
});
