function Move(from, to) {
  this.from = from;
  this.to = to;

  this.created = new Date();
  this.execution_time = null;
  this.executed = false;
  this.piece = from.piece || null;
  this.killed = to.piece || null;
  this.enPassant = false;
  this.startingPosition = this.piece.startingPosition;
}

// manipulates state
Move.prototype.execute = function (game) {

  if ((this.to.y-this.from.y) %2 === 0 && this.startingPosition) {
      var doubleAheadLeft = game.board.getTile(this.to.x-1, this.to.y),
          doubleAheadRight = game.board.getTile(this.to.x+1, this.to.y);

      if (doubleAheadLeft && doubleAheadLeft.piece && doubleAheadLeft.piece.colour !== this.from.piece.colour) {
        game.enPassant = this.to;                  
      }

      if (doubleAheadRight && doubleAheadRight.piece && doubleAheadRight.piece.colour !== this.from.piece.colour) {
        game.enPassant = this.to;                  
      }
    
  } else {
    game.enPassant = null;
  }

  this.to.fillTile(this.from.piece);
  this.to.piece.startingPosition = false;
  this.from.clearTile();

  if (this.enPassant) {
    var killed = game.board.getTile(this.to.x, this.from.y);
    this.killed = killed.piece;
    killed.clearTile();
  }

  this.executed = true;
  this.execution_time = new Date();

  return this;
};

module.exports = Move;
