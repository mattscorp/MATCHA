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
        let info_parse = JSON.parse(await user.recup_info(JSON.parse(req.session.login)[0].uuid));
        notifications.notification(info_parse[0], req.body.recipient_ID, 'message')
		await messages.new_message(req.body.sender_ID, req.body.recipient_ID, req.body.message);
		res.redirect(backURL);
    }
})

router.post('/report', async function(req, res) {
    if (!req.session.login || req.session.login == '')
        res.redirect('/');
    else {
        let backURL = req.header('Referer') || '/';
        let info_parse = JSON.parse(await user.recup_info(JSON.parse(req.session.login)[0].uuid));
        notifications.notification(info_parse[0], req.body.messaged_ID, 'report');
        messages.report_email(info_parse[0].user_ID, req.body.messaged_ID);
        res.redirect(backURL);
    }
})

// Renvoie la conversation
router.get('/see_messages', async function(req, res) {
	if (!req.session.login || req.session.login == '')
        res.redirect('/');
    else {
    	// Infos de l'utilisateur
        let info_parse = JSON.parse(await user.recup_info(JSON.parse(req.session.login)[0].uuid));
        // Infos de l'utilisateur
        let info_messaged_parse = JSON.parse(await user.recup_info(req.query.messaged_login));
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
        if (block_me_profiles.includes(info_messaged_parse[0].user_ID) || block_profiles.includes(info_messaged_parse[0].user_ID) || (!(like_profiles.includes(info_messaged_parse[0].user_ID) && like_me_profiles.includes(info_messaged_parse[0].user_ID))))
            res.redirect('/messages');
        else {
        let status = await user.is_connected(info_messaged_parse[0].login);
        // Messages entre les deux
    	let messages_parse = JSON.parse(await messages.messages(req.query.messaging_ID, req.query.messaged_ID));
        let new_notifications = await notifications.notifications_number(info_parse[0].user_ID);
    	res.render('see_messages', {messaging_first_name: info_parse[0].first_name,
                                    login: info_parse[0].login,
                                    messaging_profile_picture: info_parse[0].profile_picture,
									messaging_ID: req.query.messaging_ID,
									messages: messages_parse,
									infos_messaged: info_messaged_parse[0],
                                    new_notifications: new_notifications,
                                    status: status
									});
        }
	}
})

// Retourne toutes les personnes matchées pour choisir avec qui envoyer un message
router.get('/messages', async function (req, res) {
	if (!req.session.login || req.session.login == '')
        res.redirect('/');
    else {
    	// Infos de l'utilisateur
        let info_parse = JSON.parse(await user.recup_info(JSON.parse(req.session.login)[0].uuid));
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
        // Obtention des trois derniers messages
        let messaged_bottom = JSON.parse(await messages.last_three_messages(info_parse[0].user_ID));
        let messenger_0 = '';
        let messenger_1 = '';
        let messenger_2 = '';
        let messenger_3 = '';
        let messenger_4 = '';
        let messages_0 = '';
        let messages_1 = '';
        let messages_2 = '';
        if (messaged_bottom[0])
            messenger_0 = JSON.parse(await messages.get_messenger(messaged_bottom[0], info_parse[0].user_ID));
        if (messaged_bottom[1])
            messenger_1 = JSON.parse(await messages.get_messenger(messaged_bottom[1], info_parse[0].user_ID));
        if (messaged_bottom[2])
            messenger_2 = JSON.parse(await messages.get_messenger(messaged_bottom[2], info_parse[0].user_ID));
        if (messaged_bottom[3])
            messenger_3 = JSON.parse(await messages.get_messenger(messaged_bottom[2], info_parse[0].user_ID));
        if (messaged_bottom[4])
            messenger_4 = JSON.parse(await messages.get_messenger(messaged_bottom[2], info_parse[0].user_ID));
        if (messenger_0 != '')
            messages_0 = JSON.parse(await messages.messages(info_parse[0].user_ID, messenger_0[0].user_ID));
        if (messenger_1 != '')
            messages_1 = JSON.parse(await messages.messages(info_parse[0].user_ID, messenger_1[0].user_ID));
        if (messenger_2 != '')
            messages_2 = JSON.parse(await messages.messages(info_parse[0].user_ID, messenger_2[0].user_ID));

		res.render('messages', {login: JSON.parse(req.session.login)[0].uuid,
								infos: info_parse[0],
                                info: info_parse[0],
								like: like_profiles,
								like_me: like_me_profiles,
								block: block_profiles,
								block_me: block_me_profiles,
								profiles: profiles_parse,
                                new_notifications: new_notifications,
                                messaged_bottom: messaged_bottom,
                                messenger_0: messenger_0,
                                messenger_1: messenger_1,
                                messenger_2: messenger_2,
                                messages_0: messages_0,
                                messages_1: messages_1,
                                messages_2: messages_2
								});
	}
})

module.exports = router;