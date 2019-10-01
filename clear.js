'use strict'

const db_connect = require('./db_connection.js');
let con = db_connect.con;

const delete_row = function(){
 const sql_req_del = "SELECT * FROM `interests`";
 //let values_del = [hashtag_verif];
 con.query(sql_req_del, function (err, result) {  
    if (err) throw err;
        else
        {
     
          let row_nb = 0;
          if (result[row_nb]) {
            while (result[row_nb])
            {
              let row_nb2 = row_nb + 1;
              if (result[row_nb2]) {
                while(result[row_nb2]){
                   if(result[row_nb].topic == result[row_nb2].topic)
                  {
                     console.log(" dans le if le nb 1111 ====>" + result[row_nb].topic);
                      console.log(" dans le if le nb 2222 ====>" + result[row_nb2].topic);
                    let del_sql = "DELETE FROM `interests` WHERE `interest_ID` = ?";
                    let inter_ID = [result[row_nb2].interest_ID];
                   con.query(del_sql, [inter_ID], function (err, result) {  
                      if (err) throw err;  
                   });
                  }
                  
                  row_nb2++;
                }
              }
              row_nb++;
          }
        }
         
      }  
    });  
}
let test_del = delete_row();