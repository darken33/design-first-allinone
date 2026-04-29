# Getting Started with Connaissance Client API

**Document:** 01-getting-started.md  
**Purpose:** Set up your development environment and make your first API call  
**Related:** [Authentication Guide](./02-authentication.md) | [Main README](./README.md)

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Authentication Setup](#authentication-setup)
3. [Environment Configuration](#environment-configuration)
4. [Your First Request](#your-first-request)
5. [What's Next](#whats-next)

---

## Prerequisites

Before you begin, ensure you have:

### Required
- ✅ A valid **JWT Bearer token** from your organization's authentication provider
- ✅ A REST client or command-line tool (see options below)
- ✅ Access to the API endpoint(s)

### Recommended
- ✅ cURL (for quick testing)
- ✅ Postman or Insomnia (for API exploration)
- ✅ Your preferred programming language/framework
- ✅ A text editor or IDE

### REST Client Options

| Tool | Best For | Installation |
|------|----------|--------------|
| **cURL** | Command-line testing | Pre-installed on most systems |
| **Postman** | GUI exploration & testing | [Download](https://www.postman.com/downloads/) |
| **Insomnia** | REST client UI | [Download](https://insomnia.rest/) |
| **HTTPie** | User-friendly CLI | `pip install httpie` or `brew install httpie` |
| **Node.js/Axios** | JavaScript automation | `npm install axios` |
| **Python/Requests** | Python automation | `pip install requests` |

---

## Authentication Setup

### Step 1: Obtain Your JWT Token

Contact your system administrator or authentication provider to obtain a **JWT Bearer token**. The token typically looks like:

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c
```

### Step 2: Store Your Token Securely

**⚠️ IMPORTANT:** Never commit tokens to version control!

**Option A: Environment Variable**
```bash
export API_TOKEN="your_jwt_token_here"
```

**Option B: Configuration File** (e.g., `.env`, `.config/api.conf`)
```
API_TOKEN=your_jwt_token_here
API_BASE_URL=http://localhost:8080
```

**Option C: Credentials Manager**
Use your OS credentials manager (macOS Keychain, Windows Credential Manager, etc.)

### Step 3: Verify Token Format

Your token should follow the JWT format: `header.payload.signature`

```bash
# Split token to inspect (optional)
TOKEN="your_jwt_token_here"
echo $TOKEN | cut -d'.' -f2 | base64 -d | jq .
```

---

## Environment Configuration

### Development Environment

For **local development** (recommended for testing):

```bash
# Set variables
export API_BASE_URL="http://localhost:8080"
export API_VERSION="v1"
export API_TOKEN="your_jwt_token_here"

# Verify setup
echo "Base URL: $API_BASE_URL"
echo "Version: $API_VERSION"
echo "Token: ${API_TOKEN:0:20}..." # Show first 20 chars only
```

### Production Environment

For **production** (use with caution):

```bash
export API_BASE_URL="https://jenesaispas"
export API_VERSION="v1"
export API_TOKEN="your_production_token_here"
```

### Add to Shell Configuration (Persistent)

To make variables permanent, add to your shell profile (`~/.bashrc`, `~/.zshrc`, etc.):

```bash
# ~/.bashrc or ~/.zshrc
export API_BASE_URL="http://localhost:8080"
export API_VERSION="v1"
# Note: Store API_TOKEN in a credentials manager instead!
```

Then reload:
```bash
source ~/.bashrc  # or source ~/.zshrc
```

---

## Your First Request

### Option 1: Using cURL (Command Line)

**Public Endpoint** (no authentication required):
```bash
curl -X GET \
  "${API_BASE_URL}/${API_VERSION}/connaissance-clients" \
  -H "Content-Type: application/json"
```

**Protected Endpoint** (requires authentication):
```bash
curl -X GET \
  "${API_BASE_URL}/${API_VERSION}/connaissance-clients" \
  -H "Authorization: Bearer ${API_TOKEN}" \
  -H "Content-Type: application/json"
```

### Option 2: Using HTTPie

```bash
# Public endpoint
http GET "http://localhost:8080/v1/connaissance-clients"

# Protected endpoint
http GET "http://localhost:8080/v1/connaissance-clients" \
  "Authorization: Bearer ${API_TOKEN}"
```

### Option 3: Using JavaScript/Node.js

```javascript
const axios = require('axios');

const apiClient = axios.create({
  baseURL: 'http://localhost:8080/v1',
  headers: {
    'Authorization': `Bearer ${process.env.API_TOKEN}`,
    'Content-Type': 'application/json'
  }
});

// Fetch all clients
async function listClients() {
  try {
    const response = await apiClient.get('/connaissance-clients');
    console.log('Clients:', response.data);
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
}

listClients();
```

### Option 4: Using Python

```python
import requests
import os

BASE_URL = "http://localhost:8080/v1"
API_TOKEN = os.getenv('API_TOKEN')

headers = {
    'Authorization': f'Bearer {API_TOKEN}',
    'Content-Type': 'application/json'
}

# Fetch all clients
response = requests.get(
    f'{BASE_URL}/connaissance-clients',
    headers=headers
)

if response.status_code == 200:
    print('Clients:', response.json())
else:
    print(f'Error: {response.status_code}')
    print(response.json())
```

---

## Expected Response

If successful, you'll see a JSON response:

```json
[
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
]
```

### Troubleshooting

| Issue | Solution |
|-------|----------|
| **401 Unauthorized** | Check if your token is valid and not expired. See [Authentication Guide](./02-authentication.md) |
| **Connection refused** | Verify the API server is running on `http://localhost:8080` |
| **400 Bad Request** | Check your request format. See specific endpoint docs |
| **CORS error (browser)** | Use a backend server or proxy. See [Best Practices](./06-best-practices.md) |

---

## Next Steps

### 1. Explore the API

- **List Clients:** [GET /v1/connaissance-clients](./03-endpoints/01-list-clients.md)
- **Get a Client:** [GET /v1/connaissance-clients/{id}](./03-endpoints/03-get-client.md)
- **Create a Client:** [POST /v1/connaissance-clients](./03-endpoints/02-create-update-client.md)
- **Update Address:** [PUT /v1/connaissance-clients/{id}/adresse](./03-endpoints/05-update-address.md)
- **Update Situation:** [PUT /v1/connaissance-clients/{id}/situation](./03-endpoints/06-update-situation.md)
- **Delete a Client:** [DELETE /v1/connaissance-clients/{id}](./03-endpoints/04-delete-client.md)

### 2. Learn More

- [Authentication Details](./02-authentication.md) — JWT Bearer tokens explained
- [Error Handling](./04-error-handling.md) — Common errors and solutions
- [Best Practices](./06-best-practices.md) — Validation rules and guidelines
- [Code Examples](./05-examples.md) — Complete working examples

### 3. Integrate with Your Application

See [Code Examples](./05-examples.md) for language-specific integration patterns:
- Node.js/Express
- Python/Flask
- Java/Spring Boot
- cURL/Bash scripts

---

## Common Setup Patterns

### Pattern 1: Quick Testing (cURL)

```bash
#!/bin/bash
API_TOKEN="your_token"
API_URL="http://localhost:8080/v1"

# List all clients
curl -H "Authorization: Bearer $API_TOKEN" \
  "$API_URL/connaissance-clients"
```

### Pattern 2: Node.js Application

```javascript
require('dotenv').config();

const apiClient = require('./client');

async function main() {
  const clients = await apiClient.listClients();
  console.log(clients);
}

main();
```

### Pattern 3: Python Application

```python
import os
from dotenv import load_dotenv
from client import APIClient

load_dotenv()
client = APIClient(os.getenv('API_TOKEN'))
clients = client.list_clients()
print(clients)
```

---

## Support

- 📖 **Full Documentation:** [README](./README.md)
- 🔐 **Authentication:** [Authentication Guide](./02-authentication.md)
- 📋 **Endpoints:** [Endpoint Reference](./03-endpoints/)
- 💾 **Examples:** [Code Examples](./05-examples.md)
- ❌ **Errors:** [Error Handling](./04-error-handling.md)

---

**Next Step:** → [Read Authentication Guide](./02-authentication.md)
