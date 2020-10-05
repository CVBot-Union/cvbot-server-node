const express = require('express');
const mongoose = require('mongoose');

const { User, RTGroup } = require('../models')
const { handler,guard } = require('../middlewares')

const router = express.Router();

/* GET users listing. */
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
    const docs = await User.find({ }).select('username');
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

// todo: resolve mongo key error
router.delete('/:id', guard.checkIfAdmin, async(req, res) => {
  const { id } = req.params;
  try{
    const deleteUser = await User.findOneAndDelete({ _id: mongoose.Types.ObjectId(id) }, { multi: false});
    const deleteRTGroup = await RTGroup.update({},{
      $pull: { 'members.id': deleteUser._id, 'leaders.id': deleteUser._id }
    }, { multi: true})
    handler(res, null, {
      user: deleteUser,
      rtgroups: deleteRTGroup
    })
  }catch (e) {
    handler(res, e.toString(), null);
    throw e;
  }
});

const getUserInfoAndRTGroupInfoRoutine = async (userID) => {
  const userInfoDoc = await User.findOne({ _id: mongoose.Types.ObjectId(userID) });
  userInfoDoc.password = undefined;
  const rtgroupDocs = await RTGroup.find({ $or:[
      {
        'members.id': userInfoDoc._id
      },{
        'leaders.id': userInfoDoc._id
      }
    ] }).select('name property');
  return {user: userInfoDoc, rtgroups: rtgroupDocs};
}

module.exports = router;
