module.exports = {
  apps: [{
    name: "twitter-stream-worker",
    script: "./workers/twitter-stream/daemon.js",
    args: "--env prod"
  },{
    name: "cvbot-app-server",
    script: "./bin/www",
    args: "--env prod",
    exec_mode: "cluster"
  }]
}

