const express = require('express');
const mongoose = require('mongoose');
const { handler } = require('../middlewares');
const { RTGroup } = require('../models')
const router = express.Router();

router.get('/', async (req, res) => {
  try{
    const docs = await RTGroup.find();
    handler(res, null, docs);
  }catch (e) {
    handler(res, e.toString(), null);
    throw e;
  }
});

router.post('/', async (req,res) => {
  const { name } = req.body;
  try {
    const doc = await  RTGroup.create({ name });
    handler(res, null, doc);
  }catch (e) {
    handler(res, e.toString(), null);
    throw e;
  }
});

router.patch('/:id', async (req,res) => {
  const { id } = req.params;
  const update_info = req.body;
  try {
    const doc = await  RTGroup.findOneAndUpdate({ _id: mongoose.Types.ObjectId(id) }, update_info);
    handler(res, null, doc);
  }catch (e) {
    handler(res, e.toString(), null);
    throw e;
  }
});

router.get('/:id', async (req,res) => {
    const { id } = req.params;
    try {
      const doc = await RTGroup.findOne({ _id: mongoose.Types.ObjectId(id)});
      handler(res,null,doc);
    }catch (e) {
      handler(res, e.toString(), null);
      throw e;
    }
});




module.exports = router;
