'use strict'
const express = require('express');
const app = express();


const router = express.Router();
// get(http://www.infowebmaster.fr/outils/generateur-profil-aleatoire.php)

const http = require('http');
const https = require('https');
const grapping = require('./grapping.js');

const options = {
  host: 'http://www.infowebmaster.fr',
  port: 80,
  path: '/outils/generateur-profil-aleatoire.php',
  method: 'GET',
  headers: {
    'Content-Type': 'application/json'
  }
};



router.get('/grapping', async function(req, res){
	grapping.getJSON(options, (statusCode, res) => {
  // I could work with the resulting HTML/JSON here. I could also just return it
  console.log(`onResult: (${statusCode})\n\n${JSON.stringify(result)}`);

  res.statusCode = statusCode;

  res.send(result);
});
}
	)

/**
 * getJSON:  RESTful GET request returning JSON object(s)
 * @param options: http options object
 * @param callback: callback to pass the results JSON object(s) back
 */

module.exports.getJSON = (options, onResult) => {
 
  const port = options.port == 80 ? https : http;

  let output = '';

  const req = port.request(options, (res) => {
    console.log(`${options.host} : ${res.statusCode}`);
    res.setEncoding('utf8');

    res.on('data', (chunk) => {
      output += chunk;
    });

    res.on('end', () => {
      let obj = JSON.parse(output);

      onResult(res.statusCode, obj);
    });
  });

   req.end();
};


module.exports = router;

