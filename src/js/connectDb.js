const mysql = require('mysql');
const connContsts = require('./includes/connConstants.js');
const HOST = connContsts.host;
const USER = connContsts.user;
const PASSWORD = connContsts.password;
const DATABASE = connContsts.database;
const DATE_STRINGS = connContsts.dateStrings;

let conn = mysql.createConnection({
  host: HOST,
  user: USER,
  password: PASSWORD,
  database: DATABASE,
  dateStrings: DATE_STRINGS
});

module.exports = conn;
