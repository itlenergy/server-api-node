
import express from 'express';
import {Context} from 'router-wrapper';

import ControllerBase from '../ControllerBase';


export default class ElectricalLoadController extends ControllerBase {
  constructor(app) {
    // register routes
    let router = express.Router();
    app.use('/electrical_load', router);
    
    let context = new Context(router, this)
      .get('/:mintime/:maxtime', this.requireRole('admin'), this.getByTime('observed'));
    
    super(context, app, 'electrical_load', 'id');
  }
}