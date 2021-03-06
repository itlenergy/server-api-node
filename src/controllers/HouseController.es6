
import express from 'express';
import {Context} from 'router-wrapper';

import ControllerBase from '../ControllerBase';


export default class HouseController extends ControllerBase {
  constructor(app) {
    // register routes
    let router = express.Router();
    app.use('/houses', router);
    
    let context = new Context(router, this)
      .get('/:id/hubs', this.requireRole('admin'), this.getChildEntities('hub', 'houseId'))
      .get('/:id/tariffs', this.requireRole('admin'), this.getChildEntities('tariff', 'houseId'))
      .get('/:id/hubs', this.requireRole('admin'), this.getChildEntities('hub', 'houseId'));
    
    super(context, app, 'house', 'houseId');
  }
}