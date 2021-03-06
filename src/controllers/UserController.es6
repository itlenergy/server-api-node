
import express from 'express';
import {Context} from 'router-wrapper';

import ControllerBase from '../ControllerBase';
import {getPasswordHashBytes} from './AuthenticationController';


export default class UserController extends ControllerBase {
  constructor(app) {
    // register routes
    let router = express.Router();
    app.use('/users', router);
    
    this.setupMiddleware(router);
    
    let context = new Context(router, this)
      .get('/', this.requireRole('admin'), this.getAllUsers)
      .get('/:id', this.requireRole('admin'), this.getSingleUser)
      .post('/', this.requireRole('admin'), this.add)
      .put('/', this.requireRole('admin'), this.deletePassword, this.update)
      .delete('/:id', this.requireRole('admin'), this.remove)
      .post('/:id/password', this.requireRole('admin'), this.changePassword);
    
    // don't pass the router, because we need to set up all the routes manually to
    // modify the behaviour of the update method
    super(null, app, 'login_user', 'userId');
  }
  
  
  async getAllUsers(request, response) {
    let items = (await this.table.find()).map(function (user) {
      delete user.password;
      return user;
    });
    
    response.json({items});
  }
  
  
  async getSingleUser(request, response) {
    let item = await this.table.findOne(request.params.id);
    delete item.password;
    response.json(item);
  }
  
  
  async changePassword(request, response) {
    // get the user and bail if it doesn't exist
    let user = await this._getEntity(request, response);
    if (!user) return;
    
    let hash = await getPasswordHashBytes(user.username, request.body.password);
    await this.table.update(request.params.id, {password: hash});
    
    // otherwise send HTTP 204 No content
    response.status(204).send();
  }
  
  
  /**
   * Middleware to delete the password from update request.
   */
  deletePassword(request, response, next) {
    delete request.body.password;
    next();
  }
}