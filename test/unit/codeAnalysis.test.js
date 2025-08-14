const { describe, test, expect, beforeEach, afterEach } = require('@jest/globals');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

describe('MongoDB Atlas MCP Server - Code Analysis Tests', () => {
  let sourceCode;

  beforeAll(() => {
    // Read the source code for static analysis
    sourceCode = fs.readFileSync(path.join(__dirname, '../../src/index.js'), 'utf8');
  });

  describe('Tool Definitions Analysis', () => {
    test('should define all expected user tools', () => {
      const userTools = [
        'user_get',
        'user_get_all', 
        'user_create',
        'user_update',
        'user_delete'
      ];

      userTools.forEach(tool => {
        expect(sourceCode).toContain(`name: '${tool}'`);
      });
    });

    test('should define all expected cluster tools', () => {
      const clusterTools = [
        'cluster_get',
        'cluster_get_all',
        'cluster_create', 
        'cluster_update',
        'cluster_delete'
      ];

      clusterTools.forEach(tool => {
        expect(sourceCode).toContain(`name: '${tool}'`);
      });
    });

    test('should define all expected project tools', () => {
      const projectTools = [
        'project_get_by_id',
        'project_get_by_name',
        'project_get_all',
        'project_create'
      ];

      projectTools.forEach(tool => {
        expect(sourceCode).toContain(`name: '${tool}'`);
      });
    });

    test('should define all expected cloud backup tools', () => {
      const backupTools = [
        'cloud_backup_get_snapshots',
        'cloud_backup_get_snapshot'
      ];

      backupTools.forEach(tool => {
        expect(sourceCode).toContain(`name: '${tool}'`);
      });
    });

    test('should define all expected organization tools', () => {
      const orgTools = [
        'organization_get_by_id',
        'organization_get_all'
      ];

      orgTools.forEach(tool => {
        expect(sourceCode).toContain(`name: '${tool}'`);
      });
    });

    test('should define all expected access list tools', () => {
      const accessListTools = [
        'project_access_list_get_all',
        'project_access_list_create'
      ];

      accessListTools.forEach(tool => {
        expect(sourceCode).toContain(`name: '${tool}'`);
      });
    });

    test('should define all expected event tools', () => {
      const eventTools = [
        'events_get_all',
        'events_get'
      ];

      eventTools.forEach(tool => {
        expect(sourceCode).toContain(`name: '${tool}'`);
      });
    });

    test('should define all expected atlas search tools', () => {
      const searchTools = [
        'atlas_search_get_all',
        'atlas_search_create'
      ];

      searchTools.forEach(tool => {
        expect(sourceCode).toContain(`name: '${tool}'`);
      });
    });
  });

  describe('Tool Implementation Analysis', () => {
    test('should implement all user tool cases in switch statement', () => {
      const userCases = [
        "case 'user_get':",
        "case 'user_get_all':",
        "case 'user_create':",
        "case 'user_update':",
        "case 'user_delete':"
      ];

      userCases.forEach(caseStmt => {
        expect(sourceCode).toContain(caseStmt);
      });
    });

    test('should implement all cluster tool cases in switch statement', () => {
      const clusterCases = [
        "case 'cluster_get':",
        "case 'cluster_get_all':",
        "case 'cluster_create':",
        "case 'cluster_update':",
        "case 'cluster_delete':"
      ];

      clusterCases.forEach(caseStmt => {
        expect(sourceCode).toContain(caseStmt);
      });
    });

    test('should have proper error handling for unknown tools', () => {
      expect(sourceCode).toContain('default:');
      expect(sourceCode).toContain('Unknown tool:');
    });

    test('should have proper error handling for Atlas API errors', () => {
      expect(sourceCode).toContain('try {');
      expect(sourceCode).toContain('} catch (error) {');
      expect(sourceCode).toContain('MongoDB Atlas API error:');
    });
  });

  describe('Configuration and Dependencies Analysis', () => {
    test('should import required dependencies', () => {
      expect(sourceCode).toContain("require('@modelcontextprotocol/sdk/server/index.js')");
      expect(sourceCode).toContain("require('@modelcontextprotocol/sdk/server/stdio.js')");
      expect(sourceCode).toContain("require('@modelcontextprotocol/sdk/types.js')");
      expect(sourceCode).toContain("require('mongodb-atlas-api-client')");
    });

    test('should check for required environment variables', () => {
      expect(sourceCode).toContain('MONGODB_ATLAS_PUBLIC_KEY');
      expect(sourceCode).toContain('MONGODB_ATLAS_PRIVATE_KEY');
      expect(sourceCode).toContain('MONGODB_ATLAS_PROJECT_ID');
      expect(sourceCode).toContain('MONGODB_ATLAS_BASE_URL');
    });

    test('should have proper server configuration', () => {
      expect(sourceCode).toContain('mongodb-atlas-mcp-server');
      expect(sourceCode).toContain('1.1.0');
      expect(sourceCode).toContain('capabilities');
    });
  });

  describe('Schema Validation Analysis', () => {
    test('should define proper input schemas for user tools', () => {
      expect(sourceCode).toContain('inputSchema');
      expect(sourceCode).toContain('username');
      expect(sourceCode).toContain('password');
      expect(sourceCode).toContain('roles');
    });

    test('should define proper input schemas for cluster tools', () => {
      expect(sourceCode).toContain('clustername');
      expect(sourceCode).toContain('clusterName');
    });

    test('should define required fields in schemas', () => {
      expect(sourceCode).toContain('required');
      expect(sourceCode).toContain("'username'");
      expect(sourceCode).toContain("'password'");
      expect(sourceCode).toContain("'roles'");
    });
  });
});
