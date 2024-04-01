// models/User.model.js

const { Schema, model } = require("mongoose");

const userSchema = new Schema(
  {
    email: String,
    password: String,
    fullname: String,
    slackID: String,
    googleID: String
  },
  {
    timestamps: true
  }
);

module.exports = model("User", userSchema);
