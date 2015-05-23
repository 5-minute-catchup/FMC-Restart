var express = require('express');
var app = express();
var server = require('http').createServer(app);
var path = require("path")
var port = process.env.PORT || 3000
var http = require('http').Server(app);
var markers = [];
var io = require('socket.io')(http);


app.use(express.static(__dirname + '/'));

app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname + '/app/index.html'));
});

app.get('/mapjs', function(req, res){
  res.sendFile(__dirname + '/app/scripts/map.js');
});

io.on('connection', function(socket){
  console.log('a user connected');
  socket.on('marker', function(data) {
    data.socketId = socket.id;  
    markers[socket.id] = data;
    console.log('marker latitude: ' + data.lat + ', marker longitude:' + data.lng);
    socket.broadcast.emit('show-marker', data);
  });
});

// Session stuff
var passport = require('passport');
var passportStrategy = require('./utils/passport-strategy');
var expressSession = require('express-session');
var sessionStore = require('sessionstore');

app.use(sessionData);

  // Here's the trick, you attach your current session data to the socket using the client cookie as a convergence point.
io.use(function(socket, next){
  sessionData(socket.request, socket.request.res, next);
});

app.use(passport.initialize());
app.use(passport.session());

passport.use(passportStrategy.facebook);

// This part is quite tricky, 

// This part is important, this is the function to get the id of the user in the databse based on the user object.
passport.serializeUser(function(user, done) {
  done(null, user.id);
});


// Here we get the user object based on the user id on the database.
passport.deserializeUser(function(user, done) {
  // this is an example because im using mongo in my original proyect, you need to replace this with something working on postgre to get the user from his ID and pass the complete user object to the "done" function.
  Users.findById(user, function(err, User) {
    done(err, User);
  });
});

// passport needs the 2 functions above to work.

// here you setup your urls to auth with facebook
app.get('/auth/facebook', passport.authenticate('facebook'));
app.get('/auth/facebook/callback', passport.authenticate('facebook', { successRedirect: '/', failureRedirect: '/login' }));

// End of session stuff
http.listen(3000, function(){
  console.log('five minute catch up is on port 3000');
});

module.exports = server;
