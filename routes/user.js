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
const alert = require('alert-node');
const fs = require('fs');
const util = require('util');
const readFile = util.promisify(fs.readFile);

const user = require('../js/connect.js');
const interests = require('../js/interests.js');
const notifications = require('../js/notifications.js');
const messages = require('../js/messages.js');

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
  		const info_parse = JSON.parse(await user.recup_info(req.session.login));
	  	if (info_parse[0].email_confirmation == 2) {
	  		res.render('banned', {user_ID: info_parse[0].user_ID});
	  	} else if (info_parse[0].email_confirmation == '' || info_parse[0].email_confirmation != 1) {
	     	res.render('confirm_your_email');
	    } else if (info_parse[0].bio == null || info_parse[0].age == null || info_parse[0].gender == null || info_parse[0].orientation == null) {
	    	res.render('info_user', {info: info_parse[0]});
	    } else if (info_parse[0].profile_picture == null) {
	    	res.render('profile_picture', {info:info_parse[0]});
	    } else {
	    	const interests_parse = JSON.parse(await user.recup_interests(info_parse[0].user_ID));
	    	const new_notifications = await notifications.notifications_number(info_parse[0].user_ID);
	    	const all_interests_parse = JSON.parse(await interests.recup_all_interests(info_parse[0].user_ID));
	    	let hashtag_nb = 0;
	    	if (info_parse[0].hashtag != null)
		    	hashtag_nb = info_parse[0].hashtag.split(',').length;
		    // Obtention des trois derniers messages
		    let messages_bottom = [];
		    let messaged_bottom = await messages.last_three_messages(info_parse[0].user_ID);
		    console.log('messaged_bottom ===> ' + messaged_bottom);
		    console.log('messaged_bottom[0] ===> ' + messaged_bottom[1] + "\n\n\n\n");
		    if (messaged_bottom == '') console.log('vide');
	    	res.render('account', {hashtag_nb: 'true',
	    							info: info_parse[0],
	    							interests: interests_parse,
	    							new_notifications: new_notifications,
	    							all_interests: all_interests_parse,
	    							messaged_bottom: messaged_bottom,
	    							messages_bottom: messages_bottom
	    						});
	    }
	} else {
	    res.render('connect', {user: 'true', password: 'true', creation: 'true'});
   }
});

// Deconnection du user banni
async function disconnect(req) {
	return new Promise((resolve, reject) => {
		req.session.login = '';
		resolve(1);
	})
}
router.post('/disconnect', async function(req, res) {
	await disconnect(req);
	res.redirect('/');
})

// Géolocalisation
router.post('/geo', async function(req, res) {
	if (!req.session.login || req.session.login == '')
		res.redirect('/');
	else {
		user.add_coordinates(req.body, req.session.login);
		res.redirect('/');
	}
})

// Géolocalisation via navigateur si oui
router.post('/geo_nav', async function(req, res) {
	if (!req.session.login || req.session.login == '')
		res.redirect('/');
	else {
		user.add_coordinates_nav(req.body, req.session.login);
		res.redirect('/');
	}
})


router.get('/connect', function(req, res) {
	res.redirect('/');
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
	else {
		let info_parse = JSON.parse(await user.recup_info(req.session.login));
		let new_notifications = await notifications.notifications_number(info_parse[0].user_ID);
	 	res.render('change_password', {login: req.session.login, new_notifications: new_notifications, mdp_strength: 'true', same_pass: 'true', old_password: 'true', success: 'true'});
	}
})

router.post('/change_password', async function(req, res) {
	if (!req.session.login || req.session.login == '')
		res.redirect('/');
	else {
		let info_parse = JSON.parse(await user.recup_info(req.session.login));
		let new_notifications = await notifications.notifications_number(info_parse[0].user_ID);
		if (req.body.mdp2 != req.body.mdp3)
			res.render('change_password', {login: req.session.login, new_notifications: new_notifications, mdp_strength: 'true', same_pass: 'false', old_password: 'true', success: 'true'});
		else if (await user.mdp_strength(req.body) == 0)
			res.render('change_password', {login: req.session.login, new_notifications: new_notifications, mdp_strength: 'false', same_pass: 'true', old_password: 'true', success: 'true'});
		else if (await user.user_connect(req.body) == 1) {
				await user.reset_password_new(info_parse[0].email, req.body.mdp2);
				res.render('change_password', {login: req.session.login, new_notifications: new_notifications, mdp_strength: 'true', same_pass: 'true', old_password: 'true', success: 'false'});
		} else
			res.render('change_password', {login: req.session.login, new_notifications: new_notifications, mdp_strength: 'true', same_pass: 'true', old_password: 'false', success: 'true'});
	}
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
	 	res.render('create_account', {mdp_strength: 'true', user_exist: 'true', email_exist: 'true', mdp_match: 'true', mdp_length: 'true', name: 'true', email: 'true', login:'true'});
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
		user.reset_password_new(req.body.email, ent.encode(req.body.mdp1));
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
			res.render('connect', {user: 'false', password: 'true', creation: 'true'});
		else if (val_verif == 3)
			res.render('connect', {user: 'true', password: 'false', creation: 'true'});
		} else
			res.render('connect', {user: 'true', password: 'true', creation: 'true'});
	}
});

// Ajout d'un nouvel utilisateur
router.post('/creation', async function(req, res) {
	if (req.session.login && req.session.login != '')
		res.redirect('/');
	else {
		let test =  await user.user_exist(req.body.user);
		let input = await user.input_verif(req.body.user);
		let mdp_strength = await user.mdp_strength(req.body.user);
		let user_special = await user.user_special(req.body.user.login);
		if (test == 2)
			res.render('create_account', {mdp_strength: 'true', user_exist: 'false', email_exist: 'true', mdp_match: 'true', mdp_length: 'true', name: 'true', email: 'true', login: 'true'});
		if (test == 0)
			res.render('create_account', {mdp_strength: 'true', user_exist: 'true', email_exist: 'false', mdp_match: 'true', mdp_length: 'true', name: 'true', email: 'true', login: 'true'});
		else if (input == 3)
			res.render('create_account', {mdp_strength: 'true', user_exist: 'true', email_exist: 'true', mdp_match: 'false', mdp_length: 'true', name: 'true', email: 'true', login: 'true'});
		else if (input == 0)
			res.render('create_account', {mdp_strength: 'true', user_exist: 'true', email_exist: 'true', mdp_match: 'true', mdp_length: 'true', name: 'false', email: 'true', login: 'true'});
		else if (input == 2)
			res.render('create_account', {mdp_strength: 'true', user_exist: 'true', email_exist: 'true', mdp_match: 'true', mdp_length: 'false', name: 'true', email: 'true', login: 'true'});
		else if (input == 4)
			res.render('create_account', {mdp_strength: 'true', user_exist: 'true', email_exist: 'true', mdp_match: 'true', mdp_length: 'true', name: 'true', email: 'true', login: 'true'});
		else if (mdp_strength == 0)
			res.render('create_account', {mdp_strength: 'false', user_exist: 'true', email_exist: 'true', mdp_match: 'true', mdp_length: 'true', name: 'true', email: 'true', login: 'true'});
		else if (user_special == 0)
			res.render('create_account', {mdp_strength: 'true', user_exist: 'true', email_exist: 'true', mdp_match: 'true', mdp_length: 'true', name: 'true', email: 'true', login: 'false'});
		else if(input == 1 && test == '1') {
			user.add_user(req.body.user);
			res.render('connect', {user: 'true', password: 'true', creation: 'false'});
		}
		else
			res.render('create_account', {mdp_strength: 'true', user_exist: 'true', email_exist: 'true', mdp_match: 'true', mdp_length: 'true', name: 'true', email: 'true', login: 'true'});
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
		if(req.file && req.file.size > 0) {
			let file_data = await readFile("public/images/"+req.file.filename);
			if (user.loadMime(file_data) == 1) {
				if(req.file && req.file.size > 0) {
					var add_image = await user.add_image(req.file, req.session.login);
					res.redirect('/');
				}
			} else {
				alert("Ton image est cassée");
				res.redirect('/')
				//throw 'error';
			}
		} else {
			alert("Ton image est cassée");
			res.redirect('/');
		}
	}
});

// Ajout d'une nouvelle photo
router.post('/add_new_image', upload.single('photo'), async function(req, res) {
	if (!req.session.login || req.session.login == '')
		res.redirect('/');
	else {
		if(req.file && req.file.size > 0) {
			let file_data = await readFile("public/images/"+req.file.filename);
			if (user.loadMime(file_data) == 1){
				var add_new_image = user.add_new_image(req.file, req.session.login);
				res.redirect('/');
			}
			else {
				alert("Ton image est cassée");
				res.redirect('/')
				//throw 'error';
			}
		}
		else {
			alert("Ton image est cassée");
			res.redirect('/');
		}
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
	if (!req.session.login || req.session.login == '')
		res.redirect('/');
	else {
		let info_parse = JSON.parse(await user.recup_info(req.session.login));
		if (info_parse[0].email == req.body.email && info_parse[0].login == req.body.login)
			await user.modif_infos_perso(req.body, req.session.login);
		else {
			let same_email = await user.email_exist(req.body);
			let same_login = await user.login_exist(req.body);
			if (info_parse[0].email != req.body.email && same_email != '1')
				alert('Cet email est déjà utilisé');
			else if (info_parse[0].login != req.body.login && same_login != '1')
				alert('Ce login est déjà utilisé');
			else {
				await user.modif_infos_perso(req.body, req.session.login);
				req.session.login = req.body.login;
			}
		}
		res.redirect('/');
	}
});

router.post('/onload', function(req, res) {
	user.connected(req.body.user_login);
});

router.post('/onbeforeunload', function(req, res) {
	user.not_connected(req.body.user_login);
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
		let new_topic = "";
		if (req.body.submit == "Ajouter un topic")
			new_topic = req.body.new_topic;
		else
			new_topic = req.body.submit.split('#')[1];
			let topic_exists = await interests.topic_exists(new_topic);
			let info_user = await user.recup_info(req.session.login);
			let info_parse = JSON.parse(info_user);
			const hashtag_nb = info_parse[0].hashtag.split(',').length;
			if (hashtag_nb >= 7) {
				const interests_parse = JSON.parse(await user.recup_interests(info_parse[0].user_ID));
		    	const new_notifications = await notifications.notifications_number(info_parse[0].user_ID);
		    	const all_interests_parse = JSON.parse(await interests.recup_all_interests(info_parse[0].user_ID));
		    	res.render('account', {hashtag_nb: 'false', info: info_parse[0], interests: interests_parse, new_notifications: new_notifications, all_interests: all_interests_parse});
			} else {
				if (topic_exists == 0)
					interests.add_topic(new_topic);
				interests.add_topic_user(new_topic, info_parse[0].user_ID);
				res.redirect('/');
			} 
	} else
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