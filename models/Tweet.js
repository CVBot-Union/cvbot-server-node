const mongoose = require('mongoose');
const TweetSchema = mongoose.Schema({
  "created_at": {
    "type": "Date"
  },
  "id": {
    "type": "Number",
  },
  "id_str": {
    "type": "String",
    index:{
      unique: true
    }
  },
  "text": {
    "type": "String"
  },
  "truncated": {
    "type": "Boolean"
  },
  "extended_entities":{
    "type" : [
      "Mixed"
    ]
  },
  "entities": {
    type: "Mixed"
  },
  "source": {
    "type": "String"
  },
  "in_reply_to_status_id": {
    "type": "Mixed"
  },
  "in_reply_to_status_id_str": {
    "type": "Mixed"
  },
  "in_reply_to_user_id": {
    "type": "Mixed"
  },
  "in_reply_to_user_id_str": {
    "type": "Mixed"
  },
  "in_reply_to_screen_name": {
    "type": "Mixed"
  },
  "user": {
    "type" :"Mixed"
  },
  "geo": {
    "type": "Mixed"
  },
  "coordinates": {
    "type": "Mixed"
  },
  "place": {
    "type": "Mixed"
  },
  "contributors": {
    "type": "Mixed"
  },
  "retweeted_status": {
    type: mongoose.Mixed
  },
  extended_tweet: {
    type: "Mixed"
  },
  "is_quote_status": {
    "type": "Boolean"
  },
  quoted_status: {
    "type": "Mixed"
  },
  "retweet_count": {
    "type": "Number"
  },
  "favorite_count": {
    "type": "Number"
  },
  "favorited": {
    "type": "Boolean"
  },
  "retweeted": {
    "type": "Boolean"
  },
  "possibly_sensitive": {
    "type": "Boolean"
  },
  "lang": {
    "type": "String"
  },
  is_feed: {
    type: Boolean,
    default: true
  }
});

const Tweet = mongoose.model('Tweet', TweetSchema);
module.exports = {Tweet, TweetSchema};
