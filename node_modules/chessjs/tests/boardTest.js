var Board = require('../lib/board.js');
var Tile = require('../lib/tile.js');

module.exports = {
  setUp: function(callback) {
         this.board = new Board(8, 8);
         callback();
         },
  testTileSetup: function(test) {
                   test.equals(this.board.tiles.length, 64);
                   test.done();
                 },
  testGetTile: function (test) {
                var newTile = new Tile(1,1);
                var tile = this.board.getTile(newTile.x, newTile.y);
                test.strictEqual(tile.x, newTile.x);
                test.strictEqual(tile.y, newTile.y);
                test.done();
               }

};
