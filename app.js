const createError = require('http-errors');
const express = require('express');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require('cors')

const routers = require('./routes');

const app = express();

app.use(logger('dev'))
  .use(cors())
  .use(express.json())
  .use(express.urlencoded({ extended: false }))
  .use(cookieParser());

app.use('/', routers.rootRouter)
.use('/tracker', routers.trackerRouter)
.use('/tweet', routers.tweetRouter)
.use('/webhook', routers.webhookRouter)
.use('/lookup', routers.lookupRouter)
.use('/rtgroup', routers.rtgroupRouter)
.use('/users', routers.userRouter);

// catch 404 and forward to error handler
app.use((req, res, next) => {
  next(createError(404));
});

// error handler
app.use((err, req, res, next) => {
  // render the error page
  res.status(err.status || 500);
  res.send(req.app.get('env') === 'development' ? err.message : {});
});

module.exports = app;
