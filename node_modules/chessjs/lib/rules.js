var Move = require('./move.js');

function Rules() {
  this.TILES_X = 8;
  this.TILES_Y = 8;

  this.WHITE = 'white';
  this.BLACK = 'black';

  this.STARTING_PLAYER = this.WHITE;

  this.PAWN = 'pawn';
  this.ROOK = 'rook';
  this.BISHOP = 'bishop';
  this.KING = 'king';
  this.QUEEN = 'queen';
  this.KNIGHT = 'knight';

  this.START_POSITIONS = [
      {'colour':this.BLACK,'type':this.ROOK, 'position': {'x': 1, 'y':8}},
      {'colour':this.BLACK,'type':this.KNIGHT, 'position': {'x': 2, 'y':8}},
      {'colour':this.BLACK,'type':this.BISHOP, 'position': {'x': 3, 'y':8}},
      {'colour':this.BLACK,'type':this.QUEEN, 'position':  {'x': 4, 'y':8}},
      {'colour':this.BLACK,'type':this.KING, 'position': {'x': 5, 'y':8}},
      {'colour':this.BLACK,'type':this.BISHOP, 'position': {'x': 6, 'y':8}},
      {'colour':this.BLACK,'type':this.KNIGHT, 'position':  {'x': 7, 'y':8}},
      {'colour':this.BLACK,'type':this.ROOK, 'position': {'x': 8, 'y':8}},
      {'colour':this.BLACK,'type':this.PAWN, 'position': {'x': 1, 'y':7}},
      {'colour':this.BLACK,'type':this.PAWN, 'position': {'x': 2, 'y':7}},
      {'colour':this.BLACK,'type':this.PAWN, 'position': {'x': 3, 'y':7}},
      {'colour':this.BLACK,'type':this.PAWN, 'position': {'x': 4, 'y':7}},
      {'colour':this.BLACK,'type':this.PAWN, 'position': {'x': 5, 'y':7}},
      {'colour':this.BLACK,'type':this.PAWN, 'position': {'x': 6, 'y':7}},
      {'colour':this.BLACK,'type':this.PAWN, 'position': {'x': 7, 'y':7}},
      {'colour':this.BLACK,'type':this.PAWN, 'position': {'x': 8, 'y':7}},
      {'colour':this.WHITE,'type':this.ROOK, 'position': {'x': 1, 'y':1}},
      {'colour':this.WHITE,'type':this.KNIGHT, 'position': {'x': 2, 'y':1}},
      {'colour':this.WHITE,'type':this.BISHOP, 'position': {'x': 3, 'y':1}},
      {'colour':this.WHITE,'type':this.QUEEN, 'position': {'x': 4, 'y':1}},
      {'colour':this.WHITE,'type':this.KING, 'position': {'x': 5, 'y':1}},
      {'colour':this.WHITE,'type':this.BISHOP, 'position': {'x': 6, 'y':1}},
      {'colour':this.WHITE,'type':this.KNIGHT, 'position': {'x': 7, 'y':1}},
      {'colour':this.WHITE,'type':this.ROOK, 'position': {'x': 8, 'y':1}},
      {'colour':this.WHITE,'type':this.PAWN, 'position': {'x': 1, 'y':2}},
      {'colour':this.WHITE,'type':this.PAWN, 'position': {'x': 2, 'y':2}},
      {'colour':this.WHITE,'type':this.PAWN, 'position': {'x': 3, 'y':2}},
      {'colour':this.WHITE,'type':this.PAWN, 'position': {'x': 4, 'y':2}},
      {'colour':this.WHITE,'type':this.PAWN, 'position': {'x': 5, 'y':2}},
      {'colour':this.WHITE,'type':this.PAWN, 'position': {'x': 6, 'y':2}},
      {'colour':this.WHITE,'type':this.PAWN, 'position': {'x': 7, 'y':2}},
      {'colour':this.WHITE,'type':this.PAWN, 'position': {'x': 8, 'y':2}}
    ];
  
};

Rules.prototype.findValidMoves = function (game, from) {

  var validMoves = [];

  if (!from.piece) {
    // just return the empty set; there are no valid moves if there is no piece
    // on the tile we are looking at.
    return validMoves;
  }
  
  switch (from.piece.type) {
    case this.PAWN:
      // pawns can move two steps forward from starting position, otherwise just one step up, up-left or up-right
      var offsets = {'black':-1, 'white':1};

      // promotion not implemented!
      if (game.enPassant) {
        var enPassant = new Move(from, game.board.getTile(game.enPassant.x, from.y+offsets[from.piece.colour]));          
        enPassant.enPassant = true;
        validMoves.push(enPassant);
      } 
      
      var ahead = game.board.getTile(from.x, from.y+offsets[from.piece.colour]);
      if (ahead && !ahead.piece) {
        validMoves.push(new Move(from, ahead));
      }

      var aheadLeft = game.board.getTile(from.x-offsets[from.piece.colour], from.y+offsets[from.piece.colour]);
      if (aheadLeft && aheadLeft.piece && aheadLeft.piece.colour !== from.piece.colour) {
        validMoves.push(new Move(from, aheadLeft));
      }
      
      var aheadRight = game.board.getTile(from.x+offsets[from.piece.colour], from.y+offsets[from.piece.colour]);
      if (aheadRight && aheadRight.piece && aheadRight.piece.colour !== from.piece.colour) {
        validMoves.push(new Move(from, aheadRight));
      }
      
      var doubleAhead = game.board.getTile(from.x, from.y+offsets[from.piece.colour]*2);
      if (doubleAhead && from.piece.startingPosition == true && !doubleAhead.piece) {
        validMoves.push(new Move(from, doubleAhead));
      }

      break;
    case this.ROOK:
      var offsets = this.straightMovement(from);
      validMoves = this.getValidMoves(game, from, offsets);

      break;
    case this.KNIGHT:
      var offsets = [
        {'x':-2, 'y':1},
        {'x':-1, 'y':2},
        {'x':1, 'y':2},
        {'x':2, 'y':1},
        {'x':2, 'y':-1},
        {'x':1, 'y':-2},
        {'x':-1, 'y':-2},
        {'x':-2, 'y':-1}
      ];

      var i = offsets.length;
      while (i--) {
        var candidate = game.board.getTile(from.x+offsets[i].x, from.y+offsets[i].y);
        if (candidate && (!candidate.piece || candidate.piece.colour != from.piece.colour)) {
          validMoves.push(new Move(from, candidate));
        } 
      }
      break;
    case this.BISHOP:
      var offsets = this.diagonalMovement(from);
      validMoves = this.getValidMoves(game, from, offsets);

      break;
    case this.QUEEN:
      var offsets = this.diagonalMovement(from);
      validMoves.concat(this.getValidMoves(game, from, offsets)); 
          
      offsets = this.straightMovement(from);
      validMoves = validMoves.concat(this.getValidMoves(game, from, offsets)); 

      break;
    case this.KING:
      var offsets = [
        {'x': 0, 'y':1},  
        {'x': 1, 'y':1},  
        {'x': 1, 'y':0},  
        {'x': 1, 'y':-1},  
        {'x': 0, 'y': -1},  
        {'x': -1, 'y': -1},  
        {'x': -1, 'y': 0},  
        {'x': -1, 'y': 1},  
      ]
      var i = offsets.length; 
      while (i--) {
        var candidate = game.board.getTile(from.x+offsets[i].x, from.y+offsets[i].y);
        if (candidate && (!candidate.piece || candidate.piece.colour != from.piece.colour)) {
          validMoves.push(new Move(from, candidate));
        } 
      }
      break;
    default:
      break;
  }

  return validMoves;
};

Rules.prototype.validateMove = function (game, fromTile, toTile) {
  var result;

  var validMoves = this.findValidMoves(game, fromTile);
  var i = validMoves.length;

  if (fromTile.piece && game.turn === fromTile.piece.colour) {
    while (i--) {
      if (fromTile === validMoves[i].from 
          && toTile === validMoves[i].to) {
        result = validMoves[i];
        break;
      }
    }
  }

  return result;
};

Rules.prototype.straightMovement = function (from) {
  var offsets = {
    'pos_x': [],
    'neg_x': [],
    'pos_y': [],
    'neg_y': []
  };

  // x direction
  var x = from.x,
    offset = 1;

  while (offset+x <= this.TILES_X) {
    offsets['pos_x'].push({'x':offset, 'y':0});
    offset++;
  }

  x = from.x,
    offset = -1;
  while (offset-x > 0) {
    offsets['neg_x'].push({'x':offset, 'y':0});
    offset--;
  }

  // y direction
  y = from.y,
    offset = 1;
  while (offset+y <= this.TILES_Y) {
    offsets['pos_y'].push({'x':0, 'y':offset});
    offset++;
  }

  y = from.y,
    offset = -1;
  while (offset-y > 0) {      
    offsets['neg_y'].push({'x':0, 'y':offset});
    offset--;
  }

  return offsets;
}

Rules.prototype.diagonalMovement = function (from) {
  var offsets = {
    'pos_xy': [],
    'neg_xy': [],
    'pos_y_neg_x': [],
    'neg_y_pos_x': []
  };

  // positive x and y
  var x = from.x,
    y = from.y,
    offset = 1;

  while (offset+x <= this.TILES_X && offset+y <= this.TILES_Y) {
    offsets['pos_xy'].push({'x':offset, 'y':offset});
    offset++;
  }

  // negative x and y
  x = from.x,
    y = from.y,
    offset = -1;

  while (offset-x > 0 && offset-y > 0) {
    offsets['neg_xy'].push({'x':offset, 'y':offset});
    offset--;
  }

  // y direction
  y = from.y,
    x = from.x,
    offset_x = 1,
    offset_y = -1;

  while (offset_x+x <= this.TILES_X && offset_y+y > 0) {
    offsets['neg_y_pos_x'].push({'x':offset_x, 'y':offset_y});
    offset_x++;
    offset_y--;
  }

  y = from.y,
    x = from.x,
    offset_x = -1,
    offset_y = 1;

  while (offset_y+y <= this.TILES_Y && offset_x+x > 0) {
    offsets['pos_y_neg_x'].push({'x':offset_x, 'y':offset_y});
    offset_y++;
    offset_x--;
  }

  return offsets;
}

Rules.prototype.getValidMoves = function (game, from, offsets) {
  var validMoves = [];
  for (var direction in offsets) {
    var max = offsets[direction].length,
        i = 0;

    while (i<max) {
      var candidate = game.board.getTile(from.x+offsets[direction][i].x, from.y+offsets[direction][i].y);
      if (candidate && candidate.piece && candidate.piece.colour !== from.piece.colour) {
        // capture, we can't move further
        validMoves.push(new Move(from, candidate));
        break;
      } else if (candidate && !candidate.piece) {
        // why, we have a tile, but it's empty, so we can continue forward
        validMoves.push(new Move(from, candidate));
      } else {
        // no candidate, or there is something in the way.
        break;
      }
      i++;
    }
  }
  return validMoves;
}

module.exports = Rules;
