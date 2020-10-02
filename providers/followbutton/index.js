class FollowButton {
  constructor () {
    this.http = require('axios');
    this.endpoint = require('../../const/url').followbutton;
    // Bind
    this.getInfoById = this.getInfoById.bind(this);
    this.getInfoByDisplayName = this.getInfoByDisplayName.bind(this);
  }
  getInfoById (id) {
    return this.http.get(this.endpoint, {
      params: {
        user_ids: id
      }
    });
  }
  getInfoByDisplayName (name) {
    return this.http.get(this.endpoint, {
      params: {
        screen_names: name
      }
    });
  }
}
module.exports = FollowButton;
