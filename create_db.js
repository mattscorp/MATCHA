'use strict'

const fs = require('fs');
const util = require('util');
const readFile = util.promisify(fs.readFile);

const db_connect = require('./db_connection.js');
let con = db_connect.con;
let con_1 = db_connect.con_1;

const create_db = async function(filesql) {
  return new Promise((resolve, reject) => {
    let sql_create = "CREATE DATABASE IF NOT EXISTS `db_matcha`;";
    con_1.query(sql_create, async function(err, result) {
      if (err)
        throw err;
      else {
        con.connect(function(err) {
          if (err) throw err;
          console.log("Connected!");
        });
        let file_data = await readFile(filesql, 'utf8');
        let array = file_data.split('\n');
        let x =0;
        let str = '';
        for (x = 0; x < array.length ; x++) {
          if (array[x] != '') {
            str = str + array[x];
            str = str.replace(/\n/gi, " ");
            if (array[x].indexOf(';') != -1) {
              con.query(str, function(err, result) {
                if (err)
                  throw err;
              });
              str = '';
            }
          }
        }
      }
    });
  });
}

const created = create_db('./db_matcha_structure.sql');
console.log("La db a bien été créée.");