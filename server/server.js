import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import { Chess } from "chess.js";
import path from "path";
import {fileURLToPath} from "url";


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const clientPath = path.join(__dirname, "../client/dist"); // Move up from 'server'

const app = express();
app.use(express.static(clientPath));

const server = createServer(app);
const io = new Server(server, {
    cors: {
        origin: "https://localhost:3000" ,// Allow frontend to connect
        methods: ["GET", "POST"]
    }
});

const games = {}; // Store game states

io.on("connection", (socket) => {
    console.log(socket.id);
    console.log("A user connected:", socket.id);

    // Handle game creation
    socket.on("createGame", () => {
        const gameId = Math.random().toString(36).slice(2, 11); // Generate a random game ID using slice() instead of substr()
        games[gameId] = new Chess(); // Initialize a new Chess game for this ID
        socket.join(gameId); // Add socket to a room (gameId)
        console.log(`Game created with ID: ${gameId}`);
        socket.emit("gameCreated", gameId); // Emit the game ID back to the client
    });

    // Handle joining a game
    socket.on("joinGame", (gameId) => {
        if (games[gameId]) {
            socket.join(gameId);
            socket.emit("gameStarted", {
                board: games[gameId].fen(),
                currentTurn: "white",
            });
        } else {
            socket.emit("error", "Invalid game ID.");
        }
    });

    // Handle moves
    socket.on("makeMove", (gameId, move) => {
        if (games[gameId]) {
            const game = games[gameId];
            const moveResult = game.move(move);
            if (moveResult) {
                io.to(gameId).emit("moveMade", game.fen(), game.turn() === "w" ? "white" : "black");
            } else {
                socket.emit("error", "Invalid move.");
            }
        }
    });

    // Handle disconnection
    socket.on("disconnect", () => {
        console.log("client disconnected:", socket.id);
    });
});
const PORT = 5000;
app.get("*", (req, res) => {
    res.sendFile(path.join(clientPath, "index.html"));
});
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
