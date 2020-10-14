require('../../starups')
const Twit = require('twit');
const { Tweet,Tracker } = require('../../models');
const webhookInstance = require('../../services/webhook/hookModifier');
const mediaDownloader = require('./downloadMedia');

const T = new Twit({
  consumer_key: process.env.TW_CKEY,
  consumer_secret: process.env.TW_CS,
  access_token: process.env.TW_AT,
  access_token_secret: process.env.TW_ATS,
  timeout_ms: 60 * 1000,  // optional HTTP request timeout to apply to all requests.
  strictSSL: true,     // optional - requires SSL certificates to be valid.
});

const getFollowsIDs = async () => {
  let followIDs = [];
  let result = await Tracker.find().select('uid');
  result.forEach(d => {
    followIDs.push(d.uid)
  });
  console.info('[INFO] Reloaded follows id array now length: ' + followIDs.length);
  return followIDs;
};

const handleTweet = async (tweet) => {
  if(tweet === undefined) {
    console.warn('[Warn] Got a tweet with nothing inside, skipping, recursion fault?')
    return;
  }
  // Check if tweet is retweeted
  if(typeof tweet.retweeted_status === 'object')
  {
    await handleTweet(tweet.retweeted_status);
  }
  // Check if tweet is retweet with comment aka. quote
  if(tweet.is_quote_status)
  {
    await handleTweet(tweet.quoted_status)
  }
  // Check if tweet is a reply to a parent tweet
  else if(tweet.in_reply_to_status_id_str !== null)
  {
    handleReplyTweet(tweet.in_reply_to_status_id_str)
  }
  if (tweet.truncated) { // if the tweet is the new version of 280 char, get from extended_entities
    if(tweet.extended_tweet === undefined){
      return ;
    }
    if(tweet.extended_tweet.extended_entities !== undefined){
      await mediaDownloader(tweet.extended_tweet.extended_entities.media);
    }
  } else if (tweet.extended_entities !== undefined){
   await mediaDownloader(tweet.extended_entities.media);
  }
};

const handleReplyTweet = (id_str) => {
  T.get('/statuses/show/:id', { id: id_str},(err,data)=>{
    if(err){
      console.error('[ERROR] Can not get tweet ' + id_str)
    }else{
      Tweet.create({...data, is_feed: false}, async (err,docs)=>{
        if(err){
          if(err.code === 11000) {
            console.warn("[WARN] Attempted to store a saved tweet, skipping!")
            return;
          }
          console.error(err);
          console.error("[ERROR] Failed to store tweet " + id_str)
        }else{
          await handleTweet(docs)
        }
      })
    }
  })
}

const mainThread = async() => {

  const followIDs = await getFollowsIDs();

  const stream = T.stream('statuses/filter', {
    follow: followIDs,
    filter_level: 'none'
  });

  stream.on('tweet', (tweet) => {
    if (followIDs.indexOf(tweet.user.id_str) === -1) {
      console.debug(`[Debug] Rejected Tweet from ${tweet.user.screen_name}(${tweet.user.id_str}), not in list.`)
      return;
    }

    if(tweet.is_quote_status) {
      console.debug(`[Debug] Rejected Tweet from ${tweet.user.screen_name}(${tweet.user.id_str}), is a RT.`);
      return;
    }

    Tweet.create({...tweet}, async (err, docs)=>{
      if(err){
        if(err.code === 11000) {
          console.warn("[WARN] Attempted to store a saved tweet, skipping!")
          return;
        }
        console.error(err);
        return;
      }
      const groupLookup = await Tracker.findOne({ 'uid': tweet.user.id_str }).select('qqGroups nickname');
      webhookInstance.trigger({
        type: 'tweet',
        data: { tweet:{ ...tweet, qqGroups: groupLookup.qqGroups, initUserNickname: groupLookup.nickname} }
      });
      console.info(`[INFO] New tweet from ${docs.user.screen_name} stored with id ${docs.id_str}`);
      await handleTweet(tweet);
    })

  })

  stream.on('disconnect', () => {
    process.send(`[INFO] Twitter Stream Disconnected`);
  })

  stream.on('connected', (event) => {
    process.send('[INFO] Connected to Twitter Stream')
    process.send(`[INFO] Stream with current Follow IDs: ${event.request.body}`)
  })

  stream.on('error', (event) => {
    process.send(`[ERROR] ${event.message} with reply ${event.twitterReply}`)
  })
}

mainThread();
