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

const ft_concatenate = async function(return_table, first_name, profile_picture, i) {
	console.log(`ceci est dans ton cul ${i}`);
	// return new Promise((resolve, reject) => {
		let test = '';
		if (i == 2)
			test = '{"first_name":"' + first_name + '", "profile_picture":"' + profile_picture + '"}';
		else
			test = '{"first_name":"' + first_name + '", "profile_picture":"' + profile_picture + '"},';
		console.log('dans test ; ' + test);
		return (test);
	// });
}

const last_three_messages = async function(user_ID) {
	return new Promise((resolve, reject) => {
		let sql = "SELECT DISTINCT `recipient_ID`, `sender_ID` FROM `message` WHERE `recipient_ID` = ? OR `sender_ID` = ? ORDER BY `date` DESC LIMIT 3";
		con.query(sql, [user_ID, user_ID], function(err, result) {
			if (err)
				throw err;
			else {
				// let return_table = [{'profile_picture': '', 'first_name': ''},{'profile_picture': '', 'first_name': ''},{'profile_picture': '', 'first_name': ''}];
				let return_table = '{[';
				let i = 0;
				let values = '';
				console.log(JSON.stringify(result, null,2));
				while (result[i]) {
					let j = i;
					sql = "SELECT `profile_picture`, `first_name` FROM `users` WHERE `user_ID` = ?";
					if (result[j].sender_ID == user_ID)
						values = result[j].recipient_ID;
					else
						values = result[j].sender_ID;
					con.query(sql, values, async function(err, result1) {
						console.log(JSON.stringify(result1, null,2));
						console.log(j);
						if (err)
							throw err;
						else {
							console.log('i est avant ton cul ' + j);
							return_table = return_table + await ft_concatenate(return_table, result1[0].first_name, result1[0].profile_picture, j);
							//return_table = return_table.concat('{"first_name":"', result[i].first_name, '", "profile_picture":"', result[i].profile_picture, '"}');
							// if (i != 2)
							// 	return_table = return_table + ','
							// return_table[i].profile_picture = result[0].profile_picture;
							// return_table[i].first_name = result[0].first_name;

					console.log(`fahd ` + return_table);
						}
					});
					i++;
				}
				return_table = return_table + ']}';
				console.log('ici ' + return_table);
				resolve(return_table);
			}
		});
	});
}
module.exports.last_three_messages = last_three_messages;