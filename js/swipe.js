'use strict'

const ent = require('ent'); // Permet de bloquer les caractères HTML (sécurité équivalente à htmlentities en PHP)
const bodyParser = require('body-parser'); // Permet de parser
const mysql = require('mysql');

const user = require('../js/connect.js');
const interests = require('../js/interests.js');

/*  CONEXION MAISON */

  var con = mysql.createConnection({
  host: "localhost",  
  user: "paul",
  password: "42Pourlavie!",
  database: "matcha"
});


/* CONNECTION ECOLE */
/*
var con = mysql.createConnection({
  host: "localhost",
  port: "3306",
  user: "root",
  password: "pvictor",
  database: "db_matcha"
});
*/

// Renvoie la liste des profiles qui ont été bloqués par l'utilisateur
const block_info = async function(user_ID) {
	return new Promise((resolve, reject) => {
		let sql = "SELECT `blocked_ID` FROM `block` WHERE `blocker_ID` = ? AND `valid_block` = 1";
		con.query(sql, [user_ID], function(err, result) {
			if (err) throw err;
			else
				resolve(JSON.stringify(result));
		});
	});
}
module.exports.block_info = block_info;

// Renvoie la liste des profiles qui ont été refusés par l'utilisateur
const nope_info = async function(user_ID) {
	return new Promise((resolve, reject) => {
		let sql = "SELECT `noped_ID` FROM `nope` WHERE `noper_ID` = ? AND `valid_nope` = 1";
		con.query(sql, [user_ID], function(err, result) {
			if (err) throw err;
			else
				resolve(JSON.stringify(result));
		});
	});
}
module.exports.nope_info = nope_info;

// Renvoie la liste des profiles qui ont été likés par l'utilisateur
const like_info = async function(user_ID) {
	return new Promise((resolve, reject) => {
		let sql = "SELECT `liked_ID` FROM `like` WHERE liker_ID = ? AND `valid_like` = 1";
		con.query(sql, [user_ID], function(err, result) {
			if (err) throw err;
			else
				resolve(JSON.stringify(result));
		});
	});
}
module.exports.like_info = like_info;

// Renvoie la liste des profiles à proposer à l'utilisateur
const get_profiles = async function(user_ID, block, like, nope) {
	console.log('In get_profiles');
	console.log(block);
	console.log(like);
	console.log(nope);
}
module.exports.get_profiles = get_profiles;