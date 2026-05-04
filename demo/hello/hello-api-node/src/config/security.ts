import helmet from 'helmet';
import type { Application } from 'express';

/**
 * Apply security HTTP headers using Helmet.
 * Configures CSP, X-Frame-Options, X-Content-Type-Options, and other security headers.
 */
export const configureSecurity = (app: Application): void => {
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'"],
          styleSrc: ["'self'"],
          imgSrc: ["'self'", 'data:'],
          connectSrc: ["'self'"],
          fontSrc: ["'self'"],
          objectSrc: ["'none'"],
          frameSrc: ["'none'"]
        }
      },
      frameguard: { action: 'deny' },
      noSniff: true,
      xssFilter: true
    })
  );
};
