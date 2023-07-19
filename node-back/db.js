
var mysql = require('mysql2');

const db = mysql.createConnection({
    database: "meowmall",
    connectionLimit: 10,
    host: "127.0.0.1",
    user: "root",
    password: "0000"
});
db.connect();

module.exports = db;
