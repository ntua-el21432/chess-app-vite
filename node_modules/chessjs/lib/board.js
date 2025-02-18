var Tile = require('./tile.js');

function Board(tilesX, tilesY) {
  this.tiles = this.setupTiles(tilesX, tilesY);
}

Board.prototype.setupTiles = function(tilesX, tilesY) {
  tiles = []
  for (var x = 1; x <= tilesX; ++x) {
    for (var y = 1; y <= tilesY; ++y) {
      tiles.push(new Tile(x, y));
    }   
  }
  return tiles;
};

Board.prototype.getTile = function (x, y) {
  var result = null; 
  this.tiles.forEach(function (tile, index) {
    if (tile.x === x && tile.y === y) {
      result = tile;
    } 
  });
  return result;
};

module.exports = Board;
