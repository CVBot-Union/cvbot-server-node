const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');
const { User } = require('../models');
const RSAKeyChain = require('../services/rsa');
const { handler } = require('../middlewares')
const router = express.Router();

router.get('/', (req, res) => {
  res.send('respond with a resource');
});

router.get('/public-key', async (req,res) => {
    res
    .header('Content-type', 'text/plain')
    .send(fs.readFileSync(path.join(__dirname + '/../keys/key.pub')));
});

router.post('/encrypt', async (req,res) => {
    const { password } = req.body;
    const buff = Buffer.from(password,'utf-8');
    const base64 = buff.toString('base64');
    res
    .header('Content-type', 'text/plain')
    .send(RSAKeyChain.encrypt(base64));
});

router.post('/login', async (req,res) => {
    let { username, password } = req.body;
    const RSAEnabled = req.headers['x-tian-wang-gai-di-hu'] === 'bao-ta-zhen-he-yao';
    try{
      const userDoc = await User.findOne({ username });
      if(userDoc === null) {
        res.status(403).send('403');
        return;
      }
      if(RSAEnabled) {
        const base64Buff = Buffer.from(password, 'base64');
        const decryptedBufferPassword = RSAKeyChain.decrypt(base64Buff);
        const passwordBase64 = Buffer.from(Buffer.from(
            decryptedBufferPassword).toString(), 'base64');
        password = passwordBase64.toString('utf-8');
      }
      if(!bcrypt.compareSync(password,userDoc.password)){
        res.status(403).send('403');
        return;
      }
      const token = jwt.sign({
        _id: userDoc._id,
        isManager: userDoc._doc.isManager,
        username: userDoc.username,
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
