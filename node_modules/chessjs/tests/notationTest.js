var Game = require('../lib/game.js');
var notation = require('../lib/notation.js');

module.exports = {
  setUp: function(callback) {
         this.game = new Game();
         callback();
         },
  testConvertNumericNotation: function(test) {

                                var converted = notation.convert(1213);
                                test.equals(converted.from['x'], 1);
                                test.equals(converted.from['y'], 2);
                                test.equals(converted.to['x'], 1);
                                test.equals(converted.to['y'], 3);

                                console.log(this.game.getState('ascii'));

                                var result = this.game.move(converted.from, converted.to);
                                test.equals(result.code, 1);
                                console.log(this.game.getState('ascii'));
                                test.done();
                              },
  testConvertNumericNotationPromotion: function(test) {
                                /*
                                 * 1: queen
                                 * 2: rook
                                 * 3: bishop
                                 * 4: knight
                                 */
                                var converted = notation.convert(67682);
                                test.equals(converted.from['x'], 6);
                                test.equals(converted.from['y'], 7);
                                test.equals(converted.to['x'], 6);
                                test.equals(converted.to['y'], 8);
                                test.equals(converted.promotion, this.game.rules.ROOK);                              

                                test.done();
                              },
};

