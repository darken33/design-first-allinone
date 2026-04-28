/**
 * Hello Routes
 * Registers GET /hello and GET /hello/:name endpoints
 */
import type { Router } from 'express';
import { Router as ExpressRouter } from 'express';
import { HelloController } from '../controllers/hello.controller';
import { HelloService } from '../../services/hello.service';
import { NameParamSchema } from '../../validations/index';
import { validateRequest } from '../../middleware/validation';

// Initialize service and controller
const helloService = new HelloService();
const helloController = new HelloController(helloService);

// Create router
export const helloRoutes: Router = ExpressRouter();

/**
 * GET /hello
 * Returns generic "Hello World" greeting
 */
helloRoutes.get('/hello', helloController.getHello);

/**
 * GET /hello/:name
 * Returns personalized greeting for the provided name
 * Validates name against NameParamSchema (min 2 chars, max 25, pattern)
 */
helloRoutes.get(
  '/hello/:name',
  validateRequest(NameParamSchema, 'params'),
  helloController.getHelloByName
);
