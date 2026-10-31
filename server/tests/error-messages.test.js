// Tests for #45 VPS-NF-005 (TC-NF-004): readable validation and error messages
const express = require('express');
const request = require('supertest');
const mongoose = require('mongoose');
const errorHandler = require('../src/middleware/errorHandler');

// Small app that throws the kinds of errors the real routes can produce
function appThrowing(makeError) {
  const app = express();
  app.use(express.json());
  app.all('/boom', () => {
    throw makeError();
  });
  app.use(errorHandler);
  return app;
}

const Slot = mongoose.model('ErrSlot', new mongoose.Schema({
  slotId: { type: String, required: true },
  status: { type: String, enum: ['Available', 'Occupied'] },
}));

describe('errorHandler readable messages (TC-NF-004)', () => {
  beforeAll(() => jest.spyOn(console, 'error').mockImplementation(() => {}));

  it('invalid MongoDB id -> 400 "Invalid ID."', async () => {
    const castErr = new mongoose.Error.CastError('ObjectId', 'abc', '_id');
    const res = await request(appThrowing(() => castErr)).get('/boom');
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Invalid ID.');
  });

  it('missing / wrong fields -> 400 with plain-English reasons', async () => {
    const err = new Slot({ status: 'Broken' }).validateSync();
    const res = await request(appThrowing(() => err)).get('/boom');
    expect(res.status).toBe(400);
    expect(res.body.error).toContain('slotId is required.');
    expect(res.body.error).toContain('status must be one of: Available, Occupied.');
  });

  it('duplicate key -> 409 naming the field', async () => {
    const dup = Object.assign(new Error('E11000'), { code: 11000, keyValue: { slotId: 'A1' } });
    const res = await request(appThrowing(() => dup)).get('/boom');
    expect(res.status).toBe(409);
    expect(res.body.error).toBe('A record with this slotId already exists.');
  });

  it('malformed JSON body -> 400', async () => {
    const app = appThrowing(() => new Error('not reached'));
    const res = await request(app).post('/boom').set('Content-Type', 'application/json').send('{"bad json');
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Request body is not valid JSON.');
  });

  it('errors with a status keep their own message', async () => {
    const res = await request(appThrowing(() => Object.assign(new Error('Vehicle not found.'), { status: 404 }))).get('/boom');
    expect(res.status).toBe(404);
    expect(res.body.error).toBe('Vehicle not found.');
  });

  it('unexpected errors -> 500 without leaking details', async () => {
    const res = await request(appThrowing(() => new Error('connect ECONNREFUSED 127.0.0.1:27017 secret'))).get('/boom');
    expect(res.status).toBe(500);
    expect(res.body.error).toBe('Internal server error');
    expect(JSON.stringify(res.body)).not.toMatch(/ECONNREFUSED|secret|stack/);
  });
});
