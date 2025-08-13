# Example Usage

This document provides examples of how to use the MongoDB Atlas MCP Server tools.

## Environment Setup

First, make sure your environment variables are set:

```bash
export MONGODB_ATLAS_PUBLIC_KEY="your-public-key"
export MONGODB_ATLAS_PRIVATE_KEY="your-private-key"
export MONGODB_ATLAS_PROJECT_ID="your-project-id"
```

## Tool Examples

### Database Users

#### Get All Users
```json
{
  "name": "user_get_all",
  "arguments": {
    "options": {
      "itemsPerPage": 10,
      "pretty": true
    }
  }
}
```

#### Create a Database User
```json
{
  "name": "user_create",
  "arguments": {
    "body": {
      "username": "appuser",
      "password": "SecurePassword123!",
      "roles": [
        {
          "databaseName": "myapp",
          "roleName": "readWrite"
        }
      ],
      "databaseName": "admin"
    }
  }
}
```

#### Get Specific User
```json
{
  "name": "user_get",
  "arguments": {
    "username": "appuser"
  }
}
```

#### Update User
```json
{
  "name": "user_update",
  "arguments": {
    "username": "appuser",
    "body": {
      "roles": [
        {
          "databaseName": "myapp",
          "roleName": "read"
        }
      ]
    }
  }
}
```

### Clusters

#### Get All Clusters
```json
{
  "name": "cluster_get_all",
  "arguments": {
    "options": {
      "envelope": true
    }
  }
}
```

#### Get Specific Cluster
```json
{
  "name": "cluster_get",
  "arguments": {
    "clustername": "my-cluster"
  }
}
```

#### Create a Cluster
```json
{
  "name": "cluster_create",
  "arguments": {
    "body": {
      "name": "test-cluster",
      "clusterType": "REPLICASET",
      "providerSettings": {
        "providerName": "AWS",
        "instanceSizeName": "M10",
        "regionName": "US_EAST_1"
      }
    }
  }
}
```

### Projects

#### Get All Projects
```json
{
  "name": "project_get_all",
  "arguments": {
    "options": {
      "itemsPerPage": 20
    }
  }
}
```

#### Get Project by Name
```json
{
  "name": "project_get_by_name",
  "arguments": {
    "projectName": "MyProject"
  }
}
```

#### Create a Project
```json
{
  "name": "project_create",
  "arguments": {
    "body": {
      "name": "NewProject",
      "orgId": "5f8f8f8f8f8f8f8f8f8f8f8f"
    }
  }
}
```

### Cloud Backups

#### Get All Snapshots for a Cluster
```json
{
  "name": "cloud_backup_get_snapshots",
  "arguments": {
    "clustername": "my-cluster",
    "options": {
      "itemsPerPage": 10
    }
  }
}
```

#### Get Specific Snapshot
```json
{
  "name": "cloud_backup_get_snapshot",
  "arguments": {
    "clustername": "my-cluster",
    "snapshotId": "5f8f8f8f8f8f8f8f8f8f8f8f"
  }
}
```

### Organizations

#### Get All Organizations
```json
{
  "name": "organization_get_all",
  "arguments": {
    "options": {
      "pretty": true
    }
  }
}
```

#### Get Organization by ID
```json
{
  "name": "organization_get_by_id",
  "arguments": {
    "organizationId": "5f8f8f8f8f8f8f8f8f8f8f8f"
  }
}
```

### Project Access Lists

#### Get All Access List Entries
```json
{
  "name": "project_access_list_get_all",
  "arguments": {
    "options": {
      "itemsPerPage": 50
    }
  }
}
```

#### Add IP Addresses to Access List
```json
{
  "name": "project_access_list_create",
  "arguments": {
    "body": [
      {
        "ipAddress": "192.168.1.100",
        "comment": "Office IP"
      },
      {
        "cidrBlock": "10.0.0.0/24",
        "comment": "Internal network"
      }
    ]
  }
}
```

### Events

#### Get All Events
```json
{
  "name": "events_get_all",
  "arguments": {
    "options": {
      "itemsPerPage": 20,
      "eventType": ["CLUSTER", "USER"]
    }
  }
}
```

#### Get Specific Event
```json
{
  "name": "events_get",
  "arguments": {
    "eventId": "5f8f8f8f8f8f8f8f8f8f8f8f"
  }
}
```

### Atlas Search

#### Get All Search Indexes
```json
{
  "name": "atlas_search_get_all",
  "arguments": {
    "clusterName": "my-cluster",
    "databaseName": "myapp",
    "collectionName": "products"
  }
}
```

#### Create Search Index
```json
{
  "name": "atlas_search_create",
  "arguments": {
    "clusterName": "my-cluster",
    "body": {
      "name": "product-search",
      "database": "myapp",
      "collection": "products",
      "mappings": {
        "dynamic": true,
        "fields": {
          "title": {
            "type": "string",
            "analyzer": "lucene.standard"
          },
          "description": {
            "type": "string",
            "analyzer": "lucene.standard"
          }
        }
      }
    }
  }
}
```

## Response Format

All successful tool calls return a response with the following format:

```json
{
  "content": [
    {
      "type": "text",
      "text": "{\"result\": \"...\"}"
    }
  ]
}
```

The `text` field contains the JSON response from the MongoDB Atlas API.

## Error Handling

If an error occurs, the server will return an error message:

```json
{
  "error": "MongoDB Atlas API error: Cluster not found"
}
```

Common error scenarios:
- Invalid API credentials
- Resource not found
- Insufficient permissions
- Network connectivity issues
- Invalid request parameters
