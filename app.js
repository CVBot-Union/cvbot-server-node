const express = require('express');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require('cors')

const routers = require('./routes');
const v2Routers = require('./routes/v2');
const { auth } = require('./middlewares')

const app = express();

app.use(logger('dev'))
  .use(cors())
  .use(express.json())
  .use(express.urlencoded({ extended: false }))
  .use(cookieParser());

app.use('/', routers.rootRouter)
  .use('/lookup', routers.lookupRouter)
  .use('/auth', routers.authRouter)
  .use(auth)
  .use('/tracker', routers.trackerRouter)
  .use('/tweet', routers.tweetRouter)
  .use('/stat', routers.statRouter)
  .use('/webhook', routers.webhookRouter)
  .use('/rtgroup', routers.rtgroupRouter)
  .use('/v2/rtgroup', v2Routers.rtgroupRouter)
  .use('/setting', routers.settingRouter)
  .use('/user', routers.userRouter)
  .use('/v2/user', v2Routers.userRouter);

module.exports = app;
