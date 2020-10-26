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
  const { name, description, members, leaders } = req.body;
  try {
    const doc = await  RTGroup.create({ name, property: {
      description
      }, members, leaders });
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
      }, { 'property.icon': req.file.location }, {new :true});
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

router.get('/:id/meta', async (req,res) => {
  const { id } = req.params;
  try {
    const doc = await RTGroup.findOne({ _id: mongoose.Types.ObjectId(id)}).select('name property');
    let userKV = await Tracker.find({ groups: { $elemMatch: { id: doc._id } } }).select('groups uid');
    userKV = userKV.map(elm => {
      let kv = elm.groups.filter(group => {
        return group.id + '' === doc._id + '';
      })[0];
      return Object.assign({ uid: elm.uid }, kv._doc)
    });
    handler(res,null, {group: doc, userKV: userKV});
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
    const deleteTracker = await Tracker.update({} , {
      $pull: {
        'groups.id': deleteGroup._id
      }
    },{ multi: true});
    handler(res, null, {
      group: deleteGroup,
      trackers: deleteTracker
    })
  } catch (e) {
    handler(res, e.toString(), null);
    throw e;
  }
});

router.post('/join/:groupID', async (req,res) => {
    const { groupID } = req.params;
    const { id, dutyDescription, type } = req.body;
    try{
      const userCheckResult = await User.findOne({ _id: mongoose.Types.ObjectId(id) });
      if(userCheckResult === null) {
        handler(res, 'User Does Not Exist', null);
        return;
      }
      const groupCheckResult = await RTGroup.findOne({ _id: mongoose.Types.ObjectId(groupID)});
      if(groupCheckResult === null) {
        handler(res, 'Group Does Not Exist', null);
        return;
      }
      const membersIdx= groupCheckResult.members.map(e=>e.id + '').indexOf(id);
      const leadersIdx= groupCheckResult.leaders.map(e=>e.id + '').indexOf(id);
      if(membersIdx !== -1 || leadersIdx !== -1) {
        handler(res, 'Already Joined!', null);
        return;
      }

      if(type === 'leader'){
        const joinDoc = await RTGroup.findOneAndUpdate({
          _id: mongoose.Types.ObjectId(groupID)
        },{
          $push: {
            leaders: {
              id: mongoose.Types.ObjectId(id),
              dutyDescription
            }
          }
        });
        handler(res, null, joinDoc);
      }else if(type === 'member'){
        const joinDoc = await RTGroup.findOneAndUpdate({
          _id: mongoose.Types.ObjectId(groupID)
        },{
          $push: {
            members: {
              id: mongoose.Types.ObjectId(id),
              dutyDescription
            }
          }
        });
        handler(res, null, joinDoc);
      } else{
        handler(res, 'Join Type Incorrect', null);
      }
    }catch (e) {
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
