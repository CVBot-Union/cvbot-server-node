module.exports = {
  handler: require('./handler'),
  auth: require('./authenticate').authenticateToken,
  guard: require('./guard')
}
