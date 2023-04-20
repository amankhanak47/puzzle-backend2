const mongoose = require("mongoose");
const { Schema } = mongoose;

const UserSchema = new Schema({
  name: {
    type: String,
  },
  email: {
    type: String,
  },
  password: {
    type: String,
  },
  treasure: {
    type:Boolean,
  }
});

module.exports = mongoose.model("user", UserSchema);
