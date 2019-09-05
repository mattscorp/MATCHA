'use strict'

const express = require('express');
let app = express();
const session = require('express-session');
const server = require('http').createServer(app);
const ent = require('ent'); // Permet de bloquer les caractères HTML (sécurité équivalente à htmlentities en PHP)
const bodyParser = require('body-parser'); // Permet de parser
const mysql = require('mysql');

const user = require('../js/connect.js');
const interests = require('../js/interests.js');
const swipe = require('../js/swipe.js');

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
    	let block_parse = JSON.parse(await swipe.block_info(info_parse[0].user_ID));
    	let like_parse = JSON.parse(await swipe.like_info(info_parse[0].user_ID));
        let profiles_parse = JSON.parse(await swipe.get_profiles(info_parse[0].user_ID, block_parse, like_parse));
        let previous_profiles = [];
        block_parse.forEach(function(item) {
            previous_profiles.push(item.blocked_ID);
        });
        like_parse.forEach(function(item) {
            previous_profiles.push(item.liked_ID);
        });
    	// en fonction des infos (block ou pas, déjà match ou pas, orientation )
    	// envoyer les filtres : 
    		// intervalle d'age, 
    		// intervalle de score de popularité, 
    		// géolocalisation,
    		// tags 
		res.render('swipe', {infos: info_parse[0], profiles: profiles_parse, previous_profiles: previous_profiles});
	}
})




module.exports = router;