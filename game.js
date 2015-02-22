module.exports = function(io) {
  return new Game(io);
}

var Game = function(io) {
  this.init(io);
}

Game.prototype = {
  
  timer: null,

  data: {
    circles: []
  },

  players: {},

  options: {
    width: 500,
    height: 500,
    maxCircles: 4,
    maxCircleRadius: 60,
    minCircleRadius: 20,
    initialCircleCount: 4,
    newCircleDelay: 2000,
    stepTimer: 5,
    gameDuration: 30, // in seconds
    endingColor: 'red',
    circleColor: 'gold'
  },

  init: function(io) {
    this.io = io;
    this.gameHelper = new GameHelper(this);
    this.step = this.step.bind(this);
    this.addCircles = this.addCircles.bind(this);
  },

  addPlayer: function(player) {
    console.log('adding ', player);
    this.players[player.id] = player;
  },

  updatePlayer: function(player) {
    console.log('updating player');
    this.players[player.id] = player;
    this.io.emit('player-update', this.players);
  },

  removePlayer: function(player) {
    console.log('removing ', player)
    delete this.players[player.id];
  },

  start: function() {
    if(this.timer){
      return;
    }
    this.data.currentTime = +new Date;
    this.data.endTime = this.data.currentTime + (this.options.gameDuration * 1000);
    for(var i = 0; i < this.options.initialCircleCount - 1; i++){
      this.data.circles.push(this.gameHelper.createCircle());
    }
    this.step();
    this.addCircles();
  },

  step: function() {
    if(new Date > this.data.endTime){
      this.end();
      return;
    }
    this.data.currentTime = +new Date;
    for (var i = this.data.circles.length - 1; i >= 0; i--) {
      // console.log(.direction);
      var circle = this.data.circles[i];
      this.gameHelper.move(circle);
    };
    this.sendData();
    this.timer = setTimeout(this.step, this.options.stepTimer);
  },

  sendData: function() {
    this.io.emit('game-data', this.data);
  },

  addCircles: function() {
    if(this.data.circles.length < this.options.maxCircles){
      this.data.circles.push(this.gameHelper.createCircle());
    }
    setTimeout(this.addCircles, this.options.newCircleDelay);
  },

  end: function() {
    clearTimeout(this.timer);
    var that = this;
    this.data.circles.forEach(function(circle){
      circle.color = that.options.endingColor;
    });
    this.sendData();
    this.data.circles = [];
    this.timer = null;
    this.sendData();
  },

  killCircle: function(data) {
    for(var i = 0; i < this.data.circles.length; i++){
      if(this.data.circles[i].id == data.id){
        this.data.circles[i].color = data.color;
        this.sendData();
        this.data.circles.splice(i, 1);
        console.log('kill shot');
      }
    }
  }
}

var GameHelper = function(game) {
  this.game = game;
}

GameHelper.prototype = {

  circleIdCounter: 0,

  createCircle: function() {
    return {
      multiplier: Math.random(),
      top: Math.floor(Math.random() * this.game.options.height),
      left: Math.floor(Math.random() * this.game.options.width),
      direction: this.possibleDirections[Math.floor(Math.random() * (this.possibleDirections.length))],
      id: (this.circleIdCounter++).toString()
    }
  },

  move: function(circle) {
    this[circle.direction](circle);
  },
  
  possibleDirections: ['northeast','southeast','southwest','northwest'],

  northeast: function(circle) {
    if(circle.top == 0 && circle.left == this.game.options.width){
      circle.direction = 'southwest';
      this.southwest(circle);
    } else if (circle.top == 0) {
      this.rerollSouth(circle);
    } else if (circle.left == this.game.options.width){
      this.rerollWest(circle);
    } else {
      circle.top--;
      circle.left++;  
    }
  },

  northwest: function(circle) {
    if(circle.top == 0 && circle.left == 0){
      circle.direction = 'southeast';
      this.southeast(circle);
    } else if (circle.top == 0) {
      this.rerollSouth(circle);
    } else if (circle.left == 0){
      this.rerollEast(circle);
    } else {
      circle.top--;
      circle.left--;  
    }
  },
  southeast: function(circle) {
    if(circle.top == this.game.options.height && circle.left == this.game.options.width){
      circle.direction = 'northwest';
      this.northwest(circle);
    } else if (circle.top == this.game.options.height) {
      this.rerollNorth(circle);
    } else if (circle.left == this.game.options.width){
      this.rerollWest(circle);
    } else {
      circle.top++;
      circle.left++;
    }
  },
  southwest: function(circle) {
    if(circle.top == this.game.options.height && circle.left == 0){
      circle.direction = 'northeast';
      this.northeast(circle);
    } else if (circle.top == this.game.options.height) {
      this.rerollNorth(circle);
    } else if (circle.left == 0){
      this.rerollEast(circle);
    } else {
      circle.top++;
      circle.left--;
    }
  },

  rerollNorth: function(circle) {
    circle.direction = Math.random() > .5 ? 'northeast' : 'northwest';
    this[circle.direction](circle);
  },

  rerollSouth: function(circle) {
    circle.direction = Math.random() > .5 ? 'southeast' : 'southwest';
    this[circle.direction](circle);
  },

  rerollWest: function(circle) {
    circle.direction = Math.random() > .5 ? 'northwest' : 'southwest';
    this[circle.direction](circle);
  },

  rerollEast: function(circle) {
    circle.direction = Math.random() > .5 ? 'northeast' : 'southeast';
    this[circle.direction](circle); 
  }
}
