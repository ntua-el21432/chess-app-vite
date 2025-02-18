var Game = require('./game.js');

function Table(whitePlayer, blackPlayer) {
  this.white = whitePlayer;
  this.black = blackPlayer;

  this.game = new Game();
}

module.exports = Table;
