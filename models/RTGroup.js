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
    id: {
      type: mongoose.Types.ObjectId,
      required: true,
      index: 1
    },
    dutyDescription: {
      type: String,
      default: "组员"
    }
  }],
  leaders: [{
    id: {
      type: mongoose.Types.ObjectId,
      required: true,
      index: 1
    },
    dutyDescription: {
      type: String,
      default: "组长"
    }
  }],
  property: {
    themeColor: {
      type: String,
      default: "#29b6f6"
    },
    icon: {
      type: String,
      default: "https://s1.ax1x.com/2020/10/02/0Qydde.png"
    },
    description: {
      type: String,
      default: "RTGroup"
    }
  }
});

const RTGroup = mongoose.model('RTGroup', RTGroupSchema);
module.exports = {RTGroup, RTGroupSchema};
