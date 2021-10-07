const express = require('express');
const session = require('express-session');
const flash = require('express-flash');
const http = require('http');
const socketio = require('socket.io');
const bcrypt = require('bcrypt');
const mongodb = require('mongodb');
const bodyParser = require("body-parser");
const createMsg = require('./createMsg');

const app = express();
const server = http.createServer(app);
const io = socketio(server);
const sessionMiddleware = session({
  secret: '4BD842D8960E56725063430F54A67D5892471DC1F5B7F0A9FCD2FBC9627A3519',
  resave: true,
  saveUninitialized: true,
  cookie: { maxAge: 3 * 3600 * 1000 },
});
const port = 3000;

const url = 'mongodb://localhost:27017/nightowl';
const MongoClient = mongodb.MongoClient;

app.use(express.static(__dirname + '/public/'));
app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(sessionMiddleware);
app.use(flash());
io.use(function(socket, next) {
    sessionMiddleware(socket.request, socket.request.res || {}, next);
});

app.get('/login', (req, res) => {
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.sendFile('/public/html/login.html', { root: __dirname });
});

app.post('/auth', (req, res) => {
  const username = req.body.username;
  MongoClient.connect(url, { useUnifiedTopology: true }, function(err, db){
    if(err){
      res.status(500);
      res.redirect('/error');
    }else{
      var dbo = db.db('nightowl');
      var query = { username: username }
      dbo.collection('mösyö').findOne(query, function(err, result){
        if(err){
          res.status(400);
          res.end();
          db.close();
        }else if(result == null){
          res.status(401);
          res.redirect('/login');
          db.close();
        }else{
          try{
            if(bcrypt.compareSync(req.body.password, result.password)){
                req.session.logged = true;
                req.session.username = username;
                res.redirect('/');
            }else{
              res.status(401);
              res.redirect('/login');
            }
          }catch{
            res.status(500);
            res.redirect('/error');
          }
          db.close();
        }
      });
    }
  });
});

app.get('/', (req, res) => {
  if(req.session.logged){
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    res.sendFile('/public/html/chat.html', { root: __dirname });
  }else{
    res.redirect('/login');
    res.end();
  }
});

app.get('/error', (req, res) => {
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.sendFile('/public/html/error.html', { root: __dirname });
});

io.on('connection', socket => {
  socket.emit('getName', socket.request.session.username);

  socket.on('chatMessage', ({msg, usr}) => {
    const date = new Date();
    var hour = date.getHours();
    var minute;
    if(date.getMinutes() < 10){
      minute = '0' + date.getMinutes();
    }else{
      minute = date.getMinutes();
    }
    const time = hour + ':' + minute;
    const myMsg = createMsg.createMyMessageBox(msg, time);
    const theirMsg = createMsg.createTheirMessageBox(msg, time, usr);
    socket.broadcast.emit('message', theirMsg);
    socket.emit('write', myMsg);
  });

  socket.on('serverLog', (serverMsg) => {
    console.log(serverMsg);
  });

  socket.on('disconnect', () => {
    console.log('User (' + socket.request.session.username + ') disconnected');
  });
});

server.listen(port, () => console.log(`Server running on port: ` + port));
