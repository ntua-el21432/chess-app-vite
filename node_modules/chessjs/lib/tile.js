function Tile(x, y) {
  this.x = x;
  this.y = y;

  this.piece = null;
}

Tile.prototype.clearTile = function () {
  this.piece = null;
};

Tile.prototype.fillTile = function (piece) {
  this.piece = piece;
};

module.exports = Tile;
