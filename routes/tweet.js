const express = require('express');
const mongoose = require('mongoose');
const { Tweet,Tracker,RTGroup, User } = require('../models');
const { handler,guard } = require('../middlewares')
const router = express.Router();

router.get('/', async (req,res) => {
  const { page, limit } = req.query;
  const { group, user } = req.query;

  let pageInt = parseInt(page);
  let limitInt = parseInt(limit);

  if(isNaN(pageInt)){
    pageInt = 1;
  }
  if(isNaN(limitInt)) {
    limitInt = 10;
  }

  try{
    let filterUid;
    if(user !== null && user === 'null') {
      const filteredUser = await Tracker.find({ 'groups.id': mongoose.Types.ObjectId(group) }).select('uid');
      filterUid = filteredUser.map(x=> x.uid);
    }else{
      filterUid = [user];
    }
    const docs = await Tweet
    .find({ 'user.id_str':  { $in: filterUid } })
    .sort({created_at: -1})
    .skip(limitInt * (pageInt - 1))
    .limit(limitInt);
    handler(res ,null, docs);
  }catch (e) {
    handler(res, e.toString(), null);
    throw e;
  }
});

router.get('/range', async (req,res) => {
  let { page, limit, beforeID, afterID, sortKey } = req.query;
  const { group,user } = req.query;

  page = parseInt(page);
  limit = parseInt(limit);

  if(sortKey !== 'DESC' && sortKey !== 'ASC'){
    sortKey = 'DESC';
  }
  if(afterID == null) {
    afterID = '9999999999999999999';
    page = 0;
    limit = 0;
  }
  if(beforeID == null) {
    beforeID = '0';
  }
  if(isNaN(page)){
    page = 1;
  }
  if(isNaN(limit)) {
    limit = 10;
  }

  try{
    let filterUid;
    if(user !== null) {
      const filteredUser = await Tracker.find({ 'groups.id': mongoose.Types.ObjectId(group) }).select('uid');
      filterUid = filteredUser.map(x=> x.uid);
    }else{
      filterUid = [user];
    }

    const docs = await Tweet
    .find({
      'user.id_str':  { $in: filterUid },
      'id_str' : {
        $lt: afterID,
        $gt: beforeID
      }
    })
    .sort({created_at: sortKey === 'DESC' ? -1 : 1})
    .skip(limit * (page - 1))
    .limit(limit);
    handler(res ,null, docs);
  }catch (e) {
    handler(res, e.toString(), null);
    throw e;
  }
});

router.get('/:id', async (req,res) => {
  const { id } = req.params;
  const { groupID } = req.query;
  try {
    const doc = await Tweet.findOne({ id_str: id});
    const filteredUser = await Tracker.findOne({
      'uid': doc._doc.user.id_str
    });
    const filterUserNicknameIdx = filteredUser.groups.map(e => e.id).indexOf(groupID);
    const mergedResponse = {
      ...doc._doc, userNickname: filteredUser.groups[filterUserNicknameIdx]
    }
    handler(res, null, mergedResponse);
  }catch (e) {
    handler(res, e.toString(), null);
    throw e;
  }
});

router.get('/:id/translations', async (req,res) => {
  const { id } = req.params;
  try{
    const doc = await Tweet.findOne({
      id_str: id
    }).select('translations').exec();
    const lookupedDoc = await doc.translations.map(async (each) => {
      const userInfo = await User.findOne({_id: each.author.id}).
          select('username');
      const rtGroupInfo = await RTGroup.findOne({_id: each.author.groupID}).
          select('name property');
      return {
        ...each._doc,
        author: {
          name: userInfo._doc.username,
          group: rtGroupInfo._doc.name
        }
      };
    });
    const resolvedTranslations = await Promise.all(lookupedDoc);
    handler(res, null, resolvedTranslations);
  }catch (e) {
    handler(res, e.toString(), null);
    throw e;
  }
});

router.put('/:id/translation', guard.checkIfUserIsInSessionGroup, async (req,res) => {
  const { id } = req.params;
  const { translationContent, sessionGroupID } = req.body;
  try {
    const putTranslation = await Tweet.update({ id_str: id }, {
      $push: {
        translations: {
          translationContent,
          author: {
            id: mongoose.Types.ObjectId(req.user._id),
            groupID: mongoose.Types.ObjectId(sessionGroupID)
          },
          createdAt: new Date()
        }
      }
    });
    handler(res, null, putTranslation);
  }catch (e) {
    handler(res, e.toString(), null);
    throw e;
  }
});

router.delete('/:id/translation/:translationID', async (req,res) => {
  const { id, translationID } = req.params;
  try {
    const putTranslation = await Tweet.update({ id_str: id }, {
      $pull: {
        translations: {
          _id: mongoose.Types.ObjectId(translationID)
        }
      }
    });
    handler(res, null, putTranslation);
  }catch (e) {
    handler(res, e.toString(), null);
    throw e;
  }});

module.exports = router;
