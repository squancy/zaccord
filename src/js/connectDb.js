const mysql = require('mysql');

// Edit the connection params to fit your server
var conn = mysql.createConnection({
  host: "",
  user: "",
  password: "",
  database: "",
  dateStrings: "date"
});

module.exports = conn;
