const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { User } = require('../models');
const { handler } = require('../middlewares')
const router = express.Router();

router.get('/', (req, res) => {
  res.send('respond with a resource');
});

router.post('/login', async (req,res) => {
    const { username, password } = req.body;
    try{
      const userDoc = await User.findOne({ username });
      if(userDoc === null) {
        res.status(403).send('403');
        return;
      }
      if(!bcrypt.compareSync(password,userDoc.password)){
        res.status(403).send('403');
        return;
      }
      const token = jwt.sign({
        _id: userDoc._id,
        userLevel: userDoc.userLevel,
        username: userDoc.username
      }, process.env.JWT_SECRET);
      handler(res, null, {
        token, uid: userDoc._id
      })
    }catch (e) {
      handler(res, e.toString(), null);
      throw e;
    }
});

router.post('/create', async (req,res) => {
    const { username, password } = req.body;
    try {
      const userDoc = await User.create({
        username,
        password: bcrypt.hashSync(password, 4)
      });
      userDoc.password = undefined;
      handler(res, null, userDoc);
    }catch (e) {
      handler(res, e.toString(), null);
      throw e;
    }
});

module.exports = router;
