const MySql = require('sync-mysql');
 
let connection = new MySql({
  host: 'localhost',
  user: 'root',
  password: '',
  database: '3d'
});

module.exports = connection;
