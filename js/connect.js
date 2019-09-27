'use strict'

const empty = require('is-empty');
const isset = require('isset');
const mysql = require('mysql');
const ent = require('ent'); // Permet de bloquer les caractères HTML (sécurité équivalente à htmlentities en PHP)
const uuidv4 = require('uuid/v4');
const nodemailer = require('nodemailer');
const bcrypt = require('bcryptjs');
const FileReader = require('filereader');


const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: '42betatest@gmail.com',
    pass: 'MatchaTest42'
  }
});

const db_connect = require('../db_connection.js');
let con = db_connect.con;


// Fonction pour connecter un utilisateur retourne 1 si user OK
const user_connect = async function(info){
  return new Promise((resolve, reject ) => {
    let sql = "SELECT * FROM users WHERE login = ?";

    con.query(sql, [ent.encode(info.name)], function(err, result){
      if(err) throw err;
      if(result != '') {
        bcrypt.compare(ent.encode(info.mdp1), result[0].password, function (err, result) {
          if (result == true) {
            resolve(1);
          } else {
            resolve(3);
          }
        });
      } else {
        resolve(2);
      }
    })
  });
}
module.exports.user_connect = user_connect;

// Fonction pour verifier qu'il n'y a pas de char speciaux 
const user_special = async function(user) {
  return new Promise((resolve, reject) => {
    let iChars = "~`!#$%^&*+=-[]\\';,/.{}|\":<>?";
    let count = 0;
    for (var i = 0; i < user.length; i++) {
      if (iChars.indexOf(user.charAt(i)) != -1)
         count++;
    }
    if (count == 0)
      resolve(1);
    else
      resolve(0);
  });
}
module.exports.user_special = user_special;

// Fonction pour verifier les donnees de connection 
const connect_input_verif = async function(info) {
  return new Promise((resolve, reject) => {
    if(!empty(ent.encode(info.name)) && isset(ent.encode(info.name)) && !empty(ent.encode(info.mdp1)) && isset(ent.encode(info.mdp1)))
      resolve(1);
    else
      resolve(0);
  });
}
module.exports.connect_input_verif = connect_input_verif;

// Fonction pour verifier si un utilisateur existe deja mail ou pseudo retourn 1 si l utilisateur n existe pas 0 sinon
const user_exist = async function(info){
  return new Promise((resolve, reject) => {
    let sql = "SELECT * FROM users WHERE email = ?";
    let values = [info.email];
    con.query(sql, values, function (err, result) {  
      if (err)
        throw err;
      else if (result == '') {
        let sql2 = "SELECT * FROM users WHERE login = ?";
        let values2 = [ent.encode(info.login)];
        con.query(sql2, values2, function (err, result) {  
          if (err)
            throw err;
        if (result == '')
          resolve('1');
        else {
          resolve('2');
        }
        });
      } else
        resolve('0');
    })
  });
}
module.exports.user_exist = user_exist;

// Fonction pour verifier si un utilisateur existe deja mail ou pseudo retourn 1 si l utilisateur n existe pas 0 sinon
const email_exist = async function(info){
  return new Promise((resolve, reject) => {
    let sql = "SELECT * FROM users WHERE email = ?";
    let values = [info.email];
    con.query(sql, values, function (err, result) {  
      if (err)
        throw err;
      else if (result == '')
        resolve('1');
      else
        resolve('0');
    })
  });
}
module.exports.email_exist = email_exist;

// Fonction pour verifier si un utilisateur existe deja mail ou pseudo retourn 1 si l utilisateur n existe pas 0 sinon
const login_exist = async function(info){
  return new Promise((resolve, reject) => {
    let sql = "SELECT * FROM users WHERE login = ?";
    let values = [ent.encode(info.login)];
    con.query(sql, values, function (err, result) {  
      if (err)
        throw err;
      else if (result == '')
        resolve('1');
      else
        resolve('0');
    })
  });
}
module.exports.login_exist = login_exist;

// Fonction de vérification des input lors de la creation, renvoi 1 si tout est ok 0 sinon
const input_verif = async function(info) {
  return new Promise((resolve, reject) => {
    let name = ent.encode(info.login);
    let email = info.email;
//ATTENTION le criptage dois se faire apres et surtout pense a bien enregistrer des mdp en cryopte dqns bdd
    if(!empty(name) && isset(name) && !empty(email) && isset(email) && !empty(info.mdp1) && isset(info.mdp1) && !empty(info.mdp2) && isset(info.mdp2))
    {
      if (name.length > 50)
        resolve(0)
      else if (email.length > 255)
        resolve(4)
      else if (info.mdp1.length > 50)
        resolve(2);
      if(info.mdp1 !== info.mdp2)
        resolve(3);
      resolve(1);
    }
    else
      resolve(5);
  });
}
module.exports.input_verif = input_verif;

// Vérifie que le mot de passe est sécurisé (8 char, 1 chiffre, 1 min, 1 max, un char spécial)
const mdp_strength = async function(infos) {
  return new Promise((resolve, reject) => {
    if (infos.mdp2.length < 8)
      resolve(0);
    else {
      var matchedCase = new Array();
      matchedCase.push("[$@$!%*#?&]"); // Special Charector
      matchedCase.push("[A-Z]");      // Uppercase Alpabates
      matchedCase.push("[0-9]");      // Numbers
      matchedCase.push("[a-z]");     // Lowercase Alphabates
      var ctr = 0;
      for (var i = 0; i < matchedCase.length; i++) {
          if (new RegExp(matchedCase[i]).test(infos.mdp2)) {
              ctr++;
          }
      }
      if (ctr < 4)
        resolve(0);
      else
        resolve(1);
    }
  });
}
module.exports.mdp_strength = mdp_strength;

// Reset password
const reset_password = async function(email) {
  return new Promise((resolve, reject) => {
    var uuid = uuidv4();
    const mailOptions = {
            from: 'matcha@matcha.com',
            to: email,
            subject: 'MATCHA - Réinitialisation du mot de passe',
            html: '<h1>Clique <a href="http://localhost:8080/new_password?uuid=' + uuid + '&email=' + email + ' ">ici</a> pour réinitialiser ton mot de passe.</h1>'
          };
    let sql = "SELECT * FROM users WHERE email = ?";
    let values = [email];
    con.query(sql, values, function (err, result) {  
      if (err) throw err;
      else {
        if (result != '') {
          transporter.sendMail(mailOptions, function(error, info){
            if (error) {
              console.log(error);
            } else {
              console.log('Email sent: ' + info.response);
              let sql2 = "UPDATE users SET recup_password = '" + uuid + "' WHERE email = ?"
              con.query(sql2, values, function (err, result) {  
                if (err) throw err;
                else
                  resolve(1);
              });
            }
          });
        }
        else
          resolve(0);
      }
    });
  });
}
module.exports.reset_password = reset_password;

// Reset du mdp : vérification que l'email et l'uuid correspondent bien avant de rediriger
const password_recup = async function(email, uuid) {
  return new Promise((resolve, reject) => {
    let sql = "SELECT recup_password FROM users WHERE email = ?";
    con.query(sql, [email], function (err, result) {  
     if (err) throw err;
     else {
      if (result[0].recup_password == uuid)
        resolve(1);
      else
        resolve(0);
     }
     resolve(0);
    });
  });
}
module.exports.password_recup = password_recup;

// Change password after reset
const reset_password_new = function(email, password) {
  const saltRounds = 12;
  bcrypt.hash(password, saltRounds, function (err, hash) {
    let sql = "UPDATE users SET recup_password = null, password = ? WHERE email = ?"
    let values = [hash, email];
    con.query(sql, values, function (err, result) {
      if (err) throw err;
    })
  });
}
module.exports.reset_password_new = reset_password_new;

// Fonction pour ajouter les info d un utilisateur une fois que ses dernieres on etaient verifiees
function add_user(info) {
	let uuid = uuidv4();	
	const mailOptions = {
		from: 'matcha@matcha.com',
		to: info.email,
		subject: 'MATCHA - Confirme ton addresse mail!',
		html: '<h1>Clique <a href="http://localhost:8080/confirm_email?uuid=' + uuid + '&login=' + info.login + ' ">ici</a> pour confirmer ton email.</h1>'
	};
	transporter.sendMail(mailOptions, function(error, info){
		if (error) {
			console.log(error);
		} else {
			console.log('Email sent: ' + info.response);
    }
	});
  let saltRounds = 12;
    bcrypt.hash(ent.encode(info.mdp1), saltRounds, function (err,   hash) {
    if (err) throw err; 
    let sql = "INSERT INTO users (email, login, first_name, last_name, password, email_confirmation) VALUES ?";
  	let values = [[info.email, info.login, info.first_name, info.last_name, hash, uuid]];
  	con.query(sql, [values], function (err, result) {  
  	 if (err) throw err;
     // Ajout d'une colonne à la table 'interests'
     else {
      let sql2 = "SELECT user_ID FROM users WHERE login = ?";
      con.query(sql2, ent.encode(info.login), function(err, result) {
        if (err) throw err;
        else {
          let sql3 = "ALTER TABLE interests ADD `" + result[0].user_ID + "` INT NOT NULL DEFAULT 0";
          con.query(sql3, result[0].user_ID, function(err, result) {
            if (err) throw err;
          });
        }
      });
     }
    }); 
  });  
}
module.exports.add_user = add_user;

//Fonction de verification des infos entrees lors de la premiere connection et lors d un changement sur profil
function verif_add_infos(info){
  if(info.gender !== "Homme" && info.gender !== "Femme" && info.gender !== "Autre"){
    console.log("Mauvais input tester 1: " + info.gender);
    return(1);
  }
  else if (info.orientation !== "Hommes" && info.orientation !== "Femmes" && info.orientation !== "Bi" && info.orientation != "Autres") {
    console.log("Mauvais input tester 2: " + info.orientation);
    return(2);
  }
  else if (info.geo_consent !== "Oui" && info.geo_consent !== "Non"){
    console.log("Mauvais input tester 3: " + info.geo_consent);
    return(3);
  }
  else{
    return(0);
  }
}

// Indiquer que l'utilisateur est deconnecté
function not_connected(login) {
  let sql = "UPDATE `users` SET `connected` = 0 WHERE `login` = ?";
  let values = [login];
  con.query(sql, values, function (err, result) {  
    if (err) throw err;
  });
}
module.exports.not_connected = not_connected;

// Indiquer que l'utilisateur est connecté
function connected(login) {
  let sql = "UPDATE `users` SET `connected` = 1 WHERE `login` = ?";
  let values = [login];
  con.query(sql, values, function (err, result) {  
    if (err) throw err;
  });
}
module.exports.connected = connected;

//Fonction qui retourne 1 si l'utilisateur est connecté, 0 sinon
async function is_connected(login) {
  return new Promise((resolve, reject) => {
    let sql = "SELECT `connected` FROM `users` WHERE `login` = ?";
    let values = [login];
    con.query(sql, values, function(err, result) {
      if (err)
        throw err;
      else {
        if (result[0].connected == 1)
          resolve('1');
        else
          resolve('0');
      }
    });
  });
};
module.exports.is_connected = is_connected;

// Fonction pour ajouter les infos d'un utilisateur lors de sa première connection
function add_infos(info, login) {
  let iChars = "~`=[]\\{}|<>";
  let count = 0;
  for (var i = 0; i < info.bio.length; i++) {
    if (iChars.indexOf(info.bio.charAt(i)) != -1)
       count++;
  }
  if (count == 0) {
    let sql = "UPDATE users SET bio = ?, age = ?, gender = ?, orientation = ?, departement = ?, geo_consent = ? WHERE login = ?";
    let values = [info.bio, ent.encode(info.age), ent.encode(info.gender), ent.encode(info.orientation), info.departement, ent.encode(info.geo_consent), ent.encode(login)];
    if(verif_add_infos(info) == 0){
      con.query(sql, values, function (err, result) {  
      	if (err) throw err;
      });
    }
    else
      console.log('User: ' + login + ' ESSAI DE POURRIR LA BDD');
  }
  else
    console.log('User: ' + login + ' ESSAI DE POURRIR LA BDD');
}
module.exports.add_infos = add_infos;

// Fonction pour modifier les infos personnelles de l'utilisateur
function modif_infos_perso(info, login) {
  let iChars = "~`=[]\\{}|<>";
  let count = 0;
  for (var i = 0; i < info.bio.length; i++) {
    if (iChars.indexOf(info.bio.charAt(i)) != -1)
       count++;
  }
  if (count == 0) {
    let sql = "UPDATE users SET login = ?, first_name = ?, last_name = ?, email = ?, age = ?, gender = ?, orientation = ?, bio = ?, `departement` = ?, geo_consent = ? WHERE login = ?"; 
    let values = [ent.encode(info.login), ent.encode(info.first_name), ent.encode(info.last_name), info.email, ent.encode(info.age), ent.encode(info.gender), ent.encode(info.orientation), info.bio, info.departement, ent.encode(info.geo_consent), ent.encode(login)];
    if(verif_add_infos(info) == 0) {
      con.query(sql, values, function (err, result) {  
        if (err) throw err;  
      });  
    }
    else
      console.log('User: ' + login + ' ESSAI DE POURRIR LA BDD');
  }
  else
    console.log('User: ' + login + ' ESSAI DE POURRIR LA BDD');
}
module.exports.modif_infos_perso = modif_infos_perso;

// Verification de l image
function loadMime(file, callback) {
    var mimes = [
    {
        mime: 'image/jpeg',
        pattern: [0xFF, 0xD8, 0xFF],
        mask: [0xFF, 0xFF, 0xFF],
    },
    {
        mime: 'image/png',
        pattern: [0x89, 0x50, 0x4E, 0x47],
        mask: [0xFF, 0xFF, 0xFF, 0xFF],
    }
    ];
    function check(file, mime) {
        for (var i = 0, l = mime.mask.length; i < l; ++i) {
            if ((file[i] & mime.mask[i]) - mime.pattern[i] !== 0) {
                return false;
            }
        }
        return true;
    }
            for (var i=0, l = mimes.length; i<l; ++i) {
                if (check(file, mimes[i])) return(1);
            }
            return(0);
        }
module.exports.loadMime = loadMime;



// Ajout du path de l'image_1 et utilisation de celle-ci comme photo de profil
function add_image(infos, login) {
	let sql = "UPDATE users SET image_1 = ?, profile_picture = image_1 WHERE login = ?";
	  let values = ['/images/' + infos.filename, login];
	con.query(sql, values, function (err, result) {  
		if (err) throw err;  
	});  
}
module.exports.add_image = add_image;

// Ajout d'une nouvelle photo de profil
const add_new_image = async function(infos, login) {
  const user = require('./connect.js');
  const info_user = await user.recup_info(login);
  const info_parse = await JSON.parse(info_user);
  var num = '1';
  if (info_parse[0].image_2 == null)
    num = '2';
  else if (info_parse[0].image_3 == null)
    num = '3';
  else if (info_parse[0].image_4 == null)
    num = '4';
  else if (info_parse[0].image_5 == null)
    num = '5';
  const sql_req = "UPDATE users SET image_" + num + " = ? WHERE login = ?";
  let values = ['/images/' + infos.filename, login];
  con.query(sql_req, values, function (err, result) {  
    if (err) throw err;  
  });  
}
module.exports.add_new_image = add_new_image;

// Modification de la photo de profil
const change_profile_picture = function(infos, login) {
  var num = '1';
  if (infos.profile_picture == 'Photo 1')
    num = '1';
  else if (infos.profile_picture == 'Photo 2')
    num = '2';
  else if (infos.profile_picture == 'Photo 3')
    num = '3';
  else if (infos.profile_picture == 'Photo 4')
    num = '4';
  else if (infos.profile_picture == 'Photo 5')
    num = '5';
  if(num >= 1 && num <= 5){
    let sql = "UPDATE users SET profile_picture = image_" + num + " WHERE login = ?";
    let values = [ent.encode(login)];
    con.query(sql, values, function (err, result) {  
      if (err) throw err;  
    });
  }
  else
  console.log('User: ' + login + ' ESSAI DE POURRIR LA BDD AVEC UN MAUVAIS CHIFFRE DE PHOTO'); 
}
module.exports.change_profile_picture = change_profile_picture;

// Suppression d'une image
const delete_photo = async function(photo, login) {
  const user = require('./connect.js');
  let sql = "UPDATE users SET image_" + photo + " = null WHERE login = ?";
  let values = [ent.encode(login)];
  con.query(sql, values, function (err, result) {  
    if (err) throw err;  
  });
  const info_user = await user.recup_info(ent.encode(login));
  const info_parse = await JSON.parse(info_user);
  var new_pp = '0';
  if (photo != '1' && info_parse[0].image_1 != null)
    new_pp = 'Photo 1';
  else if (photo != '2' && info_parse[0].image_2 != null)
    new_pp = 'Photo 2';
  else if (photo != '3' && info_parse[0].image_3 != null)
    new_pp = 'Photo 3';
  else if (photo != '4' && info_parse[0].image_4 != null)
    new_pp = 'Photo 4';
  else if (photo != '5' && info_parse[0].image_5 != null)
    new_pp = 'Photo 5';
  if (new_pp != '0')
    await user.change_profile_picture({profile_picture: new_pp}, login);
  else {
    let sql1 = "UPDATE users SET profile_picture = null WHERE login = ?";
    let values1 = [ent.encode(login)];
    con.query(sql1, values1, function (err, result) {  
    if (err) throw err;  
  });
  }
}
module.exports.delete_photo = delete_photo;

// Validation de l'addresse email user
const validation_mail = async function(login, uuid) {
	return new Promise((resolve, reject) => {
		let sql = "SELECT email_confirmation FROM users WHERE login = ?";
	  	con.query(sql, [ent.encode(login)], function(err, result){
	    	if(err) 
          throw err;
        else if (!result[0].email_confirmation || result[0].email_confirmation == '' || result[0].email_confirmation == null)
          resolve (0);
	    	else if (result[0].email_confirmation == uuid) {
	    		let sql2 = "UPDATE users SET email_confirmation = 1 WHERE login = ?";
	    		con.query(sql2, [ent.encode(login)], function(err, result) {
	    			if(err) throw err;
	    		})
	    		resolve(1);
	    	}
	    	else
	    		resolve(0);
	    })
   });
}
module.exports.validation_mail = validation_mail;

// Fonction pour recuperer les info utilisateur
const recup_info = async function(login){
 return new Promise((resolve, reject) =>{
   let sql = "SELECT `user_ID`, `last_name`, `first_name`, `login`, `hashtag`, `email`, `localisation_auto`, `localisation_manual`, `gender`, `orientation`, `age`, `bio`, `image_1`, `image_2`, `image_3`, `image_4`, `image_5`, `profile_picture`, `score`, `geo_consent`, `departement`, `email_confirmation` FROM users WHERE login = ?";
   con.query(sql, [ent.encode(login)], function(err, result){
     if(err) throw err;
     resolve(JSON.stringify(result));
   })
 });
}
module.exports.recup_info = recup_info;

// Fonction pour recuperer les interests de l'utilisateur
const recup_interests = async function(user_ID){
 return new Promise((resolve, reject) => {
   let sql = "SELECT `topic` FROM interests WHERE `" + user_ID + "` = 1";
   con.query(sql, function(err, result){
     if(err) throw err;
     resolve(JSON.stringify(result));
   })
 });
}
module.exports.recup_interests = recup_interests;

// Ajout des coordonnées à la BDD
const add_coordinates = async function(infos, login) {
  let geoloc = infos.geoplugin_latitude + ',' + infos.geoplugin_longitude;
  let sql = "UPDATE users SET localisation_auto = '" + geoloc + "' WHERE login = ?";
  con.query(sql, [ent.encode(login)], function(err, result) {
    if (err) throw err;
  });
}
module.exports.add_coordinates = add_coordinates;


// Ajout des coordonnées via navigateur à la BDD
const add_coordinates_nav = async function(infos, login) {
  let geoloc = infos.latitude + ',' + infos.longitude;
  let sql = "UPDATE users SET localisation_manual = '" + geoloc + "' WHERE login = ?";
  con.query(sql, [ent.encode(login)], function(err, result) {
    if (err) throw err;
  });
}
module.exports.add_coordinates_nav = add_coordinates_nav;