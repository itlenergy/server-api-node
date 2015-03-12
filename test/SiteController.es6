
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
  
  before(async function () {
    await setupData();
    
    let response = await supertest(app)
      .post('/auth/login')
      .send({username: 'admin', password: 'admin'})
      .expect(200);
    
    ticket = response.body.ticket;
    
    annan = await pg.table('site').findOne({site_name: 'annan'});
  });
  
  describe('getChildEntities', function () {
    it('should get all child entities', async function () {
      let response = await supertest(app)
        .get(`/sites/${annan.site_id}/weather?sgauth=${ticket}`)
        .expect(200);
      
      expect(response.body.items).to.exist;
      let items = response.body.items;
      
      // assume if we have the right count and the right fields we're good
      expect(items).to.have.length(7);
      expect(items[0].observation_time).to.exist;
      expect(items[0].site_id).to.exist;
      expect(items[0].wind_speed).to.exist;
      expect(items[0].wind_direction).to.exist;
      expect(items[0].ambient_temperature).to.exist;
      expect(items[0].humidity).to.exist;
      expect(items[0].uv).to.exist;
      expect(items[0].precipitation).to.exist;
    });
  });
  
  describe('getChildEntitiesByTime', function () {
    it('should get matching child entities', async function () {
      let response = await supertest(app)
        .get(`/sites/${annan.site_id}/weather/2013-07-13 19:00:00/2013-07-13 20:00:00?sgauth=${ticket}`)
        .expect(200);
      
      expect(response.body.items).to.exist;
      let items = response.body.items;
      
      expect(items).to.have.length(3);
      expect(items[0].observation_time).to.exist;
      expect(items[0].site_id).to.exist;
      expect(items[0].wind_speed).to.exist;
      expect(items[0].wind_direction).to.exist;
      expect(items[0].ambient_temperature).to.exist;
      expect(items[0].humidity).to.exist;
      expect(items[0].uv).to.exist;
      expect(items[0].precipitation).to.exist;
      expect(items[0].observation_time).to.equal('2013-07-13 19:00:00');
      expect(items[0].site_id).to.equal(annan.site_id);
      expect(items[1].observation_time).to.equal('2013-07-13 19:30:00');
      expect(items[1].site_id).to.equal(annan.site_id);
      expect(items[2].observation_time).to.equal('2013-07-13 20:00:00');
      expect(items[2].site_id).to.equal(annan.site_id);
    });
  });
  
  describe('addChildEntity', function () {
    it('should add the child entity', async function () {
      let w = {
        observation_time: '2015-03-12 20:14:00',
        site_id: annan.site_id,
        wind_speed: 3.0 ,
        wind_direction: 346,
        ambient_temperature: 11.5,
        humidity: 50.0,
        uv: 0.4,
        precipitation: 0.0
      };
      
      let response = await supertest(app)
        .post(`/sites/${annan.site_id}/weather?sgauth=${ticket}`)
        .send(w)
        .expect(201);
      
      let location = response.header['location'];
      let [_, id] = location.match(/.*\/([0-9]+)$/) || [];
      expect(id).to.exist;
      id = parseInt(id);
      
      w.weather_observation_id = id;
      expect(await pg.table('weather', 'weather_observation_id').findOne(id)).to.deep.equal(w);
    });
  });
  
  
  describe('addChildEntities', function () {
    it('should add the child entities', async function () {
      let catherinefield = await pg.table('site').findOne({site_name: 'catherinefield'})
      
      let w = [
        {
          observation_time: '2015-03-12 20:14:00',
          site_id: catherinefield.site_id,
          wind_speed: 3.0 ,
          wind_direction: 346,
          ambient_temperature: 11.5,
          humidity: 50.0,
          uv: 0.4,
          precipitation: 0.0
        },
        {
          observation_time: '2015-03-12 20:50:00',
          site_id: catherinefield.site_id,
          wind_speed: 3.0 ,
          wind_direction: 346,
          ambient_temperature: 11.5,
          humidity: 50.0,
          uv: 0.4,
          precipitation: 0.0
        },
        {
          observation_time: '2015-03-12 20:55:00',
          site_id: catherinefield.site_id,
          wind_speed: 3.0 ,
          wind_direction: 346,
          ambient_temperature: 11.5,
          humidity: 50.0,
          uv: 0.4,
          precipitation: 0.0
        }
      ];
      
      let response = await supertest(app)
        .put(`/sites/${catherinefield.site_id}/weather?sgauth=${ticket}`)
        .send({items: w})
        .expect(200);
      
      let inserted = (await pg.table('weather').find({site_id: catherinefield.site_id}))
        .map((x) => { delete x.weather_observation_id; return x; });
      
      expect(inserted).to.deep.equal(w);
    });
  });
});
