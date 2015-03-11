// translate ES6 to get async/await, import/export, classes and other goodies
require('babel/register')({
  optional: ['asyncToGenerator']
});

// start the server
var server = require('./src/server');
server.start();