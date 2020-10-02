//This script load all database webhook into webhook instance
const webhookInstance = require('./../services/webhook/index');
const { Webhook } = require('../models/');
Webhook
  .find()
  .exec((err,docs)=>{
    if(err){
      console.error('[ERROR] Error while loading webhook from database')
    }else {
      docs.map(d=>{
        webhookInstance.add('pool', d.url)
        .then(()=>{
          console.log('[INFO] Loaded ' + d.url + ' to webhook');
        })
      })
    }
  })
