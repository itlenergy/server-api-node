
import express from 'express';
import {Context} from 'router-wrapper';

import ControllerBase from '../ControllerBase';


export default class WeatherForecastController extends ControllerBase {
  constructor(app) {
    // register routes
    let router = express.Router();
    app.use('/weather_forecast', router);
    
    let context = new Context(router, this)
      .get('/:mintime/:maxtime', this.requireRole('admin'), this.getByTime('time_observed'));
    
    super(context, app, 'weather_forecast');
  }
}