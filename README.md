# MongoDB Atlas MCP Server

A Model Context Protocol (MCP) server that provides access to the MongoDB Atlas API. This server wraps the [mongodb-atlas-api-client](https://www.npmjs.com/package/mongodb-atlas-api-client) package to expose MongoDB Atlas functionality through MCP tools.

## Features

This MCP server provides tools for interacting with various MongoDB Atlas resources:

### Database Users
- `user_get` - Get a specific database user by username
- `user_get_all` - Get all database users
- `user_create` - Create a new database user
- `user_update` - Update an existing database user
- `user_delete` - Delete a database user

### Clusters
- `cluster_get` - Get details of a specific cluster
- `cluster_get_all` - Get all clusters in the project
- `cluster_create` - Create a new cluster
- `cluster_update` - Update an existing cluster
- `cluster_delete` - Delete a cluster

### Projects
- `project_get_by_id` - Get project details by ID
- `project_get_by_name` - Get project details by name
- `project_get_all` - Get all projects
- `project_create` - Create a new project

### Cloud Backups
- `cloud_backup_get_snapshots` - Get all cloud backup snapshots for a cluster
- `cloud_backup_get_snapshot` - Get details of a specific snapshot

### Organizations
- `organization_get_by_id` - Get organization details by ID
- `organization_get_all` - Get all organizations

### Project Access Lists (IP Whitelisting)
- `project_access_list_get_all` - Get all IP access list entries
- `project_access_list_create` - Add IP addresses to the access list

### Events
- `events_get_all` - Get all events for the project
- `events_get` - Get details of a specific event

### Atlas Search
- `atlas_search_get_all` - Get all Atlas Search indexes for a cluster
- `atlas_search_create` - Create a new Atlas Search index

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
