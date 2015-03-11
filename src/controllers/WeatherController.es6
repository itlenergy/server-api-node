
import express from 'express';
import {Context} from 'router-wrapper';

import ControllerBase from '../ControllerBase';


export default class WeatherController extends ControllerBase {
  constructor(app) {
    // register routes
    let router = express.Router();
    app.use('/weather', router);
    
    let context = new Context(router, this)
      .get('/:mintime/:maxtime', this.requireRole('admin'), this.getByTime('observation_time'));
    
    super(context, app, 'weather', 'weather_observation_id');
  }
}