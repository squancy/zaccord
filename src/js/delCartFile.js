const fs = require('fs');

// When user deletes an item from server also delete the corresponding file from the server
const delCartFile = (conn, fname, ext, path) => {
  return new Promise((resolve, reject) => {
    // Make sure extension is valid
    console.log(path + '/printUploads/' + fname + '.stl');
    if (['png', 'jpg', 'jpeg', 'stl'].indexOf(ext) < 0) {
      reject('Invalid extension');
      return;
      // Make sure file exists on server & delete it
    } else if (ext === 'stl' && fs.existsSync(path + '/printUploads/' + fname + '.stl')) {
      fs.unlinkSync(path + '/printUploads/' + fname + '.stl');

      // Also delete thumbnail
      fs.unlinkSync(path + '/printUploads/thumbnails/' + fname + '.png');
    } else if (fs.existsSync(path + '/printUploads/lithophanes/' + fname + '.' + ext)) {
      fs.unlinkSync(path + '/printUploads/lithophanes/' + fname + '.' + ext);
    }

    resolve('success');
    return true;
  });
};

module.exports = delCartFile;
