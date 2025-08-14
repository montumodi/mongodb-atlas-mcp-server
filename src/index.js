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
        version: '1.5.0',
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

          // Cluster advanced tools
          {
            name: 'cluster_get_advanced_configuration',
            description: 'Get advanced configuration (processArgs) for a cluster',
            inputSchema: {
              type: 'object',
              properties: {
                clustername: { type: 'string', description: 'Name of the cluster' },
                options: { type: 'object', description: 'Optional parameters', default: {} },
              },
              required: ['clustername'],
            },
          },
          {
            name: 'cluster_update_advanced_configuration',
            description: 'Update advanced configuration (processArgs) for a cluster',
            inputSchema: {
              type: 'object',
              properties: {
                clustername: { type: 'string', description: 'Name of the cluster' },
                body: { type: 'object', description: 'Partial advanced configuration document' },
                options: { type: 'object', description: 'Optional parameters', default: {} },
              },
              required: ['clustername', 'body'],
            },
          },
          {
            name: 'cluster_test_primary_failover',
            description: 'Initiate a test primary failover for the cluster',
            inputSchema: {
              type: 'object',
              properties: {
                clustername: { type: 'string', description: 'Name of the cluster' },
                options: { type: 'object', description: 'Optional parameters', default: {} },
              },
              required: ['clustername'],
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
          {
            name: 'cloud_backup_get_restore_job',
            description: 'Get a specific snapshot restore job for a cluster',
            inputSchema: {
              type: 'object',
              properties: {
                clustername: { type: 'string', description: 'Name of the cluster' },
                jobId: { type: 'string', description: 'ID of the snapshot restore job' },
                options: { type: 'object', description: 'Optional parameters', default: {} },
              },
              required: ['clustername', 'jobId'],
            },
          },
          {
            name: 'cloud_backup_create_restore_job',
            description: 'Create a snapshot restore job for a cluster',
            inputSchema: {
              type: 'object',
              properties: {
                clustername: { type: 'string', description: 'Name of the cluster' },
                body: { type: 'object', description: 'Restore job configuration (snapshotId, target info, etc.)' },
                options: { type: 'object', description: 'Optional parameters', default: {} },
              },
              required: ['clustername', 'body'],
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
          {
            name: 'organization_get_users',
            description: 'Get all users for an organization',
            inputSchema: {
              type: 'object',
              properties: {
                organizationId: { type: 'string', description: 'Organization ID' },
                options: { type: 'object', description: 'Optional parameters', default: {} },
              },
              required: ['organizationId'],
            },
          },
          {
            name: 'organization_get_projects',
            description: 'Get all projects for an organization',
            inputSchema: {
              type: 'object',
              properties: {
                organizationId: { type: 'string', description: 'Organization ID' },
                options: { type: 'object', description: 'Optional parameters', default: {} },
              },
              required: ['organizationId'],
            },
          },
          {
            name: 'organization_delete',
            description: 'Delete an organization',
            inputSchema: {
              type: 'object',
              properties: {
                organizationId: { type: 'string', description: 'Organization ID' },
                options: { type: 'object', description: 'Optional parameters', default: {} },
              },
              required: ['organizationId'],
            },
          },
          {
            name: 'organization_rename',
            description: 'Rename an organization',
            inputSchema: {
              type: 'object',
              properties: {
                organizationId: { type: 'string', description: 'Organization ID' },
                body: { type: 'object', description: 'Rename payload (e.g., { name })' },
                options: { type: 'object', description: 'Optional parameters', default: {} },
              },
              required: ['organizationId', 'body'],
            },
          },
          {
            name: 'organization_invite',
            description: 'Invite users to an organization',
            inputSchema: {
              type: 'object',
              properties: {
                organizationId: { type: 'string', description: 'Organization ID' },
                body: { type: 'object', description: 'Invitation details' },
                options: { type: 'object', description: 'Optional parameters', default: {} },
              },
              required: ['organizationId', 'body'],
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
          {
            name: 'project_access_list_get',
            description: 'Get a specific access list entry for the project',
            inputSchema: {
              type: 'object',
              properties: {
                accesslistentry: { type: 'string', description: 'IP address or CIDR block entry' },
                options: { type: 'object', description: 'Optional parameters', default: {} },
              },
              required: ['accesslistentry'],
            },
          },
          {
            name: 'project_access_list_delete',
            description: 'Delete an IP access list entry from the project',
            inputSchema: {
              type: 'object',
              properties: {
                accesslistentry: { type: 'string', description: 'IP address or CIDR block entry' },
                options: { type: 'object', description: 'Optional parameters', default: {} },
              },
              required: ['accesslistentry'],
            },
          },
          {
            name: 'project_access_list_update',
            description: 'Update IP access list entries for the project (POST semantics)',
            inputSchema: {
              type: 'object',
              properties: {
                body: {
                  type: 'array',
                  description: 'Array of IP access list entries to upsert',
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
                options: { type: 'object', description: 'Optional parameters', default: {} },
              },
              required: ['body'],
            },
          },

          // Project Whitelist tools (legacy)
          {
            name: 'project_whitelist_get_all',
            description: 'Get all IP whitelist entries for the project (legacy)',
            inputSchema: { type: 'object', properties: { options: { type: 'object', description: 'Optional parameters', default: {} } } },
          },
          {
            name: 'project_whitelist_get',
            description: 'Get a specific IP whitelist entry for the project (legacy)',
            inputSchema: { type: 'object', properties: { whitelistentry: { type: 'string', description: 'IP or CIDR' }, options: { type: 'object', description: 'Optional parameters', default: {} } }, required: ['whitelistentry'] },
          },
          {
            name: 'project_whitelist_create',
            description: 'Add IP addresses to the whitelist (legacy)',
            inputSchema: { type: 'object', properties: { body: { type: 'array', minItems: 1, items: { type: 'object', properties: { ipAddress: { type: 'string' }, cidrBlock: { type: 'string' }, comment: { type: 'string' } }, required: ['ipAddress'] } }, options: { type: 'object', description: 'Optional parameters', default: {} } }, required: ['body'] },
          },
          {
            name: 'project_whitelist_update',
            description: 'Update project whitelist entries (legacy)',
            inputSchema: { type: 'object', properties: { body: { type: 'array', minItems: 1, items: { type: 'object', properties: { ipAddress: { type: 'string' }, cidrBlock: { type: 'string' }, comment: { type: 'string' } }, required: ['ipAddress'] } }, options: { type: 'object', description: 'Optional parameters', default: {} } }, required: ['body'] },
          },
          {
            name: 'project_whitelist_delete',
            description: 'Delete an IP whitelist entry from the project (legacy)',
            inputSchema: { type: 'object', properties: { whitelistentry: { type: 'string', description: 'IP or CIDR' }, options: { type: 'object', description: 'Optional parameters', default: {} } }, required: ['whitelistentry'] },
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
          {
            name: 'events_get_by_org',
            description: 'Get an event by ID for a specific organization',
            inputSchema: {
              type: 'object',
              properties: {
                organizationId: { type: 'string', description: 'Organization ID' },
                eventId: { type: 'string', description: 'Event ID' },
                options: { type: 'object', description: 'Optional parameters', default: {} },
              },
              required: ['organizationId', 'eventId'],
            },
          },
          {
            name: 'events_get_all_by_org',
            description: 'Get all events for a specific organization',
            inputSchema: {
              type: 'object',
              properties: {
                organizationId: { type: 'string', description: 'Organization ID' },
                options: { type: 'object', description: 'Optional parameters', default: {} },
              },
              required: ['organizationId'],
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
          {
            name: 'atlas_search_get',
            description: 'Get details for a specific Atlas Search index',
            inputSchema: {
              type: 'object',
              properties: {
                clusterName: { type: 'string', description: 'Name of the cluster' },
                indexId: { type: 'string', description: 'Search index ID' },
                options: { type: 'object', description: 'Optional parameters', default: {} },
              },
              required: ['clusterName', 'indexId'],
            },
          },
          {
            name: 'atlas_search_update',
            description: 'Update an Atlas Search index',
            inputSchema: {
              type: 'object',
              properties: {
                clusterName: { type: 'string' },
                indexId: { type: 'string' },
                body: { type: 'object', description: 'Partial index definition' },
                options: { type: 'object', description: 'Optional parameters', default: {} },
              },
              required: ['clusterName', 'indexId', 'body'],
            },
          },
          {
            name: 'atlas_search_delete',
            description: 'Delete an Atlas Search index',
            inputSchema: {
              type: 'object',
              properties: {
                clusterName: { type: 'string' },
                indexId: { type: 'string' },
                options: { type: 'object', description: 'Optional parameters', default: {} },
              },
              required: ['clusterName', 'indexId'],
            },
          },
          {
            name: 'atlas_search_get_all_analyzers',
            description: 'Get all Atlas Search analyzers for a cluster',
            inputSchema: {
              type: 'object',
              properties: {
                clusterName: { type: 'string' },
                options: { type: 'object', description: 'Optional parameters', default: {} },
              },
              required: ['clusterName'],
            },
          },
          {
            name: 'atlas_search_upsert_analyzer',
            description: 'Create or update Atlas Search analyzers for a cluster',
            inputSchema: {
              type: 'object',
              properties: {
                clusterName: { type: 'string' },
                body: { type: 'object', description: 'Analyzer definition(s)' },
                options: { type: 'object', description: 'Optional parameters', default: {} },
              },
              required: ['clusterName', 'body'],
            },
          },

          // Atlas User tools
          {
            name: 'atlas_user_get_by_name',
            description: 'Get Atlas user by username',
            inputSchema: { type: 'object', properties: { username: { type: 'string' }, options: { type: 'object', description: 'Optional parameters', default: {} } }, required: ['username'] },
          },
          {
            name: 'atlas_user_get_by_id',
            description: 'Get Atlas user by ID',
            inputSchema: { type: 'object', properties: { userId: { type: 'string' }, options: { type: 'object', description: 'Optional parameters', default: {} } }, required: ['userId'] },
          },
          {
            name: 'atlas_user_get_all',
            description: 'Get all Atlas users for the project',
            inputSchema: { type: 'object', properties: { options: { type: 'object', description: 'Optional parameters', default: {} } } },
          },
          {
            name: 'atlas_user_update',
            description: 'Update an Atlas user by ID',
            inputSchema: { type: 'object', properties: { userId: { type: 'string' }, body: { type: 'object' }, options: { type: 'object', description: 'Optional parameters', default: {} } }, required: ['userId', 'body'] },
          },
          {
            name: 'atlas_user_create',
            description: 'Create an Atlas user',
            inputSchema: { type: 'object', properties: { body: { type: 'object' }, options: { type: 'object', description: 'Optional parameters', default: {} } }, required: ['body'] },
          },

          // Alert tools
          {
            name: 'alert_get_all',
            description: 'Get all alerts for the project',
            inputSchema: { type: 'object', properties: { options: { type: 'object', description: 'Optional parameters', default: {} } } },
          },
          {
            name: 'alert_get',
            description: 'Get an alert by ID',
            inputSchema: { type: 'object', properties: { alertId: { type: 'string' }, options: { type: 'object', description: 'Optional parameters', default: {} } }, required: ['alertId'] },
          },
          {
            name: 'alert_acknowledge',
            description: 'Acknowledge an alert',
            inputSchema: { type: 'object', properties: { alertId: { type: 'string' }, body: { type: 'object' }, options: { type: 'object', description: 'Optional parameters', default: {} } }, required: ['alertId', 'body'] },
          },

          // Data Lake tools
          {
            name: 'datalake_get',
            description: 'Get a Data Lake by name',
            inputSchema: { type: 'object', properties: { dataLakeName: { type: 'string' }, options: { type: 'object', description: 'Optional parameters', default: {} } }, required: ['dataLakeName'] },
          },
          {
            name: 'datalake_get_all',
            description: 'Get all Data Lakes for the project',
            inputSchema: { type: 'object', properties: { options: { type: 'object', description: 'Optional parameters', default: {} } } },
          },
          {
            name: 'datalake_create',
            description: 'Create a Data Lake',
            inputSchema: { type: 'object', properties: { body: { type: 'object' }, options: { type: 'object', description: 'Optional parameters', default: {} } }, required: ['body'] },
          },
          {
            name: 'datalake_update',
            description: 'Update a Data Lake',
            inputSchema: { type: 'object', properties: { dataLakeName: { type: 'string' }, body: { type: 'object' }, options: { type: 'object', description: 'Optional parameters', default: {} } }, required: ['dataLakeName', 'body'] },
          },
          {
            name: 'datalake_delete',
            description: 'Delete a Data Lake',
            inputSchema: { type: 'object', properties: { dataLakeName: { type: 'string' }, options: { type: 'object', description: 'Optional parameters', default: {} } }, required: ['dataLakeName'] },
          },
          {
            name: 'datalake_get_logs_stream',
            description: 'Get query logs (gzipped) for a Data Lake as base64-encoded gzip data',
            inputSchema: { type: 'object', properties: { dataLakeName: { type: 'string' }, options: { type: 'object', description: 'Optional parameters', default: {} } }, required: ['dataLakeName'] },
          },

          // Cloud Provider Access tools
          {
            name: 'cloud_provider_access_get_all',
            description: 'Get all cloud provider access roles for the project',
            inputSchema: { type: 'object', properties: { options: { type: 'object', description: 'Optional parameters', default: {} } } },
          },
          {
            name: 'cloud_provider_access_create',
            description: 'Create a cloud provider access role',
            inputSchema: { type: 'object', properties: { body: { type: 'object' }, options: { type: 'object', description: 'Optional parameters', default: {} } }, required: ['body'] },
          },
          {
            name: 'cloud_provider_access_update',
            description: 'Update a cloud provider access role',
            inputSchema: { type: 'object', properties: { roleId: { type: 'string' }, body: { type: 'object' }, options: { type: 'object', description: 'Optional parameters', default: {} } }, required: ['roleId', 'body'] },
          },
          {
            name: 'cloud_provider_access_delete',
            description: 'Delete a cloud provider access role',
            inputSchema: { type: 'object', properties: { cloudProvider: { type: 'string', description: 'Cloud provider (e.g., AWS)' }, roleId: { type: 'string' }, options: { type: 'object', description: 'Optional parameters', default: {} } }, required: ['cloudProvider', 'roleId'] },
          },

          // Custom DB Role tools
          {
            name: 'custom_db_role_get',
            description: 'Get a custom database role by name',
            inputSchema: { type: 'object', properties: { rolename: { type: 'string' }, options: { type: 'object', description: 'Optional parameters', default: {} } }, required: ['rolename'] },
          },
          {
            name: 'custom_db_role_get_all',
            description: 'Get all custom database roles',
            inputSchema: { type: 'object', properties: { options: { type: 'object', description: 'Optional parameters', default: {} } } },
          },
          {
            name: 'custom_db_role_create',
            description: 'Create a custom database role',
            inputSchema: { type: 'object', properties: { body: { type: 'object' }, options: { type: 'object', description: 'Optional parameters', default: {} } }, required: ['body'] },
          },
          {
            name: 'custom_db_role_update',
            description: 'Update a custom database role',
            inputSchema: { type: 'object', properties: { rolename: { type: 'string' }, body: { type: 'object' }, options: { type: 'object', description: 'Optional parameters', default: {} } }, required: ['rolename', 'body'] },
          },
          {
            name: 'custom_db_role_delete',
            description: 'Delete a custom database role',
            inputSchema: { type: 'object', properties: { rolename: { type: 'string' }, options: { type: 'object', description: 'Optional parameters', default: {} } }, required: ['rolename'] },
          },

          // Project extra tools
          {
            name: 'project_get_teams',
            description: 'Get all teams for a given project ID',
            inputSchema: { type: 'object', properties: { projectId: { type: 'string' }, options: { type: 'object', description: 'Optional parameters', default: {} } }, required: ['projectId'] },
          },
          {
            name: 'project_delete',
            description: 'Delete a project by ID',
            inputSchema: { type: 'object', properties: { projectId: { type: 'string' }, options: { type: 'object', description: 'Optional parameters', default: {} } }, required: ['projectId'] },
          },
          {
            name: 'project_remove_user',
            description: 'Remove a user from a project',
            inputSchema: { type: 'object', properties: { projectId: { type: 'string' }, userId: { type: 'string' }, options: { type: 'object', description: 'Optional parameters', default: {} } }, required: ['projectId', 'userId'] },
          },
          {
            name: 'project_assign_teams',
            description: 'Assign teams to a project',
            inputSchema: { type: 'object', properties: { projectId: { type: 'string' }, body: { type: 'object' }, options: { type: 'object', description: 'Optional parameters', default: {} } }, required: ['projectId', 'body'] },
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
          case 'cluster_get_advanced_configuration':
            result = await this.atlasClient.cluster.getAdvanceConfiguration(args.clustername, args.options || {});
            break;
          case 'cluster_update_advanced_configuration':
            result = await this.atlasClient.cluster.updateAdvanceConfiguration(args.clustername, args.body, args.options || {});
            break;
          case 'cluster_test_primary_failover':
            result = await this.atlasClient.cluster.testPrimaryFailOver(args.clustername, args.options || {});
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
          case 'cloud_backup_get_restore_job':
            result = await this.atlasClient.cloudBackup.getSnapshotRestoreJob(args.clustername, args.jobId, args.options || {});
            break;
          case 'cloud_backup_create_restore_job':
            result = await this.atlasClient.cloudBackup.createSnapshotRestoreJob(args.clustername, args.body, args.options || {});
            break;

          // Organization operations
          case 'organization_get_by_id':
            result = await this.atlasClient.organization.getById(args.organizationId, args.options || {});
            break;
          case 'organization_get_all':
            result = await this.atlasClient.organization.getAll(args.options || {});
            break;
          case 'organization_get_users':
            result = await this.atlasClient.organization.getAllUsersForOrganization(args.organizationId, args.options || {});
            break;
          case 'organization_get_projects':
            result = await this.atlasClient.organization.getAllProjectsForOrganization(args.organizationId, args.options || {});
            break;
          case 'organization_delete':
            result = await this.atlasClient.organization.delete(args.organizationId, args.options || {});
            break;
          case 'organization_rename':
            result = await this.atlasClient.organization.rename(args.organizationId, args.body, args.options || {});
            break;
          case 'organization_invite':
            result = await this.atlasClient.organization.invite(args.organizationId, args.body, args.options || {});
            break;

          // Project Access List operations
          case 'project_access_list_get_all':
            result = await this.atlasClient.projectAccesslist.getAll(args.options || {});
            break;
          case 'project_access_list_create':
            result = await this.atlasClient.projectAccesslist.create(args.body, args.options || {});
            break;
          case 'project_access_list_get':
            result = await this.atlasClient.projectAccesslist.get(args.accesslistentry, args.options || {});
            break;
          case 'project_access_list_delete':
            result = await this.atlasClient.projectAccesslist.delete(args.accesslistentry, args.options || {});
            break;
          case 'project_access_list_update':
            result = await this.atlasClient.projectAccesslist.update(args.body, args.options || {});
            break;

          // Project Whitelist operations (legacy)
          case 'project_whitelist_get_all':
            result = await this.atlasClient.projectWhitelist.getAll(args.options || {});
            break;
          case 'project_whitelist_get':
            result = await this.atlasClient.projectWhitelist.get(args.whitelistentry, args.options || {});
            break;
          case 'project_whitelist_create':
            result = await this.atlasClient.projectWhitelist.create(args.body, args.options || {});
            break;
          case 'project_whitelist_update':
            result = await this.atlasClient.projectWhitelist.update(args.body, args.options || {});
            break;
          case 'project_whitelist_delete':
            result = await this.atlasClient.projectWhitelist.delete(args.whitelistentry, args.options || {});
            break;

          // Events operations
          case 'events_get_all':
            result = await this.atlasClient.event.getAll(args.options || {});
            break;
          case 'events_get':
            result = await this.atlasClient.event.get(args.eventId, args.options || {});
            break;
          case 'events_get_by_org':
            result = await this.atlasClient.event.getByOrganizationId(args.organizationId, args.eventId, args.options || {});
            break;
          case 'events_get_all_by_org':
            result = await this.atlasClient.event.getAllByOrganizationId(args.organizationId, args.options || {});
            break;

          // Atlas Search operations
          case 'atlas_search_get_all':
            result = await this.atlasClient.atlasSearch.getAll(args.clusterName, args.databaseName, args.collectionName, args.options || {});
            break;
          case 'atlas_search_create':
            result = await this.atlasClient.atlasSearch.create(args.clusterName, args.body, args.options || {});
            break;
          case 'atlas_search_get':
            result = await this.atlasClient.atlasSearch.get(args.clusterName, args.indexId, args.options || {});
            break;
          case 'atlas_search_update':
            result = await this.atlasClient.atlasSearch.update(args.clusterName, args.indexId, args.body, args.options || {});
            break;
          case 'atlas_search_delete':
            result = await this.atlasClient.atlasSearch.delete(args.clusterName, args.indexId, args.options || {});
            break;
          case 'atlas_search_get_all_analyzers':
            result = await this.atlasClient.atlasSearch.getAllAnalyzers(args.clusterName, args.options || {});
            break;
          case 'atlas_search_upsert_analyzer':
            result = await this.atlasClient.atlasSearch.upsertAnalyzer(args.clusterName, args.body, args.options || {});
            break;

          // Atlas User operations
          case 'atlas_user_get_by_name':
            result = await this.atlasClient.atlasUser.getByName(args.username, args.options || {});
            break;
          case 'atlas_user_get_by_id':
            result = await this.atlasClient.atlasUser.getById(args.userId, args.options || {});
            break;
          case 'atlas_user_get_all':
            result = await this.atlasClient.atlasUser.getAll(args.options || {});
            break;
          case 'atlas_user_update':
            result = await this.atlasClient.atlasUser.update(args.userId, args.body, args.options || {});
            break;
          case 'atlas_user_create':
            result = await this.atlasClient.atlasUser.create(args.body, args.options || {});
            break;

          // Alert operations
          case 'alert_get_all':
            result = await this.atlasClient.alert.getAll(args.options || {});
            break;
          case 'alert_get':
            result = await this.atlasClient.alert.get(args.alertId, args.options || {});
            break;
          case 'alert_acknowledge':
            result = await this.atlasClient.alert.acknowledge(args.alertId, args.body, args.options || {});
            break;

          // Data Lake operations
          case 'datalake_get':
            result = await this.atlasClient.dataLake.get(args.dataLakeName, args.options || {});
            break;
          case 'datalake_get_all':
            result = await this.atlasClient.dataLake.getAll(args.options || {});
            break;
          case 'datalake_create':
            result = await this.atlasClient.dataLake.create(args.body, args.options || {});
            break;
          case 'datalake_update':
            result = await this.atlasClient.dataLake.update(args.dataLakeName, args.body, args.options || {});
            break;
          case 'datalake_delete':
            result = await this.atlasClient.dataLake.delete(args.dataLakeName, args.options || {});
            break;
          case 'datalake_get_logs_stream': {
            // Convert gzipped stream to base64 to transport as text
            const stream = await this.atlasClient.dataLake.getLogsStream(args.dataLakeName, args.options || {});
            const chunks = [];
            await new Promise((resolve, reject) => {
              stream.on('data', (chunk) => chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)));
              stream.on('end', resolve);
              stream.on('error', reject);
            });
            result = { data: Buffer.concat(chunks).toString('base64'), encoding: 'base64', contentEncoding: 'gzip' };
            break;
          }

          // Cloud Provider Access operations
          case 'cloud_provider_access_get_all':
            result = await this.atlasClient.cloudProviderAccess.getAll(args.options || {});
            break;
          case 'cloud_provider_access_create':
            result = await this.atlasClient.cloudProviderAccess.create(args.body, args.options || {});
            break;
          case 'cloud_provider_access_update':
            result = await this.atlasClient.cloudProviderAccess.update(args.roleId, args.body, args.options || {});
            break;
          case 'cloud_provider_access_delete':
            result = await this.atlasClient.cloudProviderAccess.delete(args.cloudProvider, args.roleId, args.options || {});
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
