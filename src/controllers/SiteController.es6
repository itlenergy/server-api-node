
import express from 'express';
import {Context} from 'router-wrapper';

import ControllerBase from '../ControllerBase';


export default class SiteController extends ControllerBase {
  constructor(app) {
    // register routes
    let router = express.Router();
    app.use('/sites', router);
    
    let context = new Context(router, this)
      .get('/:id/houses', this.requireRole('admin'), this.getChildEntities('house', 'site_id'))
      .get('/:id/weather', this.requireRole('admin'), this.getChildEntities('weather', 'site_id'))
      .get('/:id/weather/:mintime/:maxtime', this.requireRole('admin'),
        this.getChildEntitiesByTime('weather', 'site_id', 'observation_time'))
      .post('/:id/weather', this.requireHub, this.addChildEntity('site_id', 'weather'))
      .put('/:id/weather', this.requireHub, this.addChildEntities('site_id', 'weather'));
    
    super(context, app, 'site');
  }
  
  
  async requireSite(request, response, next) {
    // request succeeds if:
    //  - user is an admin, or
    //  - user is a weather-reporter and is related to the site id
    if (request.token !== null &&
        (request.token.role === 'admin' ||
        (request.token.role === 'weather-reporter' && request.token.related_id === request.params.id))) {
      next();
    } else {
      response.status(401).send();
    }
  }
}