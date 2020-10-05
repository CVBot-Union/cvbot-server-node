const express = require('express');
const mongoose = require('mongoose');
const aws = require('aws-sdk');
const multer = require('multer');
const multerS3 = require('multer-s3');
const { handler } = require('../middlewares');
const { RTGroup, User } = require('../models')
const router = express.Router();

const s3 = new aws.S3({
  endpoint: process.env.S3_ENDPOINT,
  accessKeyId: process.env.S3_AID,
  secretAccessKey: process.env.S3_AKEY,
})

const uploadGroupIcon = multer({
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
  const { name } = req.body;
  try {
    const doc = await  RTGroup.create({ name });
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



module.exports = router;
