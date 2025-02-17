"use client";
import { useState, useEffect } from "react";
import { Chess } from "chess.js";
import { Chessboard } from "react-chessboard";
import { io } from "socket.io-client";

const socket = io("http://localhost:5000"); // Connect to the backend server

const ChessGame = () => {
    const [game, setGame] = useState(new Chess());
    const [gameId, setGameId] = useState(""); // Store the game ID
    const [currentTurn, setCurrentTurn] = useState("white"); // Track whose turn it is

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
        socket.on("connect", () => console.log("Socket connected:", socket.id));

        socket.on("gameCreated", (id) => {
            console.log("Game Created:", id);
            setGameId(id);
        });

        socket.on("gameStarted", (gameState) => {
            console.log("Game Started:", gameState);
            setGame(new Chess(gameState.board));
            setCurrentTurn(gameState.currentTurn);
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
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
            <h1 className="text-2xl font-bold mb-4">Chess Game</h1>
            
            {/* Center the chessboard */}
            <div className="flex justify-center items-center mb-4">
                <div style={{ width: "600px", height: "600px" }}>
                    <Chessboard
                        position={game.fen()}
                        onPieceDrop={onDrop}
                        arePremovesAllowed={false}
                        boardOrientation={currentTurn === "white" ? "white" : "black"} // Rotate board based on turn
                    />
                </div>
            </div>

            {/* Game controls */}
            <div className="mt-4 text-center">
                <button onClick={createGame} className="bg-blue-500 text-white px-4 py-2 rounded mr-2">
                    Create Game
                </button>
                <input
                    type="text"
                    placeholder="Enter Game ID"
                    className="border px-4 py-2 rounded"
                    onChange={(e) => setGameId(e.target.value)}
                />
                <button onClick={joinGame} className="bg-green-500 text-white px-4 py-2 rounded ml-2">
                    Join Game
                </button>
            </div>
        </div>
    );
};

export default ChessGame;
