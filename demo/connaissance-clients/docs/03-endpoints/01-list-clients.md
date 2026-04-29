# Endpoint: List All Clients

**HTTP Method:** GET  
**Path:** `/v1/connaissance-clients`  
**Authentication:** Not required (public endpoint)  
**Related:** [Main README](../../README.md) | [All Endpoints](../README.md)

---

## Summary

Retrieves a list of all client knowledge cards in the system. This is a public endpoint that does not require authentication.

---

## Request

### HTTP

```http
GET /v1/connaissance-clients HTTP/1.1
Host: localhost:8080
Content-Type: application/json
```

### URL

```
http://localhost:8080/v1/connaissance-clients
```

### Headers

| Header | Value | Required |
|--------|-------|----------|
| `Content-Type` | `application/json` | No |
| `Authorization` | `Bearer {token}` | No (public endpoint) |

### Parameters

None. This endpoint does not accept query parameters or path parameters.

### Request Body

None required.

---

## Response

### 200 OK - Success

Returns an array of all client records.

**Status Code:** `200 OK`

**Content-Type:** `application/json`

**Response Schema:**

```json
[
  {
    "id": "string (UUID v4)",
    "nom": "string (2-50 chars)",
    "prenom": "string (2-50 chars)",
    "ligne1": "string (2-50 chars)",
    "ligne2": "string (2-50 chars, optional)",
    "codePostal": "string (5 chars, uppercase)",
    "ville": "string (2-50 chars)",
    "situationFamilialle": "string (CELIBATAIRE | MARIE)",
    "nombreEnfants": "integer (0-20)"
  }
]
```

**Example Response:**

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
  },
  {
    "id": "9b0315g6-bb53-48cd-ag05-18dbbi6eefff",
    "nom": "Dupont",
    "prenom": "Marie",
    "ligne1": "25 avenue des champs",
    "ligne2": null,
    "codePostal": "75008",
    "ville": "Paris",
    "situationFamilialle": "CELIBATAIRE",
    "nombreEnfants": 0
  }
]
```

### 400 Bad Request

Invalid request format.

**Status Code:** `400 Bad Request`

**Response Schema:**

```json
{
  "timestamp": "2024-04-29T10:00:00.000+00:00",
  "status": 400,
  "error": "Bad Request",
  "message": "Invalid request format",
  "path": "/v1/connaissance-clients"
}
```

### 500 Internal Server Error

Server-side error occurred.

**Status Code:** `500 Internal Server Error`

**Response Schema:**

```json
{
  "timestamp": "2024-04-29T10:00:00.000+00:00",
  "status": 500,
  "error": "Internal Server Error",
  "message": "An unexpected error occurred",
  "path": "/v1/connaissance-clients"
}
```

---

## Code Examples

### cURL

```bash
# Basic request
curl -X GET "http://localhost:8080/v1/connaissance-clients" \
  -H "Content-Type: application/json"

# Pretty print response (requires jq)
curl -X GET "http://localhost:8080/v1/connaissance-clients" \
  -H "Content-Type: application/json" | jq .

# Save response to file
curl -X GET "http://localhost:8080/v1/connaissance-clients" \
  -H "Content-Type: application/json" \
  -o clients.json
```

### JavaScript / Node.js

```javascript
// Using Fetch API
fetch('http://localhost:8080/v1/connaissance-clients', {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json'
  }
})
.then(response => response.json())
.then(data => console.log('Clients:', data))
.catch(error => console.error('Error:', error));

// Using Axios
const axios = require('axios');

axios.get('http://localhost:8080/v1/connaissance-clients')
  .then(response => console.log('Clients:', response.data))
  .catch(error => console.error('Error:', error.response?.data || error.message));

// Error handling
async function listClients() {
  try {
    const response = await axios.get('http://localhost:8080/v1/connaissance-clients');
    return response.data;
  } catch (error) {
    if (error.response?.status === 400) {
      console.error('Invalid request:', error.response.data.message);
    } else if (error.response?.status === 500) {
      console.error('Server error. Try again later.');
    } else {
      console.error('Error:', error.message);
    }
    throw error;
  }
}
```

### Python

```python
import requests
import json

# Simple request
response = requests.get('http://localhost:8080/v1/connaissance-clients')

if response.status_code == 200:
    clients = response.json()
    print(json.dumps(clients, indent=2))
else:
    print(f'Error: {response.status_code}')
    print(response.json())

# Better error handling
def list_clients():
    try:
        response = requests.get(
            'http://localhost:8080/v1/connaissance-clients',
            headers={'Content-Type': 'application/json'},
            timeout=5
        )
        response.raise_for_status()
        return response.json()
    except requests.exceptions.Timeout:
        print('Request timeout')
    except requests.exceptions.HTTPError as e:
        print(f'HTTP Error {e.response.status_code}: {e.response.json()["message"]}')
    except requests.exceptions.RequestException as e:
        print(f'Request error: {e}')

clients = list_clients()
print(clients)
```

### Java

```java
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.net.URI;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.JsonNode;

public class ListClientsExample {
    public static void main(String[] args) throws Exception {
        HttpClient httpClient = HttpClient.newHttpClient();
        
        HttpRequest request = HttpRequest.newBuilder()
            .uri(new URI("http://localhost:8080/v1/connaissance-clients"))
            .header("Content-Type", "application/json")
            .GET()
            .build();
        
        HttpResponse<String> response = httpClient.send(request, 
            HttpResponse.BodyHandlers.ofString());
        
        if (response.statusCode() == 200) {
            ObjectMapper mapper = new ObjectMapper();
            JsonNode clients = mapper.readTree(response.body());
            System.out.println("Clients: " + mapper.writerWithDefaultPrettyPrinter()
                .writeValueAsString(clients));
        } else {
            System.out.println("Error: " + response.statusCode());
            System.out.println(response.body());
        }
    }
}
```

---

## Use Cases

### Use Case 1: Populate List View

```javascript
// Fetch and display in table
async function loadClientsTable() {
  try {
    const clients = await axios.get('http://localhost:8080/v1/connaissance-clients');
    
    const rows = clients.data.map(client => `
      <tr>
        <td>${client.nom} ${client.prenom}</td>
        <td>${client.ville}</td>
        <td>${client.nombreEnfants}</td>
        <td><a href="/client/${client.id}">View</a></td>
      </tr>
    `);
    
    document.getElementById('clients-tbody').innerHTML = rows.join('');
  } catch (error) {
    console.error('Failed to load clients:', error);
  }
}
```

### Use Case 2: Export to CSV

```python
import csv
import requests

response = requests.get('http://localhost:8080/v1/connaissance-clients')
clients = response.json()

with open('clients.csv', 'w', newline='') as f:
    writer = csv.DictWriter(f, fieldnames=['id', 'nom', 'prenom', 'ville', 'nombreEnfants'])
    writer.writeheader()
    writer.writerows(clients)
```

### Use Case 3: Find Specific Client

```bash
# List all and filter
curl -X GET "http://localhost:8080/v1/connaissance-clients" | \
  jq '.[] | select(.nom == "Bousquet")'
```

---

## Field Definitions

| Field | Type | Description | Constraints |
|-------|------|-------------|-------------|
| `id` | UUID | Unique identifier | Auto-generated UUID v4 |
| `nom` | String | Client last name | 2-50 chars, letters/spaces/punctuation |
| `prenom` | String | Client first name | 2-50 chars, letters/spaces/punctuation |
| `ligne1` | String | Address line 1 | 2-50 chars, alphanumeric/spaces/punctuation |
| `ligne2` | String | Address line 2 (optional) | 2-50 chars, alphanumeric/spaces/punctuation |
| `codePostal` | String | Postal code | Exactly 5 chars, uppercase letters/digits |
| `ville` | String | City name | 2-50 chars, letters/spaces/punctuation |
| `situationFamilialle` | String | Family status | `CELIBATAIRE` or `MARIE` |
| `nombreEnfants` | Integer | Number of children | 0-20 range |

---

## Related Endpoints

- [GET /v1/connaissance-clients/{id}](./03-get-client.md) — Retrieve single client
- [POST /v1/connaissance-clients](./02-create-update-client.md) — Create/update client
- [DELETE /v1/connaissance-clients/{id}](./04-delete-client.md) — Delete client

---

## Error Handling

See [Error Handling Guide](../04-error-handling.md) for details on:
- HTTP status codes
- Error response format
- Troubleshooting guide

---

## Related Documentation

- [Getting Started](../01-getting-started.md)
- [Authentication](../02-authentication.md)
- [Best Practices](../06-best-practices.md)
- [Error Handling](../04-error-handling.md)
- [Code Examples](../05-examples.md)

---

**Next:** [POST - Create/Update Client](./02-create-update-client.md)
