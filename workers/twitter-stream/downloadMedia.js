const axios = require('axios');
const AWS = require('aws-sdk');

const s3 = new AWS.S3({
  endpoint: process.env.S3_ENDPOINT,
  accessKeyId: process.env.S3_AID,
  secretAccessKey: process.env.S3_AKEY,
  apiVersion: '2006-03-01'
});

const bucketParams = {
  Bucket: process.env.S3_BUCKET,
  ACL: 'private'
}

module.exports = (entities_list)=>{
  if(entities_list == null){
    return ;
  }

  entities_list.map((d)=>{
    if(d.type === 'video'){
      downloadImage(d);
      downloadVideo(d.video_info.variants[d.video_info.variants.length - 1].url,d.id_str,()=>{
        console.log('[INFO] Downloaded media(video) from ' + d.media_url_https);
      });
    }
    else if(d.type === 'photo'){
      downloadImage(d, ()=>{
        console.info('[INFO] Downloaded media from(photo) ' + d.media_url_https);
      })
    }else {
      console.warn("[WARN] Cannot download media, not [photo/video].")
    }
  });
};

const downloadImage = ({media_url_https,id_str,expanded_url },callback) =>{
  axios({
    url: media_url_https,
    method: 'GET',
    responseType: 'arraybuffer',
    onDownloadProgress: (e)=>{
      console.log('[DEBUG] Downloading media..' + e)
    }
  })
  .then(async (response)=>{
    const imgBuff = new Buffer.from(response.data, 'binary');
    const imgUploadParam = { ...bucketParams, Key: 'images/'+ id_str + '.png', Body: imgBuff };
    const s3Result = await s3.upload(imgUploadParam).promise();
    callback(s3Result)
  })
  .catch((e)=>{
    console.error(e);
    console.error('[ERROR] Fail to download media(photo) from twitter.')
  })
};

const downloadVideo = (video_url, id_str, callback)=>{
  axios({
    url: video_url,
    method: 'GET',
    responseType: 'arraybuffer',
    onDownloadProgress: (e)=>{
      console.debug('[DEBUG] Downloading media..' + e)
    }
  })
  .then(async (response)=>{
    const videoBuff = new Buffer.from(response.data, 'binary');
    const vidUploadParam = { ...bucketParams, Key:'videos/'+ id_str + '.mp4', Body: videoBuff };
    const s3Result = await s3.upload(vidUploadParam).promise();
    callback(s3Result)
  })
  .catch((e)=> {
    console.error('[ERROR] Fail to download media(video) from twitter.')
  })
}
