const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.send('CVBot API Server');
});

module.exports = router;
