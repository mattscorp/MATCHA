'use strict'

'use strict'

const empty = require('is-empty');
const isset = require('isset');
const mysql = require('mysql');
const ent = require('ent'); // Permet de bloquer les caractères HTML (sécurité équivalente à htmlentities en PHP)
const uuidv4 = require('uuid/v4');
const nodemailer = require('nodemailer');
const bcrypt = require('bcryptjs');
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: '42betatest@gmail.com',
    pass: 'MatchaTest42'
  }
});

const db_connect = require('../db_connection.js');
let con = db_connect.con;

// Renvoie la liste des profiles qui ont liké l'utilisateur
const like_me_info = async function(user_ID) {
	return new Promise((resolve, reject) => {
		let sql = "SELECT `liker_ID` FROM `like` WHERE liked_ID = ? AND (`valid_like` = 1)";
		con.query(sql, [user_ID], function(err, result) {
			if (err) throw err;
			else
				resolve(JSON.stringify(result));
		});
	});
}
module.exports.like_me_info = like_me_info;

// Renvoie la liste des profiles qui ont bloqué l'utilisateur
const block_me_info = async function(user_ID) {
	return new Promise((resolve, reject) => {
		let sql = "SELECT `blocker_ID` FROM `block` WHERE `blocked_ID` = ? AND `valid_block` = 1";
		con.query(sql, [user_ID], function(err, result) {
			if (err) throw err;
			else
				resolve(JSON.stringify(result));
		});
	});
}
module.exports.block_me_info = block_me_info;

// Unlike un profil
const unlike = async function(unliker, unliked) {
	let sql = "DELETE FROM `like` WHERE `liker_ID` = ? AND `liked_ID` = ?";
	let values = [unliker, unliked];
	con.query(sql, values, function(err, result) {
		if (err) throw err;
	});
}
module.exports.unlike = unlike;

// Unlike un profil
const unblock = async function(unliker, unliked) {
	let sql = "DELETE FROM `block` WHERE `blocker_ID` = ? AND `blocked_ID` = ?";
	let values = [unliker, unliked];
	con.query(sql, values, function(err, result) {
		if (err) throw err;
	});
}
module.exports.unblock = unblock;

// Unlike un profil
const block = async function(unliker, unliked) {
	let sql = "INSERT INTO `block` (`blocker_ID`, `blocked_ID`, `valid_block`) VALUES ?";
	let values = [[unliker, unliked, 1]];
	con.query(sql, [values], function(err, result) {
		if (err) throw err;
	});
}
module.exports.block = block;