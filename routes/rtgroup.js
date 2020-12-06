const express = require('express');
const mongoose = require('mongoose');
const aws = require('aws-sdk');
const multer = require('multer');
const path = require('path');
const multerS3 = require('multer-s3');
const { handler } = require('../middlewares');
const { RTGroup, User, Tracker } = require('../models')
const router = express.Router();

const s3 = new aws.S3({
  endpoint: process.env.S3_ENDPOINT,
  accessKeyId: process.env.S3_AID,
  secretAccessKey: process.env.S3_AKEY,
})

const uploadGroupIcon = multer({
  fileFilter: function (req, file, callback) {
    var ext = path.extname(file.originalname);
    if(ext !== '.png') {
      return callback(new Error('Only png are allowed'))
    }
    callback(null, true)
  },
  limits: {
    fileSize: (2 * 1024 * 1024)
  },
  storage: multerS3({
    s3,
    contentType: multerS3.AUTO_CONTENT_TYPE,
    acl: process.env.NODE_ENV === 'development' ? 'public-read' : 'private',
    bucket: process.env.S3_BUCKET,
    key: function (req, file, cb) {
      cb(null, 'group_icon/' + Date.now().toString() + '.png')
    }
  })
})

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
  const { name, description, members } = req.body;
  try {
    const doc = await  RTGroup.create({ name, property: {
      description
      }, members });
    handler(res, null, doc);
  }catch (e) {
    handler(res, e.toString(), null);
    throw e;
  }
});

router.post('/icon/:id', uploadGroupIcon.single('icon'), async (req,res) => {
    const { id } = req.params;
    try {
      const doc = await RTGroup.findOneAndUpdate({
        _id: mongoose.Types.ObjectId(id)
      }, { 'property.icon': process.env.S3_ENTRY + '/' + req.file.key }, {new :true});
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
      const groupDoc = await RTGroup.findOne({ _id: mongoose.Types.ObjectId(id)});
      const trackerKV = await Tracker.find({ groups: { $elemMatch: { id: groupDoc._id } } }).select('groups uid');
      const mergedTrackerKV = trackerKV.map(elm => {
        let kv = elm.groups.filter(group => {
          return group.id + '' === groupDoc._id + '';
        })[0];
        return Object.assign({ uid: elm.uid }, kv._doc)
      });
      const memberKV = await groupDoc.members.map(async elm => {
        const userInfo = await User.findOne({
          _id: elm.id
        }).select('username');
        if (userInfo === null) {
          return null;
        }
        return Object.assign({ id: elm.id }, {
          username: userInfo.username,
          isManager: elm.isManager,
          job: elm.dutyDescription
        })
      });
      const resolvedMemberKV = await Promise.all(memberKV);
      let mergedDoc = {
        ...groupDoc._doc
      };
      mergedDoc.members = resolvedMemberKV;
      mergedDoc.trackers = mergedTrackerKV;
      mergedDoc.avatarURL = mergedDoc.property.icon;
      mergedDoc.members_str = resolvedMemberKV.map(e => e.id);
      handler(res,null, mergedDoc);
    }catch (e) {
      handler(res, e.toString(), null);
      throw e;
    }
});

router.delete('/:id', async (req,res) => {
  const { id } = req.params;
  try {
    const deleteGroup = await RTGroup.findOneAndDelete({ _id: mongoose.Types.ObjectId(id) });
    if(deleteGroup === null) {
      handler(res, "Group Not Found.", null);
      return;
    }
    const targetTracker = await Tracker.find({
      'groups.id': deleteGroup._id
    }).select('_id');
    const deleteTargetTracker = targetTracker.map(async elm=> {
      const tempTracker = await Tracker.findOne({_id: elm._id});
      const tempTrackerIds = tempTracker.groups.map(e => e.id + '');
      const tempIdx = tempTrackerIds.indexOf(deleteGroup._id + '');
      const clearTracker = JSON.parse(JSON.stringify(tempTracker));
      const shadowTracker = clearTracker.groups;
      shadowTracker.splice(tempIdx, 1);
      clearTracker.groups = shadowTracker;
      return await Tracker.update({
        _id: elm._id
      }, clearTracker, {new: false});
    })
    const resolvedDeletion = Promise.all(deleteTargetTracker);
    handler(res, null, {
      group: deleteGroup,
      trackers: resolvedDeletion
    })
  } catch (e) {
    handler(res, e.toString(), null);
    throw e;
  }
});

router.get('/:id/head', async (req,res) => {
  const { id } = req.params;
  try {
    const doc = await RTGroup.findOne({
      _id: mongoose.Types.ObjectId(id)
    }).select('name property');
    handler(res, null, doc);
  }catch (e) {
    handler(res, e.toString(), null);
    throw e;
  }
});

module.exports = router;
