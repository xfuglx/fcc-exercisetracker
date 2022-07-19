const mongoose = require("mongoose");

const exerciseSchema = new mongoose.Schema({
  description: { type: String, required: true },
  duration: { type: Number, required: true },
  date: {
    type: String,
  },
});

const logSchema = new mongoose.Schema({
  username: { type: String, required: true },
  count: { type: Number, default: 0 },
  log: {
    type: [exerciseSchema],
    default: [],
  },
});

const Log = new mongoose.model("Log", logSchema);

module.exports = Log;
