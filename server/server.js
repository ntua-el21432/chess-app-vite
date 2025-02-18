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
        origin: "http://localhost:3000" ,// Allow frontend to connect
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
        games[gameId] = new Chess();
        socket.join(gameId); // Add socket to a room (gameId)
        console.log(`Game created with ID: ${gameId}`);
        socket.emit("gameCreated", gameId); // Emit the game ID back to the client
    });

    // Handle joining a game
    socket.on("joinGame", (gameId) => {
        const game=games[gameId];
        if (game) {
            socket.join(gameId);
            socket.emit("gameStarted", {
                board: game.fen(),
                currentTurn: game.currentTurn
            });
        } else if(!game){
            socket.emit("error", "Invalid game ID.");
        }
        else{
            socket.emit("error", "Game already has two players.");
        }
    });

    // Handle moves
    socket.on("makeMove", (gameId, move) => {
        const game = games[gameId];
        if (game) {
            const moveResult = game.move(move);
            if (moveResult) {
                io.to(gameId).emit("moveMade", game.fen(), game.turn()==="w"?"white":"black");
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

app.get("*", (req, res) => {
    res.sendFile(path.join(clientPath, "index.html"));
});
server.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
