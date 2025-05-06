const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");
const { config } = require("dotenv");
config();

const APP_HOST = "http://localhost:5173";
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: APP_HOST, credentials: true },
});

const players = {};

app.use(
  cors({ origin: APP_HOST, methods: ["GET", "POST"], credentials: true })
);
// Servir archivos estáticos desde "public"
app.use(express.static("public"));

app.get("/ping", (req, res) => {
  res.send("pong");
});

setInterval(() => {
  io.emit("update-world", players);
}, 10);

// Evento de conexión Socket.IO
io.on("connection", (socket) => {
  console.log(`se conectó : ${socket.id}`);

  socket.on("update-position", (position) => {
    players[socket.id] = { ...position, id: socket.id };

    socket.broadcast.emit("update-world", players); // reenviar a todos
  });

  socket.on("disconnect", () => {
    delete players[socket.id];
    console.log(`se desconecto : ${socket.id}`);
  });
});

// Iniciar servidor
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
