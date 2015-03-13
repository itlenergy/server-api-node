
import express from 'express';
import {Context} from 'router-wrapper';

import ControllerBase from '../ControllerBase';


export default class ElectricalLoadForecastController extends ControllerBase {
  constructor(app) {
    // register routes
    let router = express.Router();
    app.use('/electrical_load_forecast', router);
    
    let context = new Context(router, this)
      .get('/:mintime/:maxtime', this.requireRole('admin'), this.getByTime('timeObserved'));
    
    super(context, app, 'electrical_load_forecast', 'electricalForecastId');
  }
}