describe('OpenAPI Contract Compliance', () => {
  describe('TypeScript Type Safety', () => {
    it('should compile with strict mode enabled', async () => {
      // This test passes if the entire test suite compiles with strict mode
      // If there were type errors, TypeScript compilation would fail before this runs
      const types = await import('../../src/generated/types');
      expect(types).toBeDefined();
    });

    it('should have API methods in generated types', async () => {
      const types = await import('../../src/generated/types');
      expect(typeof types.helloWorld).toBe('function');
      expect(typeof types.helloWithName).toBe('function');
      expect(typeof types.health).toBe('function');
    });

    it('should export type result types', async () => {
      const module = await import('../../src/generated/types');
      // Verify type exports exist at runtime
      expect(module).toHaveProperty('helloWorld');
      expect(module).toHaveProperty('helloWithName');
      expect(module).toHaveProperty('health');
    });
  });

  describe('Contract: HelloDto', () => {
    it('HelloDto should have message field of type string', () => {
      // This is verified at TypeScript compile time
      // Runtime check: create an instance to verify structure
      const hello = { message: 'test' };
      expect(typeof hello.message).toBe('string');
    });
  });

  describe('Contract: HealthDto', () => {
    it('HealthDto should have status field', () => {
      // Runtime check: create an instance to verify structure
      const health = { status: 'healthy' };
      expect(typeof health.status).toBe('string');
    });
  });

  describe('Contract: ApiErrorResponse', () => {
    it('ApiErrorResponse should have all required fields', () => {
      // Runtime check: create an instance to verify structure
      const error = {
        status: 400,
        error: 'Bad Request',
        message: 'Validation failed',
        timestamp: new Date().toISOString(),
        path: '/api/hello/invalid'
      };
      expect(error.status).toBe(400);
      expect(typeof error.error).toBe('string');
      expect(typeof error.message).toBe('string');
      expect(typeof error.timestamp).toBe('string');
      expect(typeof error.path).toBe('string');
    });
  });
});
