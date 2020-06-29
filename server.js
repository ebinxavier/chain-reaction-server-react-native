const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");

const { init, broadcast } = require("./utils");
const room = require("./routes/room");
const message = require("./routes/message");
const { query } = require("express");

init();
const app = express();
const server = require("http").createServer(app);
const io = require("socket.io")(server);

app.use(express.static("./public"));
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

const port = process.env.PORT || 4000;
server.listen(port, () => {
  console.log("Listening to 4000...!");
});

// Express routes
app.use("/room", room);
app.use("/message", message);

app.get("/join", (req, res) => {
  const joinHtml = fs.readFileSync(__dirname + "/public/join.html", "utf8");
  res.send(joinHtml.replace("{roomId}", req.query.roomId));
});
// Express routes ends

// Socket communication
io.on("connection", (socket) => {
  console.log("Connected");
  socket.on("addNewAtom", async ({ roomId, x, y, userId, playerIndex }, cb) => {
    console.log("addNewAtom", {
      roomId,
      x,
      y,
      userId,
      playerIndex,
    });
    const response = await broadcast({
      fromUserId: userId,
      roomId,
      type:'PLAYED',
      data: {
        roomId,
        x,
        y,
        userId,
        playerIndex,
      },
    });
    cb(response);
  });
});

// Socket communication ends
