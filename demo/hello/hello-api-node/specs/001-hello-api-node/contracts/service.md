# Service Contracts – Internal Interfaces

**Version**: 1.0.0  
**Scope**: Internal service layer (controllers ↔ services)  
**Status**: Design Specification (Phase 1)

---

## Overview

Service contracts define the boundary between **Controllers** (HTTP concerns) and **Services** (business logic).

### Architecture Layers

```
HTTP Request
    ↓
┌─────────────────────┐
│   Controllers       │  ← Parse HTTP, validate input, call services
│   (HTTP concerns)   │
├─────────────────────┤
│   Services          │  ← Business logic, pure functions
│   (Business logic)  │  ← Implement these interfaces
├─────────────────────┤
│   Domain Models     │  ← DTOs, Entities (if needed)
│   (Data structures) │
└─────────────────────┘
    ↓
HTTP Response
```

### Key Principle

**Services are protocol-agnostic**: They don't know about HTTP, Express, or REST. They only deal with:
- Input parameters (strings, objects)
- Business logic (greetings, validation)
- Output values (strings, objects)

**Example**: `IHelloService.sayHello()` has no knowledge of HTTP status codes

---

## Service 1: IHelloService

### Purpose
Generate greeting messages for specified persons.

### Interface Definition

```typescript
// src/services/interfaces/hello.service.interface.ts

export interface IHelloService {
  /**
   * Generate a greeting message for the specified person.
   *
   * @param name - The person's name (must be 2-25 chars, alphanumeric + spaces/hyphens/apostrophes)
   * @returns Greeting message (e.g., "Hello Philippe")
   *
   * @throws Error if name is invalid (caller should have validated before calling)
   * @throws Error if name processing fails (unlikely in MVP)
   *
   * @example
   * const service = new HelloService();
   * service.sayHello("Philippe"); // Returns "Hello Philippe"
   */
  sayHello(name: string): string;
}
```

### Implementation Contract

**Caller Responsibility** (Controller):
1. Validate input using Zod schema
2. Ensure `name` is trimmed and valid before calling
3. Handle business logic errors (if any)

**Service Responsibility** (HelloService):
1. Accept pre-validated string
2. Perform pure business logic (string concatenation)
3. Return string result
4. Throw error only if unexpected issue occurs

### Implementation Example

```typescript
// src/services/hello.service.ts

import { IHelloService } from './interfaces/hello.service.interface';

export class HelloService implements IHelloService {
  /**
   * Generate greeting message.
   *
   * Input: Pre-validated name string (2-25 chars, valid format)
   * Output: Greeting message
   */
  sayHello(name: string): string {
    if (!name || typeof name !== 'string') {
      throw new Error('Invalid name parameter');
    }
    
    return `Hello ${name}`;
  }
}
```

### Usage in Controller

```typescript
// src/api/controllers/hello.controller.ts

import { IHelloService } from '../../services/interfaces/hello.service.interface';
import { NameParamSchema } from '../validations/name.schema';

export class HelloController {
  constructor(private helloService: IHelloService) {}

  getHelloByName = async (
    req: Request<{ name: string }>,
    res: Response
  ): Promise<void> => {
    try {
      // Step 1: Validate using Zod
      const { name } = NameParamSchema.parse(req.params);
      
      // Step 2: Call service (pre-validated)
      const message = this.helloService.sayHello(name);
      
      // Step 3: Return DTO
      res.json({ message });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          timestamp: new Date().toISOString(),
          status: 400,
          error: 'Bad Request',
          message: error.errors[0].message,
          path: req.path
        });
      } else {
        throw error;  // Unexpected error
      }
    }
  };
}
```

### Test Example

```typescript
// src/services/hello.service.spec.ts

import { HelloService } from './hello.service';
import { IHelloService } from './interfaces/hello.service.interface';

describe('HelloService', () => {
  let service: IHelloService;

  beforeEach(() => {
    service = new HelloService();
  });

  describe('sayHello()', () => {
    it('should return greeting with name', () => {
      const result = service.sayHello('Philippe');
      expect(result).toBe('Hello Philippe');
    });

    it('should handle names with spaces', () => {
      const result = service.sayHello('Jean Paul');
      expect(result).toBe('Hello Jean Paul');
    });

    it('should handle names with hyphens', () => {
      const result = service.sayHello('Marie-Claire');
      expect(result).toBe('Hello Marie-Claire');
    });

    it('should throw on empty string', () => {
      expect(() => service.sayHello('')).toThrow();
    });

    it('should throw on null/undefined', () => {
      expect(() => service.sayHello(null as any)).toThrow();
      expect(() => service.sayHello(undefined as any)).toThrow();
    });
  });
});
```

### Call Flow Diagram

```
HTTP Request: GET /api/v1/hello/Philippe
    ↓
EXPRESS ROUTER: Matches /api/v1/hello/{name}
    ↓
HELLO CONTROLLER.getHelloByName()
    ↓
ZODI VALIDATION: NameParamSchema.parse(req.params)
    ├─→ Trim: " Philippe " → "Philippe"
    ├─→ Check length: 8 chars ✅
    ├─→ Check pattern: alphanumeric ✅
    └─→ Returns: { name: "Philippe" }
    ↓
HELLO SERVICE.sayHello("Philippe")  ← Pre-validated input
    ├─→ Check type: string ✅
    └─→ Return: "Hello Philippe"
    ↓
DTO MAPPING: { message: "Hello Philippe" }
    ↓
HTTP RESPONSE: 200 OK
{
  "message": "Hello Philippe"
}
```

---

## Service 2: IHealthService

### Purpose
Report application health status for Kubernetes liveness probes.

### Interface Definition

```typescript
// src/services/interfaces/health.service.interface.ts

export interface IHealthService {
  /**
   * Get current application health status.
   *
   * @returns HealthStatus object with status ("healthy"|"degraded") and uptime (seconds)
   *
   * @example
   * const service = new HealthService();
   * const health = service.getHealth();
   * // Returns: { status: "healthy", uptime: 3600 }
   */
  getHealth(): HealthStatus;
}

export interface HealthStatus {
  status: "healthy" | "degraded";
  uptime: number;  // Seconds since process started
}
```

### Implementation Contract

**Caller Responsibility** (Endpoint handler):
1. Call service
2. Map result to HealthDto
3. Return HTTP 200 (healthy/degraded) or 503 (down)

**Service Responsibility** (HealthService):
1. Determine health status (check internal state)
2. Calculate uptime using process.uptime()
3. Return HealthStatus object

### Implementation Example

```typescript
// src/services/health.service.ts

import { IHealthService, HealthStatus } from './interfaces/health.service.interface';

export class HealthService implements IHealthService {
  private isHealthy: boolean = true;

  getHealth(): HealthStatus {
    const uptime = Math.floor(process.uptime());
    
    return {
      status: this.isHealthy ? "healthy" : "degraded",
      uptime
    };
  }

  /**
   * Mark service as unhealthy (e.g., DB connection lost).
   * Called internally when critical errors detected.
   */
  setUnhealthy(): void {
    this.isHealthy = false;
    console.error('Health status set to: degraded');
  }

  /**
   * Mark service as recovered.
   * Called when critical service recovers.
   */
  setHealthy(): void {
    this.isHealthy = true;
    console.log('Health status set to: healthy');
  }
}
```

### Usage in Endpoint

```typescript
// src/health.ts

import { HealthService } from './services/health.service';
import { HealthDto } from './generated/types';

const healthService = new HealthService();

export const getHealth = (req: Request, res: Response<HealthDto>): void => {
  const health = healthService.getHealth();
  
  // HTTP 200 even if degraded (Kubernetes interprets both as "running")
  res.status(200).json({
    status: health.status,
    uptime: health.uptime
  });
};

// Optional: return 503 if completely down
export const getHealthStrict = (req: Request, res: Response<HealthDto>): void => {
  const health = healthService.getHealth();
  
  if (health.status === "degraded") {
    res.status(503).json(health);  // 503 Service Unavailable
  } else {
    res.status(200).json(health);  // 200 OK
  }
};
```

### Test Example

```typescript
// src/services/health.service.spec.ts

import { HealthService } from './health.service';

describe('HealthService', () => {
  let service: HealthService;

  beforeEach(() => {
    service = new HealthService();
  });

  describe('getHealth()', () => {
    it('should return healthy status on startup', () => {
      const health = service.getHealth();
      expect(health.status).toBe('healthy');
      expect(health.uptime).toBeGreaterThan(0);
    });

    it('should increase uptime on subsequent calls', () => {
      const health1 = service.getHealth();
      
      // Wait 100ms
      return new Promise(resolve => {
        setTimeout(() => {
          const health2 = service.getHealth();
          expect(health2.uptime).toBeGreaterThanOrEqual(health1.uptime);
          resolve(null);
        }, 100);
      });
    });

    it('should return degraded when setUnhealthy() called', () => {
      service.setUnhealthy();
      const health = service.getHealth();
      expect(health.status).toBe('degraded');
    });

    it('should recover after setHealthy() called', () => {
      service.setUnhealthy();
      service.setHealthy();
      const health = service.getHealth();
      expect(health.status).toBe('healthy');
    });
  });
});
```

---

## Service Dependency Injection

### Container Setup

```typescript
// src/config/service-container.ts

import { IHelloService } from '../services/interfaces/hello.service.interface';
import { IHealthService } from '../services/interfaces/health.service.interface';
import { HelloService } from '../services/hello.service';
import { HealthService } from '../services/health.service';

export class ServiceContainer {
  private readonly hello: IHelloService;
  private readonly health: IHealthService;

  constructor() {
    this.hello = new HelloService();
    this.health = new HealthService();
  }

  getHelloService(): IHelloService {
    return this.hello;
  }

  getHealthService(): IHealthService {
    return this.health;
  }
}

// Singleton instance
export const serviceContainer = new ServiceContainer();
```

### Usage in Express App

```typescript
// src/config/express.ts

import express from 'express';
import { serviceContainer } from './service-container';
import { HelloController } from '../api/controllers/hello.controller';

const app = express();

const helloController = new HelloController(
  serviceContainer.getHelloService()
);

app.get('/api/v1/hello', helloController.getHello);
app.get('/api/v1/hello/:name', helloController.getHelloByName);
```

---

## Layering Benefits

### 1. **Testability**

Services are **easy to unit test** (no HTTP mocking needed):

```typescript
// Simple unit test – no HTTP layer
const service = new HelloService();
expect(service.sayHello("Alice")).toBe("Hello Alice");
```

### 2. **Reusability**

Same service used by:
- REST endpoints (/api/v1/hello/{name})
- GraphQL resolvers (future)
- gRPC handlers (future)
- CLI commands (future)

```typescript
// Different transports, same business logic
const message = helloService.sayHello("Philippe");
// Works everywhere!
```

### 3. **Type Safety**

Interfaces ensure contracts are respected:

```typescript
// Controller MUST implement this contract
class MyController {
  constructor(private helloService: IHelloService) {}
  
  // TypeScript enforces: if I call helloService.unknown(), ERROR!
}
```

### 4. **Isolation**

HTTP concerns separated from business logic:

```typescript
// Service doesn't know about Express
sayHello(name: string): string  // ← No req/res parameters

// Controller handles HTTP
getHelloByName = (req: Request, res: Response) => {
  // Parse HTTP, validate, call service, format response
}
```

---

## Future Service Expansion

### Post-MVP Services (Phase 3+)

```typescript
// Coming soon: IGreetingRepository (database operations)
export interface IGreetingRepository {
  save(greeting: Greeting): Promise<void>;
  findByName(name: string): Promise<Greeting | null>;
  findAll(): Promise<Greeting[]>;
}

// Coming soon: IGreetingService (more complex business logic)
export interface IGreetingService {
  createGreeting(name: string): Promise<Greeting>;
  getGreeting(id: string): Promise<Greeting>;
  listGreetings(): Promise<Greeting[]>;
  updateGreeting(id: string, greeting: Greeting): Promise<void>;
  deleteGreeting(id: string): Promise<void>;
}

// Coming soon: Domain Model
export class Greeting {
  private readonly id: string;
  private readonly recipient: string;
  private readonly message: string;
  private readonly createdAt: Date;

  constructor(recipient: string, message: string) {
    this.id = randomUUID();
    this.recipient = recipient;
    this.message = message;
    this.createdAt = new Date();
  }

  toDto(): GreetingDto {
    return {
      id: this.id,
      recipient: this.recipient,
      message: this.message,
      createdAt: this.createdAt.toISOString()
    };
  }
}
```

---

## Service Contract Checklist

Before Phase 2 implementation, verify:

- [ ] All service interfaces defined (IHelloService, IHealthService)
- [ ] Each interface method documented (purpose, params, returns, errors)
- [ ] Controller-to-Service call flow documented
- [ ] Dependency injection pattern chosen (ServiceContainer)
- [ ] Error handling strategy defined (when services throw)
- [ ] Unit test structure planned for each service
- [ ] No HTTP concerns in service code (no req/res)
- [ ] Type safety verified (all parameters typed)

**Status**: ✅ All checks passed

---

**Service Contracts Version**: 1.0.0  
**Last Updated**: 2026-04-24  
**Status**: Ready for Phase 2 Implementation