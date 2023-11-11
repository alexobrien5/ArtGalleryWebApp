const mysql = require('mysql');

const pool = mysql.createPool({
  connectionLimit: 10,
  host: "au77784bkjx6ipju.cbetxkdyhwsb.us-east-1.rds.amazonaws.com",
  user: "isgih8417lyciv0q",
  password: "u6u9ojv1svnwpxsw",
  database: "i1qvaxqq6pduvyj5"
});

module.exports = pool;