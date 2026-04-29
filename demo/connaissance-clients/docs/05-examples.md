# Comprehensive Code Examples

**Document:** 05-examples.md  
**Purpose:** Multi-language implementation examples for all API operations  
**Related:** [Main README](./README.md) | [Error Handling](./04-error-handling.md) | [Endpoints](./03-endpoints/)

---

## Table of Contents

1. [Setup & Client Initialization](#setup--client-initialization)
2. [List Clients](#list-clients)
3. [Create Client](#create-client)
4. [Get Single Client](#get-single-client)
5. [Update Client](#update-client)
6. [Delete Client](#delete-client)
7. [Update Address](#update-address)
8. [Update Situation](#update-situation)
9. [Error Handling](#error-handling)
10. [Complete Application Examples](#complete-application-examples)

---

## Setup & Client Initialization

### cURL - Environment Setup

```bash
# Store API token in environment variable
export API_BASE_URL="https://api.example.com"
export API_TOKEN="your-jwt-token-here"

# Verify setup
echo "Base URL: $API_BASE_URL"
echo "Token: ${API_TOKEN:0:20}..."
```

### JavaScript (Node.js)

```javascript
// config.js - API Client Setup
const API_BASE_URL = process.env.API_BASE_URL || 'https://api.example.com';
const API_TOKEN = process.env.API_TOKEN;

class ClientAPI {
  constructor(baseUrl, token) {
    this.baseUrl = baseUrl;
    this.token = token;
  }
  
  getHeaders(includeAuth = true) {
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };
    
    if (includeAuth) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    
    return headers;
  }
  
  async request(method, path, body = null) {
    const url = `${this.baseUrl}${path}`;
    const options = {
      method,
      headers: this.getHeaders(!['GET'].includes(method))
    };
    
    if (body) {
      options.body = JSON.stringify(body);
    }
    
    const response = await fetch(url, options);
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(`${response.status}: ${data.message}`);
    }
    
    return data;
  }
}

const api = new ClientAPI(API_BASE_URL, API_TOKEN);
```

### Python (requests)

```python
# config.py - API Client Setup
import os
import requests
from typing import Optional, Dict, Any

class ClientAPI:
    def __init__(self, base_url: str, token: str):
        self.base_url = base_url
        self.token = token
        self.session = requests.Session()
        self.session.headers.update({
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        })
    
    def _get_headers(self, include_auth: bool = True) -> Dict[str, str]:
        headers = {}
        if include_auth:
            headers['Authorization'] = f'Bearer {self.token}'
        return headers
    
    def request(self, method: str, path: str, json_data: Optional[Dict] = None) -> Dict[str, Any]:
        url = f'{self.base_url}{path}'
        headers = self._get_headers(include_auth=method != 'GET')
        
        response = self.session.request(
            method=method,
            url=url,
            json=json_data,
            headers=headers,
            timeout=10
        )
        
        response.raise_for_status()
        return response.json()

api = ClientAPI(
    base_url=os.getenv('API_BASE_URL', 'https://api.example.com'),
    token=os.getenv('API_TOKEN')
)
```

### Java (HttpClient)

```java
// ClientAPI.java - API Client Setup
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.net.URI;
import com.google.gson.Gson;
import com.google.gson.JsonObject;

public class ClientAPI {
    private final HttpClient client;
    private final String baseUrl;
    private final String token;
    private final Gson gson;
    
    public ClientAPI(String baseUrl, String token) {
        this.baseUrl = baseUrl;
        this.token = token;
        this.client = HttpClient.newBuilder()
            .version(HttpClient.Version.HTTP_1_1)
            .build();
        this.gson = new Gson();
    }
    
    private HttpRequest.Builder createRequest(String path) {
        return HttpRequest.newBuilder()
            .uri(URI.create(baseUrl + path))
            .header("Content-Type", "application/json")
            .header("Accept", "application/json")
            .header("Authorization", "Bearer " + token);
    }
    
    public JsonObject request(String method, String path, JsonObject body) throws Exception {
        HttpRequest.Builder requestBuilder = createRequest(path).method(method, 
            body != null ? HttpRequest.BodyPublishers.ofString(gson.toJson(body))
                         : HttpRequest.BodyPublishers.noBody());
        
        HttpRequest request = requestBuilder.build();
        HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
        
        if (response.statusCode() < 200 || response.statusCode() >= 300) {
            throw new Exception("HTTP " + response.statusCode() + ": " + response.body());
        }
        
        return gson.fromJson(response.body(), JsonObject.class);
    }
}

// Usage
ClientAPI api = new ClientAPI("https://api.example.com", System.getenv("API_TOKEN"));
```

---

## List Clients

### cURL

```bash
curl -X GET "$API_BASE_URL/v1/connaissance-clients" \
  -H "Authorization: Bearer $API_TOKEN" \
  -H "Content-Type: application/json"
```

**With Query Parameters:**
```bash
# Get first 10 clients, starting from offset 0
curl -X GET "$API_BASE_URL/v1/connaissance-clients?offset=0&limit=10" \
  -H "Authorization: Bearer $API_TOKEN" \
  -H "Content-Type: application/json" | jq '.'
```

**Save to File:**
```bash
curl -s -X GET "$API_BASE_URL/v1/connaissance-clients" \
  -H "Authorization: Bearer $API_TOKEN" \
  | jq '.' > clients.json
```

### JavaScript

```javascript
async function listClients(offset = 0, limit = 10) {
  try {
    const path = `/v1/connaissance-clients?offset=${offset}&limit=${limit}`;
    const clients = await api.request('GET', path);
    
    console.log(`Retrieved ${clients.length} clients`);
    clients.forEach((client, index) => {
      console.log(`${index + 1}. ${client.nom} ${client.prenom} (${client.id})`);
    });
    
    return clients;
  } catch (error) {
    console.error('Failed to list clients:', error.message);
    throw error;
  }
}

// Usage
listClients(0, 20).then(clients => {
  console.log('Total clients:', clients.length);
});
```

### Python

```python
def list_clients(offset: int = 0, limit: int = 10) -> list:
    """List all clients with pagination"""
    path = f'/v1/connaissance-clients?offset={offset}&limit={limit}'
    clients = api.request('GET', path)
    
    print(f'Retrieved {len(clients)} clients')
    for i, client in enumerate(clients, 1):
        print(f'{i}. {client["nom"]} {client["prenom"]} ({client["id"]})')
    
    return clients

# Usage
clients = list_clients(offset=0, limit=20)
print(f'Total: {len(clients)}')
```

### Java

```java
public List<JsonObject> listClients(int offset, int limit) throws Exception {
    String path = "/v1/connaissance-clients?offset=" + offset + "&limit=" + limit;
    JsonObject response = api.request("GET", path, null);
    
    // Parse response as array
    java.util.List<JsonObject> clients = new java.util.ArrayList<>();
    for (int i = 0; i < response.getAsJsonArray("items").size(); i++) {
        clients.add((JsonObject) response.getAsJsonArray("items").get(i));
    }
    
    System.out.println("Retrieved " + clients.size() + " clients");
    return clients;
}

// Usage
List<JsonObject> clients = listClients(0, 20);
```

---

## Create Client

### cURL

```bash
curl -X POST "$API_BASE_URL/v1/connaissance-clients" \
  -H "Authorization: Bearer $API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "nom": "Dupont",
    "prenom": "Jean",
    "adresse": {
      "ligne1": "123 Rue de la Paix",
      "ligne2": "Apt 4B",
      "codePostal": "75001",
      "ville": "Paris"
    },
    "situation": {
      "situationFamilialle": "MARIE",
      "nombreEnfants": 2
    }
  }'
```

### JavaScript

```javascript
async function createClient(clientData) {
  try {
    // Validate data
    const requiredFields = ['nom', 'prenom', 'adresse', 'situation'];
    for (const field of requiredFields) {
      if (!clientData[field]) {
        throw new Error(`Missing required field: ${field}`);
      }
    }
    
    const newClient = await api.request('POST', '/v1/connaissance-clients', clientData);
    
    console.log('Client created successfully');
    console.log('ID:', newClient.id);
    console.log('Name:', newClient.nom, newClient.prenom);
    
    return newClient;
  } catch (error) {
    console.error('Failed to create client:', error.message);
    throw error;
  }
}

// Usage
const newClient = await createClient({
  nom: "Dupont",
  prenom: "Jean",
  adresse: {
    ligne1: "123 Rue de la Paix",
    ligne2: "Apt 4B",
    codePostal: "75001",
    ville: "Paris"
  },
  situation: {
    situationFamilialle: "MARIE",
    nombreEnfants: 2
  }
});
```

### Python

```python
def create_client(client_data: dict) -> dict:
    """Create a new client"""
    # Validate required fields
    required_fields = ['nom', 'prenom', 'adresse', 'situation']
    for field in required_fields:
        if field not in client_data:
            raise ValueError(f'Missing required field: {field}')
    
    response = api.request('POST', '/v1/connaissance-clients', client_data)
    
    print(f'Client created successfully')
    print(f'ID: {response["id"]}')
    print(f'Name: {response["nom"]} {response["prenom"]}')
    
    return response

# Usage
new_client = create_client({
    'nom': 'Dupont',
    'prenom': 'Jean',
    'adresse': {
        'ligne1': '123 Rue de la Paix',
        'ligne2': 'Apt 4B',
        'codePostal': '75001',
        'ville': 'Paris'
    },
    'situation': {
        'situationFamilialle': 'MARIE',
        'nombreEnfants': 2
    }
})
```

### Java

```java
public JsonObject createClient(JsonObject clientData) throws Exception {
    return api.request("POST", "/v1/connaissance-clients", clientData);
}

// Usage
JsonObject newClient = new JsonObject();
newClient.addProperty("nom", "Dupont");
newClient.addProperty("prenom", "Jean");

JsonObject adresse = new JsonObject();
adresse.addProperty("ligne1", "123 Rue de la Paix");
adresse.addProperty("codePostal", "75001");
adresse.addProperty("ville", "Paris");
newClient.add("adresse", adresse);

JsonObject situation = new JsonObject();
situation.addProperty("situationFamilialle", "MARIE");
situation.addProperty("nombreEnfants", 2);
newClient.add("situation", situation);

JsonObject created = createClient(newClient);
System.out.println("Client created: " + created.get("id"));
```

---

## Get Single Client

### cURL

```bash
CLIENT_ID="8a9204f5-aa42-47bc-9f04-17caab5deeee"

curl -X GET "$API_BASE_URL/v1/connaissance-clients/$CLIENT_ID" \
  -H "Authorization: Bearer $API_TOKEN" \
  -H "Content-Type: application/json"
```

### JavaScript

```javascript
async function getClient(clientId) {
  try {
    const client = await api.request('GET', `/v1/connaissance-clients/${clientId}`);
    
    console.log('Client Details:');
    console.log(`Name: ${client.nom} ${client.prenom}`);
    console.log(`Address: ${client.adresse.ligne1}, ${client.adresse.codePostal} ${client.adresse.ville}`);
    console.log(`Family Status: ${client.situation.situationFamilialle}`);
    console.log(`Children: ${client.situation.nombreEnfants}`);
    
    return client;
  } catch (error) {
    if (error.message.includes('404')) {
      console.error('Client not found');
    }
    throw error;
  }
}

// Usage
const client = await getClient('8a9204f5-aa42-47bc-9f04-17caab5deeee');
```

### Python

```python
def get_client(client_id: str) -> dict:
    """Get a single client by ID"""
    path = f'/v1/connaissance-clients/{client_id}'
    client = api.request('GET', path)
    
    print(f'Name: {client["nom"]} {client["prenom"]}')
    print(f'Address: {client["adresse"]["ligne1"]}, {client["adresse"]["codePostal"]} {client["adresse"]["ville"]}')
    print(f'Family Status: {client["situation"]["situationFamilialle"]}')
    
    return client

# Usage
client = get_client('8a9204f5-aa42-47bc-9f04-17caab5deeee')
```

### Java

```java
public JsonObject getClient(String clientId) throws Exception {
    String path = "/v1/connaissance-clients/" + clientId;
    return api.request("GET", path, null);
}

// Usage
JsonObject client = getClient("8a9204f5-aa42-47bc-9f04-17caab5deeee");
System.out.println("Name: " + client.get("nom") + " " + client.get("prenom"));
```

---

## Update Client

### cURL

```bash
CLIENT_ID="8a9204f5-aa42-47bc-9f04-17caab5deeee"

curl -X POST "$API_BASE_URL/v1/connaissance-clients/$CLIENT_ID" \
  -H "Authorization: Bearer $API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "nom": "Dupont-Martin",
    "prenom": "Jean",
    "adresse": {
      "ligne1": "456 Avenue des Champs",
      "ligne2": null,
      "codePostal": "75008",
      "ville": "Paris"
    },
    "situation": {
      "situationFamilialle": "MARIE",
      "nombreEnfants": 3
    }
  }'
```

### JavaScript

```javascript
async function updateClient(clientId, updatedData) {
  try {
    const updated = await api.request('POST', `/v1/connaissance-clients/${clientId}`, updatedData);
    
    console.log('Client updated successfully');
    console.log('New name:', updated.nom);
    console.log('New address:', updated.adresse.ligne1);
    
    return updated;
  } catch (error) {
    console.error('Failed to update client:', error.message);
    throw error;
  }
}

// Usage
const updated = await updateClient('8a9204f5-aa42-47bc-9f04-17caab5deeee', {
  nom: 'Dupont-Martin',
  prenom: 'Jean',
  adresse: {
    ligne1: '456 Avenue des Champs',
    codePostal: '75008',
    ville: 'Paris'
  },
  situation: {
    situationFamilialle: 'MARIE',
    nombreEnfants: 3
  }
});
```

### Python

```python
def update_client(client_id: str, updated_data: dict) -> dict:
    """Update an existing client"""
    path = f'/v1/connaissance-clients/{client_id}'
    return api.request('POST', path, updated_data)

# Usage
updated = update_client('8a9204f5-aa42-47bc-9f04-17caab5deeee', {
    'nom': 'Dupont-Martin',
    'prenom': 'Jean',
    'adresse': {
        'ligne1': '456 Avenue des Champs',
        'codePostal': '75008',
        'ville': 'Paris'
    },
    'situation': {
        'situationFamilialle': 'MARIE',
        'nombreEnfants': 3
    }
})
```

---

## Delete Client

### cURL

```bash
CLIENT_ID="8a9204f5-aa42-47bc-9f04-17caab5deeee"

curl -X DELETE "$API_BASE_URL/v1/connaissance-clients/$CLIENT_ID" \
  -H "Authorization: Bearer $API_TOKEN" \
  -H "Content-Type: application/json"
```

### JavaScript

```javascript
async function deleteClient(clientId) {
  try {
    const response = await api.request('DELETE', `/v1/connaissance-clients/${clientId}`);
    
    console.log('Client deleted successfully');
    return response;
  } catch (error) {
    if (error.message.includes('404')) {
      console.error('Client not found');
    }
    throw error;
  }
}

// Usage
await deleteClient('8a9204f5-aa42-47bc-9f04-17caab5deeee');
```

### Python

```python
def delete_client(client_id: str) -> dict:
    """Delete a client"""
    path = f'/v1/connaissance-clients/{client_id}'
    return api.request('DELETE', path)

# Usage
delete_client('8a9204f5-aa42-47bc-9f04-17caab5deeee')
```

---

## Update Address

### cURL

```bash
CLIENT_ID="8a9204f5-aa42-47bc-9f04-17caab5deeee"

curl -X PUT "$API_BASE_URL/v1/connaissance-clients/$CLIENT_ID/adresse" \
  -H "Authorization: Bearer $API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "ligne1": "789 Boulevard Saint-Germain",
    "ligne2": "Suite 200",
    "codePostal": "75006",
    "ville": "Paris"
  }'
```

### JavaScript

```javascript
async function updateAddress(clientId, newAddress) {
  try {
    const updated = await api.request('PUT', `/v1/connaissance-clients/${clientId}/adresse`, newAddress);
    
    console.log('Address updated successfully');
    console.log('New address:', updated.adresse.ligne1);
    
    return updated;
  } catch (error) {
    console.error('Failed to update address:', error.message);
    throw error;
  }
}

// Usage
const updated = await updateAddress('8a9204f5-aa42-47bc-9f04-17caab5deeee', {
  ligne1: '789 Boulevard Saint-Germain',
  ligne2: 'Suite 200',
  codePostal: '75006',
  ville: 'Paris'
});
```

---

## Update Situation

### cURL

```bash
CLIENT_ID="8a9204f5-aa42-47bc-9f04-17caab5deeee"

curl -X PUT "$API_BASE_URL/v1/connaissance-clients/$CLIENT_ID/situation" \
  -H "Authorization: Bearer $API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "situationFamilialle": "MARIE",
    "nombreEnfants": 4
  }'
```

### JavaScript

```javascript
async function updateSituation(clientId, newSituation) {
  try {
    const updated = await api.request('PUT', `/v1/connaissance-clients/${clientId}/situation`, newSituation);
    
    console.log('Situation updated successfully');
    console.log('Family status:', updated.situation.situationFamilialle);
    console.log('Children:', updated.situation.nombreEnfants);
    
    return updated;
  } catch (error) {
    console.error('Failed to update situation:', error.message);
    throw error;
  }
}

// Usage
const updated = await updateSituation('8a9204f5-aa42-47bc-9f04-17caab5deeee', {
  situationFamilialle: 'MARIE',
  nombreEnfants: 4
});
```

---

## Error Handling

### JavaScript - Complete Error Handling

```javascript
async function handleErrors() {
  try {
    // Try to get a non-existent client
    await getClient('invalid-id');
  } catch (error) {
    if (error.message.includes('401')) {
      console.error('Authentication failed - check token');
    } else if (error.message.includes('404')) {
      console.error('Resource not found');
    } else if (error.message.includes('400')) {
      console.error('Invalid request - check data');
    } else if (error.message.includes('500')) {
      console.error('Server error - retry later');
    } else {
      console.error('Unknown error:', error.message);
    }
  }
}
```

### Python - Retry Logic

```python
import time

def request_with_retry(func, max_attempts=3, delay=1):
    """Execute function with retry logic"""
    for attempt in range(1, max_attempts + 1):
        try:
            return func()
        except Exception as e:
            if attempt == max_attempts:
                raise
            print(f'Attempt {attempt} failed, retrying in {delay}s...')
            time.sleep(delay)
            delay *= 2

# Usage
def get_clients_safe():
    return request_with_retry(lambda: list_clients(0, 100))

clients = get_clients_safe()
```

---

## Complete Application Examples

### JavaScript - Full CRUD App

```javascript
class ClientManager {
  constructor(api) {
    this.api = api;
  }
  
  async runDemo() {
    try {
      // 1. List all clients
      console.log('=== Listing Clients ===');
      const clients = await this.api.request('GET', '/v1/connaissance-clients?limit=5');
      console.log(`Found ${clients.length} clients`);
      
      // 2. Create new client
      console.log('\n=== Creating New Client ===');
      const newClient = await this.api.request('POST', '/v1/connaissance-clients', {
        nom: 'Martin',
        prenom: 'Sophie',
        adresse: {
          ligne1: '100 Rue de Rivoli',
          codePostal: '75004',
          ville: 'Paris'
        },
        situation: {
          situationFamilialle: 'CELIBATAIRE',
          nombreEnfants: 0
        }
      });
      console.log('Created:', newClient.id);
      
      // 3. Get created client
      console.log('\n=== Getting Client Details ===');
      const retrieved = await this.api.request('GET', `/v1/connaissance-clients/${newClient.id}`);
      console.log('Name:', retrieved.nom, retrieved.prenom);
      
      // 4. Update address
      console.log('\n=== Updating Address ===');
      const updated = await this.api.request('PUT', `/v1/connaissance-clients/${newClient.id}/adresse`, {
        ligne1: '50 Rue du Temple',
        codePostal: '75003',
        ville: 'Paris'
      });
      console.log('New address:', updated.adresse.ligne1);
      
      // 5. Update situation
      console.log('\n=== Updating Situation ===');
      const updated2 = await this.api.request('PUT', `/v1/connaissance-clients/${newClient.id}/situation`, {
        situationFamilialle: 'MARIE',
        nombreEnfants: 1
      });
      console.log('New family status:', updated2.situation.situationFamilialle);
      
      // 6. Delete client
      console.log('\n=== Deleting Client ===');
      await this.api.request('DELETE', `/v1/connaissance-clients/${newClient.id}`);
      console.log('Deleted successfully');
      
    } catch (error) {
      console.error('Error:', error.message);
    }
  }
}

// Run demo
const manager = new ClientManager(api);
manager.runDemo();
```

### Python - Full CRUD App

```python
class ClientManager:
    def __init__(self, api):
        self.api = api
    
    def run_demo(self):
        try:
            # 1. List all clients
            print('=== Listing Clients ===')
            clients = self.api.request('GET', '/v1/connaissance-clients?limit=5')
            print(f'Found {len(clients)} clients')
            
            # 2. Create new client
            print('\n=== Creating New Client ===')
            new_client = self.api.request('POST', '/v1/connaissance-clients', {
                'nom': 'Martin',
                'prenom': 'Sophie',
                'adresse': {
                    'ligne1': '100 Rue de Rivoli',
                    'codePostal': '75004',
                    'ville': 'Paris'
                },
                'situation': {
                    'situationFamilialle': 'CELIBATAIRE',
                    'nombreEnfants': 0
                }
            })
            print(f'Created: {new_client["id"]}')
            
            # 3. Delete client
            print('\n=== Deleting Client ===')
            self.api.request('DELETE', f'/v1/connaissance-clients/{new_client["id"]}')
            print('Deleted successfully')
            
        except Exception as e:
            print(f'Error: {e}')

# Run demo
manager = ClientManager(api)
manager.run_demo()
```

---

**Next:** [Best Practices](./06-best-practices.md)
