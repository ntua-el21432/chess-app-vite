/*
 * WebChess
 * @features for client: realtime, turn-based, single device (2player), multitouch, etc.
 */
var Board = require('./board.js');
var Rules = require('./rules.js');
var Piece = require('./piece.js');
var Move = require('./move.js');

function Game() {
  this.rules = new Rules();
  this.started = new Date();
  this.ended = '';
  
  this.moves = [];
  this.board = new Board(this.rules.TILES_X, this.rules.TILES_Y);
  this.turn = this.rules.STARTING_PLAYER;
  
  this.enPassant = null;
  this.setupGame(this.rules);
};

Game.prototype.setupGame = function (rules) {
  var game = this;
  for (var i = 0; i < rules.START_POSITIONS.length; ++i) {
    var tile = game.board.getTile(rules.START_POSITIONS[i]['position']['x'], rules.START_POSITIONS[i]['position']['y']);
    tile.piece = new Piece(rules.START_POSITIONS[i]['type'], rules.START_POSITIONS[i]['colour']);
  }
};

Game.prototype.move = function (from, to) {
  var result = {};

  var fromTile = this.board.getTile(from['x'], from['y']);
  var toTile = this.board.getTile(to['x'], to['y']);

  var validatedMove = this.rules.validateMove(this, fromTile, toTile);
  if (validatedMove) {
    result.code = 1;
    result.msg = "Move executed";
    result.move = validatedMove.execute(this);
    this.moves.push(result.move);
    this.changeTurn();
  } else {
    result.code = 0;
    result.msg = "Move not executed";
  }
  return result;
}

Game.prototype.changeTurn = function () {
  this.turn = this.turn === this.rules.WHITE ? this.rules.BLACK : this.rules.WHITE;
}

Game.prototype.getState = function (format) {
  var result = '';
  switch (format) {
    case "ascii":
      result = this.printAscii();
      break;
    case "json":
    default:
      result = JSON.stringify(this.board);
      break;
  }
  return result;
}

Game.prototype.printAscii = function () {
  var tiles = this.board.tiles;

  var stringboard = ['--------'];
  var i = 9;
  while (--i>0) {
    var row = [];
    var j = 0;
    while (j++<8) {
      var tile = this.board.getTile(j, i);
      if (tile.piece) {
        var type = tile.piece.type.substring(0,1);
        row.push(type);
      } else {
        row.push('.');
      }
    }
    stringboard.push(row.join(''));
  }
  stringboard.push('--------');

  return stringboard.join('\n');
}
                    
module.exports = Game;
