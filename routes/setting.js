const express = require('express');
const { guard } = require('../middlewares')
const router = express.Router();

router.get('/',  async(req, res) => {
});

router.post('/', guard.checkIfAdmin, async (req,res) => {

});

module.exports = router;
