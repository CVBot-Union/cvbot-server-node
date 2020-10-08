const mongoose = require('mongoose');
const TrackerSchema = new mongoose.Schema({
  displayName: {
    type: String
  },
  uid: {
    type: String,
    unique: true,
    required: true
  },
  nickname: {
    type: String
  },
  groups: [{
    id: {
      type: mongoose.Types.ObjectId
    },
    nickname: {
      type: String,
      default: ''
    }
  }],
  qqGroups: [{
    type: String
  }]
});

const Tracker = mongoose.model('tracker', TrackerSchema);
module.exports = { TrackerSchema, Tracker };
