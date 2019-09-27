'use strict'

const express = require('express');
const app = express();
const session = require('express-session');
const server = require('http').createServer(app);
const ent = require('ent'); // Permet de bloquer les caractères HTML (sécurité équivalente à htmlentities en PHP)
const bodyParser = require('body-parser'); // Permet de parser

const user = require('../js/connect.js');
const interests = require('../js/interests.js');
const swipe = require('../js/swipe.js');
const match = require('../js/match.js');
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

router.get('/match', async function(req, res) {
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
        // Ensemble des profiles
        let new_notifications = await notifications.notifications_number(info_parse[0].user_ID);
        let profiles_parse = JSON.parse(await swipe.get_profiles(info_parse[0].user_ID, block_parse, like_parse));
        res.render('match', {infos: info_parse[0],
        						block_me: block_me_profiles,
        						block: block_profiles,
        						like: like_profiles,
                                like_me: like_me_profiles,
                                profiles: profiles_parse,
                                new_notifications: new_notifications});
    }
})

router.post('/unlike_block', async function(req, res) {
    if (!req.session.login || req.session.login == '')
        res.redirect('/');
    else {
        let backURL = req.header('Referer') || '/';
        let info_parse = JSON.parse(await user.recup_info(req.session.login));
        if (req.body.submit == "Unlike") {
            await match.unlike(info_parse[0].user_ID, req.body.liked_ID);
            notifications.notification(info_parse[0], req.body.liked_ID, 'unlike');
        }
        else if (req.body.submit == "Unblock") {
            await match.unblock(info_parse[0].user_ID, req.body.liked_ID);
            notifications.notification(info_parse[0], req.body.liked_ID, 'unblock');
        }
        else if (req.body.submit == "Block") {
            await match.block(info_parse[0].user_ID, req.body.liked_ID);
            notifications.notification(info_parse[0], req.body.liked_ID, 'block');
        }
        res.redirect(backURL);
    }
})

module.exports = router;