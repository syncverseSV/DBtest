const express = require("express");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
var bodyParser = require("body-parser");
const http = require("http");
const cors = require("cors");
const app = express();
const server = http.createServer(app);
const io = require("socket.io")(server);
app.use(express.static("public"));
dotenv.config();
app.use(cors());

app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

main().catch((err) => console.log(err));

async function main() {
  await mongoose.connect(process.env.DBURL, { dbName: "User" });

  console.log("connected to Database!!");
}

const Schema = new mongoose.Schema({
  email: {
    type: String,
    unique: true,
  },
  phone: Number,
  password: String,
  address: String,
  placeOfUse: String,
  allDevice: Array,
  roomArray: Array,
});

const DBModel = mongoose.model("Data", Schema);

server.listen(process.env.PORT, (err) => {
  if (err) {
    throw err;
  } else {
    console.log(`Server in running on port ${process.env.PORT}`);
  }
});

app.get("/", (req, res) => {
  async function getUser() {
    const data = await DBModel.find({});

    res.send(data);
  }
  getUser();
});

app.post("/", async (req, res) => {
  var obj = {
    email: req.body.email,
    phone: req.body.phone,
    password: req.body.password,
    address: req.body.address,
    placeOfUse: req.body.placeOfUse,
    allDevice: req.body.allDevice,
    roomArray: req.body.roomArray,
  };
  const user = new DBModel(obj);
  try {
    await user.save();
    res.send(user);
  } catch (err) {
    res.status(500).send(err);
  }
});
app.put("/", async (req, res) => {
  var update = {
    email: req.body.email,
    phone: req.body.phone,
    password: req.body.password,
    address: req.body.address,
    placeOfUse: req.body.placeOfUse,
    allDevice: req.body.allDevice,
    roomArray: req.body.roomArray,
  };

  try {
    await DBModel.findOneAndUpdate({ email: req.body.email }, update);
    res.send(user);
  } catch (err) {
    res.status(500).send(err);
  }
});

app.get("/connect", (req, res) => {
  io.on("connection", (socket) => {
    console.log("A user connected");

    socket.on("joinRoom", (room) => {
      console.log(`${socket.id} just joined room ${room}`);
      socket.join(room);
      io.to(room).emit("roomJoined", `${socket.id} just joined the room`);

      socket.on("update", (data) => {
        const dataOut = JSON.parse(data);
        console.log(dataOut);
        socket.broadcast.to(room).emit("dataChange", dataOut);
      });
    });

    socket.on("leaveRoom", (room) => {
      console.log(`${socket.id} has left room ${room}`);

      socket.leave(room);

      io.to(room).emit("roomLeft", `${socket.id} has left the room`);
    });
  });

  res.sendFile(__dirname + "/index.html", (err) => {
    console.log(err);
  });
});
