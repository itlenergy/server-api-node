
import express from 'express';
import {Context} from 'router-wrapper';

import ControllerBase from '../ControllerBase';


export default class StatusEventController extends ControllerBase {
  constructor(app) {
    // register routes
    let router = express.Router();
    app.use('/events', router);
    
    let context = new Context(router, this);
    super(context, app, 'status_events', 'status_id');
  }
}