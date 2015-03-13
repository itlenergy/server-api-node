
import express from 'express';
import {Context} from 'router-wrapper';

import ControllerBase from '../ControllerBase';


export default class ActuationController extends ControllerBase {
  constructor(app) {
    // register routes
    let router = express.Router();
    app.use('/actuations', router);
    
    let context = new Context(router, this)
      .get('/:mintime/:maxtime', this.requireRole('admin'), this.getByTime('actuationTime'));
    
    super(context, app, 'actuations', 'actuationId');
  }
}