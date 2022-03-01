const mysql = require('mysql');

module.exports = () => {
  var db = mysql.createConnection({
    host: process.env.DBHOST,
    port: process.env.DBPORT,
    user: process.env.DBUSER,
    password: process.env.DBPASS,
    database: process.env.DBNAME,
  });

  db.connect((err) => {

    if (err) {
      console.log(err.message);
      throw err;
    }
  });

  return db;
};
