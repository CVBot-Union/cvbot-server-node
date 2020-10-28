const { RTGroup } = require('../models')
const mongoose = require('mongoose');
module.exports = {
  checkIfAdmin: (req,res,next) => {
    if(!req.user.isManager) {
      res.status(401).json({ success: false, response: { reason: 'Not Enough Privilege' } })
      return;
    }
    next();
  },
  checkIfUserIsInSessionGroup: async (req, res, next) => {
    const { sessionGroupID } = req.body;
    const checkIfInGroup = await RTGroup.findOne({
        'members.id': mongoose.Types.ObjectId(req.user._id)
      , _id: mongoose.Types.ObjectId(sessionGroupID) }).select('name');
    if(checkIfInGroup.length === 0) {
      res.status(400).json({ success: false, response: { reason: 'Not In Group' } })
      return;
    }
    next();
  }
}
