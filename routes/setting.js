const express = require('express');
const axios = require('axios');
const { guard,handler } = require('../middlewares');
const workerURL = 'http://' + process.env.WORKER_IP + ':' +
    process.env.WORKER_PORT + '/';
const router = express.Router();

router.get('/worker',  async(req, res) => {
  axios.get(workerURL)
      .then(res => res.data)
      .then(data => {
        handler(res, null, data)
      })
      .catch(error => {
        handler(res, error, null)
  })
});

router.patch('/worker', guard.checkIfAdmin, async (req,res) => {
  axios.patch(workerURL)
  .then(res => res.data)
  .then(data => {
    handler(res, null, data)
  })
  .catch(error => {
    handler(res, error, null)
  })
});

router.post('/worker', guard.checkIfAdmin, async (req,res) => {
  axios.post(workerURL)
  .then(res => res.data)
  .then(data => {
    handler(res, null, data)
  })
  .catch(error => {
    handler(res, error, null)
  })
});

module.exports = router;
