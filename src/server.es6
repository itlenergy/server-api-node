import commander from 'commander';
import _ from 'lodash';
import fs from 'fs';
import express from 'express';
import compression from 'compression';
import bodyParser from 'body-parser';
import winston from 'winston';
import moment from 'moment';
import path from 'path';
import jwt from 'jsonwebtoken';
import PostgresPlus, {types} from 'pg-plus';

import {version} from '../package.json';

/**
 * Starts the server.
 */
export function start() {
  let config = getConfig();
  let app = getApp(config);
  
  // start the app listening
  let port = parseInt(config.listen);
  
  if (!isNaN(port)) {
    app.listen(port);
    config.logger.info('Listening on port %d', port);
  } else {
    app.listen(listen);
    config.logger.info('Listening on socket file "%s"', config.listen);
  }
};


export function getApp(config) {
  // set up logger
  config.logger = new winston.Logger({
    transports: [
      new winston.transports.Console({
        level: process.env.NODE_ENV == 'production' ? 'info' : 'silly',
        colorize: true,
        timestamp: () => moment().format('YYYY-MM-DD HH:mm:ss.SSS')
      })
    ]
  });
  
  config.logger.debug('debug logging enabled');
  
  // set up express app
  let app = express();
  app.use(compression());
  app.use(bodyParser.json())
  app.set('config', config);
  
  // set up database connection
  setupDb(app);
  
  // set up middleware
  setupMiddleware(app);
  
  // require all the controllers
  let controllersPath = path.join(__dirname, 'controllers');
  let controllers = fs.readdirSync(controllersPath);
  
  for (let i in controllers) {
    let Controller = require('./controllers/' + controllers[i]);
    Controller = Controller && Controller.__esModule ? Controller["default"] : Controller;
    (new Controller(app));
  }
  
  return app;
};


function setupDb(app) {
  // set up the connection
  let pg = new PostgresPlus(app.get('config').database);
  app.set('pg', pg);
  
  // make timestamps return as strings in the desired format
  // these constants can be got from the database like so:
  //   select oid, typname from pg_type where typtype = 'b' order by oid
  let timestamp_oid = 1184;
  let timestamptz_oid = 1114;
  
  function formatDate(val) {
    if (val === null) return null;
    else return moment.utc(val).format('YYYY-MM-DD HH:mm:ss');
  }
  
  types.setTypeParser(timestamp_oid, formatDate);
  types.setTypeParser(timestamptz_oid, formatDate);
}


function setupMiddleware(app) {
  let config = app.get('config');
  
  // set up the authentication middleware
  app.use(function middleware(request, response, next) {
    // get the token and verify it
    if (request.query.sgauth) {
      jwt.verify(request.query.sgauth, config.authSecret, function (err, token) {
        if (err) {
          // there was an error verifying the token
          if (err.name === 'TokenExpiredError' || err.name === 'JsonWebTokenError') {
            // the error was related it being a dodgy token, send HTTP 403
            response.status(403).send();
          } else {
            // some error occurred
            next(err);
          }
        } else {
          // make the token available to the request handler
          request.token = token;
          next();
        }
      });
    } else {
      next();
    }
  });
}


/**
 * Reads command line options and return them as an object.
 */
function getConfig() {
  // read command line options
  commander
    .version(version)
    .option('--database [connection string]', 'The database connection string', 'postgres://postgres:postgres@localhost/postgres')
    .option('--config [file]', 'Reads these options from a config JSON file')
    .option('--authSecret [secret]', 'Sets the authentication secret', 'secret')
    .option('--listen [value]', 'Listen on port or socket [3000]', '3000')
    .parse(process.argv);
  
  // check if a config file was specified
  if (commander.config) {
    let config = JSON.parse(fs.readFileSync(commander.config));
    return _.extend(config, commander);
  } else {
    return commander;
  }
}
