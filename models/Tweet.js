const mongoose = require('mongoose');
const TweetSchema = mongoose.Schema({
  id_str: {
    type: String,
    index: {
      unique: true
    }
  }
}, { strict: false });

const Tweet = mongoose.model('Tweet', TweetSchema);
module.exports = {Tweet, TweetSchema};
