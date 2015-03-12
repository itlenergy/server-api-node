
import {expect} from 'chai';
import supertest from 'supertest-as-promised';
import moment from 'moment';

import {app, setupData} from '../test-setup';
import ActuationController from '../src/controllers/MeasurementController';

var pg = app.get('pg');

describe('MeasurementController', function () {
  var ticket;
  
  before(async function () {
    await setupData();
    
    let response = await supertest(app)
      .post('/auth/login')
      .send({username: 'admin', password: 'admin'})
      .expect(200);
    
    ticket = response.body.ticket;
  });
  
  describe('getAll', function () {
    it('should return all the entities', async function () {
      let response = await supertest(app)
        .get(`/measurements?sgauth=${ticket}`)
        .expect(200);

      // assume that if it's got the right number of results
      // and the fields are right then it's probably ok
      expect(response.body.items).to.exist;
      expect(response.body.items).to.have.length(11);
      
      let m = response.body.items[0];
      expect(m.measurement_id).to.exist;
      expect(m.sensor_id).to.exist;
      expect(m.observation_time).to.exist;
      expect(m.observation).to.exist;
    });
  });
  
  describe('getSingle', function () {
    it('should return a single entity', async function () {
      // pick an ID
      let m = await pg.table('measurement').findOne();
      m.observation_time = moment.utc(m.observation_time).format('YYYY-MM-DD HH:mm:ss');
      
      let response = await supertest(app)
        .get(`/measurements/${m.measurement_id}?sgauth=${ticket}`)
        .expect(200);
      
      expect(response.body).to.deep.equal(m);
    });
  });
  
  describe('add', function () {
    it('should add the entity', async function () {
      // get a random sensor
      let sensor = await pg.table('sensor').findOne();
      
      let m = {
        sensor_id: sensor.sensor_id,
        observation_time: '2015-03-12 17:45:00',
        observation: 3.24
      };
      
      let response = await supertest(app)
        .post(`/measurements?sgauth=${ticket}`)
        .send(m)
        .expect(201);
      
      let location = response.header['location'];
      let [_, id] = location.match(/.*\/([0-9]+)$/) || [];
      expect(id).to.exist;
      id = parseInt(id);
      
      m.measurement_id = id;
      expect(await pg.table('measurement', 'measurement_id').findOne(id)).to.deep.equal(m);
    });
  });
  
  describe('update', function () {
    it('should update the entity', async function () {
      // get a random measurement
      let measurements = pg.table('measurement', 'measurement_id');
      let measurement = await measurements.findOne();
      
      let updated = {
        measurement_id: measurement.measurement_id,
        sensor_id: measurement.sensor_id,
        observation_time: '2015-03-12 18:07:00',
        observation: 0.33
      };
      
      let response = await supertest(app)
        .put(`/measurements?sgauth=${ticket}`)
        .send(updated)
        .expect(204);
      
      measurement = await measurements.findOne(measurement.measurement_id);
      expect(measurement).to.deep.equal(updated);
    });
  });
  
  describe('remove', function () {
    it('should remove the entity', async function () {
       // get a random measurement
      let measurements = pg.table('measurement', 'measurement_id');
      let measurement = await measurements.findOne();
      
      let response = await supertest(app)
        .delete(`/measurements/${measurement.measurement_id}?sgauth=${ticket}`)
        .expect(204);
      
      expect(await measurements.findOne(measurement.measurement_id)).to.not.exist;
    });
  });
  
  describe('getByTime', function () {
    it('should get only the entities between the specified times', async function () {
      let response = await supertest(app)
        .get(`/measurements/2013-07-13 01:00:00/2013-07-13 02:00:00?sgauth=${ticket}`)
        .expect(200);
      
      expect(response.body.items).to.exist;
      
      let measurements = response.body.items;
      expect(measurements).to.have.length(3);
      expect(measurements[0].observation).to.equal(0.09);
      expect(measurements[1].observation).to.equal(0.1);
      expect(measurements[2].observation).to.equal(0.12);
    });
  });
});
