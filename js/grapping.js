'use strict'
const express = require('express');
const app = express();
const bcrypt = require('bcryptjs');
const ent = require('ent');
const multer = require('multer'); // Pour l'upload de photos
const upload = multer({dest: __dirname + '/../public/images'});

const interests = require('../js/interests.js');
const user = require('../js/connect.js');

const download = require('download');

const http = require('http');
const https = require('https');


const faker = require('faker');
faker.locale = "fr";

const db_connect = require('../db_connection.js');
let con = db_connect.con;

//
function getRandomIntInclusive(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min +1)) + min;
}

//
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

//

const topic_exists_1 = function(topic, nb1) {

 let iChars = "~`!#$%^&*+=-[]\\';.,/{}|\":<>?";
 let count = 0;
 for (var i = 0; i < topic.length; i++) {
  if (iChars.indexOf(topic.charAt(i)) != -1)
   count++;
}
if (count == 0) {
  let sql = "SELECT * FROM interests WHERE topic = ?";
  con.query(sql, [topic], function(err, result) {
    if (err)
      throw err;
    else if (result == '' || result == 0){

      console.log(" return 0 result dans topic exist " + result);

      let sql = "INSERT INTO interests (topic) VALUES ?";
      let values = [[topic]];
      con.query(sql, [values], function(err, result) {
        if (err)
          throw err;
        else{
                  //    interests.add_topic_user(topic, nb1);
                  let sql = "UPDATE interests SET `" + nb1 + "` = 1 WHERE `topic` = ?";
                  let values = [topic];
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
                      values = [nb1];
                      con.query(sql, values, function(err, result) {
                        if (err)
                          throw err;
                        else {
                          let hashtag = "";
                          if (result[0].hashtag != null && result[0].hashtag != '') {
                            hashtag = result[0].hashtag.split(',');
                            if (!hashtag.includes(topic))
                              hashtag.push(topic);
                            hashtag.join();
                          }
                          else
                            hashtag =  topic;
                          sql = "UPDATE `users` SET `hashtag` = '" + hashtag + "' WHERE `user_ID` = ?"
                          values = [nb1];
                          con.query(sql, values, function(err, result) {
                            if (err)
                              throw err;
                          });
                        }
                      });
                    }
                  });
    }
    else{
  console.log(" return 1 result dans topic exist " + result[0]);
}
  });
 // delete_row(topic);
}

}


const add_topic_async = function(nb_ok, hashtag_filtered_1) {
      let sql3 = "ALTER TABLE interests ADD `" + nb_ok + "` INT NOT NULL DEFAULT 0";
      con.query(sql3, function(err) {
        let o = 1;
        topic_exists_1(hashtag_filtered_1[0], nb_ok);
       
        console.log("user : " + nb_ok + " - hashtag : " + hashtag_filtered_1[0]);
        while(hashtag_filtered_1[o])
        {
        console.log("user : " + nb_ok + " - hashtag : " + hashtag_filtered_1[o]);
        topic_exists_1(hashtag_filtered_1[o], nb_ok);
     //   delete_row(hashtag_filtered_1[o]);
          o++;
        }
      });
    }

//
const ft = async function() {
  let nb = 1;
   while(nb < 510){
    //Initialisatino des variables
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
    // On separe les hashtags
    let hashtag = card.company.catchPhrase.split(' ');
    let y = 1;
    // On filtre les hashtag pour virer les char speciaux
    let iChars = "~`!#$%^&*+=-[]\\';,/{}|\":<>?";
    let count = 0;
    for (var f = 0; f < hashtag[0].length; f++) {
      if (iChars.indexOf(hashtag[0].charAt(f)) != -1)
             count++;
    }
    let hashtag_1 = "";
    if (count == 0)
      hashtag_1 = hashtag[0];
    // On assemble les hashtags
    while(hashtag[y])
    {
      count = 0;
      for (var f = 0; f < hashtag[y].length; f++) {
        if (iChars.indexOf(hashtag[y].charAt(f)) != -1)
           count++;
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
    let login = card.username.replace(/-|_|\.|,|é|è|ê|à|û|ë|ï|ö|ô|ç|'~'/gi, "1") + nb;
    // On insere les donnees dans la db
    let sql = "INSERT INTO users (email, login, first_name, last_name, password, email_confirmation, localisation_manual, localisation_auto, gender, departement, age, orientation, geo_consent, bio, hashtag) VALUES ?";
    let values = [[card.email, ent.encode(login), fullname[0], fullname[1], password, email_confirmation, loc, loc, genre, departement, age, orientation, geo_consent, bio, hashtag_1]];
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

    
    let hashtag_filtered = hashtag_1.split(',');
     //
    const add_new_image = async function(user_ID_photo) {
      const sql_req = "UPDATE users SET image_1 = ? WHERE user_ID = ?";
      const sql_req2 = "UPDATE users SET profile_picture = ? WHERE user_ID = ?";
        let values = ['/images/' + user_ID_photo + '/480.jpg', user_ID_photo];
      con.query(sql_req, values, function (err, result) {  
        if (err) throw err;  
      });  
      con.query(sql_req2, values, function (err, result) {  
        if (err) throw err;  
      });  
    }
    let picture = faker.image.imageUrl();
    add_new_image(nb);
    download(picture, './public/images/' + nb).then(() => {
    });
  
   
  add_topic_async(nb, hashtag_filtered);
  
  console.log(nb + ' : ajout de ' + login)
  nb++;
  }

}

module.exports.ft = ft;
