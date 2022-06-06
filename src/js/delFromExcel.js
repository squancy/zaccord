const ExcelJS = require('exceljs');
const path = require('path');

// Delete a certain customer from the excel table
function delFromExcel(conn, formData) {
  return new Promise((resolve, reject) => {
    let name = formData.name;
    let pcode = formData.pcode;
    let city = formData.city;
    let address = formData.address;
    let mobile = formData.mobile;
    let email = formData.email;

    const workbook = new ExcelJS.Workbook();
    workbook.xlsx.readFile(path.resolve('./src/spreadsheets/shippingCredentials.xlsx')).then(w => {
      let worksheet = workbook.getWorksheet('Shipping');
      let rowToDel = -1;
      worksheet.eachRow(function(row, rowNumber) {
        let flag = true;
        row.eachCell(function(cell, colNumber) {
          if ((colNumber == 1 && name != cell.value) || (colNumber == 3 && pcode != cell.value) ||
              (colNumber == 4 && city != cell.value) || (colNumber == 5 && address != cell.value) ||
              (colNumber == 6 && mobile != cell.value) || (colNumber == 7 && email != cell.value)) {
            flag = false;
          }
        });

        if (flag) {
          rowToDel = rowNumber;
        }
      });

      if (rowToDel == -1) {
        reject('failure');
        return;
      }

      worksheet.spliceRows(rowToDel - 1, 1);
      workbook.xlsx.writeFile(path.resolve('./src/spreadsheets/shippingCredentials.xlsx')).then(x => resolve('success'));
    });
  }).catch(err => {
    console.log(err);
    return;
  });
}

module.exports = delFromExcel;
