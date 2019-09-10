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
router.get('/notifications', async function(req, res) {
	if (!req.session.login || req.session.login == '')
        res.redirect('/');
    else {
        let info_parse = JSON.parse(await user.recup_info(req.session.login));
        // Ensemble des notifications de l'utilisateur
        let notifications_parse = JSON.parse(await notifications.recup_notifications(info_parse[0].user_ID));
        res.render('notifications', {user: info_parse[0],
                                    notifications: notifications_parse});
    }
})

module.exports = router;