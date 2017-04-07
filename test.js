'use strict';

const path = require('path');
const test = require('ava');
const request = require('supertest');
const express = require('express');
const routes = require('express-mount-routes');
const finalResp = require('./index.js');

function makeApp() {
  const app = express();
  app.set('view engine', 'pug');
  routes(app, path.join(__dirname, 'controllers'));
  app.use((isAPI = true) => {
    if (isAPI) {
      return (req, res, next) => next({status: 'APINotFound'});
    } else {
      return (req, res, next) => next({status: 'PageNotFound', view: '404'});
    }
  });
  app.use(finalResp({isDebug: true}));
  return app;
}

function makeAppWithStringReturn() {
  const app = express();
  app.set('view engine', 'pug');
  routes(app, path.join(__dirname, 'controllers'));
  app.use(() => (req, res, next) => next({status: 'APINotFound'}));
  app.use(finalResp({isDebug: true, JSONformat: 'String'}));
  return app;
}

test('GET /tests/1', async t => {
  t.plan(2);

  const res = await request(makeApp())
    .get('/tests/1');

  t.is(res.status, 200);
  t.is(res.body.msg, 'test 1 success');
});

test('GET /tests/2', async t => {
  t.plan(2);

  const res = await request(makeApp())
    .get('/tests/2');

  t.is(res.status, 500);
  t.is(res.body.desc, 'Request Error!');
});

test('GET /tests/3', async t => {
  t.plan(3);

  const res = await request(makeApp())
    .get('/tests/3');

  t.is(res.status, 503);
  t.is(res.body.status, 'DBError');
  t.is(res.body.msg, 'TrueError');
});

test('GET /tests/4', async t => {
  t.plan(3);

  const res = await request(makeApp())
    .get('/tests/4');

  t.is(res.status, 500);
  t.is(res.type, 'text/html');
  t.is(res.text, '<html><head><title>I am an error</title></head><body><h1>Error: I am an error</h1></body></html>');
});

test('GET /tests/5', async t => {
  t.plan(3);

  const res = await request(makeApp())
    .get('/tests/5');

  t.is(res.status, 500);
  t.is(res.type, 'application/json');
  t.is(res.body.msg, 'I am an error');
});

test('GET /tests/1', async t => {
  t.plan(2);

  const res = await request(makeAppWithStringReturn())
    .get('/tests/1');

  t.is(res.status, 200);
  t.is(res.type, 'text/plain');
});

test('GET /tests/6', async t => {
  t.plan(3);

  const res = await request(makeApp())
    .get('/tests/6');

  t.is(res.status, 200);
  t.is(res.type, 'text/html');
  t.is(res.text, '<html><head><title>test 1 success</title></head><body><h1>Request Successful!</h1></body></html>');
});
