const express = require('express');
const mongoose = require('mongoose');
const { Tweet,Tracker } = require('../models');
const { handler } = require('../middlewares')
const router = express.Router();

router.get('/', async (req,res) => {
  const { page, limit } = req.query;
  const { group } = req.query;

  let pageInt = parseInt(page);
  let limitInt = parseInt(limit);

  if(isNaN(pageInt)){
    pageInt = 1;
  }
  if(isNaN(limitInt)) {
    limitInt = 10;
  }

  try{
    const filteredUser = await Tracker.find({ groups: mongoose.Types.ObjectId(group) }).select('uid');
    const filterUid = filteredUser.map(x=> x.uid);
    const docs = await Tweet
    .find({ 'user.id_str':  filterUid })
    .sort({created_at: -1})
    .skip(limitInt * (pageInt - 1))
    .limit(limitInt);
    handler(res ,null, docs);
  }catch (e) {
    handler(res, e.toString(), null);
    throw e;
  }
});

router.get('/:id', async (req,res) => {
  const { id } = req.params;
  try {
    const doc = await Tweet.findOne({ id_str: id});
    handler(res, null, doc);
  }catch (e) {
    handler(res, e.toString(), null);
    throw e;
  }
});


module.exports = router;
