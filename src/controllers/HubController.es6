
import express from 'express';
import {Context} from 'router-wrapper';

import ControllerBase from '../ControllerBase';


export default class HubController extends ControllerBase {
  constructor(app) {
    // register routes
    let router = express.Router();
    app.use('/hubs', router);
    
    let context = new Context(router, this)
      .get('/:id/logs', this.requireRole('admin'), this.getChildEntities('hub_log', 'hub_id'))
      .get('/:id/sensors', this.requireRole('admin'), this.getChildEntities('sensor', 'hub_id'));
    
    super(context, app, 'hub');
  }
}