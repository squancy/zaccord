const mysql = require('mysql');

var conn = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "3d",
  dateStrings: "date"
});

module.exports = conn;
