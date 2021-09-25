/* let express = require("express");
let app = express();
let server = require("http").Server(app);
let io = require("socket.io")(server);
let stream = require("./ws/stream");
let path = require("path");
let favicon = require("serve-favicon"); */

/* const express = require("express");
var app = express();
const PORT = process.env.PORT || 80;
var server = app.listen(PORT);
var io = require("socket.io").listen(server);
let stream = require("./ws/stream");
let path = require("path");
let favicon = require("serve-favicon"); */
const express = require("express");
const PORT = process.env.PORT || 80;

const app = express();
const socketIO = require("socket.io");
let stream = require("./ws/stream");
let path = require("path");
let favicon = require("serve-favicon");

const server = express()
  .use(app)
  .listen(PORT, () => console.log(`Listening Socket on ${PORT}`));

const io = socketIO(server);

app.use(favicon(path.join(__dirname, "favicon.ico")));
app.use("/assets", express.static(path.join(__dirname, "assets")));

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

app.get("/user", (req, res) => {
  res.sendFile(__dirname + "/user.html");
});

io.of("/stream").on("connection", stream);

