handler = (res,err,docs)=>{
  if(err){
    res.status(500).json({
      success:false,
      response:err
    })
  }else{
    if(!docs){
      res.status(400).json({
        success:false,
        response: null
      })
    }else{
      if(docs.userError){
        res.status(400).json({
          success:false,
          response: docs.response
        })
      }else {
        res.status(200).json({
          success: true,
          response: docs
        })
      }
    }
  }
};

module.exports = handler;
