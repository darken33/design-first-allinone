# Endpoint: Update Client Address

**HTTP Method:** PUT  
**Path:** `/v1/connaissance-clients/{id}/adresse`  
**Authentication:** Required (Bearer JWT)  
**Returns:** 200 OK  
**Related:** [Main README](../../README.md) | [All Endpoints](../README.md)

---

## Summary

Updates only the address information (ligne1, ligne2, codePostal, ville) for a specific client. Other fields remain unchanged. Requires JWT Bearer token authentication.

---

## Request

### HTTP

```http
PUT /v1/connaissance-clients/8a9204f5-aa42-47bc-9f04-17caab5deeee/adresse HTTP/1.1
Host: localhost:8080
Content-Type: application/json
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### URL

```
http://localhost:8080/v1/connaissance-clients/{id}/adresse
```

### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | UUID | Yes | Client unique identifier (UUID v4 format) |

### Headers

| Header | Value | Required |
|--------|-------|----------|
| `Content-Type` | `application/json` | Yes |
| `Authorization` | `Bearer {token}` | Yes |

### Request Body

**Required Fields:** `ligne1`, `codePostal`, `ville`

**Optional Fields:** `ligne2`

**Schema:**

```json
{
  "ligne1": "string (2-50 chars, alphanumeric/spaces/punctuation)",
  "ligne2": "string or null (2-50 chars, optional)",
  "codePostal": "string (5 chars, uppercase letters/digits)",
  "ville": "string (2-50 chars, letters/spaces/punctuation)"
}
```

**Example Request Body:**

```json
{
  "ligne1": "52 rue de la nouvelle adresse",
  "ligne2": null,
  "codePostal": "75001",
  "ville": "Paris"
}
```

---

## Response

### 200 OK - Success

Returns the updated client record with new address information.

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
  "ligne1": "52 rue de la nouvelle adresse",
  "ligne2": null,
  "codePostal": "75001",
  "ville": "Paris",
  "situationFamilialle": "MARIE",
  "nombreEnfants": 1
}
```

### 400 Bad Request

Request validation failed.

**Status Code:** `400 Bad Request`

**Response:**

```json
{
  "timestamp": "2024-04-29T10:00:00.000+00:00",
  "status": 400,
  "error": "Bad Request",
  "message": "Validation failed for object='adresseDto'. Error count: 1",
  "path": "/v1/connaissance-clients/8a9204f5-aa42-47bc-9f04-17caab5deeee/adresse"
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
  "path": "/v1/connaissance-clients/8a9204f5-aa42-47bc-9f04-17caab5deeee/adresse"
}
```

### 404 Not Found

Client not found.

**Status Code:** `404 Not Found`

**Response:**

```json
{
  "timestamp": "2024-04-29T10:00:00.000+00:00",
  "status": 404,
  "error": "Not Found",
  "message": "Client not found",
  "path": "/v1/connaissance-clients/8a9204f5-aa42-47bc-9f04-17caab5deeee/adresse"
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
  "path": "/v1/connaissance-clients/8a9204f5-aa42-47bc-9f04-17caab5deeee/adresse"
}
```

---

## Code Examples

### cURL

```bash
CLIENT_ID="8a9204f5-aa42-47bc-9f04-17caab5deeee"

# Update address
curl -X PUT "http://localhost:8080/v1/connaissance-clients/$CLIENT_ID/adresse" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $API_TOKEN" \
  -d '{
    "ligne1": "52 rue de la nouvelle adresse",
    "ligne2": null,
    "codePostal": "75001",
    "ville": "Paris"
  }'

# With jq for formatting
curl -X PUT "http://localhost:8080/v1/connaissance-clients/$CLIENT_ID/adresse" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $API_TOKEN" \
  -d @address_update.json | jq .
```

### JavaScript / Node.js

```javascript
// Using Fetch API
async function updateAddress(clientId, addressData, token) {
  try {
    const response = await fetch(
      `http://localhost:8080/v1/connaissance-clients/${clientId}/adresse`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(addressData)
      }
    );
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(`${response.status}: ${error.message}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error updating address:', error.message);
    throw error;
  }
}

// Usage
const newAddress = {
  ligne1: "52 rue de la nouvelle adresse",
  ligne2: null,
  codePostal: "75001",
  ville: "Paris"
};

updateAddress('8a9204f5-aa42-47bc-9f04-17caab5deeee', newAddress, process.env.API_TOKEN)
  .then(client => console.log('Updated:', client))
  .catch(error => console.error(error));

// Using Axios
const axios = require('axios');

async function updateAddressAxios(clientId, addressData) {
  try {
    const response = await axios.put(
      `http://localhost:8080/v1/connaissance-clients/${clientId}/adresse`,
      addressData,
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
    } else if (error.response?.status === 404) {
      console.error('Client not found');
    }
    throw error;
  }
}
```

### Python

```python
import requests
import os

def update_address(client_id, address_data, token):
    """Update client address only"""
    headers = {
        'Content-Type': 'application/json',
        'Authorization': f'Bearer {token}'
    }
    
    response = requests.put(
        f'http://localhost:8080/v1/connaissance-clients/{client_id}/adresse',
        json=address_data,
        headers=headers,
        timeout=5
    )
    
    if response.status_code == 200:
        return response.json()
    elif response.status_code == 404:
        raise ValueError(f'Client {client_id} not found')
    elif response.status_code == 400:
        error_data = response.json()
        raise ValueError(f'Validation error: {error_data["message"]}')
    else:
        error_data = response.json()
        raise Exception(f'{response.status_code}: {error_data["message"]}')

# Usage
address_data = {
    'ligne1': '52 rue de la nouvelle adresse',
    'ligne2': None,
    'codePostal': '75001',
    'ville': 'Paris'
}

try:
    updated_client = update_address(
        '8a9204f5-aa42-47bc-9f04-17caab5deeee',
        address_data,
        os.getenv('API_TOKEN')
    )
    print(f'✓ Updated: {updated_client["nom"]} now in {updated_client["ville"]}')
except Exception as e:
    print(f'✗ Error: {e}')
```

### Java

```java
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.net.URI;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;

public class UpdateAddressExample {
    
    public static ObjectNode updateAddress(String clientId, ObjectNode addressData, String token) throws Exception {
        ObjectMapper mapper = new ObjectMapper();
        String requestBody = mapper.writeValueAsString(addressData);
        
        HttpClient httpClient = HttpClient.newHttpClient();
        
        HttpRequest request = HttpRequest.newBuilder()
            .uri(new URI("http://localhost:8080/v1/connaissance-clients/" + clientId + "/adresse"))
            .header("Content-Type", "application/json")
            .header("Authorization", "Bearer " + token)
            .PUT(HttpRequest.BodyPublishers.ofString(requestBody))
            .build();
        
        HttpResponse<String> response = httpClient.send(request, 
            HttpResponse.BodyHandlers.ofString());
        
        if (response.statusCode() == 200) {
            return mapper.readValue(response.body(), ObjectNode.class);
        } else if (response.statusCode() == 404) {
            throw new Exception("Client not found");
        } else {
            throw new Exception("HTTP " + response.statusCode() + ": " + response.body());
        }
    }
    
    public static void main(String[] args) throws Exception {
        ObjectMapper mapper = new ObjectMapper();
        ObjectNode addressNode = mapper.createObjectNode();
        addressNode.put("ligne1", "52 rue de la nouvelle adresse");
        addressNode.putNull("ligne2");
        addressNode.put("codePostal", "75001");
        addressNode.put("ville", "Paris");
        
        ObjectNode updated = updateAddress(
            "8a9204f5-aa42-47bc-9f04-17caab5deeee",
            addressNode,
            System.getenv("API_TOKEN")
        );
        
        System.out.println("Updated: " + updated.get("ville").asText());
    }
}
```

---

## Use Cases

### Use Case 1: Address Change Form

```javascript
// Handle address update form submission
document.getElementById('addressForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const addressData = {
    ligne1: document.getElementById('ligne1').value,
    ligne2: document.getElementById('ligne2').value || null,
    codePostal: document.getElementById('codePostal').value,
    ville: document.getElementById('ville').value
  };
  
  try {
    const updated = await updateAddressAxios(clientId, addressData);
    alert('Address updated successfully');
  } catch (error) {
    alert('Error: ' + error.message);
  }
});
```

### Use Case 2: Bulk Address Update

```python
import csv

def bulk_update_addresses(csv_file, token):
    """Update addresses from CSV file"""
    with open(csv_file) as f:
        reader = csv.DictReader(f)
        for row in reader:
            address_data = {
                'ligne1': row['ligne1'],
                'ligne2': row.get('ligne2'),
                'codePostal': row['codePostal'],
                'ville': row['ville']
            }
            
            try:
                update_address(row['id'], address_data, token)
                print(f'✓ Updated {row["id"]}')
            except Exception as e:
                print(f'✗ Failed {row["id"]}: {e}')
```

---

## Field Definitions

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| `ligne1` | String | † | 2-50 chars, pattern: `^[a-zA-Z0-9 ,.'-]+$` |
| `ligne2` | String | ○ | 2-50 chars, pattern: `^[a-zA-Z0-9 ,.'-]+$`, can be null |
| `codePostal` | String | † | Exactly 5 chars, pattern: `^[A-Z0-9]+$` |
| `ville` | String | † | 2-50 chars, pattern: `^[a-zA-Z ,.'-]+$` |

† = Required | ○ = Optional

---

## Related Endpoints

- [GET /v1/connaissance-clients/{id}](./03-get-client.md) — Get single client
- [POST /v1/connaissance-clients](./02-create-update-client.md) — Create/update client
- [PUT /v1/connaissance-clients/{id}/situation](./06-update-situation.md) — Update situation

---

**Related:** [Error Handling](../04-error-handling.md) | [Best Practices](../06-best-practices.md) | [Code Examples](../05-examples.md)

---

**Next:** [PUT - Update Client Situation](./06-update-situation.md)
