import React from "react";
import ReactDOM from "react-dom/client";
import ChessGame from "./App.jsx";

const root = document.getElementById("root");

ReactDOM.createRoot(root).render(
    <React.StrictMode>
        <ChessGame />
    </React.StrictMode>
);
