# Endpoint: Delete Client

**HTTP Method:** DELETE  
**Path:** `/v1/connaissance-clients/{id}`  
**Authentication:** Required (Bearer JWT)  
**Returns:** 200 OK  
**Related:** [Main README](../../README.md) | [All Endpoints](../README.md)

---

## Summary

Deletes a client record permanently. Requires JWT Bearer token authentication. This operation cannot be undone.

---

## Request

### HTTP

```http
DELETE /v1/connaissance-clients/8a9204f5-aa42-47bc-9f04-17caab5deeee HTTP/1.1
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

### Headers

| Header | Value | Required |
|--------|-------|----------|
| `Authorization` | `Bearer {token}` | Yes |

### Query Parameters

None.

### Request Body

None.

---

## Response

### 200 OK - Success

Client record deleted successfully.

**Status Code:** `200 OK`

**Response Body:** Empty or confirmation message

**Example Response:**
```
(empty body)
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
# Delete a client
CLIENT_ID="8a9204f5-aa42-47bc-9f04-17caab5deeee"

curl -X DELETE "http://localhost:8080/v1/connaissance-clients/$CLIENT_ID" \
  -H "Authorization: Bearer $API_TOKEN"

# Show HTTP status code only
curl -s -o /dev/null -w "%{http_code}" \
  -X DELETE "http://localhost:8080/v1/connaissance-clients/$CLIENT_ID" \
  -H "Authorization: Bearer $API_TOKEN"

# With verbose output
curl -v -X DELETE "http://localhost:8080/v1/connaissance-clients/$CLIENT_ID" \
  -H "Authorization: Bearer $API_TOKEN"
```

### JavaScript / Node.js

```javascript
// Using Fetch API
async function deleteClient(clientId, token) {
  try {
    const response = await fetch(
      `http://localhost:8080/v1/connaissance-clients/${clientId}`,
      {
        method: 'DELETE',
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
    
    return true;
  } catch (error) {
    console.error('Error deleting client:', error.message);
    throw error;
  }
}

// Usage
deleteClient('8a9204f5-aa42-47bc-9f04-17caab5deeee', process.env.API_TOKEN)
  .then(() => console.log('Client deleted successfully'))
  .catch(error => console.error(error));

// Using Axios
const axios = require('axios');

async function deleteClientAxios(clientId) {
  try {
    await axios.delete(
      `http://localhost:8080/v1/connaissance-clients/${clientId}`,
      {
        headers: {
          'Authorization': `Bearer ${process.env.API_TOKEN}`
        }
      }
    );
    return true;
  } catch (error) {
    if (error.response?.status === 404) {
      console.error('Client not found');
    } else if (error.response?.status === 401) {
      console.error('Authentication failed');
    }
    throw error;
  }
}

// With confirmation dialog
async function deleteClientWithConfirmation(clientId, clientName) {
  if (!confirm(`Are you sure you want to delete ${clientName}? This cannot be undone.`)) {
    return false;
  }
  
  try {
    await deleteClientAxios(clientId);
    console.log('Client deleted');
    return true;
  } catch (error) {
    alert('Failed to delete: ' + error.message);
    return false;
  }
}
```

### Python

```python
import requests
import os

def delete_client(client_id, token):
    """Delete a client record"""
    headers = {
        'Authorization': f'Bearer {token}'
    }
    
    response = requests.delete(
        f'http://localhost:8080/v1/connaissance-clients/{client_id}',
        headers=headers,
        timeout=5
    )
    
    if response.status_code == 200:
        return True
    elif response.status_code == 404:
        raise ValueError(f'Client {client_id} not found')
    elif response.status_code == 401:
        raise PermissionError('Authentication failed')
    else:
        error_data = response.json()
        raise Exception(f'{response.status_code}: {error_data["message"]}')

# Usage
try:
    if delete_client('8a9204f5-aa42-47bc-9f04-17caab5deeee', os.getenv('API_TOKEN')):
        print('✓ Client deleted successfully')
except Exception as e:
    print(f'✗ Error: {e}')

# With confirmation
def delete_client_with_confirmation(client_id, client_name):
    """Delete with user confirmation"""
    response = input(f'Delete {client_name}? (yes/no): ')
    
    if response.lower() != 'yes':
        print('Aborted')
        return False
    
    try:
        delete_client(client_id, os.getenv('API_TOKEN'))
        print(f'✓ Deleted {client_name}')
        return True
    except Exception as e:
        print(f'✗ Error: {e}')
        return False

# Batch delete
def delete_multiple_clients(client_ids):
    """Delete multiple clients"""
    successful = []
    failed = []
    
    for client_id in client_ids:
        try:
            delete_client(client_id, os.getenv('API_TOKEN'))
            successful.append(client_id)
        except Exception as e:
            failed.append((client_id, str(e)))
    
    print(f'✓ Deleted: {len(successful)}')
    print(f'✗ Failed: {len(failed)}')
    return successful, failed
```

### Java

```java
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.net.URI;

public class DeleteClientExample {
    
    public static boolean deleteClient(String clientId, String token) throws Exception {
        HttpClient httpClient = HttpClient.newHttpClient();
        
        HttpRequest request = HttpRequest.newBuilder()
            .uri(new URI("http://localhost:8080/v1/connaissance-clients/" + clientId))
            .header("Authorization", "Bearer " + token)
            .DELETE()
            .build();
        
        HttpResponse<String> response = httpClient.send(request, 
            HttpResponse.BodyHandlers.ofString());
        
        if (response.statusCode() == 200) {
            return true;
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
            boolean deleted = deleteClient("8a9204f5-aa42-47bc-9f04-17caab5deeee", token);
            
            if (deleted) {
                System.out.println("✓ Client deleted successfully");
            }
        } catch (Exception e) {
            System.err.println("✗ Error: " + e.getMessage());
        }
    }
}
```

---

## Use Cases

### Use Case 1: Delete Button in UI

```javascript
// Handle delete button click
function setupDeleteButton(clientId, clientName) {
  document.getElementById('deleteBtn').addEventListener('click', async () => {
    if (!confirm(`Delete ${clientName}? This cannot be undone.`)) {
      return;
    }
    
    try {
      await deleteClientAxios(clientId);
      alert('Client deleted');
      window.location.href = '/clients'; // Redirect to list
    } catch (error) {
      alert('Failed to delete: ' + error.message);
    }
  });
}
```

### Use Case 2: Cleanup Script

```bash
#!/bin/bash
# Delete test clients created during testing

TEST_CLIENTS=(
  "8a9204f5-aa42-47bc-9f04-17caab5deeee"
  "9b0315g6-bb53-48cd-ag05-18dbbi6eefff"
)

for client_id in "${TEST_CLIENTS[@]}"; do
  curl -s -X DELETE \
    "http://localhost:8080/v1/connaissance-clients/$client_id" \
    -H "Authorization: Bearer $API_TOKEN" && \
    echo "✓ Deleted $client_id" || \
    echo "✗ Failed to delete $client_id"
done
```

### Use Case 3: Archive Before Delete

```python
import json
import shutil
from datetime import datetime

def delete_client_with_archive(client_id):
    """Archive client data before deletion"""
    
    # Fetch client data
    client = get_client(client_id, os.getenv('API_TOKEN'))
    
    # Archive to file
    archive_dir = 'archived_clients'
    os.makedirs(archive_dir, exist_ok=True)
    
    timestamp = datetime.now().isoformat()
    filename = f'{archive_dir}/{client["nom"]}_{timestamp}.json'
    
    with open(filename, 'w') as f:
        json.dump(client, f, indent=2)
    
    print(f'✓ Archived to {filename}')
    
    # Now delete
    delete_client(client_id, os.getenv('API_TOKEN'))
    print(f'✓ Deleted {client_id}')
```

---

## ⚠️ Important Notes

### Data Loss

**This operation is permanent and cannot be undone.** Consider these practices:

1. ✅ **Always confirm before deleting** — Implement UI confirmation dialogs
2. ✅ **Archive before delete** — Keep backup of important records
3. ✅ **Audit logging** — Log all delete operations with timestamps and user IDs
4. ✅ **Soft deletes** — Consider implementing soft deletes (mark as inactive) instead
5. ✅ **Backup strategy** — Maintain database backups

### Soft Delete Alternative

Instead of permanent deletion, consider marking records as inactive:

```javascript
// Update to inactive instead of delete
async function deactivateClient(clientId) {
  // Could be implemented as a custom endpoint or through an 'active' flag
  await updateClient(clientId, { active: false });
}
```

---

## Related Endpoints

- [GET /v1/connaissance-clients](./01-list-clients.md) — List all clients
- [GET /v1/connaissance-clients/{id}](./03-get-client.md) — Get single client
- [POST /v1/connaissance-clients](./02-create-update-client.md) — Create/update client
- [PUT /v1/connaissance-clients/{id}/adresse](./05-update-address.md) — Update address
- [PUT /v1/connaissance-clients/{id}/situation](./06-update-situation.md) — Update situation

---

## Error Handling

See [Error Handling Guide](../04-error-handling.md) for details on HTTP status codes and error responses.

---

**Related:** [Best Practices](../06-best-practices.md) | [Authentication](../02-authentication.md) | [Code Examples](../05-examples.md)

---

**Next:** [PUT - Update Client Address](./05-update-address.md)
