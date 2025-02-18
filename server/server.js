import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import { Chess } from "chess.js";
import path from "path";
import {fileURLToPath} from "url";

const port=process.env.PORT || 5000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app=express();

const clientPath=path.join(__dirname,"../client","dist");

//setup middleware
app.use(express.static(clientPath));

const server = createServer(app);
const io = new Server(server, {
    cors: {
        origin: "https://chess-app-vite-2.onrender.com" ,// Allow frontend to connect
        methods: ["GET", "POST"]
    }
});

const games = {}; // Store game states

io.on("connection", (socket) => {
    console.log(socket.id);
    console.log("A user connected:", socket.id);

    // Handle game creation
    socket.on("createGame", () => {
        const gameId = Math.random().toString(36).slice(2, 11); // Generate a random game ID
        games[gameId] = {
            chess: new Chess(),
            white: socket.id,
            black:null
        };
        socket.join(gameId); // Add socket to a room 
        console.log(`Game created with ID: ${gameId}`);
        socket.emit("gameCreated", gameId); // Emit the game ID back to client
    });

    // Handle joining a game
    socket.on("joinGame", (gameId) => {
        const game = games[gameId];
    
        if (!game) {
            socket.emit("error", "Invalid game ID.");
            return;
        }
    
        if (!game.black && game.white !== socket.id) {
            game.black = socket.id; // Assign second player as black
        } else if (game.white !== socket.id && game.black !== socket.id) {
            socket.emit("error", "Game is already full.");
            return;
        }
    
        socket.join(gameId);
        const boardOrientation = game.white === socket.id ? "white" : "black";
        const assignedColor = game.white === socket.id ? "white" : "black";
    
        console.log(`Player ${socket.id} joined game ${gameId} as ${assignedColor}`);
    
        socket.emit("gameStarted", {
            board: game.chess.fen(),
            currentTurn: game.chess.turn() === "w" ? "white" : "black",
            boardOrientation,
            assignedColor
        });
    
        io.to(gameId).emit("updatePlayers", {
            white: game.white,
            black: game.black
        });
    });
    
    // Handle moves
    socket.on("makeMove", (gameId, move) => {
        const game = games[gameId];
    
        if (!game) {
            socket.emit("error", "Invalid game ID.");
            return;
        }
    
        const playerColor = game.white === socket.id ? "w" : game.black === socket.id ? "b" : null;
    
        if (!playerColor) {
            socket.emit("error", "You are not a player in this game.");
            return;
        }
    
        if (game.chess.turn() !== playerColor) {
            socket.emit("error", "It's not your turn.");
            return;
        }
    
        try {
            const moveResult = game.chess.move(move);
    
            if (!moveResult) {
                socket.emit("error", "Invalid move.");
                return;
            }
    
            console.log(`Move made in game ${gameId}: ${move.from} to ${move.to}`);
            console.log(`Sending board state: ${game.chess.fen()} to all players in room ${gameId}`);
            
            //check for check and checkmate
            const isCheck = game.chess.inCheck();
            const isCheckmate = game.chess.isCheckmate();

            // Send the updated board to **everyone** in the game room
            io.to(gameId).emit("moveMade", {
                board: game.chess.fen(),
                currentTurn: game.chess.turn() === "w" ? "white" : "black",
                isCheck,
                isCheckmate
            });

            if (isCheckmate) {
                setTimeout(() => {
                    io.to(gameId).emit("gameOver", {
                        winner: playerColor === "w" ? "white" : "black",
                        reason: "Checkmate"
                    });
                }, 1000);
            }
    
        } catch (error) {
            console.error("Invalid move attempted:", error.message);
            socket.emit("error", "Invalid move. Please try again.");
        }
    });
    
    

    // Handle disconnection
    socket.on("disconnect", () => {
        console.log("client disconnected:", socket.id);
    });
});

app.get("*", (req, res) => {
    res.sendFile(path.join(clientPath, "index.html"));
});
server.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
