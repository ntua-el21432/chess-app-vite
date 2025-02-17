"use client";
import { useState, useEffect } from "react";
import { Chess } from "chess.js";
import { Chessboard } from "react-chessboard";
import { io } from "socket.io-client";

const socket = io("http://localhost:5000"); // Connect to the backend server

const ChessGame = () => {
    const [game, setGame] = useState(new Chess());
    const [gameId, setGameId] = useState(""); // Store the game ID
    const [playerId, setPlayerId] = useState(""); // Store this user's socket ID
    const [opponentId, setOpponentId] = useState(""); // Store opponent's ID
    const [currentTurn, setCurrentTurn] = useState("white"); // Track whose turn it is
    const [playerColor, setPlayerColor] = useState("white"); // Store the player's color

    // Handle game creation
    const createGame = () => {
        socket.emit("createGame");
    };

    // Handle joining a game
    const joinGame = () => {
        if (gameId.trim()) {
            socket.emit("joinGame", gameId);
        } else {
            console.error("Game ID is required!");
        }
    };

    // Handle piece drops (moves)
    const onDrop = (sourceSquare, targetSquare) => {
        const newGame = new Chess(game.fen()); // Clone game state
        const move = newGame.move({
            from: sourceSquare,
            to: targetSquare,
            promotion: "q", // Always promote to queen
        });

        if (move) {
            setGame(newGame); // Update local game state
            socket.emit("makeMove", gameId, { from: sourceSquare, to: targetSquare }); // Send move to server
            return true;
        }
        return false;
    };

    // Listen for server events
    useEffect(() => {
        socket.on("connect", () => {
            console.log("Socket connected:", socket.id);
            setPlayerId(socket.id);
        });

        socket.on("gameCreated", (id) => {
            console.log("Game Created:", id);
            setGameId(id);
            setPlayerColor("white"); // Game creator is always white
        });

        socket.on("gameStarted", ({ board, whitePlayer, blackPlayer }) => {
            console.log("Game Started:", { board, whitePlayer, blackPlayer });
            setGame(new Chess(board));
            setCurrentTurn("white");

            // Determine player's color based on their socket ID
            if (socket.id === whitePlayer) {
                setPlayerColor("white");
                setOpponentId(blackPlayer);
            } else {
                setPlayerColor("black");
                setOpponentId(whitePlayer);
            }
        });

        socket.on("moveMade", (board, turn) => {
            console.log("Move received:", board, turn);
            setGame(new Chess(board));
            setCurrentTurn(turn);
        });

        // Cleanup
        return () => {
            socket.off("connect");
            socket.off("gameCreated");
            socket.off("gameStarted");
            socket.off("moveMade");
        };
    }, []);

    return (
      <div className="flex justify-center items-center h-screen bg-gray-100">
          {/* Main Game Container */}
          <div className="bg-white shadow-lg rounded-lg p-6 flex flex-col items-center justify-center w-full max-w-[50vw] max-h-[50vh]">
              <h1 className="text-2xl font-bold mb-4">Chess Game</h1>
  
              {/* Display Game Info */}
              {gameId && (
                  <div className="mb-4 text-center p-4 bg-gray-200 shadow-md rounded w-full">
                      <p><strong>Game ID:</strong> {gameId}</p>
                      <p><strong>Your ID:</strong> {playerId}</p>
                      <p><strong>Opponent ID:</strong> {opponentId || "Waiting for opponent..."}</p>
                      <p><strong>Your Color:</strong> {playerColor}</p>
                      <p><strong>Turn:</strong> {currentTurn}</p>
                  </div>
              )}
  
              {/* Chessboard - Takes up half screen width & height */}
              <div className="flex justify-center items-center w-full">
                  <div className="w-full max-w-[400px]">
                      <Chessboard
                          position={game.fen()}
                          onPieceDrop={onDrop}
                          arePremovesAllowed={false}
                          boardOrientation={playerColor} // Fixed board orientation for each player
                          customBoardStyle={{ width: "100%", height: "auto" }}
                      />
                  </div>
              </div>
  
              {/* Game Controls */}
              <div className="mt-6 flex flex-col items-center w-full">
                  <div className="flex flex-wrap gap-2 justify-center">
                      <button onClick={createGame} className="bg-blue-500 text-white px-4 py-2 rounded">
                          Create Game
                      </button>
                      <input
                          type="text"
                          placeholder="Enter Game ID"
                          className="border px-4 py-2 rounded w-40"
                          onChange={(e) => setGameId(e.target.value)}
                      />
                      <button onClick={joinGame} className="bg-green-500 text-white px-4 py-2 rounded">
                          Join Game
                      </button>
                  </div>
              </div>
          </div>
      </div>
  );  
};

export default ChessGame;
