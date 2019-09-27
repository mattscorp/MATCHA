'use strict'
const express = require('express');
const app = express();
const bcrypt = require('bcryptjs');
const ent = require('ent');
const multer = require('multer'); // Pour l'upload de photos
const upload = multer({dest: __dirname + '/../public/images'});
const router = express.Router();
// const download = require('image-downloader'); /// a enlever !
const interests = require('../js/interests.js');
const user = require('../js/connect.js');
const fs = require('fs');
const download = require('download');

const http = require('http');
const https = require('https');

const faker = require('faker');
faker.locale = "fr";

const db_connect = require('../db_connection.js');
let con = db_connect.con;

function getRandomIntInclusive(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min +1)) + min;
}
const ft_pass = async function(){
 return new Promise((resolve, reject ) => {
    let saltRounds = 12;
    bcrypt.hash(ent.encode('paulVICTOR@42'), saltRounds, function (err, hash) {
       if (err) throw err;
       else
        resolve(hash);
    });
  });
}

const add_new_image = async function(user_ID) {
  const sql_req = "UPDATE users SET image_1 = ? WHERE user_ID = ?";
  const sql_req2 = "UPDATE users SET profile_picture = ? WHERE user_ID = ?";
    let values = ['/images/' + user_ID + '/480.jpg', user_ID];
  con.query(sql_req, values, function (err, result) {  
    if (err) throw err;  
  });  
  con.query(sql_req2, values, function (err, result) {  
    if (err) throw err;  
  });  
}

const ft = async function() {
  let i = 0;
  //while(i < 666){
  let password =  await ft_pass();
  let email_confirmation = 1;
  let genre = getRandomIntInclusive(0, 2);
    if(genre == 0)
      genre = 'Homme';
    if(genre == 1)
      genre = 'Femme';
    if(genre == 2)
      genre = 'Autre';
 

  let card = faker.helpers.createCard();
  
  let departement = getRandomIntInclusive(1, 98);
  let age = getRandomIntInclusive(18, 120);

  let orientation = getRandomIntInclusive(0, 3);
    if(orientation == 0)
      orientation = 'Bi';
    if(orientation == 1)
      orientation = 'Femmes';
    if(orientation == 2)
      orientation = 'Hommes';
    if(orientation == 3)
      orientation = 'Autres';
  let fullname = card.name.split(' ');
  let geo_consent = 'Oui';
  let loc = card.address.geo.lat + ',' + card.address.geo.lng;
  let bio = card.posts[0].sentence;
  let hashtag = card.company.catchPhrase.split(' ');
  let y = 1;


  let iChars = "~`!#$%^&*+=-[]\\';,/{}|\":<>?";
  let count = 0;
  for (var f = 0; f < hashtag[0].length; f++) {
    if (iChars.indexOf(hashtag[0].charAt(f)) != -1)
           count++;
  }
  let hashtag_1 = "";
  if (count == 0)
    hashtag_1 = hashtag[0];
  while(hashtag[y])
  {
    count = 0;
    for (var f = 0; f < hashtag[y].length; f++) {
      if (iChars.indexOf(hashtag[y].charAt(f)) != -1)
         count++;
       console.log('TOTOTOTOTOT' + iChars.indexOf(hashtag[y].charAt(f)));
       console.log('TOTOTOT' + count);

    }
    if (count == 0) {
      if (hashtag_1 != "")
        hashtag_1 = hashtag_1 + ',' + hashtag[y];
      else
        hashtag_1 = hashtag[y];
    }
    y++;
  }
  // On verifie qu'on a pas de char speciaux dans le login, sinon on remplace par '1'
  let login = card.username.replace(/-|_|\.|,|'~'/gi, "1");

  let sql = "INSERT INTO users (email, login, first_name, last_name, password, email_confirmation, localisation_manual, localisation_auto, gender, departement, age, orientation, geo_consent, bio, hashtag) VALUES ?";
  let values = [[card.email, login, fullname[0], fullname[1], password, email_confirmation, loc, loc, genre, departement, age, orientation, geo_consent, bio, hashtag_1]];
   con.query(sql, [values], function (err, result) {  
    if (err) throw err;  
  
  });  

// Fonction pour recuperer les info utilisateur
const recup_info_sans_ent = async function(login){
 return new Promise((resolve, reject) =>{
   let sql = "SELECT `user_ID`, `last_name`, `first_name`, `login`, `hashtag`, `email`, `localisation_auto`, `localisation_manual`, `gender`, `orientation`, `age`, `bio`, `image_1`, `image_2`, `image_3`, `image_4`, `image_5`, `profile_picture`, `score`, `geo_consent`, `departement`, `email_confirmation` FROM users WHERE login = ?";
   con.query(sql, [login], function(err, result){
     if(err) throw err;
     resolve(JSON.stringify(result));
   })
 });
}

const topic = async function(hashtag, login) {
  console.log("hhhhhh====> " + login);
    let topic_exists = await interests.topic_exists(hashtag);
    let info_user = await recup_info_sans_ent(login);
    console.log('**************' + info_user);
    let info_parse = JSON.parse(info_user);
    if (topic_exists == 0)
      interests.add_topic(hashtag);
    interests.add_topic_user(hashtag, info_parse[0].user_ID);

}



let sql_user = "SELECT user_ID FROM users WHERE login = ?"
let val = [login];
let hashtag_filtered = hashtag_1.split(',');
con.query(sql_user, [val], function (err, result) {  
  if (err) throw err;

let picture = faker.image.imageUrl();
console.log(picture);
console.log(result[0].user_ID);
download(picture, './public/images/'+result[0].user_ID).then(() => {
   
    console.log('done!');
    console.log(result[0].user_ID);
    

    add_new_image(result[0].user_ID);

    console.log('BDDDDDDDDDD');
});
  let sql3 = "ALTER TABLE interests ADD `" + result[0].user_ID + "` INT NOT NULL DEFAULT 0";
  con.query(sql3, result[0].user_ID, function(err, result) {
    if (err) throw err;
  });
  let o = 1;
  topic(hashtag_filtered[0], login);
  while(hashtag_filtered[o])
  {
    topic(hashtag_filtered[o], login);
    o++;
  }
});  






  

 //hashtag.join();
 // console.log('hashtaggg ======> ' + hashtag_ok);
  
//  console.log('nio============> '+ bio);
  



 


  
/*
const options = {
  url: picture,
  dest: '/public/images'
}
 
async function downloadIMG() {
  try {
    const { filename, image } = await download.image(options)
    var add_new_image = add_new_image(filename, card.username);
    console.log(filename) // => /path/to/dest/image.jpg
  } catch (e) {
    console.error(e)
  }
}
 
downloadIMG()

*/


 



  console.log(card);
 // console.log('image =======>>>> ' + picture);
  console.log(values);
}

ft();
/*
  let values = [[randomEmail, randomlogin, randomfirstName, randomlastName, hash, email_confirmation, loc, ]];
    con.query(sql, [values], function (err, result) {  
     if (err) throw err;


  i++;
}
*/

module.exports = router;