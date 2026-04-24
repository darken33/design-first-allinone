# QuickStart – HelloAPI Node.js (Phase 1 Design)

**Date**: 2026-04-24  
**Status**: Developer setup guide + Live demo script  
**Audience**: Developers (setup) + Conference presenters (demo)

---

## Part A: Local Development Setup (5 min)

### Prerequisites

- **Node.js**: 20 LTS or later (`node --version` → v20.x.x)
- **npm**: 9+ (`npm --version` → 9.x.x)
- **Git**: Latest
- **Optional**: Docker + Docker Compose (for containerized local testing)
- **Optional**: kubectl (for K8s demo)

### Step 1: Clone & Install (2 min)

```bash
# Clone the repository
git clone https://github.com/DevFestNantes/hello-api-node.git
cd hello-api-node

# Install dependencies
npm install

# Verify installation
npm list express typescript zod jest supertest
```

**Expected Output**:
```
├── express@4.18.x
├── typescript@5.x
├── zod@3.x
├── jest@29.x
└── supertest@6.x
```

### Step 2: Generate API Types from OpenAPI (1 min)

```bash
# Generate TypeScript types from OpenAPI spec
npm run generate:api

# Verify generation
ls src/generated/
# Expected output:
# types.ts
# api.ts (if using orval)
```

**What happened**:
- `orval` read `specs/001-hello-api-node/openapi.yaml`
- Generated TypeScript interfaces in `src/generated/types.ts`
- Generated API client code (optional, see src/generated/api.ts)
- **Key Point**: No manual editing of generated files!

### Step 3: Start Dev Server (1 min)

```bash
# Start Express server with Nodemon auto-reload
npm run dev

# Expected output:
# [nodemon] 3.0.1
# [nodemon] watching directory "src" ...
# [nodemon] starting `node --require ts-node/register src/index.ts`
# Server listening on port 3000
```

**Keep terminal open** for requests in Step 4.

### Step 4: Test Endpoints (1 min)

**In a new terminal**:

**Test 1: Generic greeting**
```bash
curl http://localhost:3000/api/hello

# Response:
# {"message":"Hello World"}
```

**Test 2: Personalized greeting**
```bash
curl http://localhost:3000/api/hello/Philippe

# Response:
# {"message":"Hello Philippe"}
```

**Test 3: Health check**
```bash
curl http://localhost:3000/health

# Response:
# {"status":"healthy","uptime":123}
```

**Test 4: Invalid parameter (validation)**
```bash
curl http://localhost:3000/api/hello/a

# Response (HTTP 400):
# {"timestamp":"2026-04-24T10:30:00.000Z","status":400,"error":"Bad Request","message":"name must be at least 2 characters","path":"/api/hello/a"}
```

---

## Part B: Testing (2 min)

### Run Unit Tests

```bash
npm test

# Output:
# PASS  src/services/hello.service.spec.ts
#   HelloService
#     ✓ should return greeting with name (5ms)
#     ✓ should handle spaces in name (2ms)
#     ✗ should reject empty string (would be tested in validation layer, not service)
#
# Test Suites: 1 passed, 1 total
# Tests:       2 passed, 2 total
# Time:       1.234s
```

### Run Integration Tests

```bash
npm run test:integration

# Output:
# PASS  src/api/hello.api.spec.ts
#   GET /api/hello
#     ✓ should return generic greeting (45ms)
#   GET /api/hello/:name
#     ✓ should return personalized greeting (40ms)
#     ✓ should reject invalid parameter (50ms)
#
# Test Suites: 1 passed, 1 total
# Tests:       3 passed, 3 total
# Time:       2.134s
```

### Check Test Coverage

```bash
npm test -- --coverage

# Output:
# -------- Coverage summary --------
# Statements   : 92.3% ( 48/52 )
# Branches     : 88.5% ( 23/26 )
# Functions    : 95.0% ( 19/20 )
# Lines        : 92.1% ( 47/51 )
```

---

## Part C: Docker Build & Run (2 min)

### Build Image

```bash
# Build Docker image (multi-stage)
docker build -t hello-api-node:latest .

# Verify build
docker images | grep hello-api-node

# Expected output:
# hello-api-node          latest          abc123def456        190MB  about a minute ago
```

**Image size check**: ~190-210MB ✅ (under 300MB target)

### Run Container

```bash
# Run container, forward port 3000
docker run -p 3000:3000 hello-api-node:latest

# Expected output:
# Server listening on port 3000
```

### Test from Container

**In new terminal**:
```bash
curl http://localhost:3000/api/hello/Docker

# Response:
# {"message":"Hello Docker"}
```

**Stop container**:
```bash
# Press Ctrl+C in the running container terminal
# Or in new terminal:
docker ps  # Find container ID
docker stop <CONTAINER_ID>
```

---

## Part D: Kubernetes Deployment (Optional – 5 min)

### Prerequisites

- Kubernetes cluster running (`kubectl cluster-info`)
- Docker image in registry: `registry.example.com/hello-api-node:1.0.0`

### Deploy to Kubernetes

```bash
# Apply K8s manifests (deployment, service, etc.)
kubectl apply -f kubernetes/

# Expected output:
# deployment.apps/hello-api-node created
# service/hello-api-node created
```

### Verify Deployment

```bash
# Check deployment status
kubectl get deployments

# Expected output:
# NAME              READY   UP-TO-DATE   AVAILABLE   AGE
# hello-api-node    2/2     2            2           10s

# Check pods
kubectl get pods

# Expected output:
# NAME                              READY   STATUS    RESTARTS   AGE
# hello-api-node-abc123def456-xyz   1/1     Running   0          10s
# hello-api-node-abc123def456-uvw   1/1     Running   0          10s
```

### Port-Forward & Test

```bash
# Forward local port 3000 to service
kubectl port-forward svc/hello-api-node 3000:3000

# In new terminal:
curl http://localhost:3000/api/hello/Kubernetes

# Response:
# {"message":"Hello Kubernetes"}
```

---

## Part E: Live Conference Demo (25 min)

**Audience**: BordeauxJS attendees  
**Presenter**: You (or colleague)  
**Objective**: Demonstrate Contract-First API design workflow

### Demo Script (25 min total)

#### **Segment 1: OpenAPI Design (5 min)**

1. **Show OpenAPI Spec** (2 min)
   ```bash
   # Open editor or browser
   cat specs/001-hello-api-node/openapi.yaml
   # Highlight:
   # - paths: /api/hello, /api/hello/{name}
   # - parameters: name with constraints (minLength, maxLength, pattern)
   # - responses: HelloDto schema
   ```

2. **Explain Contract First** (3 min)
   - "This YAML is not just documentation – it IS the API specification"
   - "It defines exactly what the API will do: endpoints, parameters, responses"
   - "The spec is **source of truth**; implementation must match it"
   - "This prevents API/implementation drift"

#### **Segment 2: Code Generation (2 min)**

1. **Show Generated Types** (1 min)
   ```bash
   # Show src/generated/types.ts
   cat src/generated/types.ts
   # Highlight:
   # - export interface HelloDto { message: string; }
   # - These types match OpenAPI exactly, generated automatically!
   ```

2. **Emphasize Type Safety** (1 min)
   - "TypeScript compiler ensures we use the right type"
   - "If OpenAPI changes, types change; code won't compile until fixed"
   - "This prevents bugs at compile time, not runtime"

#### **Segment 3: Implementation & Validation (5 min)**

1. **Show Controller Code** (2 min)
   ```bash
   # Open src/api/controllers/hello.controller.ts
   code src/api/controllers/hello.controller.ts
   # Explain:
   # - Controller extracts name from URL
   # - Validates using Zod schema (matches OpenAPI constraints)
   # - Calls service
   # - Returns DTO
   ```

2. **Show Service Code** (1 min)
   ```bash
   # Open src/services/hello.service.ts
   code src/services/hello.service.ts
   # Explain:
   # - Pure business logic (simple concat for demo)
   # - No HTTP concerns
   # - Easy to test (next segment!)
   ```

3. **Demo Parameter Validation** (2 min)
   ```bash
   # Show validation works
   curl http://localhost:3000/api/hello/Philippe     # ✅ Works
   curl http://localhost:3000/api/hello/a            # ❌ Too short
   curl http://localhost:3000/api/hello/123invalid   # ❌ Invalid chars
   # Each returns HTTP 400 with error message matching OpenAPI spec
   ```

#### **Segment 4: Testing (3 min)**

1. **Unit Tests** (1 min)
   ```bash
   npm test
   # Show unit tests passing (tests don't need HTTP server)
   ```

2. **Integration Tests** (1 min)
   ```bash
   npm run test:integration
   # Show integration tests validating HTTP contracts
   ```

3. **Emphasize Test Benefits** (1 min)
   - "Tests validate that OpenAPI contract is respected"
   - "Tests run in < 5 seconds (fast feedback)"
   - "Tests ensure refactoring doesn't break contract"

#### **Segment 5: Deployment (5 min)**

1. **Show Dockerfile** (1 min)
   ```bash
   # Show multi-stage build
   cat Dockerfile
   # Highlight:
   # - Stage 1: Build (compile, generate types)
   # - Stage 2: Runtime (Alpine, lean image)
   ```

2. **Build & Run Docker** (2 min)
   ```bash
   docker build -t hello-api-node:demo .
   docker run -p 3000:3000 hello-api-node:demo
   # While building, explain:
   # - Multi-stage ensures final image is small (~200MB)
   # - Alpine Linux is secure and lean
   ```

3. **Show K8s Readiness** (2 min)
   ```bash
   # While Docker runs
   ls kubernetes/
   # Highlight:
   # - deployment.yaml: 2 replicas, health checks, resource limits
   # - service.yaml: Exposes app to cluster
   # - Liveness probe: GET /health every 10 sec
   ```

#### **Segment 6: Recap & Q&A (5 min)**

1. **Recap Learnings** (3 min)
   - "OpenAPI is a **development contract**, not just docs"
   - "Code generation prevents bugs (types are auto-generated)"
   - "Layered architecture enables testing (fast unit tests)"
   - "Container-native design is straightforward (Dockerfile + K8s manifests)"

2. **Q&A** (2 min)
   - "Why Contract-First instead of code-first?"
       - Answer: API is the boundary; spec should be clear before coding
   - "How do you keep OpenAPI in sync with code?"
       - Answer: Tests validate contract; CI/CD enforces it
   - "Can I use this for production?"
       - Answer: It's production-ready! Add auth, DB, metrics as needed

---

## Part F: Common Issues & Troubleshooting

### Issue 1: `npm install` fails

**Symptom**: Errors about Python, node-gyp, etc.

**Solution**:
```bash
# Clear cache and try again
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

### Issue 2: Port 3000 already in use

**Symptom**: `EADDRINUSE: address already in use :::3000`

**Solution**:
```bash
# Kill process using port 3000
lsof -i :3000          # Find process ID
kill -9 <PID>          # Kill it
npm run dev            # Retry
# Or use different port:
PORT=3001 npm run dev
```

### Issue 3: OpenAPI generation fails

**Symptom**: `Error: Cannot read OpenAPI spec`

**Solution**:
```bash
# Verify spec file exists
ls specs/001-hello-api-node/openapi.yaml

# Check spec is valid YAML
npm run validate:openapi  # If script exists

# Regenerate
npm run generate:api -- --force
```

### Issue 4: Tests fail after code change

**Symptom**: Integration tests fail after editing controller

**Solution**:
```bash
# Ensure types are regenerated
npm run generate:api

# Clear test cache
npm test -- --clearCache

# Run tests
npm test
```

### Issue 5: Docker build fails

**Symptom**: `Error: npm ci: command not found in stage 1`

**Solution**:
```bash
# Verify Docker version
docker --version

# Rebuild with verbose output
docker build -t hello-api-node:debug . --progress=plain

# Check Dockerfile syntax
docker build -f Dockerfile --no-cache .
```

---

## Part G: Next Steps After MVP

### For Developers

1. **Add POST endpoint** (store messages in DB)
2. **Add authentication** (JWT tokens)
3. **Add WebSocket support** (real-time greetings)
4. **Add AsyncAPI** (event streaming)

### For Production

1. **Add Prometheus metrics** (prom-client)
2. **Add OpenTelemetry tracing** (for distributed tracing)
3. **Add rate limiting** (express-rate-limit)
4. **Add API versioning** (/api/v2/hello)

### For Conference

1. **Extend demo to Part 2: AsyncAPI** (event messaging)
2. **Show Pact contract testing** (consumer-driven contracts)
3. **Show API versioning** (contract evolution)
4. **Show performance benchmarking** (clinic.js profiling)

---

## Files Reference

| File | Purpose |
|------|---------|
| `specs/001-hello-api-node/openapi.yaml` | API contract (source of truth) |
| `src/api/controllers/hello.controller.ts` | HTTP handlers |
| `src/services/hello.service.ts` | Business logic |
| `src/api/validations.ts` | Input schemas (Zod) |
| `src/generated/types.ts` | Auto-generated types (DO NOT EDIT) |
| `src/config/express.ts` | Express app factory |
| `src/health.ts` | Health endpoint |
| `Dockerfile` | Container build |
| `kubernetes/deployment.yaml` | K8s manifest |
| `package.json` | Dependencies + scripts |

---

## npm Scripts Reference

| Script | Purpose |
|--------|---------|
| `npm run dev` | Start dev server (Nodemon auto-reload) |
| `npm run build` | Compile TypeScript to dist/ |
| `npm run generate:api` | Generate types from OpenAPI |
| `npm start` | Run production build |
| `npm test` | Unit tests (Jest) |
| `npm run test:integration` | Integration tests (Supertest) |
| `npm run lint` | Check ESLint |
| `npm run format` | Apply Prettier formatting |
| `npm run type-check` | Verify TypeScript strict mode |

---

**QuickStart Version**: 1.0.0  
**Last Updated**: 2026-04-24  
**Next**: Start Part A setup or jump to Part E (demo script)