# MongoDB Atlas MCP Server

A Model Context Protocol (MCP) server that provides access to the MongoDB Atlas API. This server wraps the [mongodb-atlas-api-client](https://www.npmjs.com/package/mongodb-atlas-api-client) package to expose MongoDB Atlas functionality through MCP tools.

## Features

This MCP server exposes most of the mongodb-atlas-api-client surface as MCP tools.

### Database Users
- `user_get` — Get a database user by username
- `user_get_all` — List all database users
- `user_create` — Create a database user
- `user_update` — Update a database user
- `user_delete` — Delete a database user

### Clusters
- `cluster_get` — Get cluster details
- `cluster_get_all` — List clusters
- `cluster_create` — Create cluster
- `cluster_update` — Update cluster
- `cluster_delete` — Delete cluster
- `cluster_get_advanced_configuration` — Get processArgs (advanced config)
- `cluster_update_advanced_configuration` — Update processArgs (advanced config)
- `cluster_test_primary_failover` — Initiate a test primary failover

### Projects
- `project_get_by_id` — Get project by ID
- `project_get_by_name` — Get project by name
- `project_get_all` — List projects
- `project_create` — Create project
- `project_delete` — Delete project
- `project_get_teams` — List teams for a project
- `project_remove_user` — Remove a user from a project
- `project_assign_teams` — Assign teams to a project

### Cloud Backups
- `cloud_backup_get_snapshots` — List cloud backup snapshots (replicaset)
- `cloud_backup_get_snapshot` — Get a specific snapshot
- `cloud_backup_get_restore_job` — Get a snapshot restore job
- `cloud_backup_create_restore_job` — Create a snapshot restore job

### Organizations
- `organization_get_by_id` — Get organization by ID
- `organization_get_all` — List organizations
- `organization_get_users` — List users in an organization
- `organization_get_projects` — List projects in an organization
- `organization_delete` — Delete organization
- `organization_rename` — Rename organization
- `organization_invite` — Invite users to organization

### Project Access Lists (current)
- `project_access_list_get_all` — List IP access list entries
- `project_access_list_get` — Get a specific access list entry
- `project_access_list_create` — Add entries to access list
- `project_access_list_update` — Upsert access list entries (POST semantics)
- `project_access_list_delete` — Delete an access list entry

### Project Whitelist (legacy)
- `project_whitelist_get_all` — List whitelist entries
- `project_whitelist_get` — Get a whitelist entry
- `project_whitelist_create` — Add whitelist entries
- `project_whitelist_update` — Update whitelist entries
- `project_whitelist_delete` — Delete a whitelist entry

### Events
- `events_get_all` — List project events
- `events_get` — Get event by ID (project scope)
- `events_get_by_org` — Get event by ID for an organization
- `events_get_all_by_org` — List organization events

### Atlas Search
- `atlas_search_get_all` — List indexes for a collection
- `atlas_search_create` — Create an index
- `atlas_search_get` — Get index by ID
- `atlas_search_update` — Update index by ID
- `atlas_search_delete` — Delete index by ID
- `atlas_search_get_all_analyzers` — List analyzers
- `atlas_search_upsert_analyzer` — Create/Update analyzers

### Atlas Users (Account-level)
- `atlas_user_get_by_name` — Get Atlas user by username
- `atlas_user_get_by_id` — Get Atlas user by ID
- `atlas_user_get_all` — List Atlas users for the project
- `atlas_user_create` — Create Atlas user
- `atlas_user_update` — Update Atlas user

### Alerts
- `alert_get_all` — List project alerts
- `alert_get` — Get alert by ID
- `alert_acknowledge` — Acknowledge alert

### Data Lake
- `datalake_get` — Get Data Lake by name
- `datalake_get_all` — List Data Lakes
- `datalake_create` — Create Data Lake
- `datalake_update` — Update Data Lake
- `datalake_delete` — Delete Data Lake
- `datalake_get_logs_stream` — Get query logs (returns base64-encoded gzip data)

### Cloud Provider Access
- `cloud_provider_access_get_all` — List cloud provider access roles
- `cloud_provider_access_create` — Create a role
- `cloud_provider_access_update` — Update a role (roleId + body)
- `cloud_provider_access_delete` — Delete a role (cloudProvider + roleId)

## Installation

1. Clone this repository:
```bash
git clone https://github.com/montumodi/mongodb-atlas-mcp-server.git
cd mongodb-atlas-mcp-server
```

2. Install dependencies:
```bash
npm install
```

## Configuration

Before using the server, you need to set up environment variables with your MongoDB Atlas API credentials:

### Required Environment Variables

- `MONGODB_ATLAS_PUBLIC_KEY` - Your MongoDB Atlas API public key
- `MONGODB_ATLAS_PRIVATE_KEY` - Your MongoDB Atlas API private key  
- `MONGODB_ATLAS_PROJECT_ID` - Your MongoDB Atlas project/group ID

### Optional Environment Variables

- `MONGODB_ATLAS_BASE_URL` - Atlas API base URL (defaults to `https://cloud.mongodb.com/api/atlas/v1.0`)

### Getting Atlas API Keys

1. Log in to [MongoDB Atlas](https://cloud.mongodb.com/)
2. Go to **Organization Settings** → **Access Manager** → **API Keys**
3. Click **Create API Key**
4. Assign appropriate permissions (Project Read/Write access recommended)
5. Copy the public and private keys
6. Find your Project ID in the project settings

### Example Configuration

```bash
export MONGODB_ATLAS_PUBLIC_KEY="your-public-key"
export MONGODB_ATLAS_PRIVATE_KEY="your-private-key" 
export MONGODB_ATLAS_PROJECT_ID="your-project-id"
```

Or create a `.env` file:
```env
MONGODB_ATLAS_PUBLIC_KEY=your-public-key
MONGODB_ATLAS_PRIVATE_KEY=your-private-key
MONGODB_ATLAS_PROJECT_ID=your-project-id
```

## Usage

### Running the Server

```bash
npm start
```

### Using with MCP Clients

This server implements the Model Context Protocol and can be used with any MCP-compatible client. The server communicates over stdin/stdout.

### Example Tool Usage

#### Get All Clusters
```json
{
  "name": "cluster_get_all",
  "arguments": {
    "options": {
      "itemsPerPage": 10
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
      "username": "newuser",
      "password": "securepassword123",
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

#### Get Project Events
#### Get Data Lake Logs (example)
Note: The logs are returned as base64-encoded gzip data in the `text` response. Decode base64 and then gunzip to read.
```json
{
  "name": "datalake_get_logs_stream",
  "arguments": { "dataLakeName": "MyDataLake" }
}
```
```json
{
  "name": "events_get_all",
  "arguments": {
    "options": {
      "itemsPerPage": 20,
      "eventType": ["CLUSTER"]
    }
  }
}
```

## Error Handling

The server provides detailed error messages for:
- Missing or invalid API credentials
- Network connectivity issues
- Invalid parameters
- MongoDB Atlas API errors

## Development

### Running in Development Mode
```bash
npm run dev
```

### Testing
```bash
npm test
```

## Dependencies

- **@modelcontextprotocol/sdk** - MCP SDK for server implementation
- **mongodb-atlas-api-client** - MongoDB Atlas API client library

## API Reference

This server exposes MongoDB Atlas API functionality through MCP tools. For detailed information about the underlying Atlas API, refer to:

- [MongoDB Atlas API Documentation](https://docs.atlas.mongodb.com/reference/api/)
- [mongodb-atlas-api-client Documentation](https://www.npmjs.com/package/mongodb-atlas-api-client)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT

## Support

For issues and questions:
- Check the [MongoDB Atlas API Documentation](https://docs.atlas.mongodb.com/reference/api/)
- Review the [mongodb-atlas-api-client](https://github.com/montumodi/mongodb-atlas-api-client) documentation
- Open an issue in this repository
