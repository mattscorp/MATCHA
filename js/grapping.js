'use strict'
const express = require('express');
const app = express();
const bcrypt = require('bcryptjs');
const ent = require('ent');
const multer = require('multer'); // Pour l'upload de photos
const upload = multer({dest: __dirname + '/../public/images'});
const uuidv4 = require('uuid/v4');

const interests = require('../js/interests.js');
const user = require('../js/connect.js');

const download = require('download');

const http = require('http');
const https = require('https');

const fs = require('fs');
const util = require('util');
const readFile = util.promisify(fs.readFile);

const faker = require('faker');
faker.locale = "fr";

const db_connect = require('../db_connection.js');
let con = db_connect.con;
const interets = ["football", "psg", "asm", "basketball", "csgo", "leagueoflegend", "surf", "snowboard", "netflixandchill", "dance", "cinema", "voyage", "asie", "afrique", "amerique", "europe", "australie", "bali", "42", "code", "handball", "lecture", "tarentino", "tamaman", "tonpapa", "enfant", "bdsm", "bondage", "lyon", "marseille", "apple", "usa", "sport", "fitness", "boxe", "babyfoot", "pingpong", "shopping", "randonnees", "montagne", "mer", "matcha", "php", "chien", "chat"];

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

const data_city = async function(filesql_city) {
  let file_data_city = await readFile(filesql_city, 'utf8');
  return new Promise((resolve, reject) => {
    
    const array_city_final = file_data_city.split('\n');
   resolve(array_city_final);
 });
}




//
const ft = async function(nb_compte) {
  let nb = 1;
   while(nb <= nb_compte){
    let uuid = uuidv4();
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
    
    let age = getRandomIntInclusive(18, 120);
    let orientation = getRandomIntInclusive(0, 3);
    let id_ville = getRandomIntInclusive(1, 1773);
      if(orientation == 0)
        orientation = 'Bi';
      if(orientation == 1)
        orientation = 'Femmes';
      if(orientation == 2)
        orientation = 'Hommes';
      if(orientation == 3)
        orientation = 'Autres';
    let fullname = card.name.split(' ');
    let geo_consent = 'Non';



    const city_file = await data_city('./insert_fr_city.sql');

    
    // console.log(city_file[id_ville].split(', ')[18] + ',' + city_file[id_ville].split(', ')[19])
    let departement = city_file[id_ville].split(', ')[0].trim();
    // console.log('dep => '+ departement);
    let loc = city_file[id_ville].split(', ')[19].trim() + ',' + city_file[id_ville].split(', ')[18].trim()  ;
    let bio = card.posts[0].sentence;
    

      let count_hash = 0;
      let hashtag_1 = interets[getRandomIntInclusive(0, 44)];
      while(count_hash < 5)
      {
        let hash_nb = getRandomIntInclusive(0, 44);
        hashtag_1 = hashtag_1 + "," + interets[hash_nb];
        count_hash++;
      }
      let count_clear = 0;
      let raz = count_clear + 1;
      hashtag_1 = hashtag_1.split(",");
      while(hashtag_1[count_clear])
      {
        raz = count_clear + 1;
        while(hashtag_1[raz])
        {
          if(hashtag_1[count_clear] !== hashtag_1[raz])
          {
            raz++;
          }
          else
            hashtag_1[raz] = null;
        }
        count_clear++;
      }
      let filtered = hashtag_1.filter(function (el) {
              return el != null;
            });
     hashtag_1 = filtered.join();


    // On verifie qu'on a pas de char speciaux dans le login, sinon on remplace par '1'
    let login = card.username.replace(/-|_|\.|,|é|è|ê|à|û|ë|ï|ö|ô|ç|'~'/gi, "1") + nb;
    // On insere les donnees dans la db
    let sql = "INSERT INTO users (email, uuid, login, first_name, last_name, password, email_confirmation, localisation_manual, localisation_auto, gender, departement, age, orientation, geo_consent, bio, hashtag) VALUES ?";
    let values = [[card.email, uuid, ent.encode(login), fullname[0], fullname[1], password, email_confirmation, loc, loc, genre, departement, age, orientation, geo_consent, bio, hashtag_1]];
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

    // On verifie si le topic existe, sinon on l'ajoute
    const topic = async function(ft_hashtag, nb1) {
        let topic_exists = await interests.topic_exists(ft_hashtag);
        if (topic_exists == 0) {
            let iChars = "~`!#$%^&*+=-[]\\';,/{}|\":<>?";
            let count_po = 0;
            for (var po = 0; po < ft_hashtag.length; po++) {
              if (iChars.indexOf(ft_hashtag.charAt(po)) != -1)
                 count_po++;
            }
            if (count_po == 0) {
              let sql = "INSERT INTO interests (topic) VALUES ?";
              let values = [[ft_hashtag.toLowerCase()]];
              con.query(sql, [values], function(err, result) {
                if (err)
                  throw err;
                // else
                //   interests.add_topic_user(ft_hashtag, nb1);
              });
          }
        }
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

    const add_topic_async = async function(nb_ok, hashtag_filtered_1) {
        let sql3 = "ALTER TABLE interests ADD `" + nb_ok + "` INT NOT NULL DEFAULT 0";
        con.query(sql3, function(err, result) {
          if (err)
            throw err;
          else {
            let o = 1;
            topic(hashtag_filtered_1[0].toLowerCase(), nb_ok);
            console.log("user : " + nb_ok + " - hashtag : " + hashtag_filtered_1[0].toLowerCase());
            while(hashtag_filtered_1[o])
            {
             console.log("user : " + nb_ok + " - hashtag : " + hashtag_filtered_1[o].toLowerCase());

              topic(hashtag_filtered_1[o].toLowerCase(), nb_ok);
              o++;
            }
          }
        });
    }
   
  let nb_return = await add_topic_async(nb, hashtag_filtered);
  console.log(nb + ' : ajout de ' + login)
  nb++;
  }

}

module.exports.ft = ft;

