'use strict'

const ent = require('ent');
const db_connect = require('../db_connection.js');
let con = db_connect.con;


// Fonction pour verifier si un utilisateur existe deja mail ou pseudo retourn 1 si l utilisateur n existe pas 0 sinon
const login_exist = async function(info) {
  return new Promise((resolve, reject) => {
    let sql = "SELECT login FROM users WHERE insta = ?";
    let values = [info];
    con.query(sql, values, function (err, result) {  
      if (err)
        throw err;
    	else {
			if (result == '')
		        resolve('1');
		    else
	    	    resolve('0');
		}
    })
  });
}
module.exports.login_exist = login_exist;
