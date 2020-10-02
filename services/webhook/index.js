const Webhook = require('node-webhooks');

const _webhook = new Webhook({
    db: {},
    httpSuccessCodes: [200, 201, 202, 203, 204]
});

module.exports = _webhook;

