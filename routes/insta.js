'use strict'

const express = require('express');
let app = express();
const session = require('express-session');
const server = require('http').createServer(app);
const ent = require('ent'); // Permet de bloquer les caractères HTML (sécurité équivalente à htmlentities en PHP)
const bodyParser = require('body-parser'); // Permet de parser
const mysql = require('mysql');
const request = require('request');
const alert = require('alert-node');
const uuidv4 = require('uuid/v4');

const db_connect = require('../db_connection.js');
let con = db_connect.con;

const ft_insta = require('../js/insta.js');
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

// Authentification par instagram : on redirige l'utilisateur qui clique sur la page d'authentification d'insta
router.get('/insta_connect', async function(req, res) {
	if (req.session.login && req.session.login != '') {
		res.redirect('/');
	} else {
		let client_id =  '84b794a468e14a0fa921bafacead173c';
		let redirect_uri = 'http://localhost:8080/auth';
		res.redirect('https://api.instagram.com/oauth/authorize/?client_id=' + client_id + '&redirect_uri=' + redirect_uri + '&response_type=code');
	}
})

// On recupere la reponse de instagram
router.get('/auth', async function(req, res) {
	if (req.session.login && req.session.login != '') {
		res.redirect('/');
	} else {
		let client_id =  '84b794a468e14a0fa921bafacead173c';
		let redirect_uri = 'http://localhost:8080/auth';
		let client_secret = '28c151c78c524c0fb7b6af4b74fc2b3b';
		let options = {
			url: 'https://api.instagram.com/oauth/access_token',
			method: 'POST',
			form: {
				client_id: client_id,
				client_secret: client_secret,
				grant_type: 'authorization_code',
				redirect_uri: redirect_uri,
				code: req.query.code
			}
		};
		request(options, async function (error, response, body) {
			if (!error && response.statusCode == 200) {
				let insta_infos = JSON.parse(body);
				let uuid_user = uuidv4();
				if (error)
					throw error;
				else if (insta_infos.user.is_business != false) {
					alert("Tu ne peux pas utiliser un compte instagram d'entreprise");
					res.redirect('/');
				} else {
					if (await ft_insta.login_exist(insta_infos.user.username) == '1') {
						
						// On cree l'utilisateur
						let sql = "INSERT INTO `users` (`login`, `uuid`, `insta`, `first_name`, `last_name`, `email_confirmation`, `image_1`, `profile_picture`) VALUES (?)";
						let values = [[insta_infos.user.username, uuid_user, insta_infos.user.id, insta_infos.user.full_name.split(' ')[0], insta_infos.user.full_name.split(' ')[1], '1',insta_infos.user.profile_picture ,insta_infos.user.profile_picture]];
						con.query(sql, values, function(err, result) {
							if (err)
								throw err;
							else {
								// On ajoute une colonne dans la table interest
								sql = "SELECT `user_ID` FROM `users` WHERE `uuid` = ?";
								con.query(sql, [uuid_user], function(err, result) {
									if (err)
										throw err;
									else {
										sql = "ALTER TABLE interests ADD `" + result[0].user_ID + "` INT NOT NULL DEFAULT 0";
										con.query(sql, async function(err, result) {
											if (err)
												throw err;
											else {
												let uuid_user = await user.recup_info_uuid(insta_infos.user.id);
												req.session.login = uuid_user;
												res.redirect('/');
											}
										});
									}
								});
							}
						});
					} else {
						let uuid_user = await user.recup_info_uuid(insta_infos.user.id);
						req.session.login = uuid_user;
						res.redirect('/');
					}
				}
			} else
				res.redirect('/');
		});
	};
})

module.exports = router;