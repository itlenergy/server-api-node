
import express from 'express';
import {Context} from 'router-wrapper';
import crypto from 'crypto';
import Promise from 'bluebird';
import jwt from 'jsonwebtoken';

var pbkdf2 = Promise.promisify(crypto.pbkdf2);
const passwordIterations = 1024;
const passwordHashLength = 64;
const tokenExpiresAfterMins = 20;


export default class AuthenticationController {
  constructor(app) {
    // get the table
    let pg = app.get('pg');
    this.table = pg.table('login_user', {id: 'userId', case: 'snake'});
    
    // get auth config
    this.authSecret = app.get('config').authSecret;
    
    // register routes
    let router = express.Router();
    app.use('/auth', router);
    
    new Context(router, this)
      .post('/login', this.login)
      .get('/renew', this.renew);
  }
  
  
  async login(request, response) {
    // get the user
    let user = await this.table.findOne({username: request.body.username});
    let hash = await getPasswordHash(request.body.username, request.body.password);
    
    if (user === null || hash !== user.password.toString('hex')) {
      // the authentication was unsuccessful, send HTTP 403
      response.status(403).send();
      return;
    } 
    
    this.sendToken(user, response);
  }
  
  
  async renew(request, response) {
    let user = request.token;
    
    if (!user) {
      // not authorised
      response.status(401).send();
    } else {
      this.sendToken(user, response);
    }
  }
  
  
  sendToken(user, response) {
    let token = {
      // called 'ticket' rather than 'token' for backwards compatibility
      ticket: jwt.sign({username: user.username, role: user.role, relatedId: user.relatedId}, this.authSecret, {expiresInMinutes: tokenExpiresAfterMins})
    };
    
    response.json(token);
  }
}

export function getPasswordHash(username, password) {
  return getPasswordHashBytes(username, password)
    .then((x) => x.toString('hex'));
};
  
export function getPasswordHashBytes(username, password) {
  return pbkdf2(username, password, passwordIterations, passwordHashLength);
};