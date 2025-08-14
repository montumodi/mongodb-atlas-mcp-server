#!/usr/bin/env node

/**
 * MCP Server for MongoDB Atlas API Client
 * Exposes MongoDB Atlas cluster management functions to LLMs via Model Context Protocol
 */

const { Server } = require('@modelcontextprotocol/sdk/server/index.js');
const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js');
const { 
  CallToolRequestSchema,
  ListToolsRequestSchema
} = require('@modelcontextprotocol/sdk/types.js');

// Import MongoDB Atlas API client
const getClient = require('mongodb-atlas-api-client');

class MongoDBAtlasMCPServer {
  constructor() {
    this.server = new Server(
      {
        name: 'mongodb-atlas-mcp-server',
        version: '1.1.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.atlasClient = null;
    this.setupToolHandlers();
  }

  setupToolHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          // User tools
          {
            name: 'user_get',
            description: 'Get a specific database user by username',
            inputSchema: {
              type: 'object',
              properties: {
                username: {
                  type: 'string',
                  description: 'Username of the database user',
                },
                options: {
                  type: 'object',
                  description: 'Optional parameters for the request',
                  default: {},
                },
              },
              required: ['username'],
            },
          },
          {
            name: 'user_get_all',
            description: 'Get all database users',
            inputSchema: {
              type: 'object',
              properties: {
                options: {
                  type: 'object',
                  description: 'Optional parameters for pagination and filtering',
                  default: {},
                },
              },
            },
          },
          {
            name: 'user_create',
            description: 'Create a new database user',
            inputSchema: {
              type: 'object',
              properties: {
                body: {
                  type: 'object',
                  description: 'User details for creation',
                  properties: {
                    username: { type: 'string' },
                    password: { type: 'string' },
                    roles: { 
                      type: 'array',
                      description: 'Array of user roles',
                      minItems: 1,
                      items: {
                        type: 'object',
                        properties: {
                          roleName: { type: 'string' },
                          databaseName: { type: 'string' }
                        },
                        required: ['roleName', 'databaseName']
                      }
                    },
                    databaseName: { type: 'string' },
                  },
                  required: ['username', 'password', 'roles'],
                },
                options: {
                  type: 'object',
                  description: 'Optional parameters',
                  default: {},
                },
              },
              required: ['body'],
            },
          },
          {
            name: 'user_update',
            description: 'Update an existing database user',
            inputSchema: {
              type: 'object',
              properties: {
                username: {
                  type: 'string',
                  description: 'Username of the user to update',
                },
                body: {
                  type: 'object',
                  description: 'Updated user details',
                },
                options: {
                  type: 'object',
                  description: 'Optional parameters',
                  default: {},
                },
              },
              required: ['username', 'body'],
            },
          },
          {
            name: 'user_delete',
            description: 'Delete a database user',
            inputSchema: {
              type: 'object',
              properties: {
                username: {
                  type: 'string',
                  description: 'Username of the user to delete',
                },
                options: {
                  type: 'object',
                  description: 'Optional parameters',
                  default: {},
                },
              },
              required: ['username'],
            },
          },

          // Cluster tools
          {
            name: 'cluster_get',
            description: 'Get details of a specific cluster',
            inputSchema: {
              type: 'object',
              properties: {
                clustername: {
                  type: 'string',
                  description: 'Name of the cluster',
                },
                options: {
                  type: 'object',
                  description: 'Optional parameters',
                  default: {},
                },
              },
              required: ['clustername'],
            },
          },
          {
            name: 'cluster_get_all',
            description: 'Get all clusters in the project',
            inputSchema: {
              type: 'object',
              properties: {
                options: {
                  type: 'object',
                  description: 'Optional parameters for pagination',
                  default: {},
                },
              },
            },
          },
          {
            name: 'cluster_create',
            description: 'Create a new cluster',
            inputSchema: {
              type: 'object',
              properties: {
                body: {
                  type: 'object',
                  description: 'Cluster configuration details',
                  properties: {
                    name: { type: 'string' },
                    clusterType: { type: 'string' },
                    providerSettings: { type: 'object' },
                  },
                  required: ['name'],
                },
                options: {
                  type: 'object',
                  description: 'Optional parameters',
                  default: {},
                },
              },
              required: ['body'],
            },
          },
          {
            name: 'cluster_update',
            description: 'Update an existing cluster',
            inputSchema: {
              type: 'object',
              properties: {
                clustername: {
                  type: 'string',
                  description: 'Name of the cluster to update',
                },
                body: {
                  type: 'object',
                  description: 'Updated cluster configuration',
                },
                options: {
                  type: 'object',
                  description: 'Optional parameters',
                  default: {},
                },
              },
              required: ['clustername', 'body'],
            },
          },
          {
            name: 'cluster_delete',
            description: 'Delete a cluster',
            inputSchema: {
              type: 'object',
              properties: {
                clustername: {
                  type: 'string',
                  description: 'Name of the cluster to delete',
                },
                options: {
                  type: 'object',
                  description: 'Optional parameters',
                  default: {},
                },
              },
              required: ['clustername'],
            },
          },

          // Project tools
          {
            name: 'project_get_by_id',
            description: 'Get project details by ID',
            inputSchema: {
              type: 'object',
              properties: {
                projectId: {
                  type: 'string',
                  description: 'Project ID',
                },
                options: {
                  type: 'object',
                  description: 'Optional parameters',
                  default: {},
                },
              },
              required: ['projectId'],
            },
          },
          {
            name: 'project_get_by_name',
            description: 'Get project details by name',
            inputSchema: {
              type: 'object',
              properties: {
                projectName: {
                  type: 'string',
                  description: 'Project name',
                },
                options: {
                  type: 'object',
                  description: 'Optional parameters',
                  default: {},
                },
              },
              required: ['projectName'],
            },
          },
          {
            name: 'project_get_all',
            description: 'Get all projects',
            inputSchema: {
              type: 'object',
              properties: {
                options: {
                  type: 'object',
                  description: 'Optional parameters for pagination',
                  default: {},
                },
              },
            },
          },
          {
            name: 'project_create',
            description: 'Create a new project',
            inputSchema: {
              type: 'object',
              properties: {
                body: {
                  type: 'object',
                  description: 'Project details',
                  properties: {
                    name: { type: 'string' },
                    orgId: { type: 'string' },
                  },
                  required: ['name', 'orgId'],
                },
                options: {
                  type: 'object',
                  description: 'Optional parameters',
                  default: {},
                },
              },
              required: ['body'],
            },
          },

          // Cloud Backup tools
          {
            name: 'cloud_backup_get_snapshots',
            description: 'Get all cloud backup snapshots for a cluster',
            inputSchema: {
              type: 'object',
              properties: {
                clustername: {
                  type: 'string',
                  description: 'Name of the cluster',
                },
                options: {
                  type: 'object',
                  description: 'Optional parameters',
                  default: {},
                },
              },
              required: ['clustername'],
            },
          },
          {
            name: 'cloud_backup_get_snapshot',
            description: 'Get details of a specific snapshot',
            inputSchema: {
              type: 'object',
              properties: {
                clustername: {
                  type: 'string',
                  description: 'Name of the cluster',
                },
                snapshotId: {
                  type: 'string',
                  description: 'ID of the snapshot',
                },
                options: {
                  type: 'object',
                  description: 'Optional parameters',
                  default: {},
                },
              },
              required: ['clustername', 'snapshotId'],
            },
          },

          // Organization tools
          {
            name: 'organization_get_by_id',
            description: 'Get organization details by ID',
            inputSchema: {
              type: 'object',
              properties: {
                organizationId: {
                  type: 'string',
                  description: 'Organization ID',
                },
                options: {
                  type: 'object',
                  description: 'Optional parameters',
                  default: {},
                },
              },
              required: ['organizationId'],
            },
          },
          {
            name: 'organization_get_all',
            description: 'Get all organizations',
            inputSchema: {
              type: 'object',
              properties: {
                options: {
                  type: 'object',
                  description: 'Optional parameters',
                  default: {},
                },
              },
            },
          },

          // Project Access List tools
          {
            name: 'project_access_list_get_all',
            description: 'Get all IP access list entries for the project',
            inputSchema: {
              type: 'object',
              properties: {
                options: {
                  type: 'object',
                  description: 'Optional parameters',
                  default: {},
                },
              },
            },
          },
          {
            name: 'project_access_list_create',
            description: 'Add IP addresses to the access list',
            inputSchema: {
              type: 'object',
              properties: {
                body: {
                  type: 'array',
                  description: 'Array of IP access list entries',
                  minItems: 1,
                  items: {
                    type: 'object',
                    properties: {
                      ipAddress: { type: 'string' },
                      cidrBlock: { type: 'string' },
                      comment: { type: 'string' }
                    },
                    required: ['ipAddress']
                  }
                },
                options: {
                  type: 'object',
                  description: 'Optional parameters',
                  default: {},
                },
              },
              required: ['body'],
            },
          },

          // Events tools
          {
            name: 'events_get_all',
            description: 'Get all events for the project',
            inputSchema: {
              type: 'object',
              properties: {
                options: {
                  type: 'object',
                  description: 'Optional parameters for filtering and pagination',
                  default: {},
                },
              },
            },
          },
          {
            name: 'events_get',
            description: 'Get details of a specific event',
            inputSchema: {
              type: 'object',
              properties: {
                eventId: {
                  type: 'string',
                  description: 'Event ID',
                },
                options: {
                  type: 'object',
                  description: 'Optional parameters',
                  default: {},
                },
              },
              required: ['eventId'],
            },
          },

          // Atlas Search tools
          {
            name: 'atlas_search_get_all',
            description: 'Get all Atlas Search indexes for a cluster',
            inputSchema: {
              type: 'object',
              properties: {
                clusterName: {
                  type: 'string',
                  description: 'Name of the cluster',
                },
                databaseName: {
                  type: 'string',
                  description: 'Name of the database',
                },
                collectionName: {
                  type: 'string',
                  description: 'Name of the collection',
                },
                options: {
                  type: 'object',
                  description: 'Optional parameters',
                  default: {},
                },
              },
              required: ['clusterName', 'databaseName', 'collectionName'],
            },
          },
          {
            name: 'atlas_search_create',
            description: 'Create a new Atlas Search index',
            inputSchema: {
              type: 'object',
              properties: {
                clusterName: {
                  type: 'string',
                  description: 'Name of the cluster',
                },
                body: {
                  type: 'object',
                  description: 'Search index configuration',
                  properties: {
                    name: { type: 'string' },
                    database: { type: 'string' },
                    collection: { type: 'string' },
                    mappings: { type: 'object' },
                  },
                  required: ['name', 'database', 'collection'],
                },
                options: {
                  type: 'object',
                  description: 'Optional parameters',
                  default: {},
                },
              },
              required: ['clusterName', 'body'],
            },
          },
        ],
      };
    });

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      if (!this.atlasClient) {
        throw new Error('MongoDB Atlas client not configured. Please set MONGODB_ATLAS_PUBLIC_KEY, MONGODB_ATLAS_PRIVATE_KEY, and MONGODB_ATLAS_PROJECT_ID environment variables.');
      }

      try {
        let result;

        switch (name) {
          // User operations
          case 'user_get':
            result = await this.atlasClient.user.get(args.username, args.options || {});
            break;
          case 'user_get_all':
            result = await this.atlasClient.user.getAll(args.options || {});
            break;
          case 'user_create':
            result = await this.atlasClient.user.create(args.body, args.options || {});
            break;
          case 'user_update':
            result = await this.atlasClient.user.update(args.username, args.body, args.options || {});
            break;
          case 'user_delete':
            result = await this.atlasClient.user.delete(args.username, args.options || {});
            break;

          // Cluster operations
          case 'cluster_get':
            result = await this.atlasClient.cluster.get(args.clustername, args.options || {});
            break;
          case 'cluster_get_all':
            result = await this.atlasClient.cluster.getAll(args.options || {});
            break;
          case 'cluster_create':
            result = await this.atlasClient.cluster.create(args.body, args.options || {});
            break;
          case 'cluster_update':
            result = await this.atlasClient.cluster.update(args.clustername, args.body, args.options || {});
            break;
          case 'cluster_delete':
            result = await this.atlasClient.cluster.delete(args.clustername, args.options || {});
            break;

          // Project operations
          case 'project_get_by_id':
            result = await this.atlasClient.project.getById(args.projectId, args.options || {});
            break;
          case 'project_get_by_name':
            result = await this.atlasClient.project.getByName(args.projectName, args.options || {});
            break;
          case 'project_get_all':
            result = await this.atlasClient.project.getAll(args.options || {});
            break;
          case 'project_create':
            result = await this.atlasClient.project.create(args.body, args.options || {});
            break;

          // Cloud Backup operations
          case 'cloud_backup_get_snapshots':
            result = await this.atlasClient.cloudBackup.getAllReplicaSetCloudBackups(args.clustername, args.options || {});
            break;
          case 'cloud_backup_get_snapshot':
            result = await this.atlasClient.cloudBackup.getReplicaSetCloudBackup(args.clustername, args.snapshotId, args.options || {});
            break;

          // Organization operations
          case 'organization_get_by_id':
            result = await this.atlasClient.organization.getById(args.organizationId, args.options || {});
            break;
          case 'organization_get_all':
            result = await this.atlasClient.organization.getAll(args.options || {});
            break;

          // Project Access List operations
          case 'project_access_list_get_all':
            result = await this.atlasClient.projectAccesslist.getAll(args.options || {});
            break;
          case 'project_access_list_create':
            result = await this.atlasClient.projectAccesslist.create(args.body, args.options || {});
            break;

          // Events operations
          case 'events_get_all':
            result = await this.atlasClient.event.getAll(args.options || {});
            break;
          case 'events_get':
            result = await this.atlasClient.event.get(args.eventId, args.options || {});
            break;

          // Atlas Search operations
          case 'atlas_search_get_all':
            result = await this.atlasClient.atlasSearch.getAll(args.clusterName, args.databaseName, args.collectionName, args.options || {});
            break;
          case 'atlas_search_create':
            result = await this.atlasClient.atlasSearch.create(args.clusterName, args.body, args.options || {});
            break;

          default:
            throw new Error(`Unknown tool: ${name}`);
        }

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      } catch (error) {
        throw new Error(`MongoDB Atlas API error: ${error.message}`);
      }
    });
  }

  async run() {
    // Initialize MongoDB Atlas client
    const publicKey = process.env.MONGODB_ATLAS_PUBLIC_KEY;
    const privateKey = process.env.MONGODB_ATLAS_PRIVATE_KEY;
    const projectId = process.env.MONGODB_ATLAS_PROJECT_ID;
    const baseUrl = process.env.MONGODB_ATLAS_BASE_URL || 'https://cloud.mongodb.com/api/atlas/v1.0';

    if (!publicKey || !privateKey || !projectId) {
      console.error('Error: Missing required environment variables:');
      console.error('- MONGODB_ATLAS_PUBLIC_KEY');
      console.error('- MONGODB_ATLAS_PRIVATE_KEY');
      console.error('- MONGODB_ATLAS_PROJECT_ID');
      console.error('Optional:');
      console.error('- MONGODB_ATLAS_BASE_URL (defaults to https://cloud.mongodb.com/api/atlas/v1.0)');
      process.exit(1);
    }

    this.atlasClient = getClient({
      publicKey,
      privateKey,
      baseUrl,
      projectId,
    });

    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('MongoDB Atlas MCP Server running on stdio');
  }
}

const server = new MongoDBAtlasMCPServer();
server.run().catch(console.error);

module.exports = { MongoDBAtlasMCPServer };
