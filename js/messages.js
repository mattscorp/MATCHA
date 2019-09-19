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

const messages = async function(messaging_ID, messaged_ID) {
	return new Promise((resolve, reject) => {
		let sql = "SELECT * FROM `message` WHERE ((`sender_ID` = ? AND `recipient_ID` = ?) OR (`sender_ID` = ? AND `recipient_ID` = ?))";
		con.query(sql, [messaging_ID, messaged_ID, messaged_ID, messaging_ID], function(err, result) {
			if (err) throw err;
			resolve(JSON.stringify(result));
		});
	});
}
module.exports.messages = messages;

const new_message = async function(sender_ID, recipient_ID, message) {
	return new Promise((resolve, reject) => {
		let sql = "INSERT INTO `message` (`sender_ID`, `recipient_ID`, `message`) VALUES (?, ?, ?)";
		con.query(sql, [sender_ID, recipient_ID, message], function(err, result) {
			if (err) throw err;
			resolve(JSON.stringify(result));
		});
	});
}
module.exports.new_message = new_message;

const report_email = function(reporter_ID, reported_ID) {
		const mailOptions = {
		from: 'matcha@matcha.com',
		to: 'p.victor@outlook.fr',
		subject: 'MATCHA - Report notification!',
		html: '<h1>User ' + reporter_ID + ' has reported ' + reported_ID + ' for unappropriate messaging.<br/>Please review.</h1>'
	};
	transporter.sendMail(mailOptions, function(error, info){
		if (error) {
			console.log(error);
		} else {
			console.log('Report email has been sent: ' + info.response);
    }
	});
}
module.exports.report_email = report_email;