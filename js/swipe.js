'use strict'

const ent = require('ent'); // Permet de bloquer les caractères HTML (sécurité équivalente à htmlentities en PHP)
const bodyParser = require('body-parser'); // Permet de parser
const mysql = require('mysql');

const user = require('../js/connect.js');
const interests = require('../js/interests.js');

const db_connect = require('../db_connection.js');
let con = db_connect.con;


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

// Renvoie la liste des profiles qui ont été likés par l'utilisateur
const like_info = async function(user_ID) {
	return new Promise((resolve, reject) => {
		let sql = "SELECT `liked_ID` FROM `like` WHERE liker_ID = ? AND (`valid_like` = 1 OR `valid_like` = -1)";
		con.query(sql, [user_ID], function(err, result) {
			if (err) throw err;
			else
				resolve(JSON.stringify(result));
		});
	});
}
module.exports.like_info = like_info;

// Renvoie la liste des profiles à proposer à l'utilisateur
const get_profiles = async function(user_ID) {
	return new Promise((resolve, reject) => {
		let sql = "SELECT * FROM users WHERE user_ID != ?"
		con.query(sql, [user_ID], function(err, result) {
			if (err) throw err;
			else
				resolve(JSON.stringify(result));
		})
	})
}
module.exports.get_profiles = get_profiles;

// Like ou unlike (-1) un profile proposé
const like_profile = function(info_parse, submit, liked_ID) {
	let sql = "INSERT INTO `like` (`liker_ID`, `liked_ID`, `valid_like`) VALUES ?";
    let values = "";
    if (submit == "Like")
        values = [[info_parse[0].user_ID, liked_ID, 1]];
    else if (submit == "Nope")
        values = [[info_parse[0].user_ID, liked_ID, -1]];
    con.query(sql, [values], function(err, result) {
        if (err) throw err;
    });
}
module.exports.like_profile = like_profile;

// Return true si l'autre profil me like  déjà, non sinon)
const like_reverse = function(info_parse, liked_ID) {
	return new Promise((resolve, reject) => {
		let sql = "SELECT * FROM `like` WHERE `liker_ID` = ? AND `liked_ID` = ?";
	    let values = [liked_ID, info_parse[0].user_ID];
	    con.query(sql, values, function(err, result) {
	        if (err)
	        	throw err;
	        else if (result == '')
	        	resolve(false);
	        else
	        	resolve(true);
	    });
	})
}
module.exports.like_reverse = like_reverse;

// Ajoute un match dans la table des match
const add_match = function(info_parse, liked_ID) {
	let sql = "INSERT INTO `match` (`liker_ID`, `liked_ID`, `valid_match`) VALUES ?";
    let values1 = [[info_parse[0].user_ID, liked_ID, 1]];
    let values2 = [[liked_ID, info_parse[0].user_ID, 1]];
    con.query(sql, [values1], function(err, result) {
        if (err) throw err;
    });
    con.query(sql, [values2], function(err, result) {
        if (err) throw err;
    });
}
module.exports.add_match = add_match;

// Ajoute à la table
const add_visit = function(visitor_ID, visited_ID, history_first_name) {
	let sql = "INSERT INTO `history` (`from_ID`, `to_ID`, `history_first_name`, `action`) VALUES ?";
    let values1 = [[visitor_ID, visited_ID, history_first_name, 'visit']];
    con.query(sql, [values1], function(err, result) {
        if (err) throw err;
    });
}
module.exports.add_visit = add_visit;