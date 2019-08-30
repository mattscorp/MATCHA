const express = require('express');
var app = express();
const session = require('express-session');
const server = require('http').createServer(app);
const io = require('socket.io').listen(server);
const ent = require('ent'); // Permet de bloquer les caractères HTML (sécurité équivalente à htmlentities en PHP)
const bodyParser = require('body-parser'); // Permet de parser
const mysql = require('mysql');
const multer = require('multer'); // Pour l'upload de photos
const upload = multer({dest: __dirname + '/uploads/images'});

const user = require('./users/connect.js');
app.set('view engine', 'ejs');
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies
app.use(session({
  secret:'343ji43j4n3jn4jk3n',
  resave: true,
  saveUninitialized: false
}));
app.use(express.static('uploads'));


//Variable de connexion a la Database


/*  CONEXION MAISON */
/*
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
  password: "pvictor",
  database: "db_matcha"
});


//Connexion a la Database
con.connect(function(err) {
  if (err) throw err;
  console.log("Connected!");
});

// Chargement de la page index.html
app.get('/', async function (req, res) {
  if (req.session.login) {
    const info_user = await user.recup_info(req.session.login);
    const info_parse = JSON.parse(info_user);
    if (info_parse[0].email_confirmation != 1) {
      res.render('confirm_your_email');
    } else if (info_parse[0].bio == null || info_parse[0].age == null || info_parse[0].gender == null || info_parse[0].orientation == null) {
      res.render('info_user', {info: info_parse[0]});
    } else if (info_parse[0].profile_picture == null) {
      res.render('profile_picture', {info:info_parse[0]});
    } else {
      const pic_nb = info_parse[0].profile_picture;
      res.render('account', {info: info_parse[0], profil_pic: pic_nb});
    }
  } else {
    res.sendFile(__dirname + '/index.html');
   }
});

// Confirmation de l'email
app.get('/confirm_email', async function(req, res) {
  const validation_mail = await user.validation_mail(req.query.login, req.query.uuid);
  res.redirect('/');
})

// Chargement de la page creation.html
app.get('/creation', function (req, res) {
   res.sendFile(__dirname + '/creation.html');
});

// POST  de la page index.html
app.post('/', async function(req, res){
  const val_input = await user.connect_input_verif(req.body.user_connect);
  if (val_input == 1) {
    const val_verif = await user.user_connect(req.body.user_connect);
    if(val_verif === 1)
    {
      req.session.login = req.body.user_connect.name;
      const info_user = await user.recup_info(req.session.login);
      const info_parse = JSON.parse(info_user);
    } 
    res.redirect('/');
  }
});

// POST dans creation
app.post('/creation', async function(req, res) {
  const test =  user.user_exist(req.body.user);
  const test2 = await test;
  const input = await user.input_verif(req.body.user);
  if(input > 0 && test2 == '1'){
    user.add_user(req.body.user);
    res.redirect('/');
  }
  else
    res.redirect('/creation');
});

app.post('/info_user', async function(req, res) {
  const update_infos = await user.add_infos(req.body, req.session.login);
  res.redirect('/');
});


// app.post('/profile_picture', upload.single('photo'), async function(req, res) {
//     if(req.file) {
//       const add_image = await user.add_image(req.file, req.session.login);

//       res.redirect('/');
//     }
//     else
//       throw 'error';
// });

app.post('/profile_picture', upload.single('photo'), async function(req, res) {
    if(req.file) {
      const add_image = await user.add_image(req.file, req.session.login);
      res.redirect('/');
    }
    else
      throw 'error';
});

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
