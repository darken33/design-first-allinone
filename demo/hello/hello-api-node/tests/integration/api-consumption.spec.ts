/**
 * Integration Test: API Consumption
 * Verifies that external HTTP clients can consume the HelloAPI endpoints
 * per the OpenAPI specification.
 */
import request from 'supertest';
import type { Express } from 'express';
import { HelloService } from '../../src/services/hello.service';
// No generated type imports needed - using plain assertions

const mockProducer = { sendHelloMessage: jest.fn().mockResolvedValue(undefined) };

describe('API Consumption – External Client Scenarios', () => {
  let app: Express;

  beforeAll(async () => {
    const { createApp } = await import('../../src/config/express');
    app = createApp(new HelloService(mockProducer));
  });

  describe('Content-Type negotiation', () => {
    it('GET /api/v1/hello returns Content-Type: application/json', async () => {
      const response = await request(app).get('/api/v1/hello').expect(200);
      expect(response.headers['content-type']).toMatch(/application\/json/);
    });

    it('GET /api/v1/hello/:name returns Content-Type: application/json', async () => {
      const response = await request(app).get('/api/v1/hello/Alice').expect(200);
      expect(response.headers['content-type']).toMatch(/application\/json/);
    });

    it('error responses return Content-Type: application/json', async () => {
      const response = await request(app).get('/api/v1/hello/a').expect(400);
      expect(response.headers['content-type']).toMatch(/application\/json/);
    });
  });

  describe('curl equivalents – happy path', () => {
    it('curl GET /api/v1/hello → {"message":"Hello World"}', async () => {
      const response = await request(app).get('/api/v1/hello').expect(200);
      expect(response.body).toEqual({ message: 'Hello World' });
    });

    it('curl GET /api/v1/hello/Alice → {"message":"Hello Alice"}', async () => {
      const response = await request(app).get('/api/v1/hello/Alice').expect(200);
      expect(response.body).toEqual({ message: 'Hello Alice' });
    });

    it('curl GET /api/v1/hello/Jean%20Paul → {"message":"Hello Jean Paul"}', async () => {
      const response = await request(app).get('/api/v1/hello/Jean%20Paul').expect(200);
      expect(response.body.message).toContain('Jean Paul');
    });
  });

  describe('curl equivalents – error path', () => {
    it('curl GET /api/v1/hello/a → HTTP 400 structured error', async () => {
      const response = await request(app).get('/api/v1/hello/a').expect(400);
      expect(response.body).toHaveProperty('status', 400);
      expect(response.body).toHaveProperty('error');
      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('path');
    });

    it('curl GET /api/v1/hello/invalid123 → HTTP 400', async () => {
      const response = await request(app).get('/api/v1/hello/invalid123').expect(400);
      expect(response.body.status).toBe(400);
    });
  });

  describe('Response body structure matches HelloDto', () => {
    it('response contains only expected fields', async () => {
      const response = await request(app).get('/api/v1/hello/Test').expect(200);
      expect(Object.keys(response.body)).toEqual(['message']);
    });

    it('message field is a string', async () => {
      const response = await request(app).get('/api/v1/hello/Test').expect(200);
      expect(typeof response.body.message).toBe('string');
    });
  });

  describe('Security headers (Helmet)', () => {
    it('response includes X-Content-Type-Options header', async () => {
      const response = await request(app).get('/api/v1/hello');
      expect(response.headers['x-content-type-options']).toBeDefined();
    });

    it('response includes X-Frame-Options header', async () => {
      const response = await request(app).get('/api/v1/hello');
      expect(response.headers['x-frame-options']).toBeDefined();
    });
  });
});
