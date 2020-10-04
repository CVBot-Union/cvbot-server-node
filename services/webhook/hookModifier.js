const webhookInstance = require('./index');
const { WebhookLog } = require('../../models')

module.exports = {
    add: (url) => {
        webhookInstance.add('pool', url
        ).then(()=>{
            webhookInstance.trigger('pool',{ type: 'SYSTEM',data: {
                    text: 'A new webhook has been added: ' + url +'.'
                }})
            console.info('[INFO] Loaded ' + url + ' to webhook');
        })
    },
    remove: (url) =>{
        webhookInstance.remove('pool', url)
            .catch(function(err){console.error(err);})
        console.info('[INFO] Deleted ' + url + ' from hook pool.');
    },
    trigger: (data)=>{
        webhookInstance.trigger('pool', data);
        console.info('[INFO] Triggered Webhook, announcing in hook pool');
        WebhookLog.create({ sentAt: new Date(), data, sentHost: webhookInstance.getDB() })
    }
}
