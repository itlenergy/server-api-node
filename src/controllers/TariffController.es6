
import express from 'express';
import {Context} from 'router-wrapper';

import ControllerBase from '../ControllerBase';


export default class TariffController extends ControllerBase {
  constructor(app) {
    // register routes
    let router = express.Router();
    app.use('/tariffs', router);
    
    let context = new Context(router, this)
      .get('/:id/blocks', this.requireRole('admin'), this.getChildEntities('tariff_block', 'tariffId'))
      .post('/:id/blocks', this.requireRole('admin'),
        this.addChildEntity('tariffBlockId', 'tariff_block', 'tariffId'))
      .put('/:id/blocks', this.requireRole('admin'),
        this.addChildEntities('tariffBlockId', 'tariff_block', 'tariffId'))
      .get('/:id/blocks/:mintime/:maxtime', this.requireRole('admin'),
        this.getChildEntitiesByTime('tariff_block', 'tariffId', 'startTime'));
    
    super(context, app, 'tarrif', 'tariffId');
  }
}