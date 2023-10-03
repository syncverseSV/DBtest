const express = require("express");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
var bodyParser = require("body-parser");
const cors = require("cors");
const app = express();
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

app.listen(process.env.PORT || 3000, (err) => {
  if (err) {
    console.log(err);
  } else {
    console.log(`server in running on port 3000`);
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
