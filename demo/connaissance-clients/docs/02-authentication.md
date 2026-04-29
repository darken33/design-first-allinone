# Authentication Guide

**Document:** 02-authentication.md  
**Purpose:** Understand JWT Bearer token authentication and how to use it  
**Related:** [Getting Started](./01-getting-started.md) | [Main README](./README.md)

---

## Table of Contents

1. [Overview](#overview)
2. [JWT Bearer Token](#jwt-bearer-token)
3. [Authentication Methods](#authentication-methods)
4. [Using Tokens in Requests](#using-tokens-in-requests)
5. [Token Lifecycle](#token-lifecycle)
6. [Common Issues](#common-issues)
7. [Security Best Practices](#security-best-practices)

---

## Overview

The Connaissance Client API uses **JWT Bearer Token authentication** to secure API access. 

### Key Points

- **Required for:** All endpoints EXCEPT `GET /v1/connaissance-clients` (list clients is public)
- **Format:** HTTP `Authorization` header with Bearer scheme
- **Token Type:** JWT (JSON Web Token)
- **Issued By:** Your organization's authentication provider (SSO, OAuth2 provider, etc.)

### Authentication Requirement Matrix

| Endpoint | Method | Public | Requires Auth |
|----------|--------|--------|---------------|
| List Clients | GET /v1/connaissance-clients | ✅ Yes | ❌ No |
| Get Client | GET /v1/connaissance-clients/{id} | ❌ No | ✅ Yes |
| Create/Update Client | POST /v1/connaissance-clients | ❌ No | ✅ Yes |
| Delete Client | DELETE /v1/connaissance-clients/{id} | ❌ No | ✅ Yes |
| Update Address | PUT /v1/connaissance-clients/{id}/adresse | ❌ No | ✅ Yes |
| Update Situation | PUT /v1/connaissance-clients/{id}/situation | ❌ No | ✅ Yes |

---

## JWT Bearer Token

### What is a JWT?

A **JSON Web Token (JWT)** is a compact, URL-safe means of representing claims. It consists of three parts separated by dots:

```
header.payload.signature
```

### JWT Structure Example

**Encoded Token:**
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c
```

**Decoded Parts:**

Part 1 - Header:
```json
{
  "alg": "HS256",
  "typ": "JWT"
}
```

Part 2 - Payload:
```json
{
  "sub": "1234567890",
  "name": "John Doe",
  "iat": 1516239022
}
```

Part 3 - Signature:
```
HMACSHA256(base64UrlEncode(header) + "." + base64UrlEncode(payload), secret)
```

### Key Claims (Payload)

Common JWT claims you might see:

| Claim | Type | Description |
|-------|------|-------------|
| `sub` | String | Subject (typically user ID) |
| `name` | String | User's full name |
| `email` | String | User's email address |
| `iat` | Number | Issued At (Unix timestamp) |
| `exp` | Number | Expiration Time (Unix timestamp) |
| `aud` | String/Array | Audience (intended API/resource) |
| `iss` | String | Issuer (who created the token) |
| `roles` | Array | User roles/permissions |
| `org` | String | Organization ID |

---

## Authentication Methods

### Method 1: Bearer Token (Recommended)

Use the standard HTTP `Authorization` header with the Bearer scheme.

**Header Format:**
```
Authorization: Bearer {token}
```

**Example:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkZXYtdXNlciIsIm...
```

### Method 2: Custom Headers (If Configured)

Some organizations use custom header names (e.g., `X-API-Token`). Check with your administrator.

```
X-API-Token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Method 3: Query Parameters (Not Recommended - Security Risk)

Some endpoints may accept tokens as query parameters. **Avoid this in production** as tokens will appear in logs and browser history.

```
GET /v1/connaissance-clients?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## Using Tokens in Requests

### cURL

```bash
curl -X GET "http://localhost:8080/v1/connaissance-clients/8a9204f5-aa42-47bc-9f04-17caab5deeee" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

Store token in environment variable:
```bash
export API_TOKEN="your_jwt_token"
curl -X GET "http://localhost:8080/v1/connaissance-clients/8a9204f5-aa42-47bc-9f04-17caab5deeee" \
  -H "Authorization: Bearer $API_TOKEN"
```

### JavaScript/Node.js

```javascript
const axios = require('axios');

const token = process.env.API_TOKEN;

const response = await axios.get(
  'http://localhost:8080/v1/connaissance-clients/8a9204f5-aa42-47bc-9f04-17caab5deeee',
  {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  }
);

console.log(response.data);
```

### Python

```python
import requests
import os

headers = {
    'Authorization': f'Bearer {os.getenv("API_TOKEN")}',
    'Content-Type': 'application/json'
}

response = requests.get(
    'http://localhost:8080/v1/connaissance-clients/8a9204f5-aa42-47bc-9f04-17caab5deeee',
    headers=headers
)

print(response.json())
```

### Java

```java
import org.apache.http.client.methods.HttpGet;
import org.apache.http.impl.client.HttpClients;
import org.apache.http.impl.client.CloseableHttpClient;

String token = System.getenv("API_TOKEN");
String url = "http://localhost:8080/v1/connaissance-clients/8a9204f5-aa42-47bc-9f04-17caab5deeee";

try (CloseableHttpClient httpClient = HttpClients.createDefault()) {
    HttpGet request = new HttpGet(url);
    request.addHeader("Authorization", "Bearer " + token);
    request.addHeader("Content-Type", "application/json");
    
    // Execute request
    var response = httpClient.execute(request, httpResponse -> {
        return httpResponse;
    });
}
```

---

## Token Lifecycle

### 1. Token Acquisition

Obtain a token from your authentication provider (usually via login):

```bash
# Example: OAuth2 Password Grant
curl -X POST "https://auth.example.com/token" \
  -d "grant_type=password" \
  -d "username=your_username" \
  -d "password=your_password" \
  -d "client_id=your_client_id" \
  -d "client_secret=your_client_secret"

# Response includes:
# {
#   "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
#   "token_type": "Bearer",
#   "expires_in": 3600
# }
```

### 2. Token Usage

Use the token in API requests for the specified duration (`expires_in` seconds, typically 1 hour).

### 3. Token Expiration

When token expires, you'll receive a **401 Unauthorized** response:

```json
{
  "timestamp": "2024-04-29T10:00:00.000+00:00",
  "status": 401,
  "error": "Unauthorized",
  "message": "Token expired",
  "path": "/v1/connaissance-clients"
}
```

### 4. Token Refresh

Request a new token (usually before expiration):

```bash
# Example: OAuth2 Refresh Grant
curl -X POST "https://auth.example.com/token" \
  -d "grant_type=refresh_token" \
  -d "refresh_token=your_refresh_token" \
  -d "client_id=your_client_id" \
  -d "client_secret=your_client_secret"
```

### Token Expiration Handling

**Best Practice: Proactive Refresh**

```javascript
// Pseudo-code
class APIClient {
  constructor(initialToken, refreshToken) {
    this.token = initialToken;
    this.refreshToken = refreshToken;
    this.expiresAt = Date.now() + (3600 * 1000); // 1 hour
  }

  async ensureValidToken() {
    const timeUntilExpiry = this.expiresAt - Date.now();
    
    // Refresh if less than 5 minutes remaining
    if (timeUntilExpiry < 300000) {
      await this.refreshAccessToken();
    }
  }

  async refreshAccessToken() {
    const response = await fetch('https://auth.example.com/token', {
      method: 'POST',
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: this.refreshToken
      })
    });
    
    const data = await response.json();
    this.token = data.access_token;
    this.expiresAt = Date.now() + (data.expires_in * 1000);
  }

  async request(method, endpoint, body = null) {
    await this.ensureValidToken();
    
    return fetch(`http://localhost:8080/v1${endpoint}`, {
      method,
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'application/json'
      },
      body: body ? JSON.stringify(body) : null
    });
  }
}
```

---

## Common Issues

### Issue 1: "401 Unauthorized"

**Cause:** Invalid, expired, or missing token

**Solutions:**
1. Verify token format: should be three base64-encoded parts separated by dots
2. Check token expiration: decode and check `exp` claim
3. Ensure header format is correct: `Authorization: Bearer {token}`
4. Request a new token from authentication provider

### Issue 2: "403 Forbidden"

**Cause:** Token valid but lacking required permissions

**Solutions:**
1. Check if your user/role has access to the resource
2. Contact your administrator to grant required permissions
3. Verify you're using the correct token for the environment

### Issue 3: CORS Error (Browser)

**Cause:** Browser blocks requests due to missing `Access-Control-Allow-*` headers

**Solutions:**
1. Make requests from a backend server (recommended)
2. Use a CORS proxy (development only)
3. Contact API administrator to configure CORS headers

### Issue 4: Token Expires During Long Operation

**Cause:** Long-running requests fail when token expires mid-request

**Solutions:**
1. Implement token refresh before expiration (recommended)
2. Request tokens with longer expiration times (if allowed)
3. Retry failed requests with a fresh token

### Debugging

**Decode JWT to inspect claims:**

```bash
# macOS/Linux
TOKEN="your_jwt_token"
echo $TOKEN | cut -d'.' -f2 | base64 -d | jq .

# Online tools (use with caution - don't share sensitive tokens)
# https://jwt.io/
```

**Check token expiration:**

```bash
TOKEN="your_jwt_token"
PAYLOAD=$(echo $TOKEN | cut -d'.' -f2 | base64 -d)
EXP=$(echo $PAYLOAD | jq -r '.exp')
NOW=$(date +%s)

if [ $EXP -lt $NOW ]; then
  echo "Token is EXPIRED"
else
  REMAINING=$((EXP - NOW))
  echo "Token expires in $REMAINING seconds"
fi
```

---

## Security Best Practices

### 1. ✅ DO

- ✅ Store tokens in secure, memory-protected storage
- ✅ Use HTTPS (not HTTP) for all API requests
- ✅ Refresh tokens before expiration
- ✅ Use short token expiration times (typically 1 hour)
- ✅ Implement exponential backoff for retries
- ✅ Log token usage for audit trails
- ✅ Rotate credentials regularly
- ✅ Use environment variables or credential managers

### 2. ❌ DON'T

- ❌ Commit tokens to version control
- ❌ Log tokens to console/files
- ❌ Send tokens in query parameters
- ❌ Use tokens in URLs that might be cached
- ❌ Share tokens via email or chat
- ❌ Use tokens across different environments
- ❌ Hardcode tokens in source code
- ❌ Transmit tokens over unencrypted connections

### 3. Token Storage Strategies

**Browser JavaScript (Single Page Apps):**
```javascript
// ❌ DON'T: Insecure
localStorage.setItem('token', token);

// ✅ DO: Secure (Memory or HTTPOnly cookie via backend)
sessionStorage.setItem('token', token); // Cleared on browser close

// ✅ BEST: HTTPOnly cookie set by backend
// Server sets: Set-Cookie: auth_token=...; HttpOnly; Secure; SameSite=Strict
```

**Node.js Application:**
```bash
# Use environment variables or secure vaults
export API_TOKEN="your_token_here"

# Or use a vault service:
# - AWS Secrets Manager
# - HashiCorp Vault
# - Azure Key Vault
# - 1Password (for development)
```

**Python Application:**
```python
# Use environment variables
import os
from dotenv import load_dotenv

load_dotenv()  # Load from .env file
token = os.getenv('API_TOKEN')

# Or use a secret manager
# - python-dotenv
# - python-keyring
# - pydantic-settings with vault support
```

---

## Support

- 📖 **Full Documentation:** [README](./README.md)
- 🚀 **Quick Start:** [Getting Started](./01-getting-started.md)
- 📋 **Endpoints:** [Endpoint Reference](./03-endpoints/)
- 💾 **Examples:** [Code Examples](./05-examples.md)
- ❌ **Errors:** [Error Handling](./04-error-handling.md)

---

**Next Step:** → [Explore API Endpoints](./03-endpoints/01-list-clients.md)
