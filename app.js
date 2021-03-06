var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);



var game = require('./game')(io);
var port = process.env.PORT || 5000;

app.use(express.static(__dirname + '/public'));

http.listen(port, function(){
  console.log('listening on *:' + port);
});

io.on('connection', function(socket){
  console.log('a user connected');
  io.emit('game-init', game.options);
  
  socket.on('start-game', function() {
    game.start();
  });

  socket.on('end-game', function() {
    game.end();
  });

  socket.on('kill', function(id) {
    game.killCircle(id);
  });

  socket.on('add-player', function(player) {
    game.addPlayer(player);
  });

  socket.on('update-player', function(player) {
    game.updatePlayer(player);
  });

  socket.on('remove-player', function(player) {
    game.removePlayer(player);
  });

  socket.on('disconnect', function(){
    console.log(arguments);
    console.log('user disconnected');
    // endGame();
  });
});
