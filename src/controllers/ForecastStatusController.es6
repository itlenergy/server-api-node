
import express from 'express';
import {Context} from 'router-wrapper';

import ControllerBase from '../ControllerBase';


export default class ForecastStatusController extends ControllerBase {
  constructor(app) {
    // register routes
    let router = express.Router();
    app.use('/forecast_status', router);
    
    let context = new Context(router, this)
      .get('/:mintime/:maxtime', this.requireRole('admin'), this.getByTime('time_forecast_for'));
    
    super(context, app, 'forecast_status');
  }
}