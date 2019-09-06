'use strict'

const express = require('express');
var app = express();
const session = require('express-session');
const server = require('http').createServer(app);
const ent = require('ent'); // Permet de bloquer les caractères HTML (sécurité équivalente à htmlentities en PHP)
const bodyParser = require('body-parser'); // Permet de parser
const mysql = require('mysql');
const multer = require('multer'); // Pour l'upload de photos
const upload = multer({dest: __dirname + '/../public/images'});

const user = require('../js/connect.js');
const interests = require('../js/interests.js');

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

// Chargement de la page index.html
router.get('/', async function (req, res) {
  if (req.session.login && req.session.login != '') {
  	// const geolocalize = await user.geolocalize();
  	const info_user = await user.recup_info(req.session.login);
    const info_parse = JSON.parse(info_user);
    if (info_parse[0].email_confirmation == '' || info_parse[0].email_confirmation != 1) {
     	res.render('confirm_your_email');
    } else if (info_parse[0].bio == null || info_parse[0].age == null || info_parse[0].gender == null || info_parse[0].orientation == null) {
    	res.render('info_user', {info: info_parse[0]});
    } else if (info_parse[0].profile_picture == null) {
    	res.render('profile_picture', {info:info_parse[0]});
    } else {
    	const interests = await user.recup_interests(info_parse[0].user_ID);
    	const interests_parse = JSON.parse(interests);
    	res.render('account', {info: info_parse[0], interests: interests_parse});
    }
  } else {
    res.render('connect', {user: 'true', password: 'true'});
   }
});

// Géolocalisation
router.post('/geo', async function(req, res) {
	if (!req.session.login || req.session.login == '')
		res.redirect('/');
	else {
		user.add_coordinates(req.body, req.session.login);
		res.redirect('/');
	}
})

// Confirmation de l'email
router.get('/confirm_email', async function(req, res) {
	const validation_mail = await user.validation_mail(req.query.login, req.query.uuid);
	res.redirect('/');
})

// Redirection vers le changement de mot de passe
router.get('/change_password', async function(req, res) {
	if (!req.session.login || req.session.login == '')
		res.redirect('/');
	else
	 	res.render('change_password', {login: req.session.login});
})

// Bouton de déconnection
router.get('/disconnect', async function(req, res) {
	if (!req.session.login || req.session.login == '')
		res.redirect('/');
	else {
		req.session.login = '';
		res.redirect('/');
	}
})

// Chargement de la page creation.html
router.get('/creation', function (req, res) {
	if (req.session.login && req.session.login != '')
		res.redirect('/');
	else 
	 	res.render('create_account', {mdp_strength: 'true', user_exist: 'true', email_exist: 'true', mdp_match: 'true', mdp_length: 'true', name: 'true', email: 'true'});
});

// Reset password
router.get('/reset_password', function(req, res) {
	if (req.session.login && req.session.login != '')
		res.redirect('/');
	else
	 	res.render('reset_password', {email: 'true'});
});

// Reset password
router.post('/reset_password', async function(req, res) {
	const reset_password = await user.reset_password(req.body.email);
	if (reset_password == 0)
		res.render('reset_password', {email: 'false'});
	else
		res.redirect('/');
})

// Après avoir cliqué sur l'email de réinitialisation on vérifie l'uuid pour la redirection (sinon home)
router.get('/new_password', async function(req, res) {
	const password_recup = await user.password_recup(req.query.email, req.query.uuid);
	if (password_recup == 0)
		res.redirect('/');
	else
		res.render('new_password', {mdp_match: 'true', mdp_strength: 'true', email: req.query.email});
})

// Réinialisation du mdp : vérifie si identique, sécurisé, et effectue le changement
router.post('/new_password', async function(req, res) {
	if (req.body.mdp1 !== req.body.mdp2)
		res.render('new_password', {mdp_match: 'false', mdp_strength: 'true', email: req.body.email});
	else {
		const mdp_strength = await user.mdp_strength(req.body);
	if (mdp_strength == 0)
		res.render('new_password', {mdp_match: 'true', mdp_strength: 'false', email: req.body.email});
	else {
		user.reset_password_new(req.body.email, req.body.mdp1);
		res.redirect('/');
		}
	}
})

// Connection
router.post('/connect', async function(req, res){
	if (req.session.login && req.session.login != '')
		res.redirect('/');
	else {
		const val_input = await user.connect_input_verif(req.body.user_connect);
		if (val_input == 1) {
			const val_verif = await user.user_connect(req.body.user_connect);
		if(val_verif === 1) {
			req.session.login = req.body.user_connect.name;
			res.redirect('/');
		} else if (val_verif == 2)
			res.render('connect', {user: 'false', password: 'true'});
		else if (val_verif == 3)
			res.render('connect', {user: 'true', password: 'false'});
		} else
			res.render('connect', {user: 'true', password: 'true'});
	}
});

// Ajout d'un nouvel utilisateur
router.post('/creation', async function(req, res) {
	if (req.session.login && req.session.login != '')
		res.redirect('/');
	else {
		const test =  await user.user_exist(req.body.user);
		const input = await user.input_verif(req.body.user);
		const mdp_strength = await user.mdp_strength(req.body.user);
		if (test == 2)
			res.render('create_account', {mdp_strength: 'true', user_exist: 'false', email_exist: 'true', mdp_match: 'true', mdp_length: 'true', name: 'true', email: 'true'});
		if (test == 0)
			res.render('create_account', {mdp_strength: 'true', user_exist: 'true', email_exist: 'false', mdp_match: 'true', mdp_length: 'true', name: 'true', email: 'true'});
		else if (input == 3)
			res.render('create_account', {mdp_strength: 'true', user_exist: 'true', email_exist: 'true', mdp_match: 'false', mdp_length: 'true', name: 'true', email: 'true'});
		else if (input == 0)
			res.render('create_account', {mdp_strength: 'true', user_exist: 'true', email_exist: 'true', mdp_match: 'true', mdp_length: 'true', name: 'false', email: 'true'});
		else if (input == 2)
			res.render('create_account', {mdp_strength: 'true', user_exist: 'true', email_exist: 'true', mdp_match: 'true', mdp_length: 'false', name: 'true', email: 'true'});
		else if (input == 4)
			res.render('create_account', {mdp_strength: 'true', user_exist: 'true', email_exist: 'true', mdp_match: 'true', mdp_length: 'true', name: 'true', email: 'true'});
		else if (mdp_strength == 0)
			res.render('create_account', {mdp_strength: 'false', user_exist: 'true', email_exist: 'true', mdp_match: 'true', mdp_length: 'true', name: 'true', email: 'true'});
		else if(input == 1 && test == '1') {
			user.add_user(req.body.user);
			res.redirect('/');
			}
		else
			res.render('create_account', {mdp_strength: 'true', user_exist: 'true', email_exist: 'true', mdp_match: 'true', mdp_length: 'true', name: 'true', email: 'true'});
	}
});

// Ajout des informations supplémentaires sur l'utilisateur
router.post('/info_user', async function(req, res) {
	if (req.session.login && req.session.login != '')
		var update_infos = await user.add_infos(req.body, req.session.login);
	res.redirect('/');
});

// Ajout d'une première photo (photo de profil)
router.post('/profile_picture', upload.single('photo'), async function(req, res) {
	if (!req.session.login || req.session.login == '')
		res.redirect('/');
	else {
		if(req.file) {
			var add_image = await user.add_image(req.file, req.session.login);
			res.redirect('/');
		}
		else
			throw 'error';
	}
});

// Ajout d'une nouvelle photo
router.post('/add_new_image', upload.single('photo'), async function(req, res) {
	if (!req.session.login || req.session.login == '')
		res.redirect('/');
	else {
		if(req.file) {
			var add_new_image = user.add_new_image(req.file, req.session.login);
			res.redirect('/');
			}
		else
			throw 'error';
	}
});

// Modification de la profile picture
router.post('/change_profile_picture', function(req, res) {
	if (req.session.login && req.session.login != '')
		var change_profile_picture = user.change_profile_picture(req.body, req.session.login);
	res.redirect('/');
});

// Modification des infos utilisateur
router.post('/change_infos', async function(req, res) {
	if (req.session.login && req.session.login != '') {
		var info_user = await user.recup_info(req.session.login);
		var info_parse = JSON.parse(info_user);
		var modif_infos_perso = await user.modif_infos_perso(req.body, req.session.login);
		req.session.login = req.body.login;
	}
	res.redirect('/');
});

// Suppression d'une image
router.post('/delete_image', async function(req, res) {
	if (req.session.login && req.session.login != '')
		var delete_photo = await user.delete_photo(req.body.photo, req.session.login);
	res.redirect('/');
});

// Ajout d'un nouveau centre d'intérêt
router.post('/new_topic', async function(req, res) {
	if (req.session.login && req.session.login != '') {
		var topic_exists = await interests.topic_exists(req.body.new_topic);
		var info_user = await user.recup_info(req.session.login);
		var info_parse = JSON.parse(info_user);
		if (topic_exists == 0)
			interests.add_topic(req.body.new_topic);
		interests.add_topic_user(req.body.new_topic, info_parse[0].user_ID);
	}
	res.redirect('/');
});

// Suppression d'un centre d'intérêt
router.post('/delete_interest', async function(req, res) {
	if (req.session.login && req.session.login != '') {
		var info_user = await user.recup_info(req.session.login);
	    var info_parse = JSON.parse(info_user);
		interests.delete_interest(req.body.topic, info_parse[0].user_ID);
		res.redirect('/');
	}
})

module.exports = router;