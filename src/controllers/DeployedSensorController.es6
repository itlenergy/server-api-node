
import express from 'express';
import {Context} from 'router-wrapper';

import ControllerBase from '../ControllerBase';


export default class DeployedSensorController extends ControllerBase {
  constructor(app) {
    // register routes
    let router = express.Router();
    app.use('/deployedsensors', router);
    
    let context = new Context(router, this);
    super(context, app, 'deployed_sensor', 'typeId');
  }
}