// Slice an STL file with Slic3r
const { exec } = require('child_process');
const { resolve } = require("path");

function sliceModel(layerHeight, infill, scale, wallWidth, material, fname) {
  let command; 
  wallWidth = Math.round(wallWidth / 0.4);
  let basePath = resolve('./Slic3r/Slic3r');
  let confBasePath = resolve('./Slic3r');
  let baseSTLPath = resolve('./printUploads');
  let baseGcodePath = resolve('./gcode');
  let stlFile = baseSTLPath + '/' + fname + '.stl';
  let gcodeFile = baseGcodePath + '/' + fname + '.gcode';
  let cwd = resolve('./Slic3r');
  if (material == 'PLA') {
    command = basePath + ' --load ' + confBasePath + '/' + 'pla_conf.ini';
  } else if (material == 'ABS') {
    command = basePath + ' --load ' + confBasePath + '/' + 'abs_conf.ini';
  } else if (material == 'PETG') {
    command = basePath + ' --load ' + confBasePath + '/' + 'petg_conf.ini';
  } else if (material == 'TPU') {
    command = basePath + ' --load ' + confBasePath + '/' + 'tpu_conf.ini';
  }

  command += ' -o ' + gcodeFile + ' ' + stlFile;
  command += ` --layer-height ${layerHeight} --fill-density ${infill} --scale ${scale} --perimeters ${wallWidth}`;
  exec(command, {cwd}, (err, stdout, stderr) => {
    if (err) {
      console.log(err);
      return;
    }

    //console.log(`stdout: ${stdout}`);
    console.log(`stderr: ${stderr}`);
  });
}

module.exports = sliceModel;
