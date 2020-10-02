const mongoose = require('mongoose');
const RTGroupSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
    index:{
      unique: true
    }
  },
  members: [{
    type: mongoose.Types.ObjectId,
  }],
  leaders: [{
    type: mongoose.Types.ObjectId,
  }],
  property: {
    themeColor: {
      type: String,
      default: "29b6f6"
    },
    icon: {
      type: String,
      default: "https://s1.ax1x.com/2020/10/02/0Qydde.png"
    }
  }
});

const RTGroup = mongoose.model('RTGroup', RTGroupSchema);
module.exports = {RTGroup, RTGroupSchema};
