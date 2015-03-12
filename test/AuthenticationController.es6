
import {expect} from 'chai';
import supertest from 'supertest-as-promised';

import {app} from '../test-setup';
import ActuationController from '../src/controllers/AuthenticationController';

var pg = app.get('pg');


describe('AuthenticationController', function () {
  
  describe('login', function () {
    it('should return a ticket for a successful log in', async function () {
      let response = await supertest(app)
        .post('/auth/login')
        .send({
          username: 'admin',
          password: 'admin'
        })
        .expect(200);

      expect(response.body.ticket).to.exist;
    });
    
    it('should 403 on unsuccessful log in', async function () {
      await supertest(app)
        .post('/auth/login')
        .send({
          username: 'admin',
          password: 'foo'
        })
        .expect(403);
    });
  });
});
