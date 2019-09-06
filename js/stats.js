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
const like_me_not_info = async function(user_ID) {
	return new Promise((resolve, reject) => {
		let sql = "SELECT `liker_ID` FROM `like` WHERE liked_ID = ? AND (`valid_like` = -1)";
		con.query(sql, [user_ID], function(err, result) {
			if (err) throw err;
			else
				resolve(JSON.stringify(result));
		});
	});
}
module.exports.like_me_not_info = like_me_not_info;