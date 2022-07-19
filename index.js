const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();

app.use(cors());
app.use(express.static("public"));
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/views/index.html");
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
require("./utils/db");
const Log = require("./models/learnSchema");

// * /api/users/ route
app
  .route("/api/users/")
  .post(async (req, res) => {
    try {
      const dupCheck = await Log.findOne({ username: req.body.username }).select(["_id", "username"]);
      if (dupCheck) {
        console.log("User already registered");
        res.json(dupCheck);
      } else {
        const data = new Log({
          username: req.body.username,
        });
        data.save();
        console.log("New user registered");
        res.json({ _id: data._id, username: data.username });
      }
    } catch {
      console.log("Error registering user");
    }
  })
  .get(async (req, res) => {
    const users = await Log.find().select(["_id", "username", "__v"]);
    res.json(users);
  });

// * /api/users/:_id/exercises route
app.post("/api/users/:_id/exercises", async (req, res) => {
  const description = req.body.description;
  const duration = parseInt(req.body.duration);
  const date = req.body.date === undefined ? new Date().toDateString() : new Date(req.body.date).toDateString();
  try {
    const user = await Log.findOneAndUpdate(
      { _id: req.params._id || req.body[":_id"] },
      {
        $push: {
          log: [
            {
              description,
              duration,
              date,
            },
          ],
        },
        $inc: {
          count: 1,
        },
      }
    );
    res.json({
      username: user.username,
      description,
      duration,
      date,
      _id: user._id,
    });
  } catch {
    console.log("Error adding exercise");
  }
});

// * /api/users/:_id/logs route
app.get("/api/users/:_id/logs", async (req, res) => {
  let { from, to, limit } = req.query;
  from = from === undefined ? 0 : new Date(from).getTime();
  to = to === undefined ? new Date().getTime() : new Date(to).getTime();
  limit = limit || 0;
  try {
    const data = await Log.findOne({ _id: req.params._id }).select(["username", "count", "_id", "log"]);
    console.log("Data fetched");
    res.json(data);
  } catch {
    console.log("Error fetching data");
  }
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
