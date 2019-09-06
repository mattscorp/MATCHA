'use strict'

const express = require('express');
var app = express();
const session = require('express-session');
const server = require('http').createServer(app);
const io = require('socket.io').listen(server);
const ent = require('ent'); // Permet de bloquer les caractères HTML (sécurité équivalente à htmlentities en PHP)
const bodyParser = require('body-parser'); // Permet de parser
const mysql = require('mysql');
const multer = require('multer'); // Pour l'upload de photos
const upload = multer({dest: __dirname + '/../public/images'});

const user = require('../js/connect.js');
app.set('view engine', 'ejs');
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies
app.use(session({
  secret:'343ji43j4n3jn4jk3n',
  resave: true,
  saveUninitialized: false
}));
app.use(express.static('./../public'));

const router = express.Router();

//
router.get('/messages', async function (req, res) {
	res.render('messages', {login: req.session.login});
})

module.exports = router;