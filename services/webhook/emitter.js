const webhookInstance = require('./index');

const emitter = webhookInstance.getEmitter();

emitter.on('*.success', function (shortname, statusCode, body) {
    console.log('Success on trigger webHook' + shortname + 'with status code', statusCode, 'and body', body)
})

emitter.on('*.failure', function (shortname, statusCode, body) {
    console.error('Error on trigger webHook' + shortname + 'with status code', statusCode, 'and body', body)
})
