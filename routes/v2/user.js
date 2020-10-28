const express = require('express');
const mongoose = require('mongoose');
const { handler } = require('../../middlewares');
const { User, RTGroup } = require('../../models')

const router = express.Router();

router.get('/', async (req, res) => {
  const userID = req.user._id;
  try {
    const userInfoDoc = await User.findOne({ _id: mongoose.Types.ObjectId(userID) });
    userInfoDoc.password = undefined;

    const rtgroupDocs = await RTGroup.find({
      'members.id': userInfoDoc._id
    });

    const remappedJobs = await rtgroupDocs.map(async group => {
      const stripedUserIdArr = group.members.map(e => e.id + '');
      const userIdx = stripedUserIdArr.indexOf(userInfoDoc._id + '');
      return {
        jobName: group.members[userIdx].dutyDescription,
        priority: group.members.isManager ? 1 : 0,
        groupId: group._id
      };
    });

    const resolvedJobs = await Promise.all(remappedJobs);

    const targetDoc = {
      id: userID,
      name: userInfoDoc.username,
      avatarURL: 'https://s1.ax1x.com/2020/10/28/B3sarD.png',
      jobs: resolvedJobs
    }

    handler(res, null, targetDoc);
  }catch (e) {
    handler(res, e.toString(), null);
    throw e;
  }
});

module.exports = router;
