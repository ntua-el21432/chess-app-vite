import { useState, useEffect } from "react";
import { Chess } from "chess.js";
import { Chessboard } from "react-chessboard";
import  io  from "socket.io-client";

// Connect to server 
const socket = io("https://chess-app-vite-2.onrender.com");

const ChessGame = () => {
    const [game, setGame] = useState(new Chess());
    const [gameId, setGameId] = useState(""); 
    const [currentTurn, setCurrentTurn] = useState("white");
    const [playerId, setPlayerId] = useState("");
    const [assignedColor, setAssignedColor] = useState("");
    const [isCheck, setIsCheck] = useState(false);
    const [isCheckmate, setIsCheckmate] = useState(false);  
    const [opponentId, setOpponentId] = useState("");
    const [boardOrientation, setBoardOrientation] = useState("white");
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
        const piece = game.get(sourceSquare);
        // Ensure the selected piece belongs to the player
        if (!piece || (assignedColor === "white" && piece.color !== "w") || (assignedColor === "black" && piece.color !== "b")) {
            setStatusMessage("You cannot move your opponent's pieces!");
            return false;
        }

        if ((assignedColor === "white" && game.turn() !== "w") || 
            (assignedColor === "black" && game.turn() !== "b")) {
            setStatusMessage("It's not your turn!");
            return false;
        }
    
        const newGame = new Chess(game.fen());
        const move = newGame.move({ from: sourceSquare, to: targetSquare, promotion: "q" });
    
        if (move) {
            setGame(newGame);
            setCurrentTurn(newGame.turn() === "w" ? "white" : "black");
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
            setCurrentTurn(gameState.currentTurn);
            setAssignedColor(gameState.assignedColor);
            setBoardOrientation(gameState.boardOrientation);
            setOpponentId(gameState.opponentId || "Waiting for opponent...");
            setStatusMessage("Game started!");
        });

        socket.on("moveMade", (data) => {
            console.log("Move received from server:", data); // <-- Debugging
            setGame(new Chess(data.board));
            setCurrentTurn(data.currentTurn);
            setIsCheck(data.isCheck);
            setIsCheckmate(data.isCheckmate);
            setStatusMessage(`Move made. It's now ${data.currentTurn}'s turn.`);
        });
        socket.on("updatePlayers", (players) => {
            setOpponentId(players.white === socket.id ? players.black : players.white);
        });

        socket.on("GameOver", (data) => {
            setIsCheckmate(true);
            setStatusMessage(`Game Over! ${data.winner} wins by checkmate.`);
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
            socket.off("updatePlayers");
            socket.off("GameOver");
            socket.off("error");
            socket.off("disconnect");
        };
    }, [gameId]);

    const flipBoard= () => {
        setBoardOrientation(prev=> (prev === "white" ? "black" : "white"));
    };

     // Highlight king when in check
     const getSquareStyles = () => {
        const styles = {};
        if (isCheck) {
            const kingPos = game.turn() === "w" ? game.board().flat().find(piece => piece?.type === "k" && piece.color === "w")?.square :
                game.board().flat().find(piece => piece?.type === "k" && piece.color === "b")?.square;
            if (kingPos) {
                styles[kingPos] = { backgroundColor: "red" };
            }
        }
        return styles;
    };


    return (
        <div className="flex justify-center items-center h-screen w-screen bg-gray-100">
            <div className="bg-white shadow-lg rounded-lg p-4 flex flex-col items-center" style={{ width: "600px", height: "800px" }}>
                <h1 className="text-lg font-bold mb-2">Chess Game</h1>

                {/* Display Game Info */}
                {gameId && (
                    <div className="mb-4 text-center p-4 bg-white shadow-md rounded w-full max-w-md">
                        <p><strong>Game ID:</strong> {gameId}</p>
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
                <div style={{ width: "80%", height: "60%" }}>
                    {isCheckmate && <h2 className="text-red-500">Game Over! {winner} wins by checkmate</h2>}
                    <Chessboard
                        position={game.fen()}
                        onPieceDrop={onDrop}
                        arePremovesAllowed={false}
                        boardOrientation={boardOrientation} // Fixed orientation based on turn
                        customSquareStyles={getSquareStyles()} // highlight king when in check
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
                    <button onClick={flipBoard} className="mt-3 bg-gray-600 text-white px-4 py-1 rounded">
                        Flip Board
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ChessGame;
