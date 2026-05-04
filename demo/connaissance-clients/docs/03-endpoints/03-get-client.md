# Endpoint: Get Single Client

**HTTP Method:** GET  
**Path:** `/v1/connaissance-clients/{id}`  
**Authentication:** Required (Bearer JWT)  
**Returns:** 200 OK  
**Related:** [Main README](../../README.md) | [All Endpoints](../README.md)

---

## Summary

Retrieves a specific client record by UUID. Requires JWT Bearer token authentication.

---

## Request

### HTTP

```http
GET /v1/connaissance-clients/8a9204f5-aa42-47bc-9f04-17caab5deeee HTTP/1.1
Host: localhost:8080
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### URL

```
http://localhost:8080/v1/connaissance-clients/{id}
```

### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | UUID | Yes | Client unique identifier (UUID v4 format) |

**Example ID:** `8a9204f5-aa42-47bc-9f04-17caab5deeee`

### Headers

| Header | Value | Required |
|--------|-------|----------|
| `Authorization` | `Bearer {token}` | Yes |

### Query Parameters

None.

### Request Body

None required.

---

## Response

### 200 OK - Success

Returns the requested client record.

**Status Code:** `200 OK`

**Content-Type:** `application/json`

**Response Schema:**

```json
{
  "id": "string (UUID v4)",
  "nom": "string",
  "prenom": "string",
  "ligne1": "string",
  "ligne2": "string or null",
  "codePostal": "string",
  "ville": "string",
  "situationFamilialle": "string",
  "nombreEnfants": "integer"
}
```

**Example Response:**

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

### 400 Bad Request

Invalid request format or malformed ID.

**Status Code:** `400 Bad Request`

**Response:**

```json
{
  "timestamp": "2024-04-29T10:00:00.000+00:00",
  "status": 400,
  "error": "Bad Request",
  "message": "Invalid ID format",
  "path": "/v1/connaissance-clients/invalid-id"
}
```

### 401 Unauthorized

Missing or invalid authentication token.

**Status Code:** `401 Unauthorized`

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

### 404 Not Found

Client with specified ID not found.

**Status Code:** `404 Not Found`

**Response:**

```json
{
  "timestamp": "2024-04-29T10:00:00.000+00:00",
  "status": 404,
  "error": "Not Found",
  "message": "Client not found",
  "path": "/v1/connaissance-clients/8a9204f5-aa42-47bc-9f04-17caab5deeee"
}
```

### 500 Internal Server Error

Server-side error occurred.

**Status Code:** `500 Internal Server Error`

**Response:**

```json
{
  "timestamp": "2024-04-29T10:00:00.000+00:00",
  "status": 500,
  "error": "Internal Server Error",
  "message": "An unexpected error occurred",
  "path": "/v1/connaissance-clients/8a9204f5-aa42-47bc-9f04-17caab5deeee"
}
```

---

## Code Examples

### cURL

```bash
# Get a specific client
CLIENT_ID="8a9204f5-aa42-47bc-9f04-17caab5deeee"

curl -X GET "http://localhost:8080/v1/connaissance-clients/$CLIENT_ID" \
  -H "Authorization: Bearer $API_TOKEN"

# Pretty print
curl -X GET "http://localhost:8080/v1/connaissance-clients/$CLIENT_ID" \
  -H "Authorization: Bearer $API_TOKEN" | jq .

# Save to file
curl -X GET "http://localhost:8080/v1/connaissance-clients/$CLIENT_ID" \
  -H "Authorization: Bearer $API_TOKEN" \
  -o client_detail.json
```

### JavaScript / Node.js

```javascript
// Using Fetch API
async function getClient(clientId, token) {
  try {
    const response = await fetch(
      `http://localhost:8080/v1/connaissance-clients/${clientId}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );
    
    if (response.status === 404) {
      throw new Error('Client not found');
    }
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching client:', error.message);
    throw error;
  }
}

// Usage
getClient('8a9204f5-aa42-47bc-9f04-17caab5deeee', process.env.API_TOKEN)
  .then(client => console.log('Client:', client))
  .catch(error => console.error(error));

// Using Axios
const axios = require('axios');

async function getClientAxios(clientId) {
  try {
    const response = await axios.get(
      `http://localhost:8080/v1/connaissance-clients/${clientId}`,
      {
        headers: {
          'Authorization': `Bearer ${process.env.API_TOKEN}`
        }
      }
    );
    return response.data;
  } catch (error) {
    if (error.response?.status === 404) {
      console.error('Client not found');
    } else if (error.response?.status === 401) {
      console.error('Authentication failed');
    }
    throw error;
  }
}

// With retry logic
async function getClientWithRetry(clientId, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await getClientAxios(clientId);
    } catch (error) {
      if (attempt === maxRetries || error.response?.status === 404 || error.response?.status === 401) {
        throw error;
      }
      const delay = Math.pow(2, attempt - 1) * 1000; // Exponential backoff
      console.log(`Attempt ${attempt} failed, retrying in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}
```

### Python

```python
import requests
import os

def get_client(client_id, token):
    """Fetch a single client by ID"""
    headers = {
        'Authorization': f'Bearer {token}'
    }
    
    response = requests.get(
        f'http://localhost:8080/v1/connaissance-clients/{client_id}',
        headers=headers,
        timeout=5
    )
    
    if response.status_code == 200:
        return response.json()
    elif response.status_code == 404:
        raise ValueError(f'Client {client_id} not found')
    elif response.status_code == 401:
        raise PermissionError('Authentication failed')
    else:
        error_data = response.json()
        raise Exception(f'{response.status_code}: {error_data["message"]}')

# Usage
try:
    client = get_client('8a9204f5-aa42-47bc-9f04-17caab5deeee', os.getenv('API_TOKEN'))
    print(f'Found: {client["nom"]} {client["prenom"]}')
except ValueError as e:
    print(f'Not found: {e}')
except PermissionError as e:
    print(f'Auth error: {e}')

# With retry and backoff
import time
from functools import wraps

def retry_with_backoff(max_attempts=3, initial_delay=1):
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            for attempt in range(1, max_attempts + 1):
                try:
                    return func(*args, **kwargs)
                except requests.exceptions.RequestException as e:
                    if attempt == max_attempts:
                        raise
                    delay = initial_delay * (2 ** (attempt - 1))
                    print(f'Attempt {attempt} failed, retrying in {delay}s...')
                    time.sleep(delay)
        return wrapper
    return decorator

@retry_with_backoff(max_attempts=3)
def get_client_with_retry(client_id):
    return get_client(client_id, os.getenv('API_TOKEN'))
```

### Java

```java
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.net.URI;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.JsonNode;

public class GetClientExample {
    
    static class ClientData {
        public String id;
        public String nom;
        public String prenom;
        public String ligne1;
        public String ligne2;
        public String codePostal;
        public String ville;
        public String situationFamilialle;
        public int nombreEnfants;
    }
    
    public static ClientData getClient(String clientId, String token) throws Exception {
        HttpClient httpClient = HttpClient.newHttpClient();
        
        HttpRequest request = HttpRequest.newBuilder()
            .uri(new URI("http://localhost:8080/v1/connaissance-clients/" + clientId))
            .header("Authorization", "Bearer " + token)
            .GET()
            .build();
        
        HttpResponse<String> response = httpClient.send(request, 
            HttpResponse.BodyHandlers.ofString());
        
        if (response.statusCode() == 200) {
            ObjectMapper mapper = new ObjectMapper();
            return mapper.readValue(response.body(), ClientData.class);
        } else if (response.statusCode() == 404) {
            throw new Exception("Client not found: " + clientId);
        } else if (response.statusCode() == 401) {
            throw new Exception("Authentication failed");
        } else {
            throw new Exception("HTTP " + response.statusCode() + ": " + response.body());
        }
    }
    
    public static void main(String[] args) {
        try {
            String token = System.getenv("API_TOKEN");
            ClientData client = getClient("8a9204f5-aa42-47bc-9f04-17caab5deeee", token);
            
            System.out.println("Client: " + client.nom + " " + client.prenom);
            System.out.println("City: " + client.ville);
            System.out.println("Children: " + client.nombreEnfants);
        } catch (Exception e) {
            System.err.println("Error: " + e.getMessage());
        }
    }
}
```

---

## Use Cases

### Use Case 1: Display Client Detail Page

```javascript
// Load and display client details
async function loadClientDetail() {
  const clientId = new URLSearchParams(window.location.search).get('id');
  
  try {
    const client = await getClient(clientId, sessionStorage.getItem('token'));
    
    document.getElementById('fullName').textContent = `${client.prenom} ${client.nom}`;
    document.getElementById('address').textContent = `${client.ligne1}${client.ligne2 ? ', ' + client.ligne2 : ''}`;
    document.getElementById('city').textContent = `${client.codePostal} ${client.ville}`;
    document.getElementById('situation').textContent = client.situationFamilialle === 'MARIE' ? 'Marié(e)' : 'Célibataire';
    document.getElementById('children').textContent = client.nombreEnfants;
    
    // Show edit buttons
    document.getElementById('editBtn').addEventListener('click', () => {
      populateEditForm(client);
      showModal('editModal');
    });
  } catch (error) {
    alert('Failed to load client: ' + error.message);
  }
}
```

### Use Case 2: Pre-fill Edit Form

```python
def load_client_for_edit(client_id):
    """Fetch client and pre-fill form"""
    client = get_client(client_id, os.getenv('API_TOKEN'))
    
    form_data = {
        'id': client['id'],
        'nom': client['nom'],
        'prenom': client['prenom'],
        'ligne1': client['ligne1'],
        'ligne2': client.get('ligne2', ''),
        'codePostal': client['codePostal'],
        'ville': client['ville'],
        'situationFamilialle': client['situationFamilialle'],
        'nombreEnfants': client['nombreEnfants']
    }
    
    return form_data
```

### Use Case 3: Check Client Exists Before Operation

```bash
#!/bin/bash
CLIENT_ID="8a9204f5-aa42-47bc-9f04-17caab5deeee"

check_client_exists() {
  status=$(curl -s -o /dev/null -w "%{http_code}" \
    -X GET "http://localhost:8080/v1/connaissance-clients/$CLIENT_ID" \
    -H "Authorization: Bearer $API_TOKEN")
  
  if [ "$status" -eq 200 ]; then
    echo "Client exists"
    return 0
  else
    echo "Client not found (HTTP $status)"
    return 1
  fi
}

if check_client_exists; then
  echo "Proceeding with operation..."
else
  echo "Aborting: client not found"
  exit 1
fi
```

---

## Field Definitions

| Field | Type | Description |
|-------|------|-------------|
| `id` | UUID | Unique client identifier |
| `nom` | String | Client last name |
| `prenom` | String | Client first name |
| `ligne1` | String | Primary address line |
| `ligne2` | String | Secondary address line (optional) |
| `codePostal` | String | Postal code |
| `ville` | String | City name |
| `situationFamilialle` | String | Family status (CELIBATAIRE or MARIE) |
| `nombreEnfants` | Integer | Number of children |

---

## Related Endpoints

- [GET /v1/connaissance-clients](./01-list-clients.md) — List all clients
- [POST /v1/connaissance-clients](./02-create-update-client.md) — Create/update client
- [PUT /v1/connaissance-clients/{id}/adresse](./05-update-address.md) — Update address
- [PUT /v1/connaissance-clients/{id}/situation](./06-update-situation.md) — Update situation
- [DELETE /v1/connaissance-clients/{id}](./04-delete-client.md) — Delete client

---

## Error Handling

See [Error Handling Guide](../04-error-handling.md) for details on HTTP status codes and error responses.

---

**Related:** [Authentication](../02-authentication.md) | [Best Practices](../06-best-practices.md) | [Code Examples](../05-examples.md)

---

**Next:** [DELETE - Delete Client](./04-delete-client.md)
