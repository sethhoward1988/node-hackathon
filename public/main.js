Game = function(options) {
  this.init(options);
}

Game.prototype = {

  init: function(options) {
    this.maxCircleRadius = options.maxCircleRadius;
    this.minCircleRadius = options.minCircleRadius;
    this.circleColor = options.circleColor;
    this.svg = d3.select('body').append('svg')
      .attr('width', options.width)
      .attr('height', options.height)
      .attr('class', 'game');
  },

  render: function(data) {
    var that = this;
    var something = this.svg.selectAll('.target')
        .data(data, function(d) { return d.id })

      something
          .attr('cx', function(d) { return d.left; })
          .attr('cy', function(d) { return d.top; })
        .transition().duration(100)
          .attr('r', function(d) {
            var r = that.maxCircleRadius * d.multiplier
            return r < that.minCircleRadius ? that.minCircleRadius : r;
          })

      something.enter().append('circle')
        .attr('class', 'target')
        .attr('r', 0)        
        .attr('fill', this.circleColor)
        .attr('cx', function(d) { return d.left; })
        .attr('cy', function(d) { return d.top; })
        .on('click', function(d) {
          killCircle(d.id);
        });

      something.exit()
          .attr('fill', function(d) {
            return d.color;
          })
        .transition().duration(data.length ? 100 : 3000)
          .attr('r', 0)
          .remove();
  }

}


var socket = io();
var timer = document.getElementById('timer');
var fps = document.getElementById('fps');
var lobby = document.getElementById('lobby');
var lastRequest;
var intervalTimer;
var elapsed;
var player = {
  id: (+new Date()).toString(),
  name: '',
  color: ''
}

socket.emit('add-player', player);

socket.on('game-init', function(data) {
  if(!window.game){
    window.game = new Game(data);
    console.log('initialized game');  
  }
});

socket.on('game-data', function(data) {
  if(!lastRequest){
    lastRequest = new Date();
  } else {
    calculateFps();
  }
  game.render(data.circles);
  timer.textContent = (data.endTime - data.currentTime) / 1000 + ' seconds left';
});

socket.on('player-update', function(players) {
  updatePlayersUI(players);
});

document.getElementById('name').addEventListener('change', function() {
  player.name = this.value;
  socket.emit('update-player', player)
});

document.getElementById('color').addEventListener('change', function() {
  player.color = this.value;
  socket.emit('update-player', player)
});

document.getElementById('start').addEventListener('click', function() {
  socket.emit('start-game');
});

document.getElementById('end').addEventListener('click', function() {
  socket.emit('end-game', null);
});

function killCircle(id) {
  var color = document.getElementById('color').value
  socket.emit('kill', {
    id: id,
    color: color
  });
}

function calculateFps() {
  var current = new Date();
  elapsed = current - lastRequest;
  if(!intervalTimer){
    intervalTimer = setInterval(function(){
      fps.textContent = Math.round(1000 / elapsed) + ' fps';
    }, 100);
  }
  lastRequest = current;
}

function updatePlayersUI(players) {
  lobby.innerHTML = '';
  for(id in players){
    var player = players[id];
    var div = document.createElement('div');
    var color = document.createElement('div');
    color.classList.add('color');
    div.classList.add('player');
    div.textContent = player.name;
    color.style.backgroundColor = player.color;
    div.appendChild(color);
    lobby.appendChild(div);
  }
}

window.addEventListener('unload', function() {
  socket.emit('remove-player', player)
});





