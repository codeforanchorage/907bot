'use strict';

// jscs:disable requireCapitalizedComments
// jscs:disable requireCurlyBraces

require('dotenv').config();

let assert = require('assert');
let request = require('supertest-koa-agent');
let mongoose = require('mongoose');

let l = require('./../modules/logger.js')();
let app = require('./../lib/app').app;

// Model Schemas
let ssUser = require('./../models/server.schema.user');
let ssNotify = require('./../models/server.schema.notification');

// Models
let User = mongoose.model('User', ssUser);
let Notify = mongoose.model('Notification', ssNotify);

describe('Web server', function() {
  it('should allow for GET on the dashboard', function(done) {
    request(app)
      .get('/public/index.html')
      .expect(200)
      .end(function(err, res) {
        if (err) throw err;
        done();
      });
  });
});

let user = {
  name: 'Jon Stewart',
  phone: process.env.TEST_PHONENUMBER,
};

before('Reset Data', function(done) {
  l.c(`Remove the test user.`);
  User.find({
    _id: process.env.TEST_PHONENUMBER,
  }).remove().exec();
  done();
  l.lf();
});

describe('SMS Response', function() {

  it('should ask an unknown user for their name', function(done) {
    request(app)
      .post('/sms')
      .send({
        Body: 'lorem ipsum',
        From: user.phone,
      })
      // Expect register user cookie
      .expect('set-cookie', 'state=1; path=/; httponly')
      .expect(function(res) {
        let q = `Can I get your name?`;
        assert.equal(res.text.toString().includes(q), true);
      })
      .end(function(err, res) {
        if (err) throw err;
        done();
        l.lf();
      });
  });

  it('should ask the user if the spelling is correct', function(done) {

    request(app)
      .post('/sms')
      // REGISTER_USER cookie value
      .set('Cookie', 'state=1')
      .send({
        Body: user.name,
        From: user.phone,
      })
      .expect(function(res) {
        let q = `Is ${user.name} the correct spelling of your name?`;
        // l.c(res.text);
        assert.equal(res.text.toString().includes(q), true);
      })
      // Expect session bag
      .expect('set-cookie', `temp=${user.name}; path=/; httponly`)
      .end(function(err, res) {
        if (err) throw err;
        done();
        l.lf();
      });
  });

  it('should decline if the spelling is not confirmed', function(done) {
    request(app)
      .post('/sms')
      // REGISTER_USER cookie value
      .set('Cookie', [`state=1;temp=${user.name}`])
      .send({
        Body: 'No',
        From: user.phone,
      })
      .expect(200)
      .expect(function(res) {
        let q = `Can I get the correct spelling`;
        assert.equal(res.text.toString().includes(q), true);
      })
      .end(function(err, res) {
        if (err) throw err;
        done();
        l.lf();
      });
  });

  it('should register a user if spelling name confirmed', function(done) {
    request(app)
      .post('/sms')
      // REGISTER_USER cookie value
      .set('Cookie', [`state=1;temp=${user.name}`])
      .send({
        Body: 'Yes',
        From: user.phone,
      })
      .expect(200)
      .expect(function(res) {
        let q = `${user.name}, you are now a registered user!`;
        assert.equal(res.text.toString().includes(q), true);
      })
      .end(function(err, res) {
        if (err) throw err;
        done();
        l.lf();
      });
  });

});
