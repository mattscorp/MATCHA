'use strict'

const fs = require('fs');
const util = require('util');
const readFile = util.promisify(fs.readFile);

const db_connect = require('./db_connection.js');
let con = db_connect.con;


const fill_db_fr = async function(filesql_city){

    let file_data_city = await readFile(filesql_city, 'utf8');
   // console.log(file_data_city);
    const array_city = file_data_city.split('\n');
	//console.log(array_city);
//	console.log("ICIIII ===> " + array_city[2]);
  return new Promise((resolve, reject) =>{
    let sql_city = "INSERT INTO `villes_france_free` (`ville_departement`, `ville_slug`, `ville_nom`, `ville_nom_simple`, `ville_nom_reel`, `ville_nom_soundex`, `ville_nom_metaphone`, `ville_code_postal`, `ville_commune`, `ville_code_commune`, `ville_arrondissement`, `ville_canton`, `ville_amdi`, `ville_population_2010`, `ville_population_1999`, `ville_population_2012`, `ville_densite_2010`, `ville_surface`, `ville_longitude_deg`, `ville_latitude_deg`, `ville_longitude_grd`, `ville_latitude_grd`, `ville_longitude_dms`, `ville_latitude_dms`, `ville_zmin`, `ville_zmax`) VALUES (?);"
    let city_info = 0;
 //   console.log("laaaaa=> " + array_city[2]);
    while(array_city[city_info]){
    	let test = array_city[city_info].split(',');
    	 console.log("lUUUUUUUUa=> " + [test]);
    con.query(sql_city, [test], function(err, result) {
                if (err)
                  throw err;
              });
    city_info++;
    }
console.log("La db a bien été créée. rempli");
  });
}


const fille_db_fr_city = fill_db_fr('./insert_fr_city.sql');
