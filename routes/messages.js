'use strict'

const express = require('express');
var app = express();
const session = require('express-session');
const server = require('http').createServer(app);
const ent = require('ent'); // Permet de bloquer les caractères HTML (sécurité équivalente à htmlentities en PHP)
const bodyParser = require('body-parser'); // Permet de parser

const user = require('../js/connect.js');
const interests = require('../js/interests.js');
const swipe = require('../js/swipe.js');
const match = require('../js/match.js');
const stats = require('../js/stats.js');
const messages = require('../js/messages.js');
const notifications = require('../js/notifications.js');

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

// Envoi d'un nouveau message
router.post('/new_message', async function(req, res) {
	if (!req.session.login || req.session.login == '')
        res.redirect('/');
    else {
    	let backURL = req.header('Referer') || '/';
        let info_parse = JSON.parse(await user.recup_info(req.session.login));
        notifications.notification(info_parse[0], req.body.recipient_ID, 'message')
		await messages.new_message(req.body.sender_ID, req.body.recipient_ID, req.body.message);
		res.redirect(backURL);
    }
})

// Renvoie la conversation
router.get('/see_messages', async function(req, res) {
	if (!req.session.login || req.session.login == '')
        res.redirect('/');
    else {
    	// Infos de l'utilisateur
        let info_parse = JSON.parse(await user.recup_info(req.session.login));
        // Infos de l'utilisateur
        let info_messaged_parse = JSON.parse(await user.recup_info(req.query.messaged_login));
        // Messages entre les deux
    	let messages_parse = JSON.parse(await messages.messages(req.query.messaging_ID, req.query.messaged_ID));
        let new_notifications = await notifications.notifications_number(info_parse[0].user_ID);
    	res.render('see_messages', {messaging_first_name: info_parse[0].first_name,
                                    messaging_profile_picture: info_parse[0].profile_picture,
									messaging_ID: req.query.messaging_ID,
									messages: messages_parse,
									infos_messaged: info_messaged_parse[0],
                                    new_notifications: new_notifications
									});
	}
})

// Retourne toutes les personnes matchées pour choisir avec qui envoyer un message
router.get('/messages', async function (req, res) {
	if (!req.session.login || req.session.login == '')
        res.redirect('/');
    else {
    	// Infos de l'utilisateur
        let info_parse = JSON.parse(await user.recup_info(req.session.login));
        // Profiles qui m'ont bloqué
        let block_me_parse = JSON.parse(await match.block_me_info(info_parse[0].user_ID));
        let block_me_profiles = [];
        block_me_parse.forEach(function(item) {
            block_me_profiles.push(item.blocker_ID);
        });
        // Profiles que j'ai bloqués
        let block_parse = JSON.parse(await swipe.block_info(info_parse[0].user_ID));
        let block_profiles = [];
        block_parse.forEach(function(item) {
            block_profiles.push(item.blocked_ID);
        });
        // Profiles que j'ai likés
        let like_parse = JSON.parse(await swipe.like_only(info_parse[0].user_ID));
        let like_profiles = [];
        like_parse.forEach(function(item) {
            like_profiles.push(item.liked_ID);
        });
        // Profiles qui m'ont liké
        let like_me_parse = JSON.parse(await match.like_me_info(info_parse[0].user_ID));
        let like_me_profiles = [];
        like_me_parse.forEach(function(item) {
            like_me_profiles.push(item.liker_ID);
        });
        let new_notifications = await notifications.notifications_number(info_parse[0].user_ID);
        // Tous les profiles
        let profiles_parse = JSON.parse(await swipe.get_profiles(info_parse[0].user_ID));
		res.render('messages', {login: req.session.login,
								infos: info_parse[0],
								like: like_profiles,
								like_me: like_me_profiles,
								block: block_profiles,
								block_me: block_me_profiles,
								profiles: profiles_parse,
                                new_notifications: new_notifications
								});
	}
})

module.exports = router;