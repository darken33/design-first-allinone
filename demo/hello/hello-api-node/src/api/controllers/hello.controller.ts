/**
 * HelloController
 * Handles HTTP requests for the Hello API endpoints
 */
import type { Request, Response, NextFunction } from 'express';
import type { IHelloService } from '../../services/interfaces/hello.service.interface';
import type { HelloDto } from '../../generated/schemas';

export class HelloController {
  constructor(private service: IHelloService) {}

  /**
   * GET /api/v1/hello
   * Returns "Hello World" greeting
   */
  getHello = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const message = await this.service.sayHello();
      const response: HelloDto = { message };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/v1/hello/:name
   * Returns personalized greeting for the provided name
   * Expects name to be pre-validated by validation middleware
   */
  getHelloByName = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { name } = req.params;
      const message = await this.service.sayHello(name);
      const response: HelloDto = { message };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };
}
