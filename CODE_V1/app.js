'use strict'

var path = require('path');
var bodyParser = require('body-parser');
var urlEncodeParser = bodyParser.urlencoded({ extended : false});
var ent = require('ent');
var session = require('express-session');

/*
	-
*/

const server = require('./config/server.js');
const app = server.serverConnect();
const db = server.dbConnect();

app.use(session({
	secret: 'BlobFish@42!',
	resave: true,
	saveUninitialized: true
}))
	.use(bodyParser.urlencoded({extended : true}))
	.use(bodyParser.json());

/*
	-
*/

const user = require('./users/connect/connect.js');
// If connected, send the connection page, otherwise the home page
if (!req.session.loggedin) {
	    	res.sendFile(path.join(__dirname + '/users/connect/connect.html'));
} else { 
	app.get('/', function(req, res) {
			res.sendFile(path.join(__dirname + '/users/home.html'));
			next();
		});
	app.get('/home', function(req, res) {
			if (!req.session.loggedin) {
		    	res.sendFile(path.join(__dirname + '/users/connect/connect.html'));
			} else {
				res.sendFile(path.join(__dirname + '/users/home.html'));
			}
	});
	// Create a new account
	app.get('/create_account', function(req, res) {
			if (!req.session.loggedin) {
				res.sendFile(path.join(__dirname + '/users/connect/create_account.html'));
			} else {
				res.sendFile(path.join(__dirname + '/users/home.html'));
			}
	});
	// Check the user's login and password
	app.post('/connect', urlEncodeParser, function(req, res) {
		if (!req.session.loggedin) {
			let login = ent.encode(req.body.login);
			let password = ent.encode(req.body.password);
			let connected = user.userConnect(login, password);
			if (connected === true)
				console.log('userConnect() returned "' + connected + '": the user does exist');
			else
					console.log('userConnect() returned nothing: the user does NOT exist');
			console.log(req.body.login);
			res.sendFile(path.join(__dirname + '/users/connect/connect.html'));
		} else {
			res.sendFile(path.join(__dirname + '/users/home.html'));
		}
	});
}