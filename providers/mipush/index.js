const axios = require("axios");
const { mipush } = require('../../const/url');
const { appPackageName } = require('../../const/string');

const axios = require('axios');
module.exports = {
    pushToTopic: ( payloadData = {topic, payload, title, description }) => {
        payloadData.restricted_package_name = appPackageName
        patloadData.notify_type = 1;
        return axios({
            method: 'POST',
            headers: {
                'Authorization': 'key=' + process.env.MIPUSH_KEY
            },
            url: mipush.topic_push,
            data: payloadData
        },)
    }
}