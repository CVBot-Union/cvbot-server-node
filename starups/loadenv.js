const dotenv = require('dotenv');
const path = require('path');
const commandLineArgs = require('command-line-args');// Setup command line options
const options = commandLineArgs([{ name: 'env', alias: 'e', defaultValue: 'prod', type: String, }]);
const envPath = path.join(__dirname + '/../env/' + options.env +'.env');
const result2 = dotenv.config({ path: envPath });
if (result2.error) { throw result2.error; }
