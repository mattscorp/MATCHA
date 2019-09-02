'use strict'

const empty = require('is-empty');
const isset = require('isset');
const sha1 = require('sha1');
const mysql = require('mysql');
const ent = require('ent'); // Permet de bloquer les caractères HTML (sécurité équivalente à htmlentities en PHP)
const uuidv4 = require('uuid/v4');
const nodemailer = require('nodemailer');
const bcrypt = require('bcryptjs');
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: '42betatest@gmail.com',
    pass: 'MatchaTest42'
  }
});

/*  CONEXION MAISON */

  var con = mysql.createConnection({
  host: "localhost",  
  user: "paul",
  password: "42Pourlavie!",
  database: "matcha"
});


/* CONNECTION ECOLE */
/*
var con = mysql.createConnection({
  host: "localhost",
  port: "3306",
  user: "root",
  password: "pvictor",
  database: "db_matcha"
});
*/

// Fonction pour connecter un utilisateur retourne 1 si user OK
const user_connect = async function(info){
  return new Promise((resolve, reject ) => {
    let sql = "SELECT * FROM users WHERE login = ?";
    con.query(sql, [info.name], function(err, result){
      if(err) throw err;
      if(result != '') {
        bcrypt.compare(info.mdp1, result[0].password, function (err, result) {
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

// Fonction pour verifier les donnees de connection 
const connect_input_verif = async function(info){
  return new Promise((resolve, reject) =>{
    if(!empty(ent.encode(info.name)) && isset(ent.encode(info.name)) && !empty(ent.encode(info.mdp1)) && isset(ent.encode(info.mdp1)) )
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
      if (err) throw err;
      if (result == '') {
        let sql2 = "SELECT * FROM users WHERE login = ?";
        let values2 = [info.login];
        con.query(sql2, values2, function (err, result) {  
          if (err) throw err;
        if (result == '')
          resolve('1');
        else
          resolve('2');
        })
      }
      else 
        resolve('0');
    })
  });
}
module.exports.user_exist = user_exist;

// Fonction de vérification des input lors de la creation, renvoi 1 si tout est ok 0 sinon
const input_verif = async function(info) {
  return new Promise((resolve, reject) => {
    let name = ent.encode(info.login);
    let email = ent.encode(info.email);
    let mdp1 = sha1(info.mdp1);
    let mdp2 = sha1(info.mdp2);
//ATTENTION le criptage dois se faire apres et surtout pense a bien enregistrer des mdp en cryopte dqns bdd
    if(!empty(name) && isset(name) && !empty(email) && isset(email) && !empty(mdp1) && isset(mdp1) && !empty(mdp2) && isset(mdp2))
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
    if (infos.mdp1.length < 8)
      resolve(0);
    else {
      var matchedCase = new Array();
      matchedCase.push("[$@$!%*#?&]"); // Special Charector
      matchedCase.push("[A-Z]");      // Uppercase Alpabates
      matchedCase.push("[0-9]");      // Numbers
      matchedCase.push("[a-z]");     // Lowercase Alphabates
      var ctr = 0;
      for (var i = 0; i < matchedCase.length; i++) {
          if (new RegExp(matchedCase[i]).test(infos.mdp1)) {
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
  bcrypt.hash(info.mdp1, saltRounds, function (err,   hash) {
    if (err) throw err; 
    let sql = "INSERT INTO users (email, login, first_name, last_name, password, email_confirmation) VALUES ?";
  	let values = [info.email, info.login, info.first_name, info.last_name, hash, uuid];
  	con.query(sql, values, function (err, result) {  
  	 if (err) throw err;  
    }); 
  });  
}
module.exports.add_user = add_user;

// Fonction pour ajouter les infos d'un utilisateur lors de sa première connection
function add_infos(info, login) {
  let sql = "UPDATE users SET bio = ?, age = ?, gender = ?, orientation = ? WHERE login = ?";
  let values = [info.bio, info.age, info.gender, info.orientation, login];
  con.query(sql, values, function (err, result) {  
  	if (err) throw err;  
  });  
}
module.exports.add_infos = add_infos;

// Fonction pour modifier les infos personnelles de l'utilisateur
function modif_infos_perso(info, login) {
  let sql = "UPDATE users SET login = ?, first_name = ?, last_name = ?, email = ?, age = ?, gender = ?, orientation = ?, bio = ? WHERE login = ?"; 
  let values = [info.login, info.first_name, info.last_name, info.email, info.age, info.gender, info.orientation, info.bio, login];
  con.query(sql, values, function (err, result) {  
    if (err) throw err;  
  });  
}
module.exports.modif_infos_perso = modif_infos_perso;

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
  let sql = "UPDATE users SET profile_picture = image_" + num + " WHERE login = ?";
  let values = [login];
  con.query(sql, values, function (err, result) {  
    if (err) throw err;  
  });  
}
module.exports.change_profile_picture = change_profile_picture;

// Suppression d'une image
const delete_photo = async function(photo, login) {
  const user = require('./connect.js');
  let sql = "UPDATE users SET image_" + photo + " = null WHERE login = ?";
  let values = [login];
  con.query(sql, values, function (err, result) {  
    if (err) throw err;  
  });
  const info_user = await user.recup_info(login);
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
    let values1 = [login];
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
	  	con.query(sql, [login], function(err, result){
	    	if(err) 
          throw err;
        else if (!result[0].email_confirmation || result[0].email_confirmation == '' || result[0].email_confirmation == null)
          resolve (0);
	    	else if (result[0].email_confirmation == uuid) {
	    		let sql2 = "UPDATE users SET email_confirmation = 1 WHERE login = ?";
	    		con.query(sql2, [login], function(err, result) {
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
   let sql = "SELECT * FROM users WHERE login = ?";
   con.query(sql, [login], function(err, result){
     if(err) throw err;
     resolve(JSON.stringify(result));
   })
 });
}
module.exports.recup_info = recup_info;