const mongoose = require('mongoose');
const TweetSchema = mongoose.Schema({
  id_str: {
    type: String,
    index: {
      unique: true
    }
  },
  translations: [{
    translatedContent: {
      type: String
    },
    author: {
      id: {
        type: mongoose.Types.ObjectId
      },
      groupID: {
        type: mongoose.Types.ObjectId
      }
    },
    createdAt: {
      type: Date
    }
  }]
}, { strict: false });

const Tweet = mongoose.model('Tweet', TweetSchema);
module.exports = {Tweet, TweetSchema};
