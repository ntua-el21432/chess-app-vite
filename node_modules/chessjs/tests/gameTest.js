var Game = require('../lib/game.js');

module.exports = {
  setUp: function(callback) {
         this.game = new Game();
         callback();
         },
  testGameSetup: function(test) {
                   test.ok(this.game.board);
                   test.done();
                 },
  testChangeTurn: function(test) {
                    test.equals(this.game.turn, this.game.rules.STARTING_PLAYER, 'Should start as white');
                    this.game.changeTurn();
                    test.equals(this.game.turn, this.game.rules.BLACK, 'Should be black turn');
                    this.game.changeTurn();
                    test.equals(this.game.turn, this.game.rules.WHITE, 'Should be white turn');
                    test.done();
                  },
};

