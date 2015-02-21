Game = function() {
  this.init();
}

Game.prototype = {

  init: function() {
    this.svg = d3.select('body').append('svg')
      .attr('width', 500)
      .attr('height', 500)
      .attr('class', 'game');
  },

  render: function(data) {
    var something = this.svg.selectAll('.target')
        .data(data)

      something
        .attr('r', 30)
        .attr('cx', function(d) { return d.left; })
        .attr('cy', function(d) { return d.top; })

      something.enter().append('circle')
        .attr('class', 'target')
        .attr('r', 0)
        .attr('fill', 'red')
        .attr('cx', function(d) { return d.left; })
        .attr('cy', function(d) { return d.top; })
        .on('click', function(d) {
          console.log('you clicked me!');
        });
  }

}


var socket = io();
var game = new Game;

socket.emit('start-game', null);

socket.on('game-data', function(data) {
  game.render(data.circles);
});