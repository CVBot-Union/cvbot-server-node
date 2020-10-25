const NodeRSA = require('node-rsa');
const fs = require('fs');
const path = require('path');
const privateKey = fs.readFileSync(
    path.join(__dirname + '/../../keys/private.key'));
const publicKey = fs.readFileSync(
    path.join(__dirname + '/../../keys/key.pub')
)
const privateKeyChain = new NodeRSA(privateKey,'pkcs1-private');
const publicKeyChain = new NodeRSA(publicKey,'pkcs8-public');

const decrypt = (data) => {
  return privateKeyChain.decrypt(data);
}

const encrypt = (data) => {
  return publicKeyChain.encrypt(data,'base64','utf8');
}

module.exports = {
  decrypt, encrypt
}
