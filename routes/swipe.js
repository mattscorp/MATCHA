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
        let all_interests = JSON.parse(await interests.recup_all_interests_swipe());
        let filtered = [];
        profiles_parse.forEach(function(item) {
            if (item.email_confirmation == '1' &&  item.departement !== '' && item.departement !== '0' && item.profile_picture !== null) {
                let score_algo = 0;
                let i = 0;
                // Calcul de la distance : -1 par km de distance


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
                console.log('login : ' + item.login + ' score : ' + item.score_algo);
            }
        });
        filtered.sort(function (a, b) {
          return b.score_algo - a.score_algo;
        });
		res.render('swipe', {infos: info_parse[0],
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
        res.render('swipe', {infos: info_parse[0],
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