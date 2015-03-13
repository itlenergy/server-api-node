
import {expect} from 'chai';
import supertest from 'supertest-as-promised';
import moment from 'moment';

import {app, setupData} from '../test-setup';
import ActuationController from '../src/controllers/MeasurementController';

var pg = app.get('pg');

// I could test all the actions, but I'll just test the stuff that MeasurementController doesn't cover

describe('SiteController', function () {
  var ticket;
  var annan;
  var sites = pg.table('site', {id: 'siteId', case: 'snake'});
  var weather = pg.table('weather', {id: 'weatherObservationId', case: 'snake'});
  
  before(async function () {
    await setupData();
    
    let response = await supertest(app)
      .post('/auth/login')
      .send({username: 'admin', password: 'admin'})
      .expect(200);
    
    ticket = response.body.ticket;
    
    annan = await sites.findOne({siteName: 'annan'});
  });
  
  describe('getChildEntities', function () {
    it('should get all child entities', async function () {
      let response = await supertest(app)
        .get(`/sites/${annan.siteId}/weather?sgauth=${ticket}`)
        .expect(200);
      
      expect(response.body.items).to.exist;
      let items = response.body.items;
      
      // assume if we have the right count and the right fields we're good
      expect(items).to.have.length(7);
      expect(items[0].observationTime).to.exist;
      expect(items[0].siteId).to.exist;
      expect(items[0].windSpeed).to.exist;
      expect(items[0].windDirection).to.exist;
      expect(items[0].ambientTemperature).to.exist;
      expect(items[0].humidity).to.exist;
      expect(items[0].uv).to.exist;
      expect(items[0].precipitation).to.exist;
    });
  });
  
  describe('getChildEntitiesByTime', function () {
    it('should get matching child entities', async function () {
      let response = await supertest(app)
        .get(`/sites/${annan.siteId}/weather/2013-07-13 19:00:00/2013-07-13 20:00:00?sgauth=${ticket}`)
        .expect(200);
      
      expect(response.body.items).to.exist;
      let items = response.body.items;
      
      expect(items).to.have.length(3);
      expect(items[0].observationTime).to.exist;
      expect(items[0].siteId).to.exist;
      expect(items[0].windSpeed).to.exist;
      expect(items[0].windDirection).to.exist;
      expect(items[0].ambientTemperature).to.exist;
      expect(items[0].humidity).to.exist;
      expect(items[0].uv).to.exist;
      expect(items[0].precipitation).to.exist;
      expect(items[0].observationTime).to.equal('2013-07-13 19:00:00');
      expect(items[0].siteId).to.equal(annan.siteId);
      expect(items[1].observationTime).to.equal('2013-07-13 19:30:00');
      expect(items[1].siteId).to.equal(annan.siteId);
      expect(items[2].observationTime).to.equal('2013-07-13 20:00:00');
      expect(items[2].siteId).to.equal(annan.siteId);
    });
  });
  
  describe('addChildEntity', function () {
    it('should add the child entity', async function () {
      let w = {
        observationTime: '2015-03-12 20:14:00',
        siteId: annan.siteId,
        windSpeed: 3.0 ,
        windDirection: 346,
        ambientTemperature: 11.5,
        humidity: 50.0,
        uv: 0.4,
        precipitation: 0.0
      };
      
      let response = await supertest(app)
        .post(`/sites/${annan.siteId}/weather?sgauth=${ticket}`)
        .send(w)
        .expect(201);
      
      let location = response.header['location'];
      let [_, id] = location.match(/.*\/([0-9]+)$/) || [];
      expect(id).to.exist;
      id = parseInt(id);
      
      w.weatherObservationId = id;
      expect(await weather.findOne(id)).to.deep.equal(w);
    });
  });
  
  
  describe('addChildEntities', function () {
    it('should add the child entities', async function () {
      let catherinefield = await sites.findOne({siteName: 'catherinefield'})
      
      let w = [
        {
          observationTime: '2015-03-12 20:14:00',
          siteId: catherinefield.siteId,
          windSpeed: 3.0 ,
          windDirection: 346,
          ambientTemperature: 11.5,
          humidity: 50.0,
          uv: 0.4,
          precipitation: 0.0
        },
        {
          observationTime: '2015-03-12 20:50:00',
          siteId: catherinefield.siteId,
          windSpeed: 3.0 ,
          windDirection: 346,
          ambientTemperature: 11.5,
          humidity: 50.0,
          uv: 0.4,
          precipitation: 0.0
        },
        {
          observationTime: '2015-03-12 20:55:00',
          siteId: catherinefield.siteId,
          windSpeed: 3.0 ,
          windDirection: 346,
          ambientTemperature: 11.5,
          humidity: 50.0,
          uv: 0.4,
          precipitation: 0.0
        }
      ];
      
      let response = await supertest(app)
        .put(`/sites/${catherinefield.siteId}/weather?sgauth=${ticket}`)
        .send({items: w})
        .expect(200);
      
      let inserted = (await weather.find({siteId: catherinefield.siteId}))
        .map((x) => { delete x.weatherObservationId; return x; });
      
      expect(inserted).to.deep.equal(w);
    });
  });
});
