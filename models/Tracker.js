const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
  },
});

const User = mongoose.model("User", userSchema);

const exerciseSchema = new mongoose.Schema({
  user: { type: String, ref: "User" },
  description: {
    type: String,
    required: true,
  },
  duration: {
    type: Number,
    required: true,
  },
  date: {
    type: String,
  },
});

const Exercise = mongoose.model("Exercise", exerciseSchema);

const logSchema = new mongoose.Schema({
  user: { type: String, ref: "User" },
  count: {
    type: Number,
    required: false,
  },
  log: {
    type: [mongoose.Types.ObjectId],
    required: false,
  },
});

const Tracker = mongoose.model("coba", Log);

module.exports = Tracker;
