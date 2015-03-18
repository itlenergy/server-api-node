
import express from 'express';
import {Context} from 'router-wrapper';

import ControllerBase from '../ControllerBase';


export default class SensorController extends ControllerBase {
  constructor(app) {
    // register routes
    let router = express.Router();
    app.use('/sensors', router);
    
    let context = new Context(router, this)
      .get('/:id/measurements', this.requireRole('admin'), this.getChildEntities('measurement', 'sensorId'))
      .get('/:id/measurements/:mintime/:maxtime', this.requireRole('admin'),
        this.getChildEntitiesByTime('measurement', 'sensorId', 'observationTime'))
      .post('/:id/measurements', this.requireHub,
        this.addChildEntity('measurementId', 'measurement', 'sensorId'))
      .put('/:id/measurements', this.requireHub,
        this.addChildEntities('measurementId', 'measurement', 'sensorId'));
    
    super(context, app, 'sensor', 'sensorId');
  }
  
  
  async requireHub(request, response, next) {
    let sensor = await this._getEntity(request, response);
    if (!sensor) return;
    
    // request succeeds if:
    //  - user is admin, or
    //  - user is hub and is related to the sensor's hub ID
    if (request.token != null &&
        (request.token.role === 'admin' ||
        (request.token.role === 'hub' && request.token.relatedId === sensor.hubId))) {
      next();
    } else {
      response.status(403).send();
    }
  }
}