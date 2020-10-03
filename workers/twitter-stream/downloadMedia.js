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
}

module.exports = async (entities_list)=>{
  if(entities_list == null){
    return ;
  }

  await entities_list.map(async (d)=>{

    const fileDupCheck = await checkFileExist(d.id_str, d.type);
    if(fileDupCheck) {
      console.warn('[WARN] Trying to download an existing file, skipping! ');
      return;
    }

    if(d.type === 'video'){
      await downloadImage(d);
      await downloadVideo(d.video_info.variants[d.video_info.variants.length - 1].url,d.id_str);
      console.log('[INFO] Downloaded media(video) from ' + d.media_url_https);
    }
    else if(d.type === 'photo'){
      await downloadImage(d);
      console.info('[INFO] Downloaded media from(photo) ' + d.media_url_https);
    }else {
      console.warn("[WARN] Cannot download media, not [photo/video].")
    }
    return d;
  });
};

const checkFileExist = async (id_str, fileType) => {
  try{
    const doc = await s3.headObject({ ...bucketParams,
      Key: (fileType === 'photo' ? 'images/' : 'videos/') + id_str +
          (fileType === 'photo' ? '.png' : '.mp4')
    }).promise();
    return doc !== undefined;
  }catch (e) {
    if(e.statusCode === 404) {
      return false;
    }
  }
}
const downloadImage = async ({media_url_https,id_str }) =>{
  try{
    const response = await axios({
      url: media_url_https,
      method: 'GET',
      responseType: 'arraybuffer',
      onDownloadProgress: (e)=>{
        console.log('[DEBUG] Downloading media..' + e)
      }
    });
    const imgBuff = new Buffer.from(response.data, 'binary');
    const imgUploadParam = { ...bucketParams, ACL: 'private', Key: 'images/'+ id_str + '.png', Body: imgBuff };
    return await s3.upload(imgUploadParam).promise();
  }catch (e) {
    console.error(e);
    console.error('[ERROR] Fail to download media(photo) from twitter.')
  }
};

const downloadVideo = async (video_url, id_str)=>{
  try{
    const response = await axios({
      url: video_url,
      method: 'GET',
      responseType: 'arraybuffer',
      onDownloadProgress: (e)=>{
        console.debug('[DEBUG] Downloading media..' + e)
      }
    });
    const videoBuff = new Buffer.from(response.data, 'binary');
    const vidUploadParam = { ...bucketParams, ACL: 'private', Key:'videos/'+ id_str + '.mp4', Body: videoBuff };
    return await s3.upload(vidUploadParam).promise();
  } catch(e) {
    console.error('[ERROR] Fail to download media(video) from twitter.')
  }
}
