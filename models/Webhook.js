const mongoose = require('mongoose');
const WebhookSchema = new mongoose.Schema({
  name: {
    type: String
  },
  url: {
    type: String,
    required: true,
    index:{
      unique: true
    }
  }
});
const Webhook = mongoose.model('webhook', WebhookSchema);
module.exports = {Webhook, WebhookSchema};
