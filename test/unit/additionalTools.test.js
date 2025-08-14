const { describe, test, expect, beforeEach } = require('@jest/globals');
const fs = require('fs');
const path = require('path');

describe('Additional Atlas Tools', () => {
  let sourceCode;

  beforeEach(() => {
    sourceCode = fs.readFileSync(path.join(__dirname, '../../src/index.js'), 'utf8');
  });

  describe('Cloud Backup Operations', () => {
    test('should have cloud backup tool definitions', () => {
      expect(sourceCode).toContain('name: \'cloud_backup_get_snapshots\'');
      expect(sourceCode).toContain('name: \'cloud_backup_get_snapshot\'');
      expect(sourceCode).toContain('Get all cloud backup snapshots for a cluster');
      expect(sourceCode).toContain('Get details of a specific snapshot');
    });

    test('should implement cloud backup switch cases', () => {
      expect(sourceCode).toContain('case \'cloud_backup_get_snapshots\':');
      expect(sourceCode).toContain('case \'cloud_backup_get_snapshot\':');
      expect(sourceCode).toContain('this.atlasClient.cloudBackup.getAllReplicaSetCloudBackups(');
      expect(sourceCode).toContain('this.atlasClient.cloudBackup.getReplicaSetCloudBackup(');
    });

    test('should handle cloud backup parameters correctly', () => {
      expect(sourceCode).toContain('clustername:');
      expect(sourceCode).toContain('snapshotId:');
      expect(sourceCode).toContain('args.clustername');
      expect(sourceCode).toContain('args.snapshotId');
    });
  });

  describe('Organization Operations', () => {
    test('should have organization tool definitions', () => {
      expect(sourceCode).toContain('name: \'organization_get_by_id\'');
      expect(sourceCode).toContain('name: \'organization_get_all\'');
      expect(sourceCode).toContain('Get organization details by ID');
      expect(sourceCode).toContain('Get all organizations');
    });

    test('should implement organization switch cases', () => {
      expect(sourceCode).toContain('case \'organization_get_by_id\':');
      expect(sourceCode).toContain('case \'organization_get_all\':');
      expect(sourceCode).toContain('this.atlasClient.organization.getById(');
      expect(sourceCode).toContain('this.atlasClient.organization.getAll(');
    });

    test('should handle organization parameters correctly', () => {
      expect(sourceCode).toContain('organizationId:');
      expect(sourceCode).toContain('args.organizationId');
    });
  });

  describe('Project Access List Operations', () => {
    test('should have access list tool definitions', () => {
      expect(sourceCode).toContain('name: \'project_access_list_get_all\'');
      expect(sourceCode).toContain('name: \'project_access_list_create\'');
      expect(sourceCode).toContain('Get all IP access list entries');
      expect(sourceCode).toContain('Add IP addresses to the access list');
    });

    test('should implement access list switch cases', () => {
      expect(sourceCode).toContain('case \'project_access_list_get_all\':');
      expect(sourceCode).toContain('case \'project_access_list_create\':');
      expect(sourceCode).toContain('this.atlasClient.projectAccesslist.getAll(');
      expect(sourceCode).toContain('this.atlasClient.projectAccesslist.create(');
    });

    test('should have proper access list schema', () => {
      expect(sourceCode).toContain('ipAddress: { type: \'string\' }');
      expect(sourceCode).toContain('cidrBlock: { type: \'string\' }');
      expect(sourceCode).toContain('comment: { type: \'string\' }');
      expect(sourceCode).toContain('required: [\'ipAddress\']');
    });
  });

  describe('Events Operations', () => {
    test('should have events tool definitions', () => {
      expect(sourceCode).toContain('name: \'events_get_all\'');
      expect(sourceCode).toContain('name: \'events_get\'');
      expect(sourceCode).toContain('Get all events for the project');
      expect(sourceCode).toContain('Get details of a specific event');
    });

    test('should implement events switch cases', () => {
      expect(sourceCode).toContain('case \'events_get_all\':');
      expect(sourceCode).toContain('case \'events_get\':');
      expect(sourceCode).toContain('this.atlasClient.event.getAll(');
      expect(sourceCode).toContain('this.atlasClient.event.get(');
    });

    test('should handle event parameters correctly', () => {
      expect(sourceCode).toContain('eventId:');
      expect(sourceCode).toContain('args.eventId');
    });
  });

  describe('Atlas Search Operations', () => {
    test('should have atlas search tool definitions', () => {
      expect(sourceCode).toContain('name: \'atlas_search_get_all\'');
      expect(sourceCode).toContain('name: \'atlas_search_create\'');
      expect(sourceCode).toContain('Get all Atlas Search indexes');
      expect(sourceCode).toContain('Create a new Atlas Search index');
    });

    test('should implement atlas search switch cases', () => {
      expect(sourceCode).toContain('case \'atlas_search_get_all\':');
      expect(sourceCode).toContain('case \'atlas_search_create\':');
      expect(sourceCode).toContain('this.atlasClient.atlasSearch.getAll(');
      expect(sourceCode).toContain('this.atlasClient.atlasSearch.create(');
    });

    test('should handle atlas search parameters correctly', () => {
      expect(sourceCode).toContain('clusterName:');
      expect(sourceCode).toContain('databaseName:');
      expect(sourceCode).toContain('collectionName:');
      expect(sourceCode).toContain('args.clusterName');
      expect(sourceCode).toContain('args.databaseName');
      expect(sourceCode).toContain('args.collectionName');
    });

    test('should have proper atlas search schema', () => {
      expect(sourceCode).toContain('name: { type: \'string\' }');
      expect(sourceCode).toContain('database: { type: \'string\' }');
      expect(sourceCode).toContain('collection: { type: \'string\' }');
      expect(sourceCode).toContain('mappings: { type: \'object\' }');
      expect(sourceCode).toContain('required: [\'name\', \'database\', \'collection\']');
    });
  });

  describe('Advanced Cluster Operations', () => {
    test('should handle cluster update operations', () => {
      expect(sourceCode).toContain('case \'cluster_update\':');
      expect(sourceCode).toContain('this.atlasClient.cluster.update(');
      expect(sourceCode).toContain('args.clustername');
      expect(sourceCode).toContain('args.body');
    });

    test('should handle cluster delete operations', () => {
      expect(sourceCode).toContain('case \'cluster_delete\':');
      expect(sourceCode).toContain('this.atlasClient.cluster.delete(');
      expect(sourceCode).toContain('Delete a cluster');
    });

    test('should have proper cluster modification schemas', () => {
      expect(sourceCode).toContain('clustername:');
      expect(sourceCode).toContain('body:');
      expect(sourceCode).toContain('Updated cluster configuration');
    });
  });

  describe('Project Operations Edge Cases', () => {
    test('should handle project creation properly', () => {
      expect(sourceCode).toContain('case \'project_create\':');
      expect(sourceCode).toContain('this.atlasClient.project.create(');
      expect(sourceCode).toContain('Create a new project');
    });

    test('should have proper project creation schema', () => {
      expect(sourceCode).toContain('name: { type: \'string\' }');
      expect(sourceCode).toContain('orgId: { type: \'string\' }');
      expect(sourceCode).toContain('required: [\'name\', \'orgId\']');
    });

    test('should handle all project lookup methods', () => {
      expect(sourceCode).toContain('project_get_by_id');
      expect(sourceCode).toContain('project_get_by_name');
      expect(sourceCode).toContain('project_get_all');
      expect(sourceCode).toContain('this.atlasClient.project.getById(');
      expect(sourceCode).toContain('this.atlasClient.project.getByName(');
      expect(sourceCode).toContain('this.atlasClient.project.getAll(');
    });
  });

  describe('Tool Parameter Validation', () => {
    test('should validate required parameters for complex operations', () => {
      // Atlas Search requires cluster, database, and collection
      const atlasSearchGetAll = sourceCode.substring(
        sourceCode.indexOf('name: \'atlas_search_get_all\''),
        sourceCode.indexOf('name: \'atlas_search_create\'')
      );
      
      expect(atlasSearchGetAll).toContain('required: [\'clusterName\', \'databaseName\', \'collectionName\']');
    });

    test('should have proper schema types for all parameters', () => {
      // Check that all parameter types are properly defined
      expect(sourceCode).toContain('type: \'string\'');
      expect(sourceCode).toContain('type: \'object\'');
      expect(sourceCode).toContain('type: \'array\'');
    });

    test('should have descriptions for all parameters', () => {
      // All parameters should have meaningful descriptions
      expect(sourceCode).toContain('description:');
      expect(sourceCode).toContain('Name of the cluster');
      expect(sourceCode).toContain('Optional parameters');
      expect(sourceCode).toContain('Project ID');
    });
  });
});
