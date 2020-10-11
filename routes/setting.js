const express = require('express');
const axios = require('axios');
const { guard,handler } = require('../middlewares');
const router = express.Router();

router.get('/worker',  async(req, res) => {
  axios.get('http://localhost:' + process.env.WORKER_PORT + '/')
      .then(res => res.data)
      .then(data => {
        handler(res, null, data)
      })
      .catch(error => {
        handler(res, error, null)
  })
});

router.patch('/worker', guard.checkIfAdmin, async (req,res) => {
  axios.patch('http://localhost:' + process.env.WORKER_PORT + '/')
  .then(res => res.data)
  .then(data => {
    handler(res, null, data)
  })
  .catch(error => {
    handler(res, error, null)
  })
});

router.post('/worker', guard.checkIfAdmin, async (req,res) => {
  axios.post('http://localhost:' + process.env.WORKER_PORT + '/')
  .then(res => res.data)
  .then(data => {
    handler(res, null, data)
  })
  .catch(error => {
    handler(res, error, null)
  })
});

module.exports = router;
