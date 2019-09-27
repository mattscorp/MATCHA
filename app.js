'use strict'

const express = require('express');
var app = express();
const session = require('express-session');
const server = require('http').createServer(app);
const ent = require('ent'); // Permet de bloquer les caractères HTML (sécurité équivalente à htmlentities en PHP)
const bodyParser = require('body-parser'); // Permet de parser
const mysql = require('mysql');
const multer = require('multer'); // Pour l'upload de photos
const upload = multer({dest: __dirname + '/public/images'});

app.set('view engine', 'ejs');
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies
app.use(session({
  secret:'343ji43j4n3jn4jk3n',
  resave: true,
  saveUninitialized: false
}));
app.use(express.static('public'));

//Variable de connexion a la Database

const db_connect = require('./db_connection.js');
let con = db_connect.con;

//Connexion a la Database

const user = require('./routes/user.js');
app.use(user);

const messages = require('./routes/messages.js');
app.use(messages);

const swipe = require('./routes/swipe.js');
app.use(swipe);

const match = require('./routes/match.js');
app.use(match);

const notifications = require('./routes/notifications.js');
app.use(notifications);

app.use(async function(req, res, next) {
	res.status(404).render('error404');
});



server.listen(8080);
