const express = require('express');
const Twit = require('twit');
const axios = require('axios');
const router = express.Router();
const FwButton = require('./../providers/followbutton');
const { handler } = require('../middlewares')
const _fwButton = new FwButton();

const T = new Twit({
  consumer_key: process.env.TW_CKEY,
  consumer_secret: process.env.TW_CS,
  access_token: process.env.TW_AT,
  access_token_secret: process.env.TW_ATS,
  timeout_ms: 60 * 1000,  // optional HTTP request timeout to apply to all requests.
  strictSSL: true,     // optional - requires SSL certificates to be valid.
});

router.get('/id/:id', (req, res) => {
  const { id } = req.params;
  _fwButton.getInfoById(id)
  .then(res => res.data)
  .then(data => {
    handler(res, null, data[0])
  })
  .catch(e => {
    handler(res, e.toString(), null);
    throw e;
  });
});

router.get('/display_name/:name', (req, res) => {
  const { name } = req.params;
  _fwButton.getInfoByDisplayName(name)
  .then(res => res.data)
  .then(data => {
    handler(res, null, data[0])
  })
  .catch(e => {
    handler(res, e.toString(), null);
    throw e;
  });
});

router.get('/avatar/id/:id', async (req,res) => {
    T.get('users/show', { user_id: req.params.id}, (err,data)=>{
      axios({
        method: 'get',
        url: data.profile_image_url_https,
        responseType: 'arraybuffer'
      })
      .then(function (response) {
        var headers = {'Content-Type': 'image/png'};
        res.set('Cache-Control', 'public, max-age=31557600'); // one year
        res.writeHead(200, headers);
        res.end(response.data, 'binary');
      })
      .catch(function (error) {
        res.send("error:" + error);
      });
    })
});

module.exports = router;
