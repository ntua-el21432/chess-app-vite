import { useState, useEffect } from "react";
import { Chess } from "chess.js";
import { Chessboard } from "react-chessboard";
import  io  from "socket.io-client";

// Connect to your server (ensure the URL matches your deployment or local server)
const socket = io("https://chess-app-vite-2.onrender.com");

const ChessGame = () => {
    const [game, setGame] = useState(new Chess());
    const [gameId, setGameId] = useState(""); 
    const[playerColor,setPlayerColor]=useState(null);
    const [currentTurn, setCurrentTurn] = useState("white");
    const [playerId, setPlayerId] = useState("");
    const [opponentId, setOpponentId] = useState("");
    const [statusMessage, setStatusMessage] = useState(""); // For connection status message

    const createGame = () => {
        socket.emit("createGame");
        setStatusMessage("Creating game...");
    };

    const joinGame = () => {
        if (gameId.trim()) {
            socket.emit("joinGame", gameId);
            setStatusMessage("Joining game...");
        } else {
            setStatusMessage("Please enter a valid game ID.");
        }
    };

    const onDrop = (sourceSquare, targetSquare) => {
        const newGame = new Chess(game.fen());
        const move = newGame.move({ from: sourceSquare, to: targetSquare, promotion: "q" });

        if (move) {
            setGame(newGame);
            setCurrentTurn(newGame.turn() === "w" ? "white" : "black"); // Update turn
            socket.emit("makeMove", gameId, { from: sourceSquare, to: targetSquare });
            return true;
        }
        return false;
    };

    // Handle socket events
    useEffect(() => {
        socket.on("connect", () => {
            console.log("Connected:", socket.id);
            setPlayerId(socket.id); // Assign player's unique ID from server
            setStatusMessage(`You are connected as: ${socket.id}`);
        });

        socket.on("gameCreated", (id) => {
            setGameId(id);
            setStatusMessage(`Game created with ID: ${id}`);
        });

        socket.on("gameStarted", (gameState) => {
            setGame(new Chess(gameState.board));
            setPlayerColor(gameState.playerColor);
            setCurrentTurn(gameState.currentTurn);
            setOpponentId(gameState.opponentId || "Waiting for opponent...");
            setStatusMessage("Game started!");
        });

        socket.on("moveMade", (board, turn) => {
            setGame(new Chess(board));
            setCurrentTurn(turn);
            setStatusMessage(`Move made. It's now ${turn}'s turn.`);
        });

        socket.on("error", (message) => {
            setStatusMessage(message); // Display error messages if any
        });

        socket.on("disconnect", () => {
            console.log("Disconnected:", socket.id);
            setStatusMessage("You have been disconnected.");
        });

        return () => {
            socket.off("connect");
            socket.off("gameCreated");
            socket.off("gameStarted");
            socket.off("moveMade");
            socket.off("error");
            socket.off("disconnect");
        };
    }, [gameId]);

    return (
        <div className="flex justify-center items-center h-screen w-screen bg-gray-100">
            <div className="bg-white shadow-lg rounded-lg p-4 flex flex-col items-center" style={{ width: "600px", height: "800px" }}>
                <h1 className="text-lg font-bold mb-2">Chess Game</h1>

                {/* Display Game Info */}
                {gameId && (
                    <div className="mb-4 text-center p-4 bg-white shadow-md rounded w-full max-w-md">
                        <p><strong>Game ID:</strong> {gameId}</p>
                        <p><strong>Your Color:</strong> {playerColor || "Waiting for game to start..."}</p>
                        <p><strong>Your ID:</strong> {playerId}</p>
                        <p><strong>Opponent ID:</strong> {opponentId || "Waiting for opponent..."}</p>
                        <p><strong>Current Turn:</strong> {currentTurn}</p>
                    </div>
                )}

                {/* Display Status Message */}
                {statusMessage && (
                    <div className="text-center text-gray-700 mb-4">
                        <p>{statusMessage}</p>
                    </div>
                )}

                {/* Chessboard */}
                <div style={{ width: "100%", height: "80%" }}>
                    <Chessboard
                        position={game.fen()}
                        onPieceDrop={onDrop}
                        arePremovesAllowed={false}
                        boardOrientation={playerColor} // Fixed orientation based on turn
                        customBoardStyle={{ width: "100%", height: "100%" }}
                    />
                </div>

                {/* Game Controls */}
                <div className="mt-2 flex flex-wrap gap-2 justify-center">
                    <button onClick={createGame} className="bg-blue-500 text-white px-3 py-1 rounded">
                        Create Game
                    </button>
                    <input
                        type="text"
                        placeholder="Enter Game ID"
                        className="border px-2 py-1 rounded w-28"
                        onChange={(e) => setGameId(e.target.value)}
                    />
                    <button onClick={joinGame} className="bg-green-500 text-white px-3 py-1 rounded">
                        Join Game
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ChessGame;
