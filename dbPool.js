const mysql = require("mysql");
const pool = mysql.createPool({
  connectionLimit: 10,
  host: "jbb8y3dri1ywovy2.cbetxkdyhwsb.us-east-1.rds.amazonaws.com",
  user: "esw0kpysmpx33bhd",
  password: "aed3qdstdccar8oy",
  database: "xv1krnv2gox84c7m",
});

module.exports = pool;
