

var http = require('http').Server(app);
var connect = require('connect');
var express = require('express');
var cookieParser = require('cookie-parser')('secret stuff');
var app = express();

var sessionStore = new connect.middleware.session.MemoryStore();

app.configure(function () {
  app.use(express.static(__dirname + '/public'));
  app.use(cookieParser);
  app.use(express.session({
    store: sessionStore
  }));
});

var server = http.createServer(app);
var io = require('socket.io').listen(server);

var SessionSockets = require('session.socket.io');
var sessionSockets = new SessionSockets(io, sessionStore, cookieParser);

sessionSockets.on('connection', function(err, socket, session){
  console.log(session);
  socket.on('start-game', function(data) {
    startGame();
    console.log
  });
});




function startGame() {
  var data = {
    circles: [{
      top: 0,
      left: 0
    },
    {
      top: 100,
      left: 100
    },{
      top: 200,
      left: 200
    }]
  };
  step();

  function step() {
    for (var i = data.circles.length - 1; i >= 0; i--) {
      data.circles[i].top++;
      data.circles[i].left++;
    };
    io.emit('game-data', data);
    setTimeout(step, 5);
  };
}