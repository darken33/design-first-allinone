/**
 * HelloController
 * Handles HTTP requests for the Hello API endpoints
 */
import type { Request, Response } from 'express';
import type { IHelloService } from '../../services/interfaces/hello.service.interface';
import type { HelloDto } from '../../generated/schemas';

export class HelloController {
  constructor(private service: IHelloService) {}

  /**
   * GET /api/hello
   * Returns "Hello World" greeting
   */
  getHello = (_req: Request, res: Response): void => {
    const message = this.service.sayHello();
    const response: HelloDto = { message };
    res.status(200).json(response);
  };

  /**
   * GET /api/hello/:name
   * Returns personalized greeting for the provided name
   * Expects name to be pre-validated by validation middleware
   */
  getHelloByName = (req: Request, res: Response): void => {
    const { name } = req.params;
    const message = this.service.sayHello(name);
    const response: HelloDto = { message };
    res.status(200).json(response);
  };
}
