var mysql = require("mysql2");
var env = require("dotenv").config();

var connection = mysql.createConnection({
  host: "localhost",
  database: "demodb",
  user: "root",
  password: process.env.PASSWORD,
});

module.exports = connection;
