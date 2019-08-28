const express = require('express');
var app = express();
const session = require('express-session');
const server = require('http').createServer(app);
const io = require('socket.io').listen(server);
const ent = require('ent'); // Permet de bloquer les caractères HTML (sécurité équivalente à htmlentities en PHP)
const bodyParser = require('body-parser'); // Permet de parser
const mysql = require('mysql');
const sha1 = require('sha1');
const empty = require('is-empty');
const isset = require('isset');
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies
app.use(session({
  secret:'343ji43j4n3jn4jk3n',
  resave: true,
  saveUninitialized: false
}))

//Variable de connexion a la Database

/*
  CONEXION MAISON
  var con = mysql.createConnection({
  host: "localhost",  
  user: "paul",
  password: "42Pourlavie!",
  database: "matcha"
});
*/

/* CONNECTION ECOLE */

var con = mysql.createConnection({
  host: "localhost",
  port: "3306",
  user: "root",
  password: "123456",
  database: "db_matcha"
});

//Connexion a la Database
con.connect(function(err) {
  if (err) throw err;
  console.log("Connected!");
});

// Chargement de la page index.html
app.get('/', async function (req, res){
  if (req.session.login) {
    res.sendFile(__dirname + '/moncompte.html');
 
    console.log(info_user);
    console.log(req.session);
  } else {
    res.sendFile(__dirname + '/index.html');
    console.log(req.session);
   }
});

// Chargement de la page creation.html
app.get('/creation', function (req, res) {
   res.sendFile(__dirname + '/creation.html');
});
// POST  de la page index.html
app.post('/', async function(req, res){
  console.log("envoi des donne en post pour connection");
  const val_input = await connect_input_verif(req.body.user_connect);
  if (val_input == 1) {
    const val_verif = await user_connect(req.body.user_connect);
    console.log(val_input);
    if(val_verif === 1)
    {
      console.log(val_verif);
      req.session.login = req.body.user_connect.name;
      console.log('login de session : ' + req.session.login);
      const info_user = await recup_info(req.session.login);
      console.log("info USER  = " + info_user);
      res.sendFile(__dirname + '/moncompte.html');
      console.log(req.session);
      console.log("connexion de l utilisqter");
    } else {
      res.sendFile(__dirname + '/index.html');
      console.log("non connexion de l user");
    } 
  }
  else {
    res.sendFile(__dirname + '/index.html');
    console.log("non connexion de l user");
  }
});


// POST dans creation
app.post('/creation', async function(req, res) {
   // console.log("le user_exist(req body ==");
    console.log(req.body.user);
    
    const test =  user_exist(req.body.user);
    const test2 = await test;
    const input = await input_verif(req.body.user);
    console.log(test);


  if(input > 0 && test2== '1'){
    add_user(req.body.user);
    res.sendFile(__dirname + '/index.html');
    console.log("ajout dans la BDD");
  }
  else{
    console.log("non ajout dans bdd");
    res.sendFile(__dirname + '/creation.html');
  }


   // Redirige vers /moncompte //
   // res.redirect('/moncompte');
});

// Fonction pour recuperer les info utilisateur

const recup_info = async function(info){
  return new Promise((resolve, reject) =>{
    console.log("les info recu dans recup info" + info);
    let sql = "SELECT * FROM users WHERE login = ?";
    con.query(sql, [info], function(err, result){
      if(err) throw err;
      console.log("result dans recupe info " + result);
      resolve(JSON.stringify(result));
    })
  });
}

// Fonction pour connecter un utilisateur retourne 1 si user OK

const user_connect = async function(info){
  return new Promise((resolve, reject ) => {
    console.log(info);
    let sql = "SELECT * FROM users WHERE login = ?";
    con.query(sql, [info.name], function(err, result){
      if(err) throw err;
      console.log(result);
      if(result != ''){
        if(result[0].password == info.mdp1)
         { 
          console.log('on est dans le 1');
          resolve(1);
         }
      }
      else{
        console.log('on est dans le 2');
        resolve(0);
      }
    })
  });
}

const connect_input_verif = async function(info){
  return new Promise((resolve, reject) =>{
    if(!empty(ent.encode(info.name)) && isset(ent.encode(info.name)) && !empty(ent.encode(info.mdp1)) && isset(ent.encode(info.mdp1)) )
      resolve(1);
    else
      resolve(0);
  });
}

// Fonction pour verifier si un utilisateur existe deja mail ou pseudo retourn 1 si l utilisateur n existe pas 0 sinon
const user_exist = async function(info){
  return new Promise((resolve, reject) => {
    let sql = "SELECT * FROM users WHERE email = ? OR login = ?";
    let values = [[info.email, info.name]];

       console.log('user_exist function');
  con.query(sql, [info.email, info.name], function (err, result) {  
      console.log(result);
      if (err) throw err;
      if (result == '')
        {
          console.log("return 1 il doit");
          resolve('1');
        }
        else
          {console.log("resolve 0 il doit");   
          resolve('0');
        }
  /*
        ;
        //if (result[0].user_ID > 0)
       //   return(0);
  */
    })
  });
}

// Fonction de vérification des input lors de la creation, renvoi 1 si tout est ok 0 sinon
const input_verif = async function(info){
  return new Promise((resolve, reject) => {
    console.log(info);
    let name = ent.encode(info.name);
    let email = ent.encode(info.email);
    let mdp1 = sha1(info.mdp1);
    let mdp2 = sha1(info.mdp2);
//ATTENTION le criptage dois se faire apres et surtout pense a bien enregistrer des mdp en cryopte dqns bdd
    if(!empty(name) && isset(name) && !empty(email) && isset(email) && !empty(mdp1) && isset(mdp1) && !empty(mdp2) && isset(mdp2)){
        if (name.length > 50 || email.length > 255 || info.mdp1.length > 50){
            console.log("trop long");
            resolve(0);
        }
        if(info.mdp1 !== info.mdp2){
            console.log("les mdp ne correspondent pas");
            resolve(0);
        }
        console.log("ca commence a etre ok reste plus qu q verifier bdd");
        resolve(1);
    }
    else{
        console.log("vide klk pqrt");
        resolve(0);
    }
  });
}                                                   



/*
    con.query("SELECT * FROM users WHERE mail = ?", function (err, result, fields) {
        if (err) throw err;
        console.log("CEST LALALALLA")
        console.log(result);
        
    });
*/
 


// Fonction pour ajouter les info d un utilisateur une fois que ses dernieres on etaient verifiees

function add_user(info){

let sql = "INSERT INTO users (email, login, password) VALUES ?";
let values = [[info.email, info.name, info.mdp1]];
console.log(values);
con.query(sql, [values], function (err, result) {  
if (err) throw err;  
console.log("AJOUTER A LA DB !!!");  
});  
}


/*


// Chargement de la page chatroom.html
app.get('/chatroom', function (req, res) {
   res.sendFile(__dirname + '/chatroom.html');
});
// Chargement de la page moncompte.html
app.get('/moncompte', function (req, res) {
   res.sendFile(__dirname + '/moncompte.html');
});

//

                            
// ChatRoom //
io.sockets.on('connection', function (socket, pseudo) {
    // Dès qu'on nous donne un pseudo, on le stocke en variable de session et on informe les autres personnes
    socket.on('nouveau_client', function(pseudo) {
        pseudo = ent.encode(pseudo);
        socket.pseudo = pseudo;
        socket.broadcast.emit('nouveau_client', pseudo);
    });

    // Dès qu'on reçoit un message, on récupère le pseudo de son auteur et on le transmet aux autres personnes
    socket.on('message', function (message) {
        message = ent.encode(message);
        socket.broadcast.emit('message', {pseudo: socket.pseudo, message: message});
    }); 
});
*/
server.listen(8080);
