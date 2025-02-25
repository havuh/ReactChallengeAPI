const jsonServer = require("json-server");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const bodyParser = require("body-parser");

const server = jsonServer.create();
const router = jsonServer.router("db.json");
const middlewares = jsonServer.defaults();

server.use(cors());
server.use(bodyParser.json());
server.use(middlewares);

const SECRET_KEY = "supersecretkey";
const expiresIn = "1h";

// Simulación de login con token
server.post("/login", (req, res) => {
  const { email, password } = req.body;
  console.log(email, password);

  if (email === "al.mj@gmail.com" && password === "1234") {
    const token = jwt.sign(
      {
        id: 1,
        name: "Alejandro Quiros",
        lastName: "Medrano Jacobo",
        isAdmin: true,
      },
      SECRET_KEY,
      { expiresIn }
    );

    res.json({
      message: "Acceso autorizado",
      data: {
        email: "al.mj@gmail.com",
        id: 1,
        lastName: "Medrano Jacobo",
        name: "Alejandro Quiros",
        token: token,
      },
      status: 200,
    });
  } else {
    res.status(401).json({ message: "Credenciales inválidas" });
  }
});

// Middleware de autenticación
server.use((req, res, next) => {
  if (req.path === "/login") return next();

  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: "No autorizado" });

  const token = authHeader.split(" ")[1];
  jwt.verify(token, SECRET_KEY, (err, decoded) => {
    if (err) return res.status(403).json({ message: "Token inválido" });

    req.user = decoded;
    next();
  });
});

// Endpoints de canciones
server.get("/songs", (req, res) => {
  res.json({
    message: "Lista de canciones populares",
    data: require("./db.json").songs,
    status: 200,
  });
});

server.post("/songs", (req, res) => {
  const db = require("./db.json");
  const newSong = { id: db.songs.length + 1, ...req.body };
  db.songs.push(newSong);
  res.status(201).json({ message: "Canción agregada", data: newSong });
});

server.put("/songs/:id", (req, res) => {
  const db = require("./db.json");
  const songIndex = db.songs.findIndex((s) => s.id == req.params.id);
  if (songIndex === -1) return res.status(404).json({ message: "Canción no encontrada" });

  db.songs[songIndex] = { ...db.songs[songIndex], ...req.body };
  res.json({ message: "Canción actualizada", data: db.songs[songIndex] });
});

server.delete("/songs/:id", (req, res) => {
  const db = require("./db.json");
  const songIndex = db.songs.findIndex((s) => s.id == req.params.id);
  if (songIndex === -1) return res.status(404).json({ message: "Canción no encontrada" });

  db.songs.splice(songIndex, 1);
  res.json({ message: "Canción eliminada" });
});

// Usar JSON Server
server.use(router);
server.listen(3000, () => {
  console.log("🎵 Servidor corriendo en http://localhost:3000");
});
