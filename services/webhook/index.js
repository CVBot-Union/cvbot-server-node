const Webhook = require('node-webhooks');

const _webhook = new Webhook({
    db: {},
    DEBUG: process.env.NODE_ENV === 'development',
    httpSuccessCodes: [200, 201, 202, 203, 204]
});

module.exports = _webhook;
