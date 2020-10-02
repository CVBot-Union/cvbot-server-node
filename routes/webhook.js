const express = require('express');
const { Webhook } = require('../models/');
const webhookInstance = require('../services/webhook/hookModifier');
const { handler } = require('../middlewares')
const router = express.Router();

// Get all webhook
router.get('/', (req,res)=>{
  Webhook
  .find()
  .exec((err,docs)=>{
    if (err) {
      handler(res, err.toString(), null);
    } else {
      handler(res, null, docs);
    }
  })
})

// Create a webhook
router.post('/', (req, res)=>{
  Webhook.create({
    name: req.body.name,
    url: req.body.url
  }, (err, docs) => {
    if (err) {
      handler(res, err.toString(), null);
    } else {
      webhookInstance.add(docs.url);
      handler(res, null, docs);
    }
  })
});

// Delete a webhook
router.delete('/', (req, res) => {
  const { url } = req.body;
  Webhook
  .deleteOne({ url }, (err,doc) => {
    if (err) {
      handler(res, err.toString(), null);
    } else {
      webhookInstance.remove(url);
      handler(res,null, { deleted: 'ok', db:doc  });
    }
  });
});
module.exports = router;
