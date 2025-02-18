var Rules = require('../lib/rules.js');
var Move = require('../lib/move.js');
var Tile = require('../lib/tile.js');
var Piece = require('../lib/piece.js');
var Game = require('../lib/game.js');

module.exports = {
  setUp: function (callback) {
          this.game = new Game();
          callback();
         },
  testRulesBoardSize: function(test) {
                        rules = new Rules();
                        test.equals(rules.TILES_X, 8);
                        test.equals(rules.TILES_Y, 8);
                        test.done();
                      },
  testBoardBoundries: function (test) {                        
                        var fromTile1 = new Tile(1,1);
                        var fromTile2 = new Tile(1,9);
                        var fromTile3 = new Tile(9,1);
                        var toTile1 = new Tile(9,1);
                        var toTile2 = new Tile(1,9);
                        var toTile3 = new Tile(-10,19);

                        fromTile1.piece = new Piece(this.game.rules.PAWN, this.game.rules.WHITE);
                        fromTile2.piece = new Piece(this.game.rules.PAWN, this.game.rules.WHITE);
                        fromTile3.piece = new Piece(this.game.rules.PAWN, this.game.rules.WHITE);
                        toTile1.piece = new Piece(this.game.rules.PAWN, this.game.rules.BLACK);
                        toTile2.piece = new Piece(this.game.rules.PAWN, this.game.rules.BLACK);

                        var move1 = new Move(fromTile1, toTile1);
                        var move2 = new Move(fromTile2, toTile2);
                        var move3 = new Move(fromTile3, toTile3);

                        var res1 = this.game.rules.validateMove(this.game, move1);
                        var res2 = this.game.rules.validateMove(this.game, move2);
                        var res3 = this.game.rules.validateMove(this.game, move3);

                        test.ok(!res1, "Move invalid");
                        test.ok(!res2, "Move invalid");
                        test.ok(!res3, "Move invalid");
                        test.done();
                      },
  testPawnMovements: function (test) {
                        // move a pawn from starting position
                        var fromTile = this.game.board.getTile(1,2); // white pawn starting position
                        test.equals(fromTile.piece.type, this.game.rules.PAWN, "That's not a pawn.");
                        var validMoves = this.game.rules.findValidMoves(this.game, fromTile);                        
                        test.equals(validMoves.length, 2, "There are two starting moves for a pawn");

                        fromTile = this.game.board.getTile(4,4); // empty tile in the middle of the board
                        fromTile.piece = new Piece(this.game.rules.PAWN, this.game.rules.WHITE);
                        fromTile.piece.startingPosition = false;
                        var validMoves = this.game.rules.findValidMoves(this.game, fromTile);
                        test.equals(validMoves.length, 1, "The pawn has only one move, forward.");

                        var captureAheadLeft = this.game.board.getTile(3,7);
                        var blockedAhead = this.game.board.getTile(4,7); 
                        var captureAheadRight = this.game.board.getTile(5,7);

                        captureAheadLeft.piece = new Piece(this.game.rules.PAWN, this.game.rules.BLACK);
                        blockedAhead.piece = new Piece(this.game.rules.PAWN, this.game.rules.BLACK);
                        captureAheadRight.piece = new Piece(this.game.rules.PAWN, this.game.rules.BLACK);

                        fromTile = this.game.board.getTile(4,6);
                        fromTile.piece = new Piece(this.game.rules.PAWN, this.game.rules.WHITE);
                        fromTile.piece.startingPosition = false;

                        var validMoves = this.game.rules.findValidMoves(this.game, fromTile);
                        test.equals(validMoves.length, 2, "The pawn has only two moves, ATTACK!.");

                        test.done();
                      },
  testKnightMovements: function (test) {
                        // move a knight from starting position
                        var fromTile = this.game.board.getTile(2,1); // white knight starting position
                        test.equals(fromTile.piece.type, this.game.rules.KNIGHT, "That's not a knight.");
                        var validMoves = this.game.rules.findValidMoves(this.game, fromTile);                        
                        test.equals(validMoves.length, 2, "There are two starting moves for a knight");

                        test.done();
                     },
  testKingMovements: function (test) {
                        // move a king from starting position
                        var fromTile = this.game.board.getTile(5,1); // white king starting position
                        test.equals(fromTile.piece.type, this.game.rules.KING, "That's not a king.");
                        var validMoves = this.game.rules.findValidMoves(this.game, fromTile);                        
                        test.equals(validMoves.length, 0, "There are no starting moves for a king");
                        
                        test.done();
                     },
  testEnPassant: function (test) {
                    // en passant
                    var moveList = [
                                    [this.game.board.getTile(6,2), this.game.board.getTile(6,4)], // 0
                                    [this.game.board.getTile(1,7), this.game.board.getTile(1,6)], // 1
                                    [this.game.board.getTile(6,4), this.game.board.getTile(6,5)], // 2
                                    [this.game.board.getTile(7,7), this.game.board.getTile(7,5)], // 3
                                    [this.game.board.getTile(6,5), this.game.board.getTile(7,6)]  // 4 THIS SHOULD BE EN PASSANT
                                   ];
                    for (var i=0;i<moveList.length;++i) {
                      var move = moveList[i];
                      var execution = this.game.move(move[0], move[1]);
                      test.ok(execution.code, "The move wasn't executed!");                      

                      if (execution.code && i===4) {
                        test.ok(execution.move.enPassant, "The move wasn't en passant!");                      
                        test.equals(execution.move.killed.type, this.game.rules.PAWN, "You didn't kill a pawn");                        
                      }
                    }
                    test.expect(7);
                    test.done();
                 },
  testEnPassantForfeit: function (test) {
                          var moveList = [
                                          [this.game.board.getTile(6,2), this.game.board.getTile(6,4)], // 0
                                          [this.game.board.getTile(1,7), this.game.board.getTile(1,6)], // 1
                                          [this.game.board.getTile(6,4), this.game.board.getTile(6,5)], // 2
                                          [this.game.board.getTile(7,7), this.game.board.getTile(7,5)], // 3
                                          [this.game.board.getTile(1,2), this.game.board.getTile(1,3)], // 4
                                          [this.game.board.getTile(6,5), this.game.board.getTile(7,6)]  // 5 EN PASSANT SHOULD FORFEIT
                                         ];

                          for (var i=0;i<moveList.length;++i) {
                            var move = moveList[i];
                            var execution = this.game.move(move[0], move[1]);
                            if (i<5) {
                              if (i === 3) {
                                test.ok(this.game.enPassant, "next move can be en passant");
                              } else {
                                test.ok(!this.game.enPassant, "next move can not be en passant");
                              }
                              test.ok(execution.code, "The move wasn't executed!");                              
                            } else {
                              test.ok(!execution.code, "The move should not be executed");
                            }
                          }

                          test.expect(11);
                          test.done();
                        },
  testRookMovements: function (test) {
                      var rookTile = this.game.board.getTile(1,1);
                      var validMoves = this.game.rules.findValidMoves(this.game, rookTile);
                      test.equals(validMoves.length, 0, "There should be no starting moves for a Rook");

                      var moveList = [
                                      [this.game.board.getTile(1,2), this.game.board.getTile(1,4)], // white
                                      [this.game.board.getTile(1,7), this.game.board.getTile(1,6)], // black
                                      [this.game.board.getTile(1,1), this.game.board.getTile(1,3)], // white
                                      [this.game.board.getTile(1,6), this.game.board.getTile(1,5)], // black
                                      [this.game.board.getTile(1,3), this.game.board.getTile(5,3)], // white
                                      [this.game.board.getTile(2,7), this.game.board.getTile(2,6)], // black
                                      [this.game.board.getTile(5,3), this.game.board.getTile(5,5)], // white
                                      [this.game.board.getTile(2,6), this.game.board.getTile(2,5)], // black
                                      [this.game.board.getTile(5,5), this.game.board.getTile(5,7)] // white
                                     ];

                      for (var i=0;i<moveList.length;++i) {
                        var move = moveList[i];
                        var execution = this.game.move(move[0], move[1]);
                        test.ok(execution.code, "The move should be executed");
                        if (i === 8) {
                          test.ok(execution.move.killed, "Someone died, man.");
                        }
                      }
                      
                      test.expect(11);
                      test.done();
                     },
  testBishopMovements: function (test) {
                        var bishopTile = this.game.board.getTile(3, 1); // bishop start position
                        var validMoves = this.game.rules.findValidMoves(this.game, bishopTile);
                        test.equals(validMoves.length, 0, "There should be no starting moves for a bishop");
                        
                        var moveList = [
                            [this.game.board.getTile(2,2), this.game.board.getTile(2,3)], // white
                            [this.game.board.getTile(1,7), this.game.board.getTile(1,6)], // black
                            [this.game.board.getTile(3,1), this.game.board.getTile(1,3)], // white
                            [this.game.board.getTile(1,6), this.game.board.getTile(1,5)], // black
                            [this.game.board.getTile(1,3), this.game.board.getTile(5,7)] // white
                           ];

                        for (var i=0;i<moveList.length;++i) {
                          var move = moveList[i];
                          var execution = this.game.move(move[0], move[1]);
                          test.ok(execution.code, "The move should be executed");
                          if (i === 4) {
                            test.ok(execution.move.killed, "Someone died, man.");
                          }
                        }
                        test.done();
                       },
  testQueenMovements: function (test) {
                        var queenTile = this.game.board.getTile(4, 1); // queen start position
                        var validMoves = this.game.rules.findValidMoves(this.game, queenTile);
                        test.equals(validMoves.length, 0, "There should be no starting moves for a queen");

                        test.done();
                      }
};
