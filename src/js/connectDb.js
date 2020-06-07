// Change the database connection params to your custom ones
const mysql = require('mysql');

var conn = mysql.createConnection({
  host: "",
  user: "",
  password: "",
  database: "",
  dateStrings: "date"
});

module.exports = conn;
