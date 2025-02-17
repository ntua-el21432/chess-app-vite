import { useState, useEffect } from "react";
import { Chess } from "chess.js";
import { Chessboard } from "react-chessboard";
import { io } from "socket.io-client";

const socket = io("https://chess-app-vite-2.onrender.com"); // Adjust for your server

const ChessGame = () => {
    const [game, setGame] = useState(new Chess());
    const [gameId, setGameId] = useState(""); 
    const [currentTurn, setCurrentTurn] = useState("white");

    const createGame = () => socket.emit("createGame");
    const joinGame = () => gameId.trim() && socket.emit("joinGame", gameId);

    const onDrop = (sourceSquare, targetSquare) => {
        const newGame = new Chess(game.fen());
        const move = newGame.move({ from: sourceSquare, to: targetSquare, promotion: "q" });
        if (move) {
            setGame(newGame);
            socket.emit("makeMove", gameId, { from: sourceSquare, to: targetSquare });
            return true;
        }
        return false;
    };

    useEffect(() => {
        socket.on("gameCreated", (id) => setGameId(id));
        socket.on("gameStarted", (gameState) => {
            setGame(new Chess(gameState.board));
            setCurrentTurn(gameState.currentTurn);
        });
        socket.on("moveMade", (board, turn) => {
            setGame(new Chess(board));
            setCurrentTurn(turn);
        });

        return () => {
            socket.off("gameCreated");
            socket.off("gameStarted");
            socket.off("moveMade");
        };
    }, []);

    return (
        <div className="flex justify-center items-center h-screen w-screen bg-gray-100">
            <div className="bg-white shadow-lg rounded-lg p-4 flex flex-col items-center" style={{ width: "600px", height: "800px" }}>
                <h1 className="text-lg font-bold mb-2">Chess Game</h1>

                {/* Chessboard */}
                <div style={{ width: "100%", height: "80%" }}>
                    <Chessboard
                        position={game.fen()}
                        onPieceDrop={onDrop}
                        arePremovesAllowed={false}
                        boardOrientation="white"
                        customBoardStyle={{ width: "100%", height: "100%" }}
                    />
                </div>

                {/* Game Controls */}
                <div className="mt-2 flex flex-wrap gap-2 justify-center">
                    <button onClick={createGame} className="bg-blue-500 text-white px-3 py-1 rounded">
                        New Game
                    </button>
                    <input
                        type="text"
                        placeholder="Game ID"
                        className="border px-2 py-1 rounded w-28"
                        onChange={(e) => setGameId(e.target.value)}
                    />
                    <button onClick={joinGame} className="bg-green-500 text-white px-3 py-1 rounded">
                        Join
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ChessGame;
