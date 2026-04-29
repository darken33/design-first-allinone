# Endpoint: Create or Update Client

**HTTP Method:** POST  
**Path:** `/v1/connaissance-clients`  
**Authentication:** Required (Bearer JWT)  
**Returns:** 201 Created  
**Related:** [Main README](../../README.md) | [All Endpoints](../README.md)

---

## Summary

Creates a new client record or updates an existing one. This endpoint requires JWT Bearer token authentication.

---

## Request

### HTTP

```http
POST /v1/connaissance-clients HTTP/1.1
Host: localhost:8080
Content-Type: application/json
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### URL

```
http://localhost:8080/v1/connaissance-clients
```

### Headers

| Header | Value | Required |
|--------|-------|----------|
| `Content-Type` | `application/json` | Yes |
| `Authorization` | `Bearer {token}` | Yes |

### Request Body

**Required Fields:** `nom`, `prenom`, `ligne1`, `codePostal`, `ville`, `situationFamilialle`, `nombreEnfants`

**Optional Fields:** `ligne2`

**Schema:**

```json
{
  "nom": "string (2-50 chars, letters/spaces/punctuation)",
  "prenom": "string (2-50 chars, letters/spaces/punctuation)",
  "ligne1": "string (2-50 chars, alphanumeric/spaces/punctuation)",
  "ligne2": "string or null (2-50 chars, optional)",
  "codePostal": "string (5 chars, uppercase letters/digits)",
  "ville": "string (2-50 chars, letters/spaces/punctuation)",
  "situationFamilialle": "string (CELIBATAIRE or MARIE)",
  "nombreEnfants": "integer (0-20)"
}
```

**Example Request Body:**

```json
{
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

---

## Response

### 201 Created - Success

Returns the created or updated client record with auto-generated UUID.

**Status Code:** `201 Created`

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

### 400 Bad Request - Validation Error

Request validation failed. See details in error message.

**Status Code:** `400 Bad Request`

**Example Response (Invalid Name - Too Short):**

```json
{
  "timestamp": "2024-04-29T10:00:00.000+00:00",
  "status": 400,
  "error": "Bad Request",
  "message": "Validation failed for object='connaissanceClientInDto'. Error count: 1",
  "path": "/connaissance-clients"
}
```

**Common Validation Errors:**

| Field | Error | Cause |
|-------|-------|-------|
| `nom` | "size must be between 2 and 50" | Name too short or too long |
| `nom` | "must match \"^[a-zA-Z ,.'-]+$\"" | Invalid characters (numbers, symbols) |
| `codePostal` | "size must be between 5 and 5" | Not exactly 5 characters |
| `codePostal` | "must match \"^[A-Z0-9]+$\"" | Lowercase letters or invalid chars |
| `nombreEnfants` | "must be between 0 and 20" | Outside valid range |
| `situationFamilialle` | "Invalid enum value" | Not CELIBATAIRE or MARIE |

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
  "path": "/connaissance-clients"
}
```

### 403 Forbidden

User lacks permission to perform this action.

**Status Code:** `403 Forbidden`

**Response:**

```json
{
  "timestamp": "2024-04-29T10:00:00.000+00:00",
  "status": 403,
  "error": "Forbidden",
  "message": "Access denied",
  "path": "/connaissance-clients"
}
```

### 409 Conflict

Resource conflict (e.g., duplicate entry).

**Status Code:** `409 Conflict`

**Response:**

```json
{
  "timestamp": "2024-04-29T10:00:00.000+00:00",
  "status": 409,
  "error": "Conflict",
  "message": "Client already exists with this information",
  "path": "/connaissance-clients"
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
  "path": "/connaissance-clients"
}
```

---

## Code Examples

### cURL

```bash
# Create a new client
curl -X POST "http://localhost:8080/v1/connaissance-clients" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $API_TOKEN" \
  -d '{
    "nom": "Bousquet",
    "prenom": "Philippe",
    "ligne1": "48 rue bauducheu",
    "ligne2": "maison individuelle",
    "codePostal": "33800",
    "ville": "Bordeaux",
    "situationFamilialle": "MARIE",
    "nombreEnfants": 1
  }'

# With data from file
curl -X POST "http://localhost:8080/v1/connaissance-clients" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $API_TOKEN" \
  -d @client.json

# Pretty print response
curl -X POST "http://localhost:8080/v1/connaissance-clients" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $API_TOKEN" \
  -d @client.json | jq .
```

### JavaScript / Node.js

```javascript
// Using Fetch API
async function createClient(clientData) {
  const token = process.env.API_TOKEN;
  
  try {
    const response = await fetch('http://localhost:8080/v1/connaissance-clients', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(clientData)
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(`${response.status}: ${error.message}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error creating client:', error.message);
    throw error;
  }
}

// Usage
const newClient = {
  nom: "Bousquet",
  prenom: "Philippe",
  ligne1: "48 rue bauducheu",
  ligne2: "maison individuelle",
  codePostal: "33800",
  ville: "Bordeaux",
  situationFamilialle: "MARIE",
  nombreEnfants: 1
};

createClient(newClient)
  .then(client => console.log('Created:', client))
  .catch(error => console.error(error));

// Using Axios
const axios = require('axios');

async function createClientAxios(clientData) {
  try {
    const response = await axios.post(
      'http://localhost:8080/v1/connaissance-clients',
      clientData,
      {
        headers: {
          'Authorization': `Bearer ${process.env.API_TOKEN}`
        }
      }
    );
    return response.data;
  } catch (error) {
    if (error.response?.status === 400) {
      console.error('Validation error:', error.response.data.message);
    } else if (error.response?.status === 401) {
      console.error('Authentication failed');
    }
    throw error;
  }
}
```

### Python

```python
import requests
import json

def create_client(client_data, token):
    """Create a new client"""
    headers = {
        'Content-Type': 'application/json',
        'Authorization': f'Bearer {token}'
    }
    
    response = requests.post(
        'http://localhost:8080/v1/connaissance-clients',
        json=client_data,
        headers=headers,
        timeout=5
    )
    
    if response.status_code == 201:
        return response.json()
    else:
        error_data = response.json()
        raise Exception(f'{response.status_code}: {error_data["message"]}')

# Usage
client_data = {
    "nom": "Bousquet",
    "prenom": "Philippe",
    "ligne1": "48 rue bauducheu",
    "ligne2": "maison individuelle",
    "codePostal": "33800",
    "ville": "Bordeaux",
    "situationFamilialle": "MARIE",
    "nombreEnfants": 1
}

try:
    created_client = create_client(client_data, os.getenv('API_TOKEN'))
    print(json.dumps(created_client, indent=2))
except Exception as e:
    print(f'Error: {e}')

# Validation example
def validate_client_data(data):
    """Basic client data validation before sending"""
    errors = []
    
    if not data.get('nom') or len(data['nom']) < 2 or len(data['nom']) > 50:
        errors.append('nom: must be 2-50 characters')
    
    if not data.get('codePostal') or len(data['codePostal']) != 5:
        errors.append('codePostal: must be exactly 5 characters')
    
    if data.get('nombreEnfants', 0) < 0 or data.get('nombreEnfants', 0) > 20:
        errors.append('nombreEnfants: must be 0-20')
    
    if data.get('situationFamilialle') not in ['CELIBATAIRE', 'MARIE']:
        errors.append('situationFamilialle: must be CELIBATAIRE or MARIE')
    
    return errors

errors = validate_client_data(client_data)
if errors:
    print('Validation errors:')
    for error in errors:
        print(f'  - {error}')
else:
    created_client = create_client(client_data, os.getenv('API_TOKEN'))
```

### Java

```java
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.net.URI;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;

public class CreateClientExample {
    
    public static ObjectNode createClientRequest() {
        ObjectMapper mapper = new ObjectMapper();
        ObjectNode clientNode = mapper.createObjectNode();
        
        clientNode.put("nom", "Bousquet");
        clientNode.put("prenom", "Philippe");
        clientNode.put("ligne1", "48 rue bauducheu");
        clientNode.put("ligne2", "maison individuelle");
        clientNode.put("codePostal", "33800");
        clientNode.put("ville", "Bordeaux");
        clientNode.put("situationFamilialle", "MARIE");
        clientNode.put("nombreEnfants", 1);
        
        return clientNode;
    }
    
    public static void main(String[] args) throws Exception {
        String token = System.getenv("API_TOKEN");
        ObjectMapper mapper = new ObjectMapper();
        ObjectNode clientNode = createClientRequest();
        String requestBody = mapper.writeValueAsString(clientNode);
        
        HttpClient httpClient = HttpClient.newHttpClient();
        
        HttpRequest request = HttpRequest.newBuilder()
            .uri(new URI("http://localhost:8080/v1/connaissance-clients"))
            .header("Content-Type", "application/json")
            .header("Authorization", "Bearer " + token)
            .POST(HttpRequest.BodyPublishers.ofString(requestBody))
            .build();
        
        HttpResponse<String> response = httpClient.send(request, 
            HttpResponse.BodyHandlers.ofString());
        
        if (response.statusCode() == 201) {
            ObjectNode created = mapper.readValue(response.body(), ObjectNode.class);
            System.out.println("Created: " + mapper.writerWithDefaultPrettyPrinter()
                .writeValueAsString(created));
        } else {
            System.out.println("Error: " + response.statusCode());
            System.out.println(response.body());
        }
    }
}
```

---

## Use Cases

### Use Case 1: Form Submission

```javascript
// Handle form submission
document.getElementById('clientForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const formData = {
    nom: document.getElementById('nom').value,
    prenom: document.getElementById('prenom').value,
    ligne1: document.getElementById('ligne1').value,
    ligne2: document.getElementById('ligne2').value,
    codePostal: document.getElementById('codePostal').value,
    ville: document.getElementById('ville').value,
    situationFamilialle: document.getElementById('situation').value,
    nombreEnfants: parseInt(document.getElementById('enfants').value)
  };
  
  try {
    const response = await axios.post(
      'http://localhost:8080/v1/connaissance-clients',
      formData,
      {
        headers: {
          'Authorization': `Bearer ${sessionStorage.getItem('token')}`
        }
      }
    );
    
    alert(`Client ${response.data.id} created successfully!`);
    // Redirect or refresh list
  } catch (error) {
    alert(`Error: ${error.response?.data?.message}`);
  }
});
```

### Use Case 2: Batch Import

```python
import csv

def import_clients_from_csv(filename, token):
    with open(filename) as f:
        reader = csv.DictReader(f)
        for row in reader:
            client_data = {
                'nom': row['nom'],
                'prenom': row['prenom'],
                'ligne1': row['ligne1'],
                'ligne2': row.get('ligne2'),
                'codePostal': row['codePostal'],
                'ville': row['ville'],
                'situationFamilialle': row['situationFamilialle'],
                'nombreEnfants': int(row['nombreEnfants'])
            }
            
            try:
                response = requests.post(
                    'http://localhost:8080/v1/connaissance-clients',
                    json=client_data,
                    headers={'Authorization': f'Bearer {token}'}
                )
                if response.status_code == 201:
                    print(f'✓ Created: {client_data["nom"]}')
                else:
                    print(f'✗ Error: {response.json()["message"]}')
            except Exception as e:
                print(f'✗ Failed {client_data["nom"]}: {e}')
```

---

## Field Definitions

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| `nom` | String | † | 2-50 chars, pattern: `^[a-zA-Z ,.'-]+$` |
| `prenom` | String | † | 2-50 chars, pattern: `^[a-zA-Z ,.'-]+$` |
| `ligne1` | String | † | 2-50 chars, pattern: `^[a-zA-Z0-9 ,.'-]+$` |
| `ligne2` | String | ○ | 2-50 chars, pattern: `^[a-zA-Z0-9 ,.'-]+$` |
| `codePostal` | String | † | Exactly 5 chars, pattern: `^[A-Z0-9]+$` |
| `ville` | String | † | 2-50 chars, pattern: `^[a-zA-Z ,.'-]+$` |
| `situationFamilialle` | String | † | Enum: `CELIBATAIRE` or `MARIE` |
| `nombreEnfants` | Integer | † | Range: 0-20 |

† = Required | ○ = Optional

---

## Related Endpoints

- [GET /v1/connaissance-clients](./01-list-clients.md) — List all clients
- [GET /v1/connaissance-clients/{id}](./03-get-client.md) — Get single client
- [PUT /v1/connaissance-clients/{id}/adresse](./05-update-address.md) — Update address
- [PUT /v1/connaissance-clients/{id}/situation](./06-update-situation.md) — Update situation

---

## Best Practices

1. **Validate Before Sending** — Check constraints locally before API call
2. **Handle Conflicts** — Implement duplicate checking logic
3. **Retry Strategy** — Use exponential backoff for transient errors
4. **Logging** — Log all successful creates for audit trail

See [Best Practices Guide](../06-best-practices.md) for more details.

---

**Related:** [Error Handling](../04-error-handling.md) | [Authentication](../02-authentication.md) | [Code Examples](../05-examples.md)

---

**Next:** [GET - Retrieve Single Client](./03-get-client.md)
