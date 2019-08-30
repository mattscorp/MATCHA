'use strict'

const empty = require('is-empty');
const isset = require('isset');
const sha1 = require('sha1');
const mysql = require('mysql');
const ent = require('ent'); // Permet de bloquer les caractères HTML (sécurité équivalente à htmlentities en PHP)
const uuidv4 = require('uuid/v4');
const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: '42betatest@gmail.com',
    pass: 'MatchaTest42'
  }
});

var con = mysql.createConnection({
  host: "localhost",
  port: "3306",
  user: "root",
  password: "pvictor",
  database: "db_matcha"
});

// Fonction pour connecter un utilisateur retourne 1 si user OK
const user_connect = async function(info){
  return new Promise((resolve, reject ) => {
    let sql = "SELECT * FROM users WHERE login = ?";
    con.query(sql, [info.name], function(err, result){
      if(err) throw err;
      if(result != '') {
        if (result[0].password == info.mdp1) { 
          resolve(1);
        } else {
          resolve(0);
        }
      } else {
        resolve(0);
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
    let sql = "SELECT * FROM users WHERE email = ? OR login = ?";
    let values = [[info.email, info.name]];
    con.query(sql, [info.email, info.name], function (err, result) {  
      if (err) throw err;
      if (result == '')
          resolve('1');
      else 
        resolve('0');
    })
  });
}
module.exports.user_exist = user_exist;

// Fonction de vérification des input lors de la creation, renvoi 1 si tout est ok 0 sinon
const input_verif = async function(info){
  return new Promise((resolve, reject) => {
    let name = ent.encode(info.name);
    let email = ent.encode(info.email);
    let mdp1 = sha1(info.mdp1);
    let mdp2 = sha1(info.mdp2);
//ATTENTION le criptage dois se faire apres et surtout pense a bien enregistrer des mdp en cryopte dqns bdd
    if(!empty(name) && isset(name) && !empty(email) && isset(email) && !empty(mdp1) && isset(mdp1) && !empty(mdp2) && isset(mdp2))
    {
      if (name.length > 50 || email.length > 255 || info.mdp1.length > 50)
         resolve(0);
      if(info.mdp1 !== info.mdp2)
        resolve(0);
      resolve(1);
    }
    else
      resolve(0);
  });
}
module.exports.input_verif = input_verif;

// Fonction pour ajouter les info d un utilisateur une fois que ses dernieres on etaient verifiees
function add_user(info) {
	let uuid = uuidv4();
	let sql = "INSERT INTO users (email, login, password, email_confirmation) VALUES ?";
	const mailOptions = {
		from: 'matcha@matcha.com',
		to: info.email,
		subject: 'MATCHA - Confirme ton addresse mail!',
		html: '<h1>Clique <a href="http://localhost:8080/confirm_email?uuid=' + uuid + '&login=' + info.name + ' ">ici</a> pour confirmer ton email.</h1>'
	};
	transporter.sendMail(mailOptions, function(error, info){
		if (error) {
			console.log(error);
		} else {
			console.log('Email sent: ' + info.response);
}
	});
	console.log(info);
	let values = [[info.email, info.name, info.mdp1, uuid]];
	con.query(sql, [values], function (err, result) {  
	if (err) throw err;  
});  
}
module.exports.add_user = add_user;

// Fonction pour ajouter les info d un utilisateur une fois que ses dernieres on etaient verifiees
function add_infos(info, login) {
  let sql = "UPDATE users SET bio = ?, age = ?, gender = ?, orientation = ? WHERE login = ?";
  let values = [info.bio, info.age, info.gender, info.orientation, login];
  con.query(sql, values, function (err, result) {  
  	if (err) throw err;  
  });  
}
module.exports.add_infos = add_infos;

// Ajout du path de l'image de profil
function add_image(infos, login) {
	let sql = "UPDATE users SET image_1 = ?, profile_picture = image_1 WHERE login = ?";
	let values = ['/images/' + infos.filename, login];
	con.query(sql, values, function (err, result) {  
		if (err) throw err;  
	});  
}
module.exports.add_image = add_image;

// Validation de l'addresse email user
const validation_mail = async function(login, uuid) {
	return new Promise((resolve, reject) => {
		let sql = "SELECT email_confirmation FROM users WHERE login = ?";
	  	con.query(sql, [login], function(err, result){
	    	if(err) throw err;
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
const recup_info = async function(info){
 return new Promise((resolve, reject) =>{
   let sql = "SELECT * FROM users WHERE login = ?";
   con.query(sql, [info], function(err, result){
     if(err) throw err;
     resolve(JSON.stringify(result));
   })
 });
}
module.exports.recup_info = recup_info;