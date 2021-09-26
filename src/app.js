const express = require("express");
const PORT = process.env.PORT || 80;

const app = express();
const socketIO = require("socket.io");
let stream = require("./ws/stream");
let path = require("path");
let favicon = require("serve-favicon");

var mysql = require("mysql");
var mysqli = mysql.createPool({
  /* connectionLimit: 10, */
  host: "mysql3001.mochahost.com",
  user: "swsangel_shirov",
  password: "Compuexpress06",
  database: "swsangel_rio_grande",
});

// TODO improve this
const GENERIC_ERROR = {
  error: "servicio no disponible, por favor intente más tarde",
};

const GENERIC_SUCCESS = {
  success: "ok",
};

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

app.get("/state", (_, res) => {
  mysqli.query(
    `SELECT val FROM config WHERE llave = 'online'`,
    (error, row) => {
      try {
        if (error) {
          res.json({ error: `${String(error)}` });
        } else {
          res.json(row[0] ? row[0] : GENERIC_ERROR);
        }
      } catch {
        res.json(GENERIC_ERROR);
      }
    }
  );
});

app.get("/visitors", (_, res) => {
  mysqli.query(
    `SELECT val FROM config WHERE llave = 'visitors'`,
    (error, row) => {
      try {
        if (error) {
          res.json({ error: `${String(error)}` });
        } else {
          res.json(row ? row : GENERIC_ERROR);
        }
      } catch {
        res.json(GENERIC_ERROR);
      }
    }
  );
});

app.post("/start-broadcast", (_, res) => {
  try {
    mysqli.query(
      `UPDATE config
      SET val = '1'
      WHERE llave = 'online' `,
      (error, row) => {
        try {
          if (error) {
            res.json({ error: `${String(error)}` });
          } else {
            res.json(row ? GENERIC_SUCCESS : GENERIC_ERROR);
          }
        } catch {
          res.json(GENERIC_ERROR);
        }
      }
    );
  } catch {}
});

app.post("/end-broadcast", (_, res) => {
  try {
    mysqli.query(
      `UPDATE config
      SET val = '0'
      WHERE llave = 'online' `,
      (error, row) => {
        try {
          if (error) {
            res.json({ error: `${String(error)}` });
          } else {
            res.json(row ? GENERIC_SUCCESS : GENERIC_ERROR);
          }
        } catch {
          res.json(GENERIC_ERROR);
        }
      }
    );
  } catch {}
});

io.of("/stream").on("connection", stream);
