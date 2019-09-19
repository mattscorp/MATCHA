'use strict'

const db_connect = require('../db_connection.js');
let con = db_connect.con;

// Fonction pour recuperer les interests de l'utilisateur
const recup_notifications = async function(user_ID){
 return new Promise((resolve, reject) => {
   let sql = "SELECT * FROM `notifications` WHERE `notified_ID` = ?";
   con.query(sql, [user_ID], function(err, result){
     if(err) throw err;
     resolve(JSON.stringify(result));
   });
 });
}
module.exports.recup_notifications = recup_notifications;

// Fonction pour ajouter une notification
const notification = async function(infos, liked_ID, motive){
 return new Promise((resolve, reject) => {
   let sql = "INSERT INTO `notifications` (notified_ID, notifier_ID, notifier_first_name, motive, valid_notification) VALUES (?, ?, ?, ?, 1);";
   let values = [liked_ID, infos.user_ID, infos.first_name, motive];
   con.query(sql, values, function(err, result){
     if(err) throw err;
 	});
 });
}
module.exports.notification = notification;

// Retourne les notification non lues pour pouvoir afficher leur nombre dans la navbar
const notifications_number = async function(user_ID){
 return new Promise((resolve, reject) => {
   let sql = "SELECT `notification_ID` FROM `notifications` WHERE `notified_ID` = ? AND `valid_notification` = 1;";
   let values = [user_ID];
   con.query(sql, values, function(err, result){
     if(err) throw err;
     else
     	resolve(result.length);
 	});
 });
}
module.exports.notifications_number = notifications_number;

// Fonction pour marquer une notification comme lue
const delete_notifications = async function(user_ID){
   let sql = "UPDATE `notifications` SET `valid_notification` = 0 WHERE `notified_ID` = ?;";
   let values = [user_ID];
   con.query(sql, values, function(err, result){
     if(err) throw err;
 	});
}
module.exports.delete_notifications = delete_notifications;