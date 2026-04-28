# HelloAPI Node.js

A Contract-First REST API demo built with Node.js, TypeScript, Express, and OpenAPI.  
Showcased at BordeauxJS Conference as a live Contract-First design workflow demonstration.

## Overview

**Design philosophy**: The OpenAPI spec is the source of truth — types are generated from it, implementation follows it, tests validate it.

```
openapi.yaml → (orval) → src/generated/types.ts → implementation → tests
```

## Prerequisites

- **Node.js**: 20 LTS (`node --version`)
- **npm**: 9+ (`npm --version`)
- **Docker** (optional, for containerized run)
- **kubectl** (optional, for Kubernetes deployment)

## Local Setup

```bash
# Install dependencies
npm install

# Generate TypeScript types from OpenAPI spec
npm run generate:api

# Start dev server (auto-reload)
npm run dev
# Server listening on port 3000
```

## Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/health` | Health check |
| GET | `/api/hello` | Generic greeting |
| GET | `/api/hello/:name` | Personalized greeting |

```bash
curl http://localhost:3000/health
# {"status":"healthy","uptime":12.3}

curl http://localhost:3000/api/hello
# {"message":"Hello World"}

curl http://localhost:3000/api/hello/Philippe
# {"message":"Hello Philippe"}

# Validation error
curl -i http://localhost:3000/api/hello/a
# HTTP/1.1 400 Bad Request
```

See [API-USAGE.md](specs/001-hello-api-node/API-USAGE.md) for full client documentation.

## Testing

```bash
# Unit tests + coverage
npm test

# Integration tests
npm run test:integration

# Contract tests
npm run test:contract

# All tests with coverage report
npm test -- --coverage
```

Coverage targets: ≥ 80% statements, branches, functions, lines.

## Build

```bash
# Compile TypeScript to dist/
npm run build

# Type check (no emit)
npm run type-check

# Lint
npm run lint

# Format
npm run format
```

## Docker

```bash
# Build image
docker build -t hello-api-node:latest .

# Run container
docker run -p 3000:3000 hello-api-node:latest

# With Docker Compose
docker compose up
```

## Kubernetes Deployment

```bash
# Apply manifests (deployment + service)
kubectl apply -f kubernetes/

# Verify
kubectl get deployments hello-api-node
kubectl get pods -l app=hello-api-node

# Port-forward for local access
kubectl port-forward svc/hello-api-node 3000:3000
```

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3000` | HTTP listen port |
| `NODE_ENV` | `development` | Environment mode |
| `LOG_LEVEL` | `info` | Pino log level |
| `CORS_ORIGINS` | `http://localhost:3000` | Allowed origins (comma-separated) |

Copy `.env.example` to `.env` and adjust as needed.

## Project Structure

```
src/
  api/
    controllers/     # HTTP request handlers
    routes/          # Express route definitions
  config/            # App configuration (Express, middleware, env)
  domain/models/     # Domain types
  generated/         # Auto-generated types from OpenAPI (do not edit)
  middleware/        # Express middleware (error handling, logging, validation)
  services/          # Business logic
  validations/       # Zod validation schemas
tests/
  contract/          # Contract compliance tests
  integration/       # HTTP integration tests
specs/001-hello-api-node/  # OpenAPI spec and documentation
kubernetes/          # Kubernetes manifests
```

## Documentation

- [OpenAPI Spec](specs/001-hello-api-node/openapi.yaml)
- [Feature Spec](specs/001-hello-api-node/spec.md)
- [Technical Plan](specs/001-hello-api-node/plan.md)
- [API Usage Guide](specs/001-hello-api-node/API-USAGE.md)
- [Demo Script](specs/001-hello-api-node/DEMO-SCRIPT.md)
- [QuickStart](specs/001-hello-api-node/quickstart.md)
- [Contributing](CONTRIBUTING.md)
