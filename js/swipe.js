'use strict'

const ent = require('ent'); // Permet de bloquer les caractères HTML (sécurité équivalente à htmlentities en PHP)
const bodyParser = require('body-parser'); // Permet de parser
const mysql = require('mysql');

const user = require('../js/connect.js');
const interests = require('../js/interests.js');

const db_connect = require('../db_connection.js');
let con = db_connect.con;


// Renvoie la liste des profiles qui ont été bloqués par l'utilisateur
const block_info = async function(user_ID) {
	return new Promise((resolve, reject) => {
		let sql = "SELECT `blocked_ID` FROM `block` WHERE `blocker_ID` = ? AND `valid_block` = 1";
		con.query(sql, [user_ID], function(err, result) {
			if (err) throw err;
			else
				resolve(JSON.stringify(result));
		});
	});
}
module.exports.block_info = block_info;

// Renvoie la liste des profiles qui ont été likés par l'utilisateur
const like_info = async function(user_ID) {
	return new Promise((resolve, reject) => {
		let sql = "SELECT `liked_ID` FROM `like` WHERE liker_ID = ? AND (`valid_like` = 1 OR `valid_like` = -1)";
		con.query(sql, [user_ID], function(err, result) {
			if (err) throw err;
			else
				resolve(JSON.stringify(result));
		});
	});
}
module.exports.like_info = like_info;

// Renvoie la liste des profiles qui ont été likés par l'utilisateur
const like_only = async function(user_ID) {
	return new Promise((resolve, reject) => {
		let sql = "SELECT `liked_ID` FROM `like` WHERE liker_ID = ? AND (`valid_like` = 1)";
		con.query(sql, [user_ID], function(err, result) {
			if (err) throw err;
			else
				resolve(JSON.stringify(result));
		});
	});
}
module.exports.like_only = like_only;

// Renvoie la liste des profiles à proposer à l'utilisateur
const get_profiles = async function(user_ID) {
	return new Promise((resolve, reject) => {
		let sql = "SELECT * FROM users WHERE user_ID != ?"
		con.query(sql, [user_ID], function(err, result) {
			if (err) throw err;
			else
				resolve(JSON.stringify(result));
		})
	})
}
module.exports.get_profiles = get_profiles;


function degrees_to_radians(degrees)
{
  var pi = Math.PI;
  return degrees * (pi/180);
}

function distance(lat1, lon1, lat2, lon2, unit) {
	if ((lat1 == lat2) && (lon1 == lon2)) {
		return 0;
	}
	else {
		var radlat1 = Math.PI * lat1/180;
		var radlat2 = Math.PI * lat2/180;
		var theta = lon1-lon2;
		var radtheta = Math.PI * theta/180;
		var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
		if (dist > 1) {
			dist = 1;
		}
		dist = Math.acos(dist);
		dist = dist * 180/Math.PI;
		dist = dist * 60 * 1.1515;
		if (unit=="K") { dist = dist * 1.609344 }
		if (unit=="N") { dist = dist * 0.8684 }
		return dist;
	}
}


// Renvoie la liste des profiles à proposer à l'utilisateur
const get_profiles_research = async function(user_ID, age_min, age_max, score, orientation, localisation, info_parse) {
	return new Promise((resolve, reject) => {
		let sql = "SELECT * FROM `users` WHERE `user_ID` != ? AND `age` >= ?  AND `age` <= ? AND (`score` >= ? OR `score` IS NULL) AND `gender` = ?";
		let values = [user_ID, age_min, age_max, score, orientation];
		if (orientation == 'all' || orientation == '') {
			sql = "SELECT * FROM `users` WHERE `user_ID` != ? AND `age` >= ?  AND `age` <= ? AND (`score` >= ? OR `score` IS NULL)";
			values = [user_ID, age_min, age_max, score];
		}
		con.query(sql, values, function(err, result) {
			if (err) throw err;
			else
		{
			if(info_parse[0].localisation_manual != null)
				{
					console.log(result);
					let coord_searcher = info_parse[0].localisation_manual.split(",")
					console.log(coord_searcher);

					var lon_searcher = coord_searcher[1];
					console.log(lon_searcher);

					var lat_searcher = coord_searcher[0];
					console.log(lat_searcher);

					console.log('la');
/*
					let coord_target = info_parse[0].localisation_manual.split(",")
					console.log(coord_target);

					let lon_target = coord_target[0];
					console.log(lon_target);

					let lat_target = coord_target[1];
					console.log(lat_target);

					let distance =*/

				}
				else //if(info_parse[0].localisation_auto != null)
				{
					console.log('ouuoula');


					let coord_searcher = info_parse[0].localisation_auto.split(";")
					var lon_searcher = coord_searcher[1];

					var lat_searcher = coord_searcher[0];

					console.log('coord_searcher');
					console.log(coord_searcher);
				}
				let i = 0;
					while(result[i])
					{
						console.log(result[i]);
						if(result[i].localisation_manual != null){
							//console.log(result[i].localisation_manual);
							//console.log('localisation_manual');
							let coord_target = result[i].localisation_manual.split(",")
							//console.log(coord_target);
							let lon_target = coord_target[1];
							//console.log(lon_target);
							let lat_target = coord_target[0];
							//console.log(lat_target);
							let distance_between = distance(lat_searcher, lon_searcher, lat_target, lon_target, 'K');
							console.log('distance_between man');
							console.log(distance_between);
						}
						else //if (result[i].localisation_auto != null)
						{
							//console.log(result[i].localisation_auto);
							//console.log('localisation_auto');
							let coord_target = result[i].localisation_auto.split(";")
							console.log('coord_target');
							
							console.log(coord_target);

							let lon_target = coord_target[1];
							//console.log(lon_target);

							let lat_target = coord_target[0];
							//console.log(lat_target);
							console.log(lon_target + "   " + lat_target);
							console.log(lon_searcher + "   " + lat_searcher);
							let distance_between = distance(lat_searcher, lon_searcher, lat_target, lon_target, 'K');

							console.log('distance_between auto');
							console.log(distance_between);

						}
						i++;
					}
			resolve(JSON.stringify(result));
		}		
		})
	})
}
module.exports.get_profiles_research = get_profiles_research;

// Like ou unlike (-1) un profile proposé
const like_profile = function(info_parse, submit, liked_ID) {
	let sql = "INSERT INTO `like` (`liker_ID`, `liked_ID`, `valid_like`) VALUES ?";
	let sql2 = "";
    let values = "";
    let values2 = liked_ID;
    if (submit == "Like") {
    	sql2 = "UPDATE `users` SET `nb_like` = `nb_like` + 1 WHERE `user_ID` = ?";
        values = [[info_parse[0].user_ID, liked_ID, 1]];
    }
    else if (submit == "Nope") {
    	sql2 = "UPDATE `users` SET `nb_nope` = `nb_nope` + 1 WHERE `user_ID` = ?";
        values = [[info_parse[0].user_ID, liked_ID, -1]];
    }
    con.query(sql, [values], function(err, result) {
        if (err) throw err;
    });
    con.query(sql2, [values2], function(err, result) {
        if (err) throw err;
    });
    let sql3 = "UPDATE `users` SET `score` = `nb_like` / (`nb_nope` + `nb_like`) * 100  WHERE `user_ID` = ?";
    con.query(sql3, [values2], function(err, result) {
        if (err) throw err;
    });
}
module.exports.like_profile = like_profile;

// Return true si l'autre profil me like  déjà, non sinon)
const like_reverse = function(info_parse, liked_ID) {
	return new Promise((resolve, reject) => {
		let sql = "SELECT * FROM `like` WHERE `liker_ID` = ? AND `liked_ID` = ?";
	    let values = [liked_ID, info_parse[0].user_ID];
	    con.query(sql, values, function(err, result) {
	        if (err)
	        	throw err;
	        else if (result == '')
	        	resolve(false);
	        else
	        	resolve(true);
	    });
	})
}
module.exports.like_reverse = like_reverse;

// Ajoute un match dans la table des match
const add_match = function(info_parse, liked_ID) {
	let sql = "INSERT INTO `match` (`liker_ID`, `liked_ID`, `valid_match`) VALUES ?";
    let values1 = [[info_parse[0].user_ID, liked_ID, 1]];
    let values2 = [[liked_ID, info_parse[0].user_ID, 1]];
    con.query(sql, [values1], function(err, result) {
        if (err) throw err;
    });
    con.query(sql, [values2], function(err, result) {
        if (err) throw err;
    });
}
module.exports.add_match = add_match;

// Ajoute à la table
const add_visit = function(visitor_ID, visited_ID, history_first_name) {
	let sql = "INSERT INTO `history` (`from_ID`, `to_ID`, `history_first_name`, `action`) VALUES ?";
    let values1 = [[visitor_ID, visited_ID, history_first_name, 'visit']];
    con.query(sql, [values1], function(err, result) {
        if (err) throw err;
    });
}
module.exports.add_visit = add_visit;