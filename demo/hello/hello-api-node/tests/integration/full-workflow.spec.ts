/**
 * Integration Test: Full Workflow
 * Simulates the complete Contract-First demo workflow:
 * - All endpoints working (happy path + error paths)
 * - Response structures match generated types
 * - Health check operational
 */
import request from 'supertest';
import type { Express } from 'express';
import type { HelloDto } from '../../src/generated/schemas/helloDto';
import type { HealthDto } from '../../src/generated/schemas/healthDto';
import type { ApiErrorResponse } from '../../src/generated/schemas/apiErrorResponse';

describe('Full Workflow – Contract-First Demo', () => {
  let app: Express;

  beforeAll(async () => {
    const module = await import('../../src/config/express');
    app = module.createApp();
  });

  describe('Health check', () => {
    it('GET /health returns 200 with healthy status', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200)
        .expect('Content-Type', /json/);

      const body = response.body as HealthDto;
      expect(body.status).toBe('healthy');
      expect(typeof body.uptime).toBe('number');
      expect(body.uptime).toBeGreaterThanOrEqual(0);
    });
  });

  describe('GET /api/hello – generic greeting', () => {
    it('returns Hello World with correct structure', async () => {
      const response = await request(app)
        .get('/api/hello')
        .expect(200)
        .expect('Content-Type', /json/);

      const body = response.body as HelloDto;
      expect(body.message).toBe('Hello World');
    });
  });

  describe('GET /api/hello/:name – personalized greeting', () => {
    const validNames = ['Philippe', 'Jean Paul', 'Marie-Claire', 'Alice', 'Bob'];

    validNames.forEach((name) => {
      it(`accepts valid name "${name}" and returns greeting`, async () => {
        const encodedName = encodeURIComponent(name);
        const response = await request(app)
          .get(`/api/hello/${encodedName}`)
          .expect(200)
          .expect('Content-Type', /json/);

        const body = response.body as HelloDto;
        expect(body.message).toContain(name);
        expect(body.message).toMatch(/^Hello\s+/);
      });
    });

    it('returns Content-Type application/json', async () => {
      const response = await request(app).get('/api/hello/Test');
      expect(response.headers['content-type']).toMatch(/application\/json/);
    });
  });

  describe('Error handling – invalid names', () => {
    const invalidCases = [
      { name: 'a', reason: 'too short (< 2 chars)' },
      { name: '123', reason: 'only digits' },
      { name: '123invalid', reason: 'starts with digit' }
    ];

    invalidCases.forEach(({ name, reason }) => {
      it(`rejects "${name}" (${reason}) with HTTP 400`, async () => {
        const response = await request(app)
          .get(`/api/hello/${name}`)
          .expect(400)
          .expect('Content-Type', /json/);

        const body = response.body as ApiErrorResponse;
        expect(body.status).toBe(400);
        expect(body.error).toBeDefined();
        expect(body.message).toBeDefined();
        expect(body.timestamp).toBeDefined();
        expect(body.path).toBe(`/api/hello/${name}`);
      });
    });

    it('error response has ApiErrorResponse structure', async () => {
      const response = await request(app)
        .get('/api/hello/a')
        .expect(400);

      const body = response.body as ApiErrorResponse;
      expect(Object.keys(body)).toEqual(
        expect.arrayContaining(['timestamp', 'status', 'error', 'message', 'path'])
      );
    });
  });

  describe('Non-existent routes', () => {
    it('GET /api/unknown returns 404', async () => {
      await request(app).get('/api/unknown').expect(404);
    });
  });
});
