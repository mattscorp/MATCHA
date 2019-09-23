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

router.get('/swipe', async function (req, res) {
	if (!req.session.login || req.session.login == '')
		res.redirect('/');
	else {
    	let info_parse = JSON.parse(await user.recup_info(req.session.login));
        // Profiles qui m'ont bloqué
        let block_me_parse = JSON.parse(await match.block_me_info(info_parse[0].user_ID));
        let block_me_profiles = [];
        block_me_parse.forEach(function(item) {
            block_me_profiles.push(item.blocker_ID);
        });
    	let block_parse = JSON.parse(await swipe.block_info(info_parse[0].user_ID));
    	let like_parse = JSON.parse(await swipe.like_info(info_parse[0].user_ID));
        let profiles_parse = JSON.parse(await swipe.get_profiles(info_parse[0].user_ID));
        let previous_profiles = [];
        block_parse.forEach(function(item) {
            previous_profiles.push(item.blocked_ID);
        });
        like_parse.forEach(function(item) {
            previous_profiles.push(item.liked_ID);
        });
        let new_notifications = await notifications.notifications_number(info_parse[0].user_ID);
		res.render('swipe', {infos: info_parse[0],
                            block_me: block_me_profiles,
                            profiles: profiles_parse,
                            previous_profiles: previous_profiles,
                            new_notifications: new_notifications,
                            age_min: 18,
                            age_max: 120,
                            orientation: 'all',
                            score:0,
                            localisation:1000000});
	}
})

router.post('/swipe', async function(req, res) {
    if (!req.session.login || req.session.login == '')
        res.redirect('/');
    else {
        let info_parse = JSON.parse(await user.recup_info(req.session.login));
        // Profiles qui m'ont bloqué
        let block_me_parse = JSON.parse(await match.block_me_info(info_parse[0].user_ID));
        let block_me_profiles = [];
        block_me_parse.forEach(function(item) {
            block_me_profiles.push(item.blocker_ID);
        });
        let block_parse = JSON.parse(await swipe.block_info(info_parse[0].user_ID));
        let like_parse = JSON.parse(await swipe.like_info(info_parse[0].user_ID));
        let profiles_parse = JSON.parse(await swipe.get_profiles_research(info_parse[0].user_ID, req.body.age_min, req.body.age_max, req.body.score, req.body.orientation, req.body.localisation, info_parse));
        let previous_profiles = [];
        block_parse.forEach(function(item) {
            previous_profiles.push(item.blocked_ID);
        });
        like_parse.forEach(function(item) {
            previous_profiles.push(item.liked_ID);
        });
        let new_notifications = await notifications.notifications_number(info_parse[0].user_ID);
        res.render('swipe', {infos: info_parse[0],
                            block_me: block_me_profiles,
                            profiles: profiles_parse,
                            previous_profiles: previous_profiles,
                            new_notifications: new_notifications,
                            age_min: (req.body.age_min == '') ? 18 : req.body.age_min,
                            age_max: (req.body.age_max == '') ? 120 : req.body.age_max,
                            orientation: (req.body.orientation == '') ? 'all' : req.body.orientation,
                            score: (req.body.score == '') ? 0 : req.body.score,
                            localisation:(req.body.localisation == '') ? 1000000 : req.body.localisation
                            });
    }
})

router.post('/like_profile', async function(req, res) {
    if (!req.session.login || req.session.login == '')
        res.redirect('/');
    else {
        let info_parse = JSON.parse(await user.recup_info(req.session.login));
        swipe.like_profile(info_parse, req.body.submit, req.body.liked_ID);
        if (req.body.submit == 'Like') {
            notifications.notification(info_parse[0], req.body.liked_ID, 'like');
            if ((await swipe.like_reverse(info_parse, req.body.liked_ID)) === true) {
                notifications.notification(info_parse[0], req.body.liked_ID, 'match');
                swipe.add_match(info_parse, req.body.liked_ID);
            }
        }
        res.redirect('/swipe');
    }
})

router.post('/visit', async function(req, res) {
    if (!req.session.login || req.session.login == '')
        res.redirect('/');
    else {
        let info_parse = JSON.parse(await user.recup_info(req.session.login));
        await swipe.add_visit(info_parse[0].user_ID, req.body.visited_ID, info_parse[0].first_name);
        await notifications.notification(info_parse[0], req.body.visited_ID, 'visit');
        res.redirect('/swipe');
    }
})

module.exports = router;