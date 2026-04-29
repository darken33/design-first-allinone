# Connaissance Client API - Developer Documentation

**Version:** 1.0.0  
**Last Updated:** April 29, 2026  
**Contact:** [SQLI](http://sqli.com/) | pbousquet@sqli.com

---

## Overview

The **Connaissance Client API** provides a RESTful interface for managing client knowledge cards (`fiches de connaissance client`). This API allows you to create, retrieve, update, and delete customer records with detailed demographic and family situation information.

### Key Features

- 🔐 **JWT Bearer Authentication** — Secure API access with token-based authentication
- 📋 **Full CRUD Operations** — Create, read, update, and delete client records
- 🔄 **Granular Updates** — Update specific fields (address, family situation) independently
- ✅ **Input Validation** — Enforced schemas with pattern matching and constraints
- 📊 **Structured Data** — Standardized responses with comprehensive error information

---

## Quick Start

### 1. Get Authentication Token

Obtain a JWT Bearer token from your authentication provider. You'll need this for all API requests (except public endpoints).

### 2. Make Your First Request

```bash
curl -X GET "http://localhost:8080/v1/connaissance-clients" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 3. Explore the Endpoints

Detailed documentation for each endpoint is available in the [Endpoints](#endpoints) section below.

---

## API Basics

### Base URLs

| Environment | URL |
|-------------|-----|
| Development | `http://localhost:8080/` |
| Production | `https://jenesaispas/` |

### API Version

All endpoints use `/v1/` prefix:
```
GET /v1/connaissance-clients
POST /v1/connaissance-clients
GET /v1/connaissance-clients/{id}
DELETE /v1/connaissance-clients/{id}
PUT /v1/connaissance-clients/{id}/adresse
PUT /v1/connaissance-clients/{id}/situation
```

### Content Type

All requests and responses use JSON format:
```
Content-Type: application/json
```

---

## Security & Authentication

### Overview

Most endpoints require **JWT Bearer Token authentication**. The exception is the `GET /v1/connaissance-clients` endpoint, which is public and does not require authentication.

### Usage

Include your JWT token in the `Authorization` header:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**See [Authentication Guide](./02-authentication.md) for detailed instructions.**

---

## Endpoints

### 1. List All Clients

**GET** `/v1/connaissance-clients`

Retrieve a list of all client knowledge cards. This is a **public endpoint** (no authentication required).

- **Description:** Returns all client records
- **Auth Required:** No
- **See:** [List Clients Endpoint](./03-endpoints/01-list-clients.md)

### 2. Create or Update Client

**POST** `/v1/connaissance-clients`

Create a new client record or update an existing one. Requires authentication.

- **Description:** Create a new client or update an existing client record
- **Auth Required:** Yes (Bearer JWT)
- **See:** [Create/Update Client Endpoint](./03-endpoints/02-create-update-client.md)

### 3. Get Single Client

**GET** `/v1/connaissance-clients/{id}`

Retrieve a specific client by their UUID. Requires authentication.

- **Description:** Returns a single client record by ID
- **Auth Required:** Yes (Bearer JWT)
- **Parameters:** `id` (UUID format, e.g., `8a9204f5-aa42-47bc-9f04-17caab5deeee`)
- **See:** [Get Client Endpoint](./03-endpoints/03-get-client.md)

### 4. Delete Client

**DELETE** `/v1/connaissance-clients/{id}`

Delete a client record by UUID. Requires authentication.

- **Description:** Remove a client record from the system
- **Auth Required:** Yes (Bearer JWT)
- **Parameters:** `id` (UUID format)
- **See:** [Delete Client Endpoint](./03-endpoints/04-delete-client.md)

### 5. Update Client Address

**PUT** `/v1/connaissance-clients/{id}/adresse`

Update only the address information of a client. Requires authentication.

- **Description:** Modify the address details (line 1, line 2, postal code, city) for a specific client
- **Auth Required:** Yes (Bearer JWT)
- **Parameters:** `id` (UUID format)
- **See:** [Update Address Endpoint](./03-endpoints/05-update-address.md)

### 6. Update Client Family Situation

**PUT** `/v1/connaissance-clients/{id}/situation`

Update family situation and number of children. Requires authentication.

- **Description:** Change the family status and children count for a specific client
- **Auth Required:** Yes (Bearer JWT)
- **Parameters:** `id` (UUID format)
- **See:** [Update Situation Endpoint](./03-endpoints/06-update-situation.md)

---

## Documentation Structure

| Document | Purpose |
|----------|---------|
| [Getting Started](./01-getting-started.md) | Setup, configuration, first API call |
| [Authentication](./02-authentication.md) | JWT Bearer token details and usage |
| [Endpoints](./03-endpoints/) | Detailed reference for all 6 endpoints |
| [Error Handling](./04-error-handling.md) | HTTP status codes and error responses |
| [Code Examples](./05-examples.md) | Complete working examples (cURL, JS, Python, Java) |
| [Best Practices](./06-best-practices.md) | Validation rules, constraints, and guidelines |

---

## Common Response Structure

### Success Response (2xx)

```json
{
  "id": "8a9204f5-aa42-47bc-9f04-17caab5deeee",
  "nom": "Bousquet",
  "prenom": "Philippe",
  "ligne1": "48 rue bauducheu",
  "ligne2": "maison individuelle",
  "codePostal": "33800",
  "ville": "Bordeaux",
  "situationFamilialle": "MARIE",
  "nombreEnfants": 1
}
```

### Error Response (4xx, 5xx)

```json
{
  "timestamp": "2017-07-21T17:32:28.437+00:00",
  "status": 400,
  "error": "Bad Request",
  "message": "Validation failed for object='connaissanceClientInDto'. Error count: 1",
  "path": "/connaissance-clients"
}
```

See [Error Handling Guide](./04-error-handling.md) for complete error reference.

---

## Data Types & Constraints

### Client Record Fields

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| `id` | UUID | Auto | Format: UUID v4 |
| `nom` | String | † | 2-50 chars, letters/spaces/punctuation |
| `prenom` | String | † | 2-50 chars, letters/spaces/punctuation |
| `ligne1` | String | † | 2-50 chars, alphanumeric/spaces/punctuation |
| `ligne2` | String | Optional | 2-50 chars, alphanumeric/spaces/punctuation |
| `codePostal` | String | † | Exactly 5 chars, uppercase letters/digits |
| `ville` | String | † | 2-50 chars, letters/spaces/punctuation |
| `situationFamilialle` | Enum | † | `CELIBATAIRE` or `MARIE` |
| `nombreEnfants` | Integer | † | 0-20 range |

† = Required field

---

## Rate Limiting & Quotas

Currently, the API does not implement rate limiting. However, it is recommended to:

- Implement exponential backoff for retries
- Cache responses when possible
- Batch operations to reduce request volume
- Monitor your usage for future compliance with rate limits

---

## Support & Resources

- 📖 **Full Documentation:** Read through guides in order starting with [Getting Started](./01-getting-started.md)
- 🧪 **Code Examples:** Check [examples](./05-examples.md) for working code in your language
- 📋 **API Reference:** Browse [endpoint documentation](./03-endpoints/)
- ❓ **Error Help:** See [Error Handling](./04-error-handling.md) for troubleshooting
- 💡 **Best Practices:** Follow guidelines in [Best Practices](./06-best-practices.md)

---

## License

Copyright © SQLI. All rights reserved.

---

**Ready to get started?** → [Read Getting Started Guide](./01-getting-started.md)
