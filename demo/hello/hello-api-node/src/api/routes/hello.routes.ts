/**
 * Hello Routes
 * Registers GET /v1/hello and GET /v1/hello/:name endpoints
 */
import type { Router } from 'express';
import { Router as ExpressRouter } from 'express';
import { HelloController } from '../controllers/hello.controller';
import type { IHelloService } from '../../services/interfaces/hello.service.interface';
import { NameParamSchema } from '../../validations/index';
import { validateRequest } from '../../middleware/validation';

export const createHelloRoutes = (helloService: IHelloService): Router => {
  const helloController = new HelloController(helloService);
  const router = ExpressRouter();

  /**
   * GET /v1/hello
   * Returns generic "Hello World" greeting
   */
  router.get('/v1/hello', helloController.getHello);

  /**
   * GET /v1/hello/:name
   * Returns personalized greeting for the provided name
   * Validates name against NameParamSchema (min 2 chars, max 25, pattern)
   */
  router.get(
    '/v1/hello/:name',
    validateRequest(NameParamSchema, 'params'),
    helloController.getHelloByName
  );

  return router;
};
