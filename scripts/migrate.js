require('../starups');
const bcrypt = require('bcrypt');
const { User } = require('../models');

const initUserPassword = 'superpassword';

(async ()=>{
  try{
    const userCreate = await User.create({
      username: 'superuser',
      password: bcrypt.hashSync(initUserPassword, 4),
      isManager: true
    });
    console.log(`User Created: ${userCreate.username} with password: ${initUserPassword}`);
  }catch (e) {
    console.error('Errored while migrating.')
  }finally {
    process.exit(0);
  }
})();
