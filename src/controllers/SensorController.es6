
import express from 'express';
import {Context} from 'router-wrapper';

import ControllerBase from '../ControllerBase';


export default class SensorController extends ControllerBase {
  constructor(app) {
    // register routes
    let router = express.Router();
    app.use('/sensors', router);
    
    let context = new Context(router, this)
      .get('/:id/measurements', this.requireRole('admin'), this.getChildEntities('measurement', 'sensor_id'))
      .get('/:id/measurements/:mintime/:maxtime', this.requireRole('admin'),
        this.getChildEntitiesByTime('measurement', 'sensor_id', 'observation_time'))
      .post('/:id/measurements', this.requireHub, this.addChildEntity('sensor_id', 'measurement'))
      .put('/:id/measurements', this.requireHub, this.addChildEntities('sensor_id', 'measurement'));
    
    super(context, app, 'sensor');
  }
  
  
  async requireHub(request, response, next) {
    let sensor = await this._getEntity(request, response);
    if (!sensor) return;
    
    // request succeeds if:
    //  - user is admin, or
    //  - user is hub and is related to the sensor's hub ID
    if (request.token !== null &&
        (request.token.role === 'admin' ||
        (request.token.role === 'hub' && request.token.related_id === sensor.hub_id))) {
      next();
    } else {
      response.status(401).send();
    }
  }
}