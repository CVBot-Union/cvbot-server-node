const mongoose = require('mongoose');
const UserSchema = mongoose.Schema({
  username: {
    type: String,
    required: true,
    index: {
      unique: true
    }
  },
  password: {
    type: String,
    required: true
  },
  optedOutTwitterIDs: [{
    type: String,
    required: true
  }],
  userLevel: {
    type: Number,
    default: 0
  }
});

const User = mongoose.model('User', UserSchema);
module.exports = {User, UserSchema};
