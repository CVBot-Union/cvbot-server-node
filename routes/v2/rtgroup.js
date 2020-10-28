const express = require('express');
const mongoose = require('mongoose');
const { handler } = require('../../middlewares');
const { RTGroup, Tracker } = require('../../models')

const router = express.Router();

router.get('/:id', async (req,res) => {
  const { id } = req.params;
  try {
    const group = await RTGroup.findOne({
      _id: mongoose.Types.ObjectId(id)
    });
    const stripedUserIdArr = group.members.map(e => e.id + '');
    const trackerKV = await Tracker.find({
      groups: { $elemMatch: { id: group._id } }
    }).select('groups uid');
    const mergedTrackerKV = trackerKV.map(elm => {
      let kv = elm.groups.filter(trackerGroup => {
        return trackerGroup.id + '' === group._id + '';
      })[0];
      return Object.assign({ uid: elm.uid }, kv._doc)
    });

    const targetDoc = {
      id: group._id,
      name: group.name,
      avatarURL: group.property.icon,
      following: mergedTrackerKV,
      members: stripedUserIdArr,
      tweetFormat: group.property.templateFormat,
    }
    handler(res, null, targetDoc);
  }catch (e) {
    handler(res, e.toString(), null);
    throw e;
  }
});

module.exports = router;
