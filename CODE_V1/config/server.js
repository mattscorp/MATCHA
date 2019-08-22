'use strict'

/*
	Use express to connect to port 8080
*/

exports.serverConnect = function() {
	var express = require('express');

	const PORT = 8080;
	const HOST = "0.0.0.0";

	const app = express();
	app.listen(PORT, HOST);
	return app;
	console.log(`Running on http://${HOST}:${PORT}`);
}

/*
	Connect to the mysql database 'matcha'
*/

exports.dbConnect = function() {
	const matchaMysql = require('mysql');
	const db = matchaMysql.createConnection({
		host: 'localhost',
		user: 'paul',
		password: '42Pourlavie!',
		database: 'matcha'
	});
	db.connect((err) => {
		if(err){
			console.log('Error connecting to the database:');
			console.log(err);
		return;
		}
		console.log('Connection established');
	});
}

/*
	Credentials for connecting to the database
*/

exports.config = {
  host    : 'localhost',
  user    : 'paul',
  password: '42Pourlavie!',
  database: 'matcha'
};
