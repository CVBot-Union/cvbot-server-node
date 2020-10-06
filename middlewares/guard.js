module.exports = {
  checkIfAdmin: (req,res,next) => {
    if(req.user.userLevel < 1) {
      res.status(401).json({ success: false, response: { reason: 'Not Enough Privilege' } })
      return;
    }
    next();
  }
}
