'use strict'

var mysql = require('mysql');

/*  CONEXION MAISON */

  let con = mysql.createConnection({
  host: "localhost",  
  user: "paul",
  password: "42Pourlavie!",
  database: "matcha"
});


/* CONNECTION ECOLE */
/*
let con = mysql.createConnection({
  host: "localhost",
  port: "3306",
  user: "root",
  //password: "123456",
  password: "pvictor",
  database: "db_matcha"
});
*/


module.exports.con = con;