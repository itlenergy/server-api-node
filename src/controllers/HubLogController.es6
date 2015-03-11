
import express from 'express';
import {Context} from 'router-wrapper';

import ControllerBase from '../ControllerBase';


export default class HubLogController extends ControllerBase {
  constructor(app) {
    // register routes
    let router = express.Router();
    app.use('/hublogs', router);
    
    let context = new Context(router, this);
    super(context, app, 'hub_log');
  }
}