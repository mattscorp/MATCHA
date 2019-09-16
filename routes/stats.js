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
const stats = require('../js/stats.js');
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

router.get('/stats', async function(req, res) {
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
        let like_parse = JSON.parse(await swipe.like_info(info_parse[0].user_ID));
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
        // Profiles qui m'ont vu mais refusé
        let like_me_not_parse = JSON.parse(await stats.like_me_not_info(info_parse[0].user_ID));
        let like_me_not_profiles = [];
        like_me_not_parse.forEach(function(item) {
            like_me_not_profiles.push(item.liker_ID);
        });
        // Nombre de personnes qui ont vu mon profile
        let like_nb = like_me_profiles.length;
        let seen_nb = like_me_profiles.length + like_me_not_profiles.length;
        // Ensemble des profiles
        let new_notifications = await notifications.notifications_number(info_parse[0].user_ID);
        let profiles_parse = JSON.parse(await swipe.get_profiles(info_parse[0].user_ID, block_parse, like_parse));
        res.render('stats', {infos: info_parse[0],
                                seen_nb: seen_nb,
                                like_nb: like_nb,
                                new_notifications:new_notifications});
    }
})

module.exports = router;