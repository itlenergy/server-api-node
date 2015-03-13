
import express from 'express';
import {Context} from 'router-wrapper';

import ControllerBase from '../ControllerBase';


export default class TariffBlockController extends ControllerBase {
  constructor(app) {
    // register routes
    let router = express.Router();
    app.use('/tariff_blocks', router);
    
    let context = new Context(router, this);
    super(context, app, 'tariff_block', 'tariffBlockId');
  }
}