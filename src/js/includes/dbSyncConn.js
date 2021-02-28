// Use synchronous queries in MySQL to avoid the callback hell with async queries
var MySql = require('sync-mysql');

// Connect to db
var syncConn = new MySql({
  host: 'localhost',
  user: 'root',
  password: '',
  database: '3d'
});

module.exports = syncConn;
