
import express from 'express';
import {Context} from 'router-wrapper';

import ControllerBase from '../ControllerBase';


export default class TariffController extends ControllerBase {
  constructor(app) {
    // register routes
    let router = express.Router();
    app.use('/tariffs', router);
    
    let context = new Context(router, this)
      .get('/:id/blocks', this.requireRole('admin'), this.getChildEntities('tariff_block', 'tariff_id'))
      .post('/:id/blocks', this.requireRole('admin'), this.addChildEntity('tariff_id', 'tariff_block'))
      .put('/:id/blocks', this.requireRole('admin'), this.addChildEntities('tariff_id', 'tariff_block'))
      .get('/:id/blocks/:mintime/:maxtime', this.requireRole('admin'),
        this.getChildEntitiesByTime('tariff_block', 'tariff_id', 'start_time'));
    
    super(context, app, 'tarrif_block');
  }
}