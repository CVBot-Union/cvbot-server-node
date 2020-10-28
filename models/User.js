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
  isManager: {
    type: Boolean,
    default: false
  }
});

const User = mongoose.model('User', UserSchema);
module.exports = {User, UserSchema};
