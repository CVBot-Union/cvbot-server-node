const mongoose = require('mongoose');
const WebhookLogSchema = mongoose.Schema({
  sentAt: {
    type: Date,
    required: true
  }, data: {
    type: mongoose.Mixed,
    required: true
  },
  sentHost: [{
    type: String
  }]
});

const WebhookLog = mongoose.model('WebhookLog', WebhookLogSchema);
module.exports = {WebhookLog, WebhookLogSchema};
