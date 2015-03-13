
import express from 'express';
import {Context} from 'router-wrapper';

import ControllerBase from '../ControllerBase';


export default class HubController extends ControllerBase {
  constructor(app) {
    // register routes
    let router = express.Router();
    app.use('/hubs', router);
    
    let context = new Context(router, this)
      .get('/:id/logs', this.requireRole('admin'), this.getChildEntities('hub_log', 'hubId'))
      .get('/:id/sensors', this.requireRole('admin'), this.getChildEntities('sensor', 'hubId'));
    
    super(context, app, 'hub', 'hubId');
  }
}