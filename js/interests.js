'use strict'

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
const db_connect = require('../db_connection.js');
let con = db_connect.con;


const topic_exists = async function(topic) {
  return new Promise((resolve, reject) => {
    let sql = "SELECT * FROM interests WHERE topic = ?";
    con.query(sql, [topic], function(err, result) {
      if (err)
        throw err;
      else if (result == '')
        resolve(0);
      else
        resolve(1);
    })
  });
}
module.exports.topic_exists = topic_exists;

const add_topic = function(topic) {
  let sql = "INSERT INTO interests (topic) VALUES ?";
  let values = [[topic]];
  con.query(sql, [values], function(err, result) {
    if (err)
      throw err;
  });
}
module.exports.add_topic = add_topic;

const add_topic_user = function(topic, user_ID) {
  let sql = "UPDATE interests SET `" + user_ID + "` = 1 WHERE `topic` = ?";
  let values = [topic];
  con.query(sql, values, function(err, result) {
    if (err)
      throw err;
  });
}
module.exports.add_topic_user = add_topic_user;

const delete_interest = function(topic, user_ID) {
  let sql = "UPDATE interests SET `" + user_ID + "` = null WHERE `topic` = ?";
  let values = [topic];
  con.query(sql, values, function(err, result) {
    if (err)
      throw err;
  });
}
module.exports.delete_interest = delete_interest;