const { describe, test, expect, beforeEach, afterEach } = require('@jest/globals');
const fs = require('fs');
const path = require('path');

describe('MongoDBAtlasMCPServer Integration Tests', () => {
  let sourceCode;

  beforeEach(() => {
    sourceCode = fs.readFileSync(path.join(__dirname, '../../src/index.js'), 'utf8');
  });

  describe('Complete Server Lifecycle', () => {
    const pkg = require('../../package.json');
    test('should have proper server initialization structure', () => {
      expect(sourceCode).toContain('class MongoDBAtlasMCPServer');
      expect(sourceCode).toContain('constructor()');
      expect(sourceCode).toContain('new Server(');
  expect(sourceCode).toContain('name: \'mongodb-atlas-mcp-server\'');
  expect(sourceCode).toContain(`version: '${pkg.version}'`);
      expect(sourceCode).toContain('capabilities: {');
      expect(sourceCode).toContain('tools: {}');
    });

    test('should have proper setup tool handlers method', () => {
      expect(sourceCode).toContain('setupToolHandlers()');
      expect(sourceCode).toContain('this.server.setRequestHandler(ListToolsRequestSchema');
      expect(sourceCode).toContain('this.server.setRequestHandler(CallToolRequestSchema');
    });

    test('should have run method with environment validation', () => {
      expect(sourceCode).toContain('async run()');
      expect(sourceCode).toContain('process.env.MONGODB_ATLAS_PUBLIC_KEY');
      expect(sourceCode).toContain('process.env.MONGODB_ATLAS_PRIVATE_KEY');
      expect(sourceCode).toContain('process.env.MONGODB_ATLAS_PROJECT_ID');
      expect(sourceCode).toContain('process.env.MONGODB_ATLAS_BASE_URL');
    });
  });

  describe('Tool Schema Validation', () => {
    test('should have complete tool definitions with all required properties', () => {
      // Count tool definitions by looking for tool object patterns
      const toolDefinitionPattern = /{\s*name: '[^']+',\s*description:/g;
      const toolMatches = sourceCode.match(toolDefinitionPattern);
      const toolCount = toolMatches ? toolMatches.length : 0;

      // Count inputSchema occurrences in the source code
      const inputSchemaCount = (sourceCode.match(/inputSchema:/g) || []).length;

      expect(toolCount).toBe(24); // 24 tools
      expect(inputSchemaCount).toBe(24); // Each should have inputSchema
      
      // Verify that we have all the expected tool types
      expect(sourceCode).toContain('name: \'user_get\'');
      expect(sourceCode).toContain('name: \'cluster_get\'');
      expect(sourceCode).toContain('name: \'project_get_by_id\'');
      expect(sourceCode).toContain('name: \'cloud_backup_get_snapshots\'');
      expect(sourceCode).toContain('name: \'organization_get_by_id\'');
      expect(sourceCode).toContain('name: \'project_access_list_get_all\'');
      expect(sourceCode).toContain('name: \'events_get_all\'');
      expect(sourceCode).toContain('name: \'atlas_search_get_all\'');
    });

    test('should have proper schema structure for user tools', () => {
      expect(sourceCode).toContain('name: \'user_create\'');
      expect(sourceCode).toContain('username: { type: \'string\' }');
      expect(sourceCode).toContain('password: { type: \'string\' }');
      expect(sourceCode).toContain('roles: {');
      expect(sourceCode).toContain('required: [\'username\', \'password\', \'roles\']');
    });

    test('should have proper schema structure for cluster tools', () => {
      expect(sourceCode).toContain('name: \'cluster_create\'');
      expect(sourceCode).toContain('clustername:');
      expect(sourceCode).toContain('name: { type: \'string\' }');
      expect(sourceCode).toContain('clusterType: { type: \'string\' }');
      expect(sourceCode).toContain('providerSettings: { type: \'object\' }');
    });
  });

  describe('End-to-End Tool Execution Workflows', () => {
    test('should have comprehensive user management workflow structure', () => {
      const userCases = [
        'case \'user_get\':',
        'case \'user_get_all\':',
        'case \'user_create\':',
        'case \'user_update\':',
        'case \'user_delete\':'
      ];

      userCases.forEach(userCase => {
        expect(sourceCode).toContain(userCase);
      });

      // Should use proper Atlas client methods
      expect(sourceCode).toContain('this.atlasClient.user.get(');
      expect(sourceCode).toContain('this.atlasClient.user.getAll(');
      expect(sourceCode).toContain('this.atlasClient.user.create(');
      expect(sourceCode).toContain('this.atlasClient.user.update(');
      expect(sourceCode).toContain('this.atlasClient.user.delete(');
    });

    test('should have comprehensive cluster management workflow structure', () => {
      const clusterCases = [
        'case \'cluster_get\':',
        'case \'cluster_get_all\':',
        'case \'cluster_create\':',
        'case \'cluster_update\':',
        'case \'cluster_delete\':'
      ];

      clusterCases.forEach(clusterCase => {
        expect(sourceCode).toContain(clusterCase);
      });

      // Should use proper Atlas client methods
      expect(sourceCode).toContain('this.atlasClient.cluster.get(');
      expect(sourceCode).toContain('this.atlasClient.cluster.getAll(');
      expect(sourceCode).toContain('this.atlasClient.cluster.create(');
      expect(sourceCode).toContain('this.atlasClient.cluster.update(');
      expect(sourceCode).toContain('this.atlasClient.cluster.delete(');
    });

    test('should handle parameter passing correctly', () => {
      // Check parameter handling patterns
      expect(sourceCode).toContain('args.username');
      expect(sourceCode).toContain('args.clustername');
      expect(sourceCode).toContain('args.body');
      expect(sourceCode).toContain('args.options || {}');
    });
  });

  describe('Error Handling Integration', () => {
    test('should have comprehensive error handling structure', () => {
      expect(sourceCode).toContain('try {');
      expect(sourceCode).toContain('} catch (error) {');
      expect(sourceCode).toContain('throw new Error(`MongoDB Atlas API error: ${error.message}`);');
    });

    test('should handle client configuration errors', () => {
      expect(sourceCode).toContain('if (!this.atlasClient)');
      expect(sourceCode).toContain('MongoDB Atlas client not configured');
    });

    test('should handle unknown tools', () => {
      expect(sourceCode).toContain('default:');
      expect(sourceCode).toContain('throw new Error(`Unknown tool: ${name}`);');
    });

    test('should handle environment variable validation', () => {
      expect(sourceCode).toContain('if (!publicKey || !privateKey || !projectId)');
      expect(sourceCode).toContain('console.error(\'Error: Missing required environment variables:\')');
      expect(sourceCode).toContain('process.exit(1)');
    });
  });

  describe('Response Format Validation', () => {
    test('should return proper response format', () => {
      expect(sourceCode).toContain('return {');
      expect(sourceCode).toContain('content: [');
      expect(sourceCode).toContain('type: \'text\'');
      expect(sourceCode).toContain('JSON.stringify(result, null, 2)');
    });
  });

  describe('Server Transport and Connection', () => {
    test('should have proper transport setup', () => {
      expect(sourceCode).toContain('new StdioServerTransport()');
      expect(sourceCode).toContain('await this.server.connect(transport)');
      expect(sourceCode).toContain('console.error(\'MongoDB Atlas MCP Server running on stdio\')');
    });

    test('should handle Atlas client initialization', () => {
      expect(sourceCode).toContain('this.atlasClient = getClient({');
      expect(sourceCode).toContain('publicKey,');
      expect(sourceCode).toContain('privateKey,');
      expect(sourceCode).toContain('baseUrl,');
      expect(sourceCode).toContain('projectId,');
    });
  });

  describe('Module Export and Server Instantiation', () => {
    test('should have proper module export', () => {
      expect(sourceCode).toContain('module.exports = { MongoDBAtlasMCPServer }');
    });

    test('should instantiate and run server', () => {
      expect(sourceCode).toContain('const server = new MongoDBAtlasMCPServer()');
      expect(sourceCode).toContain('server.run().catch(console.error)');
    });

    test('should be executable as a script', () => {
      expect(sourceCode).toContain('#!/usr/bin/env node');
    });
  });
});
