const produceShowcaseOutput = require('./includes/itemGenerator.js');

// Display all items a certain category
const buildCategory = (conn, category) => {
  return new Promise((resolve, reject) => {
    let output = ''; 

    /*
      Tackle 3 cases:
        - category is an ordinary category in db
        - category is 'Legnépszerűbb' which is marked as is_best in db
        - catgegory is 'Összes' when we list all products from every category
    */
  
    let sQuery;
    if (category == 'Legnépszerűbb') {
      sQuery = `SELECT * FROM fix_products WHERE is_best = 1 ORDER BY priority ASC`;
    } else if (category == 'Összes') {
      sQuery = `SELECT * FROM fix_products ORDER BY priority ASC`;
    } else {
      sQuery = `SELECT * FROM fix_products WHERE category = '${category}' ORDER BY
        priority ASC`; 
    }

    conn.query(sQuery, (err, result, field) => {
      if (err) {
        reject('Egy nem várt hiba történt, kérlek próbáld újra');
        return;
      }
      
      // Build the output
      for (let i = 0; i < result.length; i++) {
        output += produceShowcaseOutput(result, true, i, false, true);
      }

      resolve(output);
    }); 
  });
}

module.exports = buildCategory;
