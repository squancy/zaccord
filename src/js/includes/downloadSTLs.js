const util = require('util');
const fs = require('fs');
const path = require('path');
const zip = new require('node-zip')();
const randomstring = require('randomstring');

function deleteZip() {
  fs.unlink(path.join(__dirname, '../', '../', '../', 'tmpZips', 'tmp.zip'), (err) => {
    console.log(err);
  });
}

// Zip all STLs in uncompleted orders into 1 file so that it can be downloaded
async function downloadSTLs(conn) {
  const query = util.promisify(conn.query).bind(conn);
  try {
    let res = await query(`
      SELECT o.*, d.name FROM orders AS o
      LEFT JOIN delivery_data AS d
      ON (d.uid = o.uid OR d.order_id = o.unique_id)
      WHERE o.cp_fname IS NOT NULL AND o.status = 0
    `);

    for (let i = 0; i < res.length; i++) {
      let id = randomstring.generate({length: 8});
      let stlFname = res[i].cp_fname;
      let lastName = res[i].name.split(' ')[0];
      let color = res[i].color;
      let quantity = res[i].quantity;
      let printMat = res[i].printMat;
      let infill = res[i].suruseg;
      let lh = res[i].rvas;
      let printTech = res[i].printTech;
      let ww = res[i].fvas;
      let scale = res[i].scale;
      let fname = `${lastName}_${color}_${quantity}_${printMat}_${infill}_${lh}_${printTech}_${ww}_${scale}_${id}`;
      let p = path.join(__dirname, '../', '../', '../', 'printUploads', stlFname + '.stl');
      if (fs.existsSync(p)) {
        zip.file(fname + '.stl', fs.readFileSync(p));
      }
    }
  } catch (err) {
    console.log(err);
    return 0;
  }

  let data = zip.generate({
    base64: false,
    compression: 'DEFLATE'
  });

  fs.writeFileSync(path.join(__dirname, '../', '../', '../', 'tmpZips', 'tmp.zip'), data, 'binary');

  // Remove tmp zip file after an hour
  setTimeout(deleteZip, 3600000);

  return 1;
} 

module.exports = downloadSTLs;
