const express = require('express');
const router = express.Router();
const { handler, guard } = require('../middlewares')
const models = require('../models')

router.get('/', guard.checkIfAdmin, async (req, res) => {
  try {
    const tweetCount = await models.Tweet.count();
    const rtgroupCount = await models.RTGroup.count();
    const trackerCount = await models.Tracker.count();
    const userCount = await models.User.count();

    handler(res, null, {
      tweetCount,
      rtgroupCount,
      trackerCount,
      userCount
    })
  }catch (e) {
    handler(res, e.toString(), null);
    throw e;
  }
});

module.exports = router;
