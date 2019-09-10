'use strict'

const db_connect = require('../db_connection.js');
let con = db_connect.con;

// Fonction pour recuperer les interests de l'utilisateur
const recup_notifications = async function(user_ID){
 return new Promise((resolve, reject) => {
   let sql = "SELECT * FROM `notifications` WHERE '" + user_ID + "' = ?";
   con.query(sql, [user_ID], function(err, result){
     if(err) throw err;
     resolve(JSON.stringify(result));
   })
 });
}
module.exports.recup_notifications = recup_notifications;