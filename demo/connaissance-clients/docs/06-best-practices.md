# Best Practices Guide

**Document:** 06-best-practices.md  
**Purpose:** Validation rules, constraints, recommendations, and common patterns  
**Related:** [Error Handling](./04-error-handling.md) | [Code Examples](./05-examples.md)

---

## Table of Contents

1. [Field Validation Rules](#field-validation-rules)
2. [Common Patterns](#common-patterns)
3. [Authentication Best Practices](#authentication-best-practices)
4. [Performance Optimization](#performance-optimization)
5. [Security Considerations](#security-considerations)
6. [Error Handling Best Practices](#error-handling-best-practices)
7. [Data Consistency](#data-consistency)
8. [Testing Strategies](#testing-strategies)

---

## Field Validation Rules

### Reference Table

All validation rules at a glance:

| Field | Type | Length | Pattern | Enum | Min | Max | Required | Optional |
|-------|------|--------|---------|------|-----|-----|----------|----------|
| `nom` | String | 2-50 | `^[a-zA-Z ,.'-]+$` | — | — | — | ✓ | — |
| `prenom` | String | 2-50 | `^[a-zA-Z ,.'-]+$` | — | — | — | ✓ | — |
| `ligne1` | String | 2-50 | `^[a-zA-Z0-9 ,.'-]+$` | — | — | — | ✓ | — |
| `ligne2` | String | 2-50 | `^[a-zA-Z0-9 ,.'-]+$` | — | — | — | — | ✓ |
| `codePostal` | String | 5 (exact) | `^[A-Z0-9]+$` | — | — | — | ✓ | — |
| `ville` | String | 2-50 | `^[a-zA-Z ,.'-]+$` | — | — | — | ✓ | — |
| `situationFamilialle` | Enum | — | — | CELIBATAIRE, MARIE | — | — | ✓ | — |
| `nombreEnfants` | Integer | — | — | — | 0 | 20 | ✓ | — |
| `id` | UUID v4 | — | — | — | — | — | ✗ | ✓ |

### Detailed Field Rules

#### Name Fields: `nom` and `prenom`

**Rules:**
- ✓ 2-50 characters
- ✓ Letters (a-z, A-Z) only
- ✓ Spaces, commas, periods, apostrophes, hyphens allowed
- ✓ Case-insensitive matching by API

**Valid Examples:**
```
✓ "Jean"
✓ "Jean-Marie"
✓ "O'Connor"
✓ "Marie-Claire"
✓ "Jean, Marie"
```

**Invalid Examples:**
```
✗ "J" (too short)
✗ "Jean123" (numbers not allowed)
✗ "Jean&Marie" (special chars not allowed)
✗ "Jean@Domain" (@ not allowed)
```

**Client-Side Validation:**

JavaScript:
```javascript
const namePattern = /^[a-zA-Z ,.'-]+$/;
const isValidName = (name) => {
  if (!name) return false;
  if (name.length < 2 || name.length > 50) return false;
  return namePattern.test(name);
};

// Test
console.log(isValidName("Jean")); // true
console.log(isValidName("J")); // false
console.log(isValidName("Jean123")); // false
```

Python:
```python
import re

def is_valid_name(name: str) -> bool:
    if not name or len(name) < 2 or len(name) > 50:
        return False
    return re.match(r'^[a-zA-Z ,.\'"-]+$', name) is not None

# Test
print(is_valid_name("Jean"))      # True
print(is_valid_name("J"))         # False
print(is_valid_name("Jean123"))   # False
```

---

#### Address Line 1 & 2: `ligne1` and `ligne2`

**Rules:**
- ✓ 2-50 characters
- ✓ Letters (a-z, A-Z), numbers (0-9)
- ✓ Spaces, commas, periods, apostrophes, hyphens allowed
- ✓ `ligne2` is optional (can be null)

**Valid Examples:**
```
✓ "123 Rue de la Paix"
✓ "456 Boulevard Saint-Germain"
✓ "Apt 4B"
✓ "Suite 200"
```

**Invalid Examples:**
```
✗ "# 5" (too short, special char)
✗ "123 Rue de la Paix, Paris" (too long if > 50 chars)
```

---

#### Postal Code: `codePostal`

**Rules:**
- ✓ EXACTLY 5 characters
- ✓ UPPERCASE letters (A-Z) and numbers (0-9) only
- ✓ No lowercase, no spaces, no special characters

**Valid Examples:**
```
✓ "75001" (numeric)
✓ "75AB1" (alphanumeric)
✓ "CEDEX"
✓ "93210"
```

**Invalid Examples:**
```
✗ "7500" (too short)
✗ "750011" (too long)
✗ "75001 " (space)
✗ "75a01" (lowercase)
```

**Normalization:**

JavaScript:
```javascript
function normalizePostalCode(code: string): string {
  return code.trim().toUpperCase().slice(0, 5);
}

// Always normalize before sending
const code = normalizePostalCode("75001");
```

Python:
```python
def normalize_postal_code(code: str) -> str:
    return code.strip().upper()[:5]

# Usage
code = normalize_postal_code("75001")
```

---

#### City: `ville`

**Rules:**
- ✓ 2-50 characters
- ✓ Letters only
- ✓ Spaces, commas, periods, apostrophes, hyphens allowed

**Valid Examples:**
```
✓ "Paris"
✓ "New York"
✓ "Saint-Denis"
✓ "Aix-en-Provence"
```

**Invalid Examples:**
```
✗ "NY" (might be too short depending on validation)
✗ "Paris 75001" (numbers not allowed)
```

---

#### Family Status: `situationFamilialle`

**Rules:**
- ✓ EXACTLY one of two values: `CELIBATAIRE` or `MARIE`
- ✓ Case-sensitive (must be uppercase)
- ✓ No other values accepted

**Valid Values:**
```
✓ "CELIBATAIRE" (single)
✓ "MARIE" (married)
```

**Invalid Values:**
```
✗ "celibataire" (lowercase)
✗ "Célibataire" (accents)
✗ "Single" (English)
✗ "DIVORCE" (not supported)
```

**Client-Side Enum Validation:**

JavaScript:
```javascript
const FAMILY_STATUS = {
  SINGLE: 'CELIBATAIRE',
  MARRIED: 'MARIE'
};

function isValidFamilyStatus(status: string): boolean {
  return Object.values(FAMILY_STATUS).includes(status);
}

// Use constants
const client = {
  situationFamilialle: FAMILY_STATUS.MARRIED
};
```

Python:
```python
from enum import Enum

class FamilyStatus(Enum):
    SINGLE = 'CELIBATAIRE'
    MARRIED = 'MARIE'

def is_valid_family_status(status: str) -> bool:
    return status in [e.value for e in FamilyStatus]

# Use enum
client['situationFamilialle'] = FamilyStatus.MARRIED.value
```

---

#### Number of Children: `nombreEnfants`

**Rules:**
- ✓ Integer (whole numbers only)
- ✓ 0-20 range inclusive
- ✓ Cannot be negative
- ✓ Cannot exceed 20

**Valid Examples:**
```
✓ 0 (no children)
✓ 1 (one child)
✓ 10 (ten children)
✓ 20 (maximum)
```

**Invalid Examples:**
```
✗ -1 (negative)
✗ 21 (exceeds maximum)
✗ 3.5 (decimal, not integer)
✗ null (required field)
```

**Client-Side Validation:**

JavaScript:
```javascript
function isValidChildCount(count: any): boolean {
  const num = parseInt(count);
  return Number.isInteger(num) && num >= 0 && num <= 20;
}

// Validate
if (!isValidChildCount(formInput.children)) {
  alert('Children count must be 0-20');
}
```

Python:
```python
def is_valid_child_count(count: int) -> bool:
    return isinstance(count, int) and 0 <= count <= 20

# Validate before sending
if not is_valid_child_count(client_data['nombreEnfants']):
    raise ValueError('Children count must be 0-20')
```

---

## Common Patterns

### Pattern 1: Pre-Validation Before API Call

**Why:** Catch errors locally before network round-trip

```javascript
class ClientValidator {
  validate(data) {
    const errors = [];
    
    // Check all required fields
    if (!data.nom) errors.push('nom is required');
    if (!data.prenom) errors.push('prenom is required');
    if (!data.adresse?.ligne1) errors.push('adresse.ligne1 is required');
    if (!data.adresse?.codePostal) errors.push('adresse.codePostal is required');
    if (!data.adresse?.ville) errors.push('adresse.ville is required');
    if (!data.situation?.situationFamilialle) errors.push('situation.situationFamilialle is required');
    if (data.situation?.nombreEnfants === undefined) errors.push('situation.nombreEnfants is required');
    
    // Validate field formats
    if (data.nom && (data.nom.length < 2 || data.nom.length > 50))
      errors.push('nom must be 2-50 characters');
    
    if (data.codePostal && data.codePostal.length !== 5)
      errors.push('codePostal must be exactly 5 characters');
    
    if (!['CELIBATAIRE', 'MARIE'].includes(data.situation?.situationFamilialle))
      errors.push('situationFamilialle must be CELIBATAIRE or MARIE');
    
    if (data.situation?.nombreEnfants !== undefined && 
        (data.situation.nombreEnfants < 0 || data.situation.nombreEnfants > 20))
      errors.push('nombreEnfants must be 0-20');
    
    return errors;
  }
}

// Usage
const validator = new ClientValidator();
const errors = validator.validate(formData);

if (errors.length > 0) {
  // Show errors without API call
  console.error('Validation failed:', errors);
  return;
}

// Safe to send to API
await api.request('POST', '/v1/connaissance-clients', formData);
```

### Pattern 2: Normalize Data Before Sending

```javascript
function normalizeClientData(data) {
  return {
    nom: data.nom.trim(),
    prenom: data.prenom.trim(),
    adresse: {
      ligne1: data.adresse.ligne1.trim(),
      ligne2: data.adresse.ligne2 ? data.adresse.ligne2.trim() : null,
      codePostal: data.adresse.codePostal.trim().toUpperCase(),
      ville: data.adresse.ville.trim()
    },
    situation: {
      situationFamilialle: data.situation.situationFamilialle.toUpperCase(),
      nombreEnfants: parseInt(data.situation.nombreEnfants)
    }
  };
}
```

### Pattern 3: Retry with Exponential Backoff

```javascript
async function robustCreateClient(clientData, maxAttempts = 3) {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await api.request('POST', '/v1/connaissance-clients', clientData);
    } catch (error) {
      if (attempt === maxAttempts || error.response?.status === 400) {
        throw error; // Don't retry on last attempt or validation error
      }
      
      // Exponential backoff: 1s, 2s, 4s
      const delay = Math.pow(2, attempt - 1) * 1000;
      console.log(`Attempt ${attempt} failed, retrying in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}
```

### Pattern 4: Create or Update (Upsert)

```javascript
async function createOrUpdateClient(clientData) {
  try {
    // Try to create
    return await api.request('POST', '/v1/connaissance-clients', clientData);
  } catch (error) {
    if (error.response?.status === 409) {
      // Conflict - resource exists, update instead
      // Assuming you have the client ID
      return await api.request('POST', `/v1/connaissance-clients/${clientData.id}`, clientData);
    }
    throw error;
  }
}
```

---

## Authentication Best Practices

### 1. Token Management

**DO:**
```javascript
// ✓ Store token securely
const token = process.env.API_TOKEN;

// ✓ Use Bearer prefix
headers['Authorization'] = `Bearer ${token}`;

// ✓ Check token before requests
if (!token) {
  throw new Error('API token not configured');
}
```

**DON'T:**
```javascript
// ✗ Hardcode tokens
const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...";

// ✗ Include in URLs
url = `https://api.example.com?token=${token}`;

// ✗ Log tokens
console.log("Using token:", token);
```

### 2. Token Expiration Handling

```javascript
class TokenManager {
  constructor(tokenProvider) {
    this.tokenProvider = tokenProvider;
    this.token = null;
    this.expirationTime = null;
  }
  
  async getValidToken() {
    if (this.isExpired()) {
      this.token = await this.tokenProvider.getNewToken();
      this.expirationTime = Date.now() + (3600 * 1000); // 1 hour
    }
    return this.token;
  }
  
  isExpired() {
    return !this.token || Date.now() >= this.expirationTime;
  }
}
```

### 3. Secure Header Transmission

**Always use HTTPS:**
```javascript
if (!process.env.API_URL.startsWith('https://')) {
  throw new Error('API must use HTTPS (not HTTP)');
}
```

---

## Performance Optimization

### 1. Pagination

**Always paginate large result sets:**

```javascript
async function getAllClients() {
  const allClients = [];
  const pageSize = 50;
  let offset = 0;
  
  while (true) {
    const page = await api.request('GET', 
      `/v1/connaissance-clients?offset=${offset}&limit=${pageSize}`);
    
    if (page.length === 0) break;
    
    allClients.push(...page);
    offset += page.length;
  }
  
  return allClients;
}
```

### 2. Batch Operations

**Instead of multiple individual requests:**

```javascript
// ✗ Inefficient: 100 separate API calls
for (const client of clients) {
  await api.request('GET', `/v1/connaissance-clients/${client.id}`);
}

// ✓ Efficient: Single request with pagination
const allClients = await getAllClients(); // uses pagination
```

### 3. Caching

```javascript
class ClientCache {
  constructor(ttl = 300000) { // 5 minutes
    this.cache = new Map();
    this.ttl = ttl;
  }
  
  async getClient(id) {
    const cached = this.cache.get(id);
    
    if (cached && Date.now() - cached.timestamp < this.ttl) {
      return cached.data;
    }
    
    const client = await api.request('GET', `/v1/connaissance-clients/${id}`);
    this.cache.set(id, { data: client, timestamp: Date.now() });
    return client;
  }
  
  invalidate(id) {
    this.cache.delete(id);
  }
}
```

### 4. Connection Pooling

**JavaScript (Keep-Alive by default):**
```javascript
const agent = new https.Agent({ keepAlive: true });
fetch(url, { agent });
```

**Python:**
```python
# Use session for connection reuse
session = requests.Session()
for i in range(100):
    response = session.get(url)  # Reuses connection
```

---

## Security Considerations

### 1. Input Sanitization

```javascript
function sanitizeInput(input) {
  if (typeof input !== 'string') return input;
  
  // Remove potentially dangerous characters
  return input
    .trim()
    .replace(/<script[^>]*>.*?<\/script>/gi, '') // Remove scripts
    .replace(/javascript:/gi, '')                  // Remove javascript: protocol
    .substring(0, 100);                            // Limit length
}
```

### 2. SQL Injection Prevention

The API uses parameterized queries, but always validate:

```javascript
// ✓ Safe: parameterized (API handles this)
await api.request('GET', `/v1/connaissance-clients/${clientId}`);

// ✗ Unsafe: concatenation (never do this)
const query = `SELECT * FROM clients WHERE id = '${clientId}'`;
```

### 3. CORS and CSRF

**Server should enforce:**
- CORS headers restricted to known origins
- CSRF tokens for state-changing operations
- Same-Site cookies

**Client responsibility:**
- Don't bypass CORS
- Use framework CSRF protections

### 4. Rate Limiting

Implement client-side rate limiting:

```javascript
class RateLimiter {
  constructor(maxRequests = 10, windowMs = 1000) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
    this.requests = [];
  }
  
  async waitIfNeeded() {
    const now = Date.now();
    this.requests = this.requests.filter(t => now - t < this.windowMs);
    
    if (this.requests.length >= this.maxRequests) {
      const oldestRequest = this.requests[0];
      const waitTime = this.windowMs - (now - oldestRequest);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
    
    this.requests.push(now);
  }
}
```

---

## Error Handling Best Practices

### 1. Comprehensive Error Information

```javascript
class APIError extends Error {
  constructor(status, message, path, timestamp) {
    super(message);
    this.status = status;
    this.path = path;
    this.timestamp = timestamp;
    this.name = 'APIError';
  }
  
  toString() {
    return `${this.status} ${this.name}: ${this.message} (${this.path})`;
  }
}
```

### 2. Graceful Degradation

```javascript
async function getClientOrDefault(clientId, defaultValue = null) {
  try {
    return await getClient(clientId);
  } catch (error) {
    if (error.status === 404) {
      console.warn(`Client ${clientId} not found`);
      return defaultValue;
    }
    throw error; // Re-throw other errors
  }
}
```

### 3. Logging and Monitoring

```javascript
function logRequest(method, path, statusCode, responseTime) {
  console.log({
    timestamp: new Date().toISOString(),
    method,
    path,
    statusCode,
    responseTime: `${responseTime}ms`,
    level: statusCode >= 400 ? 'ERROR' : 'INFO'
  });
}
```

---

## Data Consistency

### 1. Idempotency

For create operations, use unique identifiers:

```javascript
const idempotencyKey = crypto.randomUUID();

// Same request with same key can be safely retried
const response = await fetch(url, {
  method: 'POST',
  headers: {
    ...headers,
    'Idempotency-Key': idempotencyKey
  },
  body: JSON.stringify(clientData)
});
```

### 2. Optimistic Updates

```javascript
async function updateAndOptimistic(clientId, updates) {
  // Optimistically update UI
  const localCache = { ...getCurrentClient(), ...updates };
  updateUI(localCache);
  
  try {
    // Send to server
    const result = await api.request('POST', `/v1/connaissance-clients/${clientId}`, updates);
    // Update with real response
    updateUI(result);
  } catch (error) {
    // Rollback on error
    updateUI(getCurrentClient());
    throw error;
  }
}
```

### 3. Version Control

```javascript
class ClientRepository {
  async updateWithVersionCheck(clientId, updates, expectedVersion) {
    const client = await getClient(clientId);
    
    if (client.version !== expectedVersion) {
      throw new Error('Conflict: Client was modified');
    }
    
    return await updateClient(clientId, updates);
  }
}
```

---

## Testing Strategies

### 1. Unit Tests - Validation

```javascript
describe('ClientValidator', () => {
  let validator;
  
  beforeEach(() => {
    validator = new ClientValidator();
  });
  
  test('validates valid client data', () => {
    const validData = {
      nom: 'Dupont',
      prenom: 'Jean',
      adresse: {
        ligne1: '123 Rue de la Paix',
        codePostal: '75001',
        ville: 'Paris'
      },
      situation: {
        situationFamilialle: 'MARIE',
        nombreEnfants: 2
      }
    };
    
    const errors = validator.validate(validData);
    expect(errors).toHaveLength(0);
  });
  
  test('rejects invalid postal code', () => {
    const invalidData = {
      ...validData,
      adresse: { ...validData.adresse, codePostal: '750' }
    };
    
    const errors = validator.validate(invalidData);
    expect(errors.some(e => e.includes('codePostal'))).toBe(true);
  });
});
```

### 2. Integration Tests

```javascript
describe('ClientAPI', () => {
  test('creates and retrieves client', async () => {
    const newClient = await api.request('POST', '/v1/connaissance-clients', {
      nom: 'Test',
      prenom: 'Client',
      adresse: { /* ... */ },
      situation: { /* ... */ }
    });
    
    const retrieved = await api.request('GET', `/v1/connaissance-clients/${newClient.id}`);
    expect(retrieved.nom).toBe('Test');
  });
});
```

### 3. Test Data Strategy

```javascript
const testClients = {
  minimal: {
    nom: 'A',
    prenom: 'B',
    adresse: { ligne1: '12', codePostal: '00000', ville: 'Z' },
    situation: { situationFamilialle: 'CELIBATAIRE', nombreEnfants: 0 }
  },
  maximal: {
    nom: 'A'.repeat(50),
    prenom: 'B'.repeat(50),
    adresse: { 
      ligne1: 'X'.repeat(50),
      ligne2: 'Y'.repeat(50),
      codePostal: '99999',
      ville: 'Z'.repeat(50)
    },
    situation: { situationFamilialle: 'MARIE', nombreEnfants: 20 }
  }
};
```

---

## Summary Checklist

**Before Each API Call:**
- ✓ Validate all required fields
- ✓ Check field lengths and patterns
- ✓ Verify enum values
- ✓ Normalize data (trim, uppercase postal codes)
- ✓ Validate authentication token
- ✓ Use HTTPS only

**Error Handling:**
- ✓ Implement retry logic with backoff
- ✓ Log all errors with context
- ✓ Provide user-friendly error messages
- ✓ Handle specific status codes appropriately
- ✓ Implement circuit breaker for cascading failures

**Performance:**
- ✓ Use pagination for large result sets
- ✓ Implement caching where appropriate
- ✓ Minimize network requests
- ✓ Reuse connections
- ✓ Monitor response times

**Security:**
- ✓ Never log tokens
- ✓ Validate input always
- ✓ Use HTTPS
- ✓ Handle tokens securely
- ✓ Implement rate limiting

---

## Support

- 📖 [Main README](./README.md)
- 🚀 [Getting Started](./01-getting-started.md)
- 🔐 [Authentication](./02-authentication.md)
- 📋 [Endpoints](./03-endpoints/)
- 💾 [Code Examples](./05-examples.md)
- ⚠️ [Error Handling](./04-error-handling.md)

---

**Last Updated:** April 2024  
**Contact:** pbousquet@sqli.com
