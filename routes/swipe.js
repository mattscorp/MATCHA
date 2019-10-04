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

router.get('/swipe', async function (req, res) {
	if (!req.session.login || req.session.login == '')
		res.redirect('/');
	else {
    	let info_parse = JSON.parse(await user.recup_info(JSON.parse(req.session.login)[0].uuid));
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
        let all_interests = JSON.parse(await interests.recup_all_interests_swipe());
        let filtered = [];
        profiles_parse.forEach(function(item) {
            if (item.email_confirmation == '1' &&  item.departement !== '' && item.departement !== '0' && item.profile_picture !== null) {
                let score_algo = 0;
                let i = 0;
                // Calcul de la distance : -1 par km de distance
                let coord_searcher = [];
                let lon_searcher = "";
                let lat_searcher = "";
                if (info_parse[0].localisation_manual != null && info_parse[0].localisation_manual != '' && info_parse[0].localisation_manual != 'null' && info_parse[0].geo_consent == 'Oui') {
                    coord_searcher = info_parse[0].localisation_manual.split(",");
                    lon_searcher = coord_searcher[1];
                    lat_searcher = coord_searcher[0];
                } else {
                    coord_searcher = info_parse[0].localisation_auto.split(",");
                    lon_searcher = coord_searcher[1];
                    lat_searcher = coord_searcher[0];
                }
                i = 0;
                let coord_target = [];
                let lon_target = "";
                let lat_target = "";
                let distance_between = 0;
                if (item.localisation_manual != null && item.localisation_manual != '' && item.localisation_manual != 'null' && item.geo_consent == 'Oui') {
                    coord_target = item.localisation_manual.split(",")
                    lon_target = coord_target[1];
                    lat_target = coord_target[0];
                    distance_between = swipe.distance(lat_searcher, lon_searcher, lat_target, lon_target, 'K');
                } else {
                    coord_target = item.localisation_auto.split(",")
                    lon_target = coord_target[1];
                    lat_target = coord_target[0];
                    distance_between = swipe.distance(lat_searcher, lon_searcher, lat_target, lon_target, 'K');
                }
                score_algo -= (distance_between / 10);

                // Score de popularité : difference des deux scores / 10
                if (item.score != null && info_parse[0].score != null) {
                    if (item.score > info_parse[0].score)
                        score_algo -= (item.score - info_parse[0].score) / 10;
                    else
                        score_algo -= (info_parse[0].score - item.score) / 10;
                }

                // Nombre de centres d'interet : on compte les centres d'interets communs, a chacun (n) on fait score += n (suite de fibonacci)
                if (item.hashtag != '' && item.hashtag != null) {
                    let interests_calc = item.hashtag.split(',');
                    if (info_parse[0].hashtag != '' && info_parse[0].hashtag != null) {
                        let interests_user = info_parse[0].hashtag.split(',');
                        i = 0;
                        interests_user.forEach(function(item) {
                            if (interests_calc.includes(item)) {
                                i++;
                                score_algo += i;
                            }
                        });
                    }
                }
                item.score_algo = score_algo;
                filtered.push(item);
            }
        });
        filtered.sort(function (a, b) {
          return b.score_algo - a.score_algo;
        });
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

		res.render('swipe', {infos: info_parse[0],
                            info: info_parse[0],
                            block_me: block_me_profiles,
                            profiles: filtered,
                            previous_profiles: previous_profiles,
                            new_notifications: new_notifications,
                            age_min: 18,
                            age_max: 120,
                            orientation: 'all',
                            interest: '',
                            departement: "Non",
                            all_interests: all_interests,
                            score:0,
                            localisation:1000000,
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

router.post('/swipe', async function(req, res) {
    if (!req.session.login || req.session.login == '')
        res.redirect('/');
    else {
        let info_parse = JSON.parse(await user.recup_info(JSON.parse(req.session.login)[0].uuid));
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
        let all_interests = JSON.parse(await interests.recup_all_interests_swipe());
        let interest = "";
        let filtered = [];
        profiles_parse.forEach(function(item) {
            if (item.email_confirmation == '1' &&  item.departement !== '' && item.departement !== '0' && item.profile_picture !== null) {
                filtered.push(item);
            }
        });
        if (req.body.submit == "&#xf12d;")
            interest = "";
        else if (req.body.submit != 'Rechercher')
            interest = req.body.submit.trim().split('#')[1];
        else
            interest = req.body.interest.trim();
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
        res.render('swipe', {infos: info_parse[0],
                            info: info_parse[0],
                            block_me: block_me_profiles,
                            profiles: filtered,
                            previous_profiles: previous_profiles,
                            new_notifications: new_notifications,
                            age_min: (req.body.age_min == '') ? 18 : req.body.age_min,
                            age_max: (req.body.age_max == '') ? 120 : req.body.age_max,
                            orientation: (req.body.orientation == '') ? 'all' : req.body.orientation,
                            all_interests: all_interests,
                            score: (req.body.score == '') ? 0 : req.body.score,
                            interest: interest,
                            departement: req.body.departement,
                            localisation:(req.body.localisation == '') ? 1000000 : req.body.localisation,
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

router.post('/report_fake', async function(req, res) {
  if (!req.session.login || req.session.login == '')
        res.redirect('/');
    else {
        let info_parse = JSON.parse(await user.recup_info(JSON.parse(req.session.login)[0].uuid));
        if (await swipe.report_fake(info_parse[0].user_ID, req.body.fake_ID) > 3)
            swipe.ban_fake(req.body.fake_ID);
        res.redirect('/match');
    }  
})

router.post('/like_profile', async function(req, res) {
    if (!req.session.login || req.session.login == '')
        res.redirect('/');
    else {
        console.log("test = " + req.session.login);
        const info_parse = JSON.parse(await user.recup_info(JSON.parse(req.session.login)[0].uuid));
        console.log("info = " + info_parse[0].uuid);

        let info_parse_liked = JSON.parse(await user.recup_info_id(req.body.liked_ID));
        console.log("info_parse_liked = " + info_parse_liked[0].uuid);
        swipe.like_profile(info_parse, req.body.submit, req.body.liked_ID);
        if (req.body.submit == 'Like') {
            notifications.notification(info_parse[0], req.body.liked_ID, 'like');
            if ((await swipe.like_reverse(info_parse, req.body.liked_ID)) === true) {
                notifications.notification(info_parse[0], req.body.liked_ID, 'match');
                notifications.notification(info_parse_liked[0], info_parse[0].user_ID, 'match');
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
        let info_parse = JSON.parse(await user.recup_info(JSON.parse(req.session.login)[0].uuid));
        await swipe.add_visit(info_parse[0].user_ID, req.body.visited_ID, info_parse[0].first_name);
        await notifications.notification(info_parse[0], req.body.visited_ID, 'visit');
        res.redirect('/swipe');
    }
})

module.exports = router;