const express = require('express');
const mongoose = require('mongoose');

const { User, RTGroup } = require('../models')
const { handler,guard } = require('../middlewares')

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const mergeDoc = await getUserInfoAndRTGroupInfoRoutine(req.user._id);
    handler(res, null, mergeDoc)
  }catch (e) {
    handler(res, e.toString(), null);
    throw e;
  }
});

router.get('/all', guard.checkIfAdmin, async(req, res) => {
  try {
    const docs = await User.find({  }).select('username isManager');
    handler(res, null, docs);
  }catch (e) {
    handler(res, e.toString(), null);
    throw e;
  }
});

router.get('/:id', guard.checkIfAdmin, async (req,res) => {
    const { id } = req.params;
    try{
      const mergeDoc = await getUserInfoAndRTGroupInfoRoutine(id);
      handler(res, null ,mergeDoc);
    }catch (e) {
      handler(res, e.toString(), null);
      throw e;
    }
});

router.delete('/:id', guard.checkIfAdmin, async(req, res) => {
  const { id } = req.params;
  try{
    const deleteUser = await User.deleteOne({ _id: mongoose.Types.ObjectId(id) }, { multi: false});
    deleteUser._id = mongoose.Types.ObjectId(id);
    const targetRTGroup = await RTGroup.find({
      'members.id': deleteUser._id
    }).select('_id');
    const deleteTargetRTGroup = targetRTGroup.map(async elm=> {
      const tempGroup = await RTGroup.findOne({_id: elm._id});
      const tempGroupIds = tempGroup.members.map(e => e.id + '');
      const tempIdx = tempGroupIds.indexOf(deleteUser._id + '');
      const clearGroup = JSON.parse(JSON.stringify(tempGroup));
      const shadowMembers = clearGroup.members;
      shadowMembers.splice(tempIdx, 1);
      clearGroup.members = shadowMembers;
      return await RTGroup.update({
        _id: elm._id
      }, clearGroup, {new: false});
    })
    const resolvedDeletion = Promise.all(deleteTargetRTGroup);
    handler(res, null, {
      user: deleteUser,
      rtgroup: resolvedDeletion
    })
  }catch (e) {
    handler(res, e.toString(), null);
    throw e;
  }
});

const getUserInfoAndRTGroupInfoRoutine = async (userID) => {
  const userInfoDoc = await User.findOne({ _id: mongoose.Types.ObjectId(userID) });
  userInfoDoc.password = undefined;
  const rtgroupDocs = await RTGroup.find({
        'members.id': userInfoDoc._id
      }).select('name property members');
  const extractedManagerDoc = await rtgroupDocs.map(async group => {
    let shadowGroup = group;
    const groupMemberIdx = group.members.map(e => e.id).indexOf(userID);
    return Object.assign(shadowGroup._doc, {
      isManager: group.members[groupMemberIdx].isManager,
      members: undefined
    });
  });
  const resolvedExtractedManagerDoc = await Promise.all(extractedManagerDoc)
  return {user: userInfoDoc, rtgroups: resolvedExtractedManagerDoc};
}

module.exports = router;
