# Error Handling Guide

**Document:** 04-error-handling.md  
**Purpose:** Understand error responses, HTTP status codes, and troubleshooting  
**Related:** [Main README](./README.md) | [Getting Started](./01-getting-started.md)

---

## Table of Contents

1. [HTTP Status Codes](#http-status-codes)
2. [Error Response Format](#error-response-format)
3. [Common Errors](#common-errors)
4. [Validation Errors](#validation-errors)
5. [Troubleshooting Guide](#troubleshooting-guide)
6. [Error Handling Strategies](#error-handling-strategies)

---

## HTTP Status Codes

### 2xx Success Responses

| Code | Meaning | Description |
|------|---------|-------------|
| **200** | OK | Request successful. Resource retrieved or updated. |
| **201** | Created | Resource successfully created (POST requests). |

### 4xx Client Errors

| Code | Meaning | Description | Common Cause |
|------|---------|-------------|--------------|
| **400** | Bad Request | Invalid request format or validation failed. | Malformed JSON, missing fields, invalid values |
| **401** | Unauthorized | Missing or invalid authentication token. | Expired token, missing Bearer header, invalid credentials |
| **403** | Forbidden | Authenticated but lacking permission. | User role restrictions, access denied by policy |
| **404** | Not Found | Resource does not exist. | Invalid client ID, endpoint typo |
| **409** | Conflict | Request conflicts with resource state. | Duplicate entry, resource already exists |

### 5xx Server Errors

| Code | Meaning | Description | Action |
|------|---------|-------------|--------|
| **500** | Internal Server Error | Unexpected server error. | Contact support, retry with backoff |
| **503** | Service Unavailable | Server temporarily unavailable. | Retry with exponential backoff |

---

## Error Response Format

### Standard Error Response

```json
{
  "timestamp": "2024-04-29T10:00:00.000+00:00",
  "status": 400,
  "error": "Bad Request",
  "message": "Validation failed for object='connaissanceClientInDto'. Error count: 1",
  "path": "/v1/connaissance-clients"
}
```

### Field Descriptions

| Field | Type | Description |
|-------|------|-------------|
| `timestamp` | String (ISO 8601) | When the error occurred |
| `status` | Integer | HTTP status code |
| `error` | String | HTTP status name |
| `message` | String | Human-readable error description |
| `path` | String | API endpoint that caused the error |

### Extracting Error Details

**JavaScript:**
```javascript
try {
  const response = await fetch(url, options);
  const data = await response.json();
  
  if (!response.ok) {
    console.error(`${data.status} ${data.error}`);
    console.error(`Message: ${data.message}`);
    console.error(`Timestamp: ${data.timestamp}`);
    throw new Error(data.message);
  }
} catch (error) {
  console.error('Error:', error);
}
```

**Python:**
```python
try:
    response = requests.get(url, headers=headers)
    response.raise_for_status()
except requests.exceptions.HTTPError as e:
    error_data = e.response.json()
    print(f"Status: {error_data['status']}")
    print(f"Error: {error_data['error']}")
    print(f"Message: {error_data['message']}")
```

---

## Common Errors

### Error 1: 401 Unauthorized - Missing Token

**Response:**
```json
{
  "timestamp": "2024-04-29T10:00:00.000+00:00",
  "status": 401,
  "error": "Unauthorized",
  "message": "Authorization header is missing or invalid",
  "path": "/v1/connaissance-clients/8a9204f5-aa42-47bc-9f04-17caab5deeee"
}
```

**Causes:**
- Missing `Authorization` header
- Invalid header format (should be `Bearer {token}`)
- Expired token
- Invalid token signature

**Solutions:**
1. ✅ Check header format: `Authorization: Bearer YOUR_TOKEN`
2. ✅ Verify token is valid and not expired
3. ✅ Request a fresh token from auth provider
4. ✅ Check token environment variable is set: `echo $API_TOKEN`

**Code Example (Fix):**
```javascript
// ❌ Wrong
headers: {
  'Authorization': 'YOUR_TOKEN'  // Missing "Bearer" prefix
}

// ✅ Correct
headers: {
  'Authorization': `Bearer ${process.env.API_TOKEN}`
}
```

### Error 2: 404 Not Found - Resource Doesn't Exist

**Response:**
```json
{
  "timestamp": "2024-04-29T10:00:00.000+00:00",
  "status": 404,
  "error": "Not Found",
  "message": "Client not found",
  "path": "/v1/connaissance-clients/invalid-uuid"
}
```

**Causes:**
- Invalid client ID
- Client has been deleted
- Typo in endpoint

**Solutions:**
1. ✅ Verify client ID is correct (should be UUID v4 format)
2. ✅ Check client still exists: call GET /v1/connaissance-clients to list
3. ✅ Verify endpoint spelling
4. ✅ Confirm correct environment (dev vs prod)

**Code Example (Fix):**
```javascript
// Verify client exists before operations
async function getClientSafely(clientId) {
  try {
    return await getClient(clientId);
  } catch (error) {
    if (error.response?.status === 404) {
      console.warn(`Client ${clientId} not found`);
      return null;
    }
    throw error;
  }
}
```

### Error 3: 400 Bad Request - Validation Failed

**Response:**
```json
{
  "timestamp": "2024-04-29T10:00:00.000+00:00",
  "status": 400,
  "error": "Bad Request",
  "message": "Validation failed for object='connaissanceClientInDto'. Error count: 1",
  "path": "/v1/connaissance-clients"
}
```

**Causes:**
- Missing required fields
- Invalid field values (wrong format, out of range)
- Field constraints violated (length, pattern, etc.)

**Solutions:**
1. ✅ Validate data locally before sending (see Validation Errors section)
2. ✅ Check field lengths: nom 2-50 chars, codePostal 5 chars
3. ✅ Verify enum values: situationFamilialle must be CELIBATAIRE or MARIE
4. ✅ Check postal codes are uppercase: A-Z0-9 only

**Code Example (Fix):**
```javascript
// Validate before sending
function validateClient(data) {
  const errors = [];
  
  if (!data.nom || data.nom.length < 2 || data.nom.length > 50) {
    errors.push('nom must be 2-50 characters');
  }
  
  if (!data.codePostal || data.codePostal.length !== 5) {
    errors.push('codePostal must be exactly 5 characters');
  }
  
  if (!['CELIBATAIRE', 'MARIE'].includes(data.situationFamilialle)) {
    errors.push('situationFamilialle must be CELIBATAIRE or MARIE');
  }
  
  return errors;
}

const errors = validateClient(clientData);
if (errors.length > 0) {
  console.error('Validation errors:', errors);
  return;
}
```

### Error 4: 409 Conflict - Resource Already Exists

**Response:**
```json
{
  "timestamp": "2024-04-29T10:00:00.000+00:00",
  "status": 409,
  "error": "Conflict",
  "message": "Client already exists with this information",
  "path": "/v1/connaissance-clients"
}
```

**Causes:**
- Duplicate client record
- Conflicting unique constraint

**Solutions:**
1. ✅ Check if client already exists before creating
2. ✅ Use PUT to update existing client instead of POST
3. ✅ Verify business logic for duplicate detection

**Code Example (Fix):**
```python
def create_or_update_client(client_data):
    """Create if new, update if exists"""
    # Check for duplicates
    existing = find_client_by_name_and_city(
        client_data['nom'],
        client_data['ville']
    )
    
    if existing:
        # Update existing
        return update_client(existing['id'], client_data)
    else:
        # Create new
        return create_client(client_data)
```

### Error 5: 500 Internal Server Error

**Response:**
```json
{
  "timestamp": "2024-04-29T10:00:00.000+00:00",
  "status": 500,
  "error": "Internal Server Error",
  "message": "An unexpected error occurred",
  "path": "/v1/connaissance-clients"
}
```

**Causes:**
- Server-side bug
- Database error
- Service temporarily unavailable

**Solutions:**
1. ✅ Retry with exponential backoff
2. ✅ Check server status/health
3. ✅ Contact support if persists
4. ✅ Check application logs

**Code Example (Fix):**
```javascript
async function makeRequestWithRetry(url, options, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(url, options);
      if (response.status === 500) throw new Error('Server error');
      if (response.ok) return await response.json();
      throw new Error(`HTTP ${response.status}`);
    } catch (error) {
      if (attempt === maxRetries) throw error;
      
      const delay = Math.pow(2, attempt - 1) * 1000;
      console.log(`Retry ${attempt}/${maxRetries} in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}
```

---

## Validation Errors

### Field-Specific Validation Rules

| Field | Rules | Error Example |
|-------|-------|---------------|
| `nom` | 2-50 chars, `^[a-zA-Z ,.'-]+$` | Numbers not allowed |
| `prenom` | 2-50 chars, `^[a-zA-Z ,.'-]+$` | Special chars invalid |
| `ligne1` | 2-50 chars, `^[a-zA-Z0-9 ,.'-]+$` | Must match pattern |
| `ligne2` | Optional, 2-50 chars if provided | Can be null |
| `codePostal` | Exactly 5 chars, `^[A-Z0-9]+$` | Must be uppercase, 5 digits |
| `ville` | 2-50 chars, `^[a-zA-Z ,.'-]+$` | Numbers not allowed |
| `situationFamilialle` | `CELIBATAIRE` or `MARIE` | Only 2 valid values |
| `nombreEnfants` | 0-20 range | Must be integer |

### Validation Examples

**Invalid Name (Too Short):**
```json
{
  "status": 400,
  "message": "nom: size must be between 2 and 50"
}
```

**Invalid Postal Code (Wrong Format):**
```json
{
  "status": 400,
  "message": "codePostal: must match \"^[A-Z0-9]+$\""
}
```

**Invalid Children Count (Out of Range):**
```json
{
  "status": 400,
  "message": "nombreEnfants: must be between 0 and 20"
}
```

### Pre-Validation in Code

**JavaScript:**
```javascript
function validateClientData(data) {
  const patterns = {
    alphaPlusSpaces: /^[a-zA-Z ,.'-]+$/,
    alphanumericPlus: /^[a-zA-Z0-9 ,.'-]+$/,
    postalCode: /^[A-Z0-9]+$/
  };
  
  const errors = [];
  
  if (!data.nom?.match(patterns.alphaPlusSpaces) || data.nom.length < 2 || data.nom.length > 50)
    errors.push('Invalid nom');
  
  if (!data.codePostal?.match(patterns.postalCode) || data.codePostal.length !== 5)
    errors.push('Invalid codePostal');
  
  if (!['CELIBATAIRE', 'MARIE'].includes(data.situationFamilialle))
    errors.push('Invalid situationFamilialle');
  
  if (typeof data.nombreEnfants !== 'number' || data.nombreEnfants < 0 || data.nombreEnfants > 20)
    errors.push('Invalid nombreEnfants');
  
  return errors;
}
```

**Python:**
```python
import re

def validate_client_data(data):
    patterns = {
        'alpha_plus': r'^[a-zA-Z ,.\'"-]+$',
        'alphanumeric_plus': r'^[a-zA-Z0-9 ,.\'"-]+$',
        'postal_code': r'^[A-Z0-9]+$'
    }
    
    errors = []
    
    # Validate nom
    if not data.get('nom') or len(data['nom']) < 2 or len(data['nom']) > 50:
        errors.append('nom: must be 2-50 characters')
    elif not re.match(patterns['alpha_plus'], data['nom']):
        errors.append('nom: invalid characters')
    
    # Validate codePostal
    if not data.get('codePostal') or len(data['codePostal']) != 5:
        errors.append('codePostal: must be exactly 5 characters')
    elif not re.match(patterns['postal_code'], data['codePostal']):
        errors.append('codePostal: must be uppercase letters/digits only')
    
    # Validate situationFamilialle
    if data.get('situationFamilialle') not in ['CELIBATAIRE', 'MARIE']:
        errors.append('situationFamilialle: must be CELIBATAIRE or MARIE')
    
    # Validate nombreEnfants
    if not isinstance(data.get('nombreEnfants'), int) or data['nombreEnfants'] < 0 or data['nombreEnfants'] > 20:
        errors.append('nombreEnfants: must be 0-20')
    
    return errors
```

---

## Troubleshooting Guide

### Scenario 1: "Invalid credentials" on every request

**Symptoms:**
- All requests return 401 Unauthorized
- Token appears correct

**Diagnosis:**
```bash
# Decode token to check expiration
TOKEN="your_token"
PAYLOAD=$(echo $TOKEN | cut -d'.' -f2 | base64 -d)
echo $PAYLOAD | jq '.exp'

NOW=$(date +%s)
EXP=$(echo $PAYLOAD | jq -r '.exp')

if [ $EXP -lt $NOW ]; then
  echo "Token is EXPIRED"
else
  echo "Token is valid for $(($EXP - $NOW)) more seconds"
fi
```

**Solutions:**
1. Request new token from auth provider
2. Check server clock is synchronized
3. Verify correct token environment variable

### Scenario 2: "Validation failed" but data looks correct

**Symptoms:**
- 400 Bad Request on create/update
- Data appears correct when inspected

**Diagnosis:**
```javascript
// Debug: Log exactly what's being sent
console.log(JSON.stringify(clientData, null, 2));
console.log('nom length:', clientData.nom?.length);
console.log('nom regex test:', /^[a-zA-Z ,.'-]+$/.test(clientData.nom));
```

**Solutions:**
1. Check for invisible characters (spaces, unicode)
2. Trim whitespace: `data.nom = data.nom.trim()`
3. Verify character encoding (UTF-8)
4. Test with curl first to isolate issue

### Scenario 3: Intermittent 500 errors

**Symptoms:**
- Request sometimes succeeds, sometimes fails
- No clear pattern

**Diagnosis:**
- Server might be restarting or under load
- Database might be temporarily unavailable

**Solutions:**
1. Implement exponential backoff retry
2. Add request timeout (don't wait forever)
3. Monitor server health
4. Check database connectivity

```javascript
async function robustRequest(url, options) {
  const maxAttempts = 5;
  let lastError;
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const response = await fetch(url, {
        ...options,
        signal: AbortSignal.timeout(10000) // 10 second timeout
      });
      
      if (response.status === 500) {
        throw new Error('Server error');
      }
      
      if (response.ok) {
        return await response.json();
      }
      
      throw new Error(`HTTP ${response.status}`);
    } catch (error) {
      lastError = error;
      
      if (attempt === maxAttempts) break;
      
      const delay = Math.min(1000 * Math.pow(2, attempt - 1), 30000);
      console.log(`Attempt ${attempt} failed, retrying in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError;
}
```

---

## Error Handling Strategies

### Strategy 1: Graceful Degradation

```javascript
async function loadClientData(clientId) {
  try {
    return await getClient(clientId);
  } catch (error) {
    if (error.response?.status === 404) {
      console.warn('Client not found, using cached data');
      return getCachedClient(clientId) || getDefaultClient();
    }
    throw error;
  }
}
```

### Strategy 2: Exponential Backoff with Jitter

```python
import time
import random

def retry_with_backoff(func, max_attempts=5, base_delay=1):
    for attempt in range(1, max_attempts + 1):
        try:
            return func()
        except Exception as e:
            if attempt == max_attempts:
                raise
            
            # Exponential backoff with jitter
            delay = base_delay * (2 ** (attempt - 1))
            jitter = random.uniform(0, delay * 0.1)
            total_delay = delay + jitter
            
            print(f'Retry {attempt}/{max_attempts} after {total_delay:.1f}s')
            time.sleep(total_delay)
```

### Strategy 3: Circuit Breaker

```javascript
class CircuitBreaker {
  constructor(threshold = 5, timeout = 60000) {
    this.failureCount = 0;
    this.threshold = threshold;
    this.timeout = timeout;
    this.state = 'CLOSED'; // CLOSED, OPEN, HALF_OPEN
    this.nextAttempt = Date.now();
  }
  
  async execute(fn) {
    if (this.state === 'OPEN') {
      if (Date.now() < this.nextAttempt) {
        throw new Error('Circuit breaker is OPEN');
      }
      this.state = 'HALF_OPEN';
    }
    
    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }
  
  onSuccess() {
    this.failureCount = 0;
    this.state = 'CLOSED';
  }
  
  onFailure() {
    this.failureCount++;
    if (this.failureCount >= this.threshold) {
      this.state = 'OPEN';
      this.nextAttempt = Date.now() + this.timeout;
    }
  }
}
```

---

## Support

- 📖 [Main README](./README.md)
- 🚀 [Getting Started](./01-getting-started.md)
- 🔐 [Authentication](./02-authentication.md)
- 📋 [Endpoints](./03-endpoints/)
- 💾 [Code Examples](./05-examples.md)
- 💡 [Best Practices](./06-best-practices.md)

---

**Next:** [Code Examples](./05-examples.md)
