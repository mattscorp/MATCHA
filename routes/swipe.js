'use strict'

const express = require('express');
var app = express();
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
		var info_user = await user.recup_info(req.session.login);
    	var info_parse = JSON.parse(info_user);
    	var block_info = await swipe.block_info(info_parse[0].user_ID); // profiles bloqués par l'utilisateur
    	var block_parse = JSON.parse(block_info);
    	console.log(block_parse[0]);
    	var nope_info = await swipe.nope_info(info_parse[0].user_ID); // profiles refusés par l'utilisateur
    	var nope_parse = JSON.parse(nope_info);
    	console.log(nope_parse[0]);
    	var like_info = await swipe.like_info(info_parse[0].user_ID); // profiles likés par l'utilisateur
    	var like_parse = JSON.parse(like_info);
    	console.log(like_parse[0]);
    	var previous_profiles = [];

    	// previous_profiles = Object.assign(block_parse[0].blocked_ID);
    	// previous_profiles = Object.assign(previous_profiles, block_parse[1].blocked_ID);
		previous_profiles = {...block_parse[0].blocker_ID, ...like_parse[0].liked_ID};
    	console.log('previous_profiles : ' + previous_profiles);
    	var get_profiles = await swipe.get_profiles(info_parse[0].user_ID, block_parse, like_parse, nope_parse);
    	// en fonction des infos (block ou pas, déjà match ou pas, orientation )
    	// envoyer les filtres : 
    		// sexe du chercheur pour comparer avec orientation des profiles
    		// intervalle d'age, 
    		// intervalle de score de popularité, 
    		// géolocalisation,
    		// tags 
		res.render('swipe', {infos: info_parse[0]});
	}
})




module.exports = router;