const express = require('express');
var app = express();
const session = require('express-session');
const server = require('http').createServer(app);
const io = require('socket.io').listen(server);
const ent = require('ent'); // Permet de bloquer les caractères HTML (sécurité équivalente à htmlentities en PHP)
const bodyParser = require('body-parser'); // Permet de parser
const mysql = require('mysql');
const multer = require('multer'); // Pour l'upload de photos
const upload = multer({dest: __dirname + '/public/images'});

app.set('view engine', 'ejs');
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies
app.use(session({
  secret:'343ji43j4n3jn4jk3n',
  resave: true,
  saveUninitialized: false
}));
app.use(express.static('public'));

//Variable de connexion a la Database

/*  CONEXION MAISON */

  var con = mysql.createConnection({
  host: "localhost",  
  user: "paul",
  password: "42Pourlavie!",
  database: "matcha"
});

/* CONNECTION ECOLE */
/*
var con = mysql.createConnection({
  host: "localhost",
  port: "3306",
  user: "root",
  password: "pvictor",
  database: "db_matcha"
});
*/

//Connexion a la Database
con.connect(function(err) {
  if (err) throw err;
  console.log("Connected!");
});

const user = require('./routes/user.js');
app.use(user);

const messages = require('./routes/messages.js');
app.use(messages);

const swipe = require('./routes/swipe.js');
app.use(swipe);

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
