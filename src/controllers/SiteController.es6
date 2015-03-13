
import express from 'express';
import {Context} from 'router-wrapper';

import ControllerBase from '../ControllerBase';


export default class SiteController extends ControllerBase {
  constructor(app) {
    // register routes
    let router = express.Router();
    app.use('/sites', router);
    
    let context = new Context(router, this)
      .get('/:id/houses', this.requireRole('admin'), this.getChildEntities('house', 'siteId'))
      .get('/:id/weather', this.requireRole('admin'), this.getChildEntities('weather', 'siteId'))
      .get('/:id/weather/:mintime/:maxtime', this.requireRole('admin'),
        this.getChildEntitiesByTime('weather', 'siteId', 'observationTime'))
      .post('/:id/weather', this.requireSite, 
        this.addChildEntity('weatherObservationId', 'weather', 'siteId'))
      .put('/:id/weather', this.requireSite,
        this.addChildEntities('weatherObservationId', 'weather', 'siteId'));
    
    super(context, app, 'site', 'siteId');
  }
  
  
  async requireSite(request, response, next) {
    // request succeeds if:
    //  - user is an admin, or
    //  - user is a weather-reporter and is related to the site id
    if (request.token !== null &&
        (request.token.role === 'admin' ||
        (request.token.role === 'weather-reporter' && request.token.relatedId === request.params.id))) {
      next();
    } else {
      response.status(403).send();
    }
  }
}