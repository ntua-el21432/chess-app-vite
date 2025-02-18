import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import { Chess } from "chess.js";
import path from "path";
import {fileURLToPath} from "url";
const app = express();

const port=process.env.PORT || 5000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
        const gameId = Math.random().toString(36).slice(2, 11); // Generate a random game ID using slice() instead of substr()
        games[gameId] = {
            chess:new Chess(),
            players: {
                white: socket.id,
                black: null,
            },
            currentTurn: "white"
        };
        socket.join(gameId); // Add socket to a room (gameId)
        console.log(`Game created with ID: ${gameId}`);
        socket.emit("gameCreated", gameId); // Emit the game ID back to the client
    });

    // Handle joining a game
    socket.on("joinGame", (gameId) => {
        const game=games[gameId];
        if (game && !game.players.black) {
            game.players.black = socket.id;
            socket.join(gameId);
            socket.emit("gameStarted", {
                board: game.chess.fen,
                playerColor: "black",
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
        if (game && game.players[game.currentTurn] === socket.id) {
            const moveResult = game.chess.move(move);
            if (moveResult) {
                game.currentTurn = game.currentTurn === "white" ? "black" : "white";
                io.to(gameId).emit("moveMade", game.fen, game.currentTurn);
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
