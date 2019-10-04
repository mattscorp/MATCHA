'use strict'

const db_connect = require('./db_connection.js');
let con = db_connect.con;


// Ajoute la colonne de l'utilisateur et on ajoute le hashtage dans la table user
const add_topic_user = function(topic, user_ID) {  
	// On ajoute 1 dans la table interests
	let sql = "UPDATE interests SET `" + user_ID + "` = 1 WHERE `topic` = ?";
	let values = [topic.toLowerCase()];
	con.query(sql, values, function(err, result) {
	  if (err)
	    throw err;
	});
	// On incremente topic_score dans la table interests
	sql = "UPDATE `interests` SET `topic_score` = `topic_score` + 1 WHERE `topic` = ?";
	con.query(sql, values, function(err, result) {
	  if (err)
	    throw err;
	});
	// On ajoute le hashtag dans la table users
	sql = "SELECT `hashtag` FROM `users` WHERE `user_ID`  = ?";
	values = [user_ID];
	con.query(sql, values, function(err, result) {
	  if (err)
	    throw err;
	  else {
	    let hashtag = "";
	    if (result[0].hashtag != null && result[0].hashtag != '') {
	      hashtag = result[0].hashtag.split(',');
	      if (!hashtag.includes(topic.toLowerCase()))
	        hashtag.push(topic.toLowerCase());
	      hashtag.join();
	    }
	    else
	      hashtag = topic.toLowerCase();
	    sql = "UPDATE `users` SET `hashtag` = '" + hashtag + "' WHERE `user_ID` = ?"
	    values = [user_ID];
	    con.query(sql, values, function(err, result) {
	      if (err)
	        throw err;
	    });
	  }
	});
}

// On selectionne tous les utilisateurs
let sql = "SELECT `user_ID`, `hashtag` FROM `users`";
con.query(sql, async function(err, result) {
	if (err)
		throw err;
	else {
		let i = 0;
		let hashtag_table = result;
		console.log('hashtag table : ' + hashtag_table[0].hashtag);
		while (hashtag_table[i]) {
			let hashtag_filtered = hashtag_table[i].hashtag.split(',');
			console.log(hashtag_filtered);
			i++;
			let y = 0;
			while (hashtag_filtered[y]) {
				add_topic_user(hashtag_filtered[y], i);
				y++;
			}
		}
	}
});