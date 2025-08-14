const { describe, test, expect, beforeEach, afterEach } = require('@jest/globals');
const fs = require('fs');
const path = require('path');

describe('MongoDBAtlasMCPServer Tool Handlers', () => {
  let sourceCode;

  beforeEach(() => {
    sourceCode = fs.readFileSync(path.join(__dirname, '../../src/index.js'), 'utf8');
  });

  describe('Tool Handler Structure Analysis', () => {
    test('should have switch case handlers for all user operations', () => {
      const userTools = ['user_get', 'user_get_all', 'user_create', 'user_update', 'user_delete'];
      
      userTools.forEach(toolName => {
        expect(sourceCode).toContain(`case '${toolName}':`);
        expect(sourceCode).toContain(`this.atlasClient.user.`);
      });
    });

    test('should have switch case handlers for all cluster operations', () => {
      const clusterTools = ['cluster_get', 'cluster_get_all', 'cluster_create', 'cluster_update', 'cluster_delete'];
      
      clusterTools.forEach(toolName => {
        expect(sourceCode).toContain(`case '${toolName}':`);
      });
      
      // Verify cluster operations use the correct client method
      expect(sourceCode).toContain('this.atlasClient.cluster.get(');
      expect(sourceCode).toContain('this.atlasClient.cluster.getAll(');
      expect(sourceCode).toContain('this.atlasClient.cluster.create(');
      expect(sourceCode).toContain('this.atlasClient.cluster.update(');
      expect(sourceCode).toContain('this.atlasClient.cluster.delete(');
    });

    test('should have switch case handlers for all project operations', () => {
      const projectTools = ['project_get_by_id', 'project_get_by_name', 'project_get_all', 'project_create'];
      
      projectTools.forEach(toolName => {
        expect(sourceCode).toContain(`case '${toolName}':`);
      });

      // Verify project operations use correct methods
      expect(sourceCode).toContain('this.atlasClient.project.getById(');
      expect(sourceCode).toContain('this.atlasClient.project.getByName(');
      expect(sourceCode).toContain('this.atlasClient.project.getAll(');
      expect(sourceCode).toContain('this.atlasClient.project.create(');
    });

    test('should have switch case handlers for cloud backup operations', () => {
      const backupTools = ['cloud_backup_get_snapshots', 'cloud_backup_get_snapshot'];
      
      backupTools.forEach(toolName => {
        expect(sourceCode).toContain(`case '${toolName}':`);
      });

      expect(sourceCode).toContain('this.atlasClient.cloudBackup.getAllReplicaSetCloudBackups(');
      expect(sourceCode).toContain('this.atlasClient.cloudBackup.getReplicaSetCloudBackup(');
    });

    test('should have switch case handlers for organization operations', () => {
      const orgTools = ['organization_get_by_id', 'organization_get_all'];
      
      orgTools.forEach(toolName => {
        expect(sourceCode).toContain(`case '${toolName}':`);
      });

      expect(sourceCode).toContain('this.atlasClient.organization.getById(');
      expect(sourceCode).toContain('this.atlasClient.organization.getAll(');
    });

    test('should have switch case handlers for access list operations', () => {
      const accessListTools = ['project_access_list_get_all', 'project_access_list_create'];
      
      accessListTools.forEach(toolName => {
        expect(sourceCode).toContain(`case '${toolName}':`);
      });

      expect(sourceCode).toContain('this.atlasClient.projectAccesslist.getAll(');
      expect(sourceCode).toContain('this.atlasClient.projectAccesslist.create(');
    });

    test('should have switch case handlers for event operations', () => {
      const eventTools = ['events_get_all', 'events_get'];
      
      eventTools.forEach(toolName => {
        expect(sourceCode).toContain(`case '${toolName}':`);
      });

      expect(sourceCode).toContain('this.atlasClient.event.getAll(');
      expect(sourceCode).toContain('this.atlasClient.event.get(');
    });

    test('should have switch case handlers for atlas search operations', () => {
      const searchTools = ['atlas_search_get_all', 'atlas_search_create'];
      
      searchTools.forEach(toolName => {
        expect(sourceCode).toContain(`case '${toolName}':`);
      });

      expect(sourceCode).toContain('this.atlasClient.atlasSearch.getAll(');
      expect(sourceCode).toContain('this.atlasClient.atlasSearch.create(');
    });
  });

  describe('Parameter Handling Analysis', () => {
    test('should use default empty object for options when not provided', () => {
      // Check that all tool handlers use || {} pattern for options
      const optionsPattern = /args\.options \|\| \{\}/g;
      const matches = sourceCode.match(optionsPattern);
      
      // Should have at least 20+ occurrences (one for each tool that accepts options)
      expect(matches).toBeTruthy();
      expect(matches.length).toBeGreaterThan(20);
    });

    test('should handle required parameters correctly', () => {
      // User operations should handle username parameter
      expect(sourceCode).toContain('args.username');
      
      // Cluster operations should handle clustername parameter
      expect(sourceCode).toContain('args.clustername');
      
      // Project operations should handle projectId and projectName
      expect(sourceCode).toContain('args.projectId');
      expect(sourceCode).toContain('args.projectName');
      
      // Body parameters for create/update operations
      expect(sourceCode).toContain('args.body');
    });

    test('should validate atlas client availability', () => {
      expect(sourceCode).toContain('if (!this.atlasClient)');
      expect(sourceCode).toContain('MongoDB Atlas client not configured');
    });
  });

  describe('Error Handling Analysis', () => {
    test('should have proper error handling structure', () => {
      expect(sourceCode).toContain('try {');
      expect(sourceCode).toContain('} catch (error) {');
      expect(sourceCode).toContain('throw new Error(`MongoDB Atlas API error: ${error.message}`);');
      expect(sourceCode).toContain('throw new Error(`Unknown tool: ${name}`);');
    });

    test('should handle unknown tools with proper error message', () => {
      expect(sourceCode).toContain('default:');
      expect(sourceCode).toContain('Unknown tool:');
    });
  });

  describe('Response Format Analysis', () => {
    test('should format responses correctly', () => {
      expect(sourceCode).toContain('return {');
      expect(sourceCode).toContain('content: [');
      expect(sourceCode).toContain('type: \'text\'');
      expect(sourceCode).toContain('JSON.stringify(result, null, 2)');
    });
  });
});
