# Endpoint: Update Client Situation

**HTTP Method:** PUT  
**Path:** `/v1/connaissance-clients/{id}/situation`  
**Authentication:** Required (Bearer JWT)  
**Returns:** 200 OK  
**Related:** [Main README](../../README.md) | [All Endpoints](../README.md)

---

## Summary

Updates the family situation (marital status) and number of children for a specific client. Other fields remain unchanged. Requires JWT Bearer token authentication.

---

## Request

### HTTP

```http
PUT /v1/connaissance-clients/8a9204f5-aa42-47bc-9f04-17caab5deeee/situation HTTP/1.1
Host: localhost:8080
Content-Type: application/json
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### URL

```
http://localhost:8080/v1/connaissance-clients/{id}/situation
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

**Required Fields:** `situationFamilialle`, `nombreEnfants`

**Schema:**

```json
{
  "situationFamilialle": "string (CELIBATAIRE or MARIE)",
  "nombreEnfants": "integer (0-20)"
}
```

**Example Request Body:**

```json
{
  "situationFamilialle": "MARIE",
  "nombreEnfants": 2
}
```

---

## Response

### 200 OK - Success

Returns the updated client record with new situation information.

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
  "nombreEnfants": 2
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
  "message": "Validation failed for object='situationDto'. Error count: 1",
  "path": "/v1/connaissance-clients/8a9204f5-aa42-47bc-9f04-17caab5deeee/situation"
}
```

**Common Validation Errors:**

| Field | Error | Cause |
|-------|-------|-------|
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
  "path": "/v1/connaissance-clients/8a9204f5-aa42-47bc-9f04-17caab5deeee/situation"
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
  "path": "/v1/connaissance-clients/8a9204f5-aa42-47bc-9f04-17caab5deeee/situation"
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
  "path": "/v1/connaissance-clients/8a9204f5-aa42-47bc-9f04-17caab5deeee/situation"
}
```

---

## Code Examples

### cURL

```bash
CLIENT_ID="8a9204f5-aa42-47bc-9f04-17caab5deeee"

# Update family situation
curl -X PUT "http://localhost:8080/v1/connaissance-clients/$CLIENT_ID/situation" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $API_TOKEN" \
  -d '{
    "situationFamilialle": "MARIE",
    "nombreEnfants": 2
  }'

# Minimal update (single field change)
curl -X PUT "http://localhost:8080/v1/connaissance-clients/$CLIENT_ID/situation" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $API_TOKEN" \
  -d '{
    "situationFamilialle": "CELIBATAIRE",
    "nombreEnfants": 0
  }'
```

### JavaScript / Node.js

```javascript
// Using Fetch API
async function updateSituation(clientId, situationData, token) {
  try {
    const response = await fetch(
      `http://localhost:8080/v1/connaissance-clients/${clientId}/situation`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(situationData)
      }
    );
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(`${response.status}: ${error.message}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error updating situation:', error.message);
    throw error;
  }
}

// Usage
const newSituation = {
  situationFamilialle: "MARIE",
  nombreEnfants: 2
};

updateSituation('8a9204f5-aa42-47bc-9f04-17caab5deeee', newSituation, process.env.API_TOKEN)
  .then(client => console.log('Updated:', client))
  .catch(error => console.error(error));

// Using Axios
const axios = require('axios');

async function updateSituationAxios(clientId, situationData) {
  try {
    const response = await axios.put(
      `http://localhost:8080/v1/connaissance-clients/${clientId}/situation`,
      situationData,
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

// Form validation before submission
function validateSituation(data) {
  const errors = [];
  
  if (!['CELIBATAIRE', 'MARIE'].includes(data.situationFamilialle)) {
    errors.push('Invalid family status');
  }
  
  if (typeof data.nombreEnfants !== 'number' || data.nombreEnfants < 0 || data.nombreEnfants > 20) {
    errors.push('Number of children must be 0-20');
  }
  
  return errors;
}
```

### Python

```python
import requests
import os

def update_situation(client_id, situation_data, token):
    """Update client family situation"""
    headers = {
        'Content-Type': 'application/json',
        'Authorization': f'Bearer {token}'
    }
    
    response = requests.put(
        f'http://localhost:8080/v1/connaissance-clients/{client_id}/situation',
        json=situation_data,
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
situation_data = {
    'situationFamilialle': 'MARIE',
    'nombreEnfants': 2
}

try:
    updated_client = update_situation(
        '8a9204f5-aa42-47bc-9f04-17caab5deeee',
        situation_data,
        os.getenv('API_TOKEN')
    )
    print(f'✓ Updated: {updated_client["nom"]} - {updated_client["nombreEnfants"]} children')
except Exception as e:
    print(f'✗ Error: {e}')

# Validation helper
def validate_situation(data):
    """Validate situation data before sending"""
    errors = []
    
    if data.get('situationFamilialle') not in ['CELIBATAIRE', 'MARIE']:
        errors.append('situationFamilialle must be CELIBATAIRE or MARIE')
    
    children = data.get('nombreEnfants')
    if not isinstance(children, int) or children < 0 or children > 20:
        errors.append('nombreEnfants must be an integer 0-20')
    
    return errors

errors = validate_situation(situation_data)
if errors:
    print('Validation errors:')
    for error in errors:
        print(f'  - {error}')
else:
    updated_client = update_situation('8a9204f5-aa42-47bc-9f04-17caab5deeee', situation_data, os.getenv('API_TOKEN'))
```

### Java

```java
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.net.URI;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;

public class UpdateSituationExample {
    
    public static ObjectNode updateSituation(String clientId, ObjectNode situationData, String token) throws Exception {
        ObjectMapper mapper = new ObjectMapper();
        String requestBody = mapper.writeValueAsString(situationData);
        
        HttpClient httpClient = HttpClient.newHttpClient();
        
        HttpRequest request = HttpRequest.newBuilder()
            .uri(new URI("http://localhost:8080/v1/connaissance-clients/" + clientId + "/situation"))
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
        } else if (response.statusCode() == 400) {
            throw new Exception("Validation error");
        } else {
            throw new Exception("HTTP " + response.statusCode() + ": " + response.body());
        }
    }
    
    public static void main(String[] args) throws Exception {
        ObjectMapper mapper = new ObjectMapper();
        ObjectNode situationNode = mapper.createObjectNode();
        situationNode.put("situationFamilialle", "MARIE");
        situationNode.put("nombreEnfants", 2);
        
        ObjectNode updated = updateSituation(
            "8a9204f5-aa42-47bc-9f04-17caab5deeee",
            situationNode,
            System.getenv("API_TOKEN")
        );
        
        System.out.println("Updated: " + 
            updated.get("situationFamilialle").asText() + " - " + 
            updated.get("nombreEnfants").asInt() + " children");
    }
}
```

---

## Use Cases

### Use Case 1: Update Situation Form

```javascript
// Handle form submission for situation updates
document.getElementById('situationForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const situationData = {
    situationFamilialle: document.getElementById('situationSelect').value,
    nombreEnfants: parseInt(document.getElementById('childrenCount').value)
  };
  
  // Validate
  const errors = validateSituation(situationData);
  if (errors.length > 0) {
    alert('Errors: ' + errors.join(', '));
    return;
  }
  
  try {
    const updated = await updateSituationAxios(clientId, situationData);
    alert('Situation updated successfully');
    // Refresh display
    document.getElementById('situationDisplay').textContent = 
      updated.situationFamilialle === 'MARIE' ? 'Marié(e)' : 'Célibataire';
  } catch (error) {
    alert('Error: ' + error.message);
  }
});
```

### Use Case 2: Lifecycle Event Tracker

```python
def record_lifecycle_event(client_id, event_type, old_situation, new_situation):
    """Track major life events"""
    
    events = []
    
    # Check for marriage
    if old_situation['situationFamilialle'] == 'CELIBATAIRE' and \
       new_situation['situationFamilialle'] == 'MARIE':
        events.append('MARRIAGE')
    
    # Check for children changes
    old_children = old_situation['nombreEnfants']
    new_children = new_situation['nombreEnfants']
    
    if new_children > old_children:
        for i in range(new_children - old_children):
            events.append('CHILD_BIRTH')
    elif new_children < old_children:
        events.append('CHILD_LEFT_HOME')
    
    # Log events
    for event in events:
        print(f'Event: {event} for client {client_id}')
        # Could save to audit log, trigger workflow, etc.
    
    return events
```

### Use Case 3: Batch Status Update

```python
def update_client_statuses(csv_file, token):
    """Update multiple clients from CSV"""
    with open(csv_file) as f:
        reader = csv.DictReader(f)
        for row in reader:
            situation_data = {
                'situationFamilialle': row['situationFamilialle'],
                'nombreEnfants': int(row['nombreEnfants'])
            }
            
            try:
                update_situation(row['id'], situation_data, token)
                print(f'✓ Updated {row["id"]}')
            except Exception as e:
                print(f'✗ Failed {row["id"]}: {e}')
```

---

## Field Definitions

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| `situationFamilialle` | String | † | Enum: `CELIBATAIRE` or `MARIE` |
| `nombreEnfants` | Integer | † | Range: 0-20 |

† = Required

### Enum Values

**situationFamilialle:**
- `CELIBATAIRE` — Single/Unmarried
- `MARIE` — Married

**nombreEnfants:**
- Minimum: 0 (no children)
- Maximum: 20 (maximum number of children)

---

## Related Endpoints

- [GET /v1/connaissance-clients/{id}](./03-get-client.md) — Get single client
- [POST /v1/connaissance-clients](./02-create-update-client.md) — Create/update client
- [PUT /v1/connaissance-clients/{id}/adresse](./05-update-address.md) — Update address

---

## Best Practices

1. **Validate Enums** — Always check values are `CELIBATAIRE` or `MARIE` before sending
2. **Range Checking** — Verify `nombreEnfants` is 0-20
3. **Audit Logging** — Log life event changes for compliance
4. **Notification** — Consider notifying relevant departments of status changes

See [Best Practices Guide](../06-best-practices.md) for more details.

---

**Related:** [Error Handling](../04-error-handling.md) | [Best Practices](../06-best-practices.md) | [Code Examples](../05-examples.md)

---

**Next:** [Error Handling Guide](../04-error-handling.md)
