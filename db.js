const mysql = require('mysql2');

const db = mysql.createPool({
  host: 'mainline.proxy.rlwy.net',
  user: 'root',
  password: 'LDRRmAOvPknXycereLeonRAqxvpEMmWG',
  database: 'railway',
  port: 30392,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

module.exports = db.promise();