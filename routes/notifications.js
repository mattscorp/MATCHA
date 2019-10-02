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

router.get('/notifications', async function(req, res) {
	if (!req.session.login || req.session.login == '')
        res.redirect('/');
    else {
        let info_parse = JSON.parse(await user.recup_info(req.session.login));
        // Profiles qui m'ont liké
        let like_me_parse = JSON.parse(await match.like_me_info(info_parse[0].user_ID));
        let like_me_profiles = [];
        like_me_parse.forEach(function(item) {
            like_me_profiles.push(item.liker_ID);
        });
        // Profiles qui m'ont vu mais refusé
        let like_me_not_parse = JSON.parse(await stats.like_me_not_info(info_parse[0].user_ID));
        let like_me_not_profiles = [];
        like_me_not_parse.forEach(function(item) {
            like_me_not_profiles.push(item.liker_ID);
        });
        // Nombre de personnes qui ont vu mon profile
        let like_nb = like_me_profiles.length;
        let nope_nb = like_me_not_profiles.length;
        // Ensemble des notifications de l'utilisateur
        let new_notifications = await notifications.notifications_number(info_parse[0].user_ID);
        let notifications_parse = JSON.parse(await notifications.recup_notifications(info_parse[0].user_ID));
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
        if (messenger_3 != '')
            messages_2 = JSON.parse(await messages.messages(info_parse[0].user_ID, messenger_2[0].user_ID));

        res.render('notifications', {user: info_parse[0],
                                    info: info_parse[0],
                                    like_nb: like_nb,
                                    nope_nb: nope_nb,
                                    notifications: notifications_parse,
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

router.post('/delete_notifications', async function(req, res) {
    if (!req.session.login || req.session.login == '')
        res.redirect('/');
    else {
        let backURL = req.header('Referer') || '/';
        await notifications.delete_notifications(req.body.user_ID);
        res.redirect(backURL);
    }
})

module.exports = router;