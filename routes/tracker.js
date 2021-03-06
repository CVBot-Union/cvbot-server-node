const express = require('express');
const { handler } = require('../middlewares')
const { Tracker, RTGroup } = require('../models')
const router = express.Router();

router.get('/', async (req, res) => {
  try{
    const docs = await Tracker.find();
    handler(res,null,docs);
  }catch (e) {
    handler(res, e.toString(), null);
    throw e;
  }
});

router.post('/', async (req, res) => {
  const {uid, displayName, nickname, groups, qqGroups} = req.body;
  try {
    const doc = await Tracker.create({uid: '' + uid, displayName, nickname, groups,qqGroups});
    handler(res,null, doc);
  } catch (e) {
    handler(res, e.toString(), null);
    throw e;
  }
});

router.get('/:uid', async (req,res) => {
  const { uid } = req.params;
  try{
    const doc = await Tracker.findOne({ uid });
    const groupKV = await doc.groups.map(async elm => {
      const groupName = await RTGroup.findOne({
        _id: elm.id
      }).select('name');
      return Object.assign({ id: elm.id }, {
        name: groupName.name,
        nickname: elm.nickname
      })
    })
    const resolvedKV = await Promise.all(groupKV);
    const mergedKV = {...doc._doc};
    mergedKV.groups = resolvedKV;
    handler(res, null, mergedKV);
  }catch (e) {
    handler(res, e.toString(), null);
    throw e;
  }
});

router.patch('/:uid', async (req,res) => {
    const { uid } = req.params;
    const updated_info = req.body;
    try{
      const doc = await Tracker.findOneAndUpdate({ uid }, updated_info, {new : true});
      handler(res, null, doc);
    }catch (e) {
      handler(res, e.toString(), null);
      throw e;
    }
});

router.delete('/', async (req, res) => {
  const { uid } = req.body;
  try{
    const doc = await Tracker.deleteOne({ uid });
    handler(res,null, doc);
  }catch (e) {
    handler(res, e.toString(), null);
    throw e;
  }
});

module.exports = router;
