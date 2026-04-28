import { errorHandler } from './error-handler';
import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

describe('errorHandler middleware', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockReq = {
      path: '/api/hello/test'
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };
    mockNext = jest.fn();
  });

  it('should handle Zod validation errors', () => {
    const zodError = new ZodError([
      {
        code: 'too_small',
        minimum: 2,
        type: 'string',
        path: ['name'],
        message: 'name must be at least 2 characters',
        inclusive: true
      }
    ]);

    errorHandler(zodError, mockReq as Request, mockRes as Response, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 400,
        error: 'Bad Request',
        message: 'name must be at least 2 characters',
        path: '/api/hello/test'
      })
    );
  });

  it('should handle standard Error objects', () => {
    const error = new Error('Something went wrong');

    errorHandler(error, mockReq as Request, mockRes as Response, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.json).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 500,
        error: 'Error',
        message: 'Something went wrong',
        path: '/api/hello/test'
      })
    );
  });

  it('should include timestamp in ISO 8601 format', () => {
    const error = new Error('Test error');

    errorHandler(error, mockReq as Request, mockRes as Response, mockNext);

    const call = (mockRes.json as jest.Mock).mock.calls[0][0];
    expect(call.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });

  it('should handle unknown error objects', () => {
    const unknownError = 'some string error';

    errorHandler(unknownError, mockReq as Request, mockRes as Response, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.json).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 500,
        error: 'Internal Server Error'
      })
    );
  });
});
