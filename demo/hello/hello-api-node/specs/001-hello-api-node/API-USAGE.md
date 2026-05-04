# API Usage Guide – HelloAPI Node.js

**Version**: 1.0.0  
**Base URL**: `http://localhost:3000` (local) | `https://api.example.com` (production)  
**Format**: JSON (application/json)  
**OpenAPI Spec**: `specs/001-hello-api-node/openapi.yaml`

---

## Endpoints

### GET /health

Health check endpoint. Returns server status.

**Request**:
```bash
curl http://localhost:3000/health
```

**Response** (HTTP 200):
```json
{
  "status": "healthy",
  "uptime": 123.45
}
```

| Field | Type | Description |
|-------|------|-------------|
| `status` | string | Always `"healthy"` when server is up |
| `uptime` | number | Server uptime in seconds |

---

### GET /api/v1/hello

Returns a generic greeting.

**Request**:
```bash
curl http://localhost:3000/api/v1/hello
```

**Response** (HTTP 200):
```json
{
  "message": "Hello World"
}
```

---

### GET /api/v1/hello/{name}

Returns a personalized greeting for the given name.

**Path Parameters**:

| Parameter | Type | Required | Constraints |
|-----------|------|----------|-------------|
| `name` | string | yes | minLength: 2, maxLength: 25, pattern: letters/spaces/hyphens/apostrophes only |

**Request examples**:
```bash
# Simple name
curl http://localhost:3000/api/v1/hello/Philippe

# Name with space (URL-encoded)
curl "http://localhost:3000/api/v1/hello/Jean%20Paul"

# Name with hyphen
curl http://localhost:3000/api/v1/hello/Marie-Claire

# Name with apostrophe (URL-encoded)
curl "http://localhost:3000/api/v1/hello/O%27Brien"
```

**Response** (HTTP 200):
```json
{
  "message": "Hello Philippe"
}
```

---

## Error Handling

All error responses follow the `ApiErrorResponse` structure:

```json
{
  "timestamp": "2026-04-27T10:00:00.000Z",
  "status": 400,
  "error": "Bad Request",
  "message": "name must be at least 2 characters",
  "path": "/api/v1/hello/a"
}
```

| Field | Type | Description |
|-------|------|-------------|
| `timestamp` | string (ISO 8601) | When the error occurred |
| `status` | number | HTTP status code |
| `error` | string | HTTP status description |
| `message` | string | Human-readable error detail |
| `path` | string | Request path that caused the error |

### Common Error Codes

| HTTP Code | Cause | Example |
|-----------|-------|---------|
| 400 Bad Request | Invalid `name` parameter | Name too short, invalid characters |
| 404 Not Found | Unknown endpoint | `/api/unknown` |
| 500 Internal Server Error | Unexpected server error | — |

### Validation Error Examples

```bash
# Name too short (< 2 chars)
curl -i http://localhost:3000/api/v1/hello/a
# HTTP/1.1 400 Bad Request
# {"timestamp":"...","status":400,"error":"Bad Request","message":"...","path":"/api/v1/hello/a"}

# Invalid characters (digits)
curl -i http://localhost:3000/api/v1/hello/123
# HTTP/1.1 400 Bad Request

# Name too long (> 25 chars)
curl -i http://localhost:3000/api/v1/hello/ABCDEFGHIJKLMNOPQRSTUVWXYZ
# HTTP/1.1 400 Bad Request
```

---

## Name Validation Rules

Matches OpenAPI parameter constraints:

| Rule | Value | Example (valid) | Example (invalid) |
|------|-------|-----------------|-------------------|
| Min length | 2 | `Al` | `A` |
| Max length | 25 | `Marie-Antoinette-Claire` | 26+ chars |
| Allowed chars | Letters, spaces, hyphens, apostrophes | `Jean-Paul`, `O'Brien` | `John123`, `<script>` |
| Leading/trailing spaces | Trimmed automatically | `  Alice  ` → `Alice` | — |

---

## Rate Limiting

Currently no rate limiting applied (MVP). Future versions may add:
- `X-RateLimit-Limit` header
- `X-RateLimit-Remaining` header
- HTTP 429 Too Many Requests response

---

## Authentication

Currently no authentication required (public demo API). Future versions may add:
- Bearer token (`Authorization: Bearer <token>`)
- API Key (`X-API-Key: <key>`)

---

## CORS

Allowed origins are configurable via the `CORS_ORIGINS` environment variable (comma-separated):

```bash
CORS_ORIGINS=http://localhost:3000,https://app.example.com
```

Default: `http://localhost:3000`

---

## Integration Examples

### JavaScript / Fetch

```javascript
// Generic greeting
const response = await fetch('http://localhost:3000/api/v1/hello');
const data = await response.json(); // { message: "Hello World" }

// Personalized greeting
const name = 'Philippe';
const resp = await fetch(`http://localhost:3000/api/v1/hello/${encodeURIComponent(name)}`);
const greeting = await resp.json(); // { message: "Hello Philippe" }
```

### TypeScript (with generated types)

```typescript
import type { HelloDto } from './src/generated/types';

async function greet(name: string): Promise<HelloDto> {
  const response = await fetch(`/api/v1/hello/${encodeURIComponent(name)}`);
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.json() as Promise<HelloDto>;
}
```

### HTTPie

```bash
http GET http://localhost:3000/api/v1/hello/Philippe
```

### Python

```python
import requests

response = requests.get('http://localhost:3000/api/v1/hello/Philippe')
response.raise_for_status()
print(response.json())  # {'message': 'Hello Philippe'}
```
