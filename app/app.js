var express = require('express');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;
var util = require('util');
var logger = require('morgan');
var session = require('express-session');
var sessionStore = require('sessionstore');
var bodyParser = require("body-parser");
var cookieParser = require("cookie-parser")
var methodOverride = require('method-override');
var port = process.env.PORT || 3000;
var io = require('socket.io')(http);
var http = require('http').Server(app);
var markers = [];
var server = require('http').createServer(app);
var passportStrategy = require('../utils/passport-strategy');
var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');
var config = require('../oauth.js');
var mongoose = require('mongoose');

// Facebook authentication start

// serialize and deserialize
passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(obj, done) {
  done(null, obj);
});

// config
passport.use(new FacebookStrategy({
  clientID: config.facebook.clientID,
  clientSecret: config.facebook.clientSecret,
  callbackURL: config.facebook.callbackURL
  },
  function(accessToken, refreshToken, profile, done) {
   process.nextTick(function () {
     return done(null, profile);
   });
  }
));

var app = express();

app.configure(function() {
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.logger());
  app.use(express.cookieParser());
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.session({ secret: 'my_precious' }));
  app.use(passport.initialize());
  app.use(passport.session());
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

// routes
app.get('/', routes.index);
app.get('/ping', routes.ping);
app.get('/account', ensureAuthenticated, function(req, res){
  res.render('account', { user: req.user });
});

app.get('/', function(req, res){
  res.render('login', { user: req.user });
});

app.get('/auth/facebook',
passport.authenticate('facebook'),
function(req, res){
});

app.get('/auth/facebook/callback',
passport.authenticate('facebook', { failureRedirect: '/' }),
function(req, res) {
 res.redirect('/account');
});

app.get('/logout', function(req, res){
  req.logout();
  res.redirect('/');
});

// port
app.listen(1337);

// test authentication
function ensureAuthenticated(req, res, next) {
if (req.isAuthenticated()) { return next(); }
res.redirect('/')
}

// Facebook authentication end

// Socket markers start

io.on('connection', function(socket) {
    console.log('a user connected');

    socket.on('marker', function(data) {
      data.socketId = socket.id;
      markers[socket.id] = data;
      console.log('marker latitude: ' + data.lat + ', marker longitude:' + data.lng);
      socket.broadcast.emit('show-marker', data);
    });

    // socket.on('show-marker', )
    socket.on('show-user-location', function(data) {
      socket.broadcast.emit('show-user-location', data);
    });

});

app.listen(port, function(){
  console.log('five minute catch up is on port 3000');
});

// socket markers end

module.exports = server;
