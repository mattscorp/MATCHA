'use strict'

const dbCheckLogin = async (login) => {
	return new Promise((resolve, reject) => {

		let config = require('../../config/server.js');
		let credentials = config.config;

		let mysql = require('mysql');
		let connection = mysql.createConnection(credentials);

		let sql = 'SELECT password FROM users WHERE login = ?';
		connection.query(sql, login, async (err, results, fields) => {
			if (err) {
				console.log('Error (dbEmailCheck): this query could not be performed');
			} else if (results != '') {
				console.log(results);
				console.log('Success (dbEmailCheck) : the login ' + login + ' is in the database and the associated password is ' + results[0].password);
			}
		})
		resolve('1');
		/*
		if (ok)
			return password;
		else
			return false;
		*/

	})
}

const userConnect = async (login, password) => {
	try {
		console.log(login)
		let dbCheckLogin = await dbCheckLogin(login)
	}
	catch (error) {
		console.log("Dans le catch de userConnect : " + error)
	}
	// let result = await message(login, password);
	// console.log(result);
	return true;
}

// const message = async (login, password) => {
// 	return new Promise((resolve, reject) => {
// 		resolve('login : ' + login + ' | password : ' + password)
// 	})

// }


//export the module
module.exports.userConnect = userConnect;