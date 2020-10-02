const express = require('express');
const router = express.Router();
const FwButton = require('./../providers/followbutton');
const { handler } = require('../middlewares')
const _fwButton = new FwButton();

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

module.exports = router;
