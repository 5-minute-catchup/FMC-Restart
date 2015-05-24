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

app.get('/login', function(req, res) {
  res.sendfile('views/login.html');
});

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
