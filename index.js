#!/usr/local/bin/node --harmony

// translate ES6 to get async/await, import/export, classes and other goodies
require('babel/register');

// start the server
var server = require('./src/server');
server.start();