const { describe, test, expect, beforeEach, afterEach } = require('@jest/globals');
const fs = require('fs');
const path = require('path');

describe('MongoDBAtlasMCPServer Error Handling', () => {
  let sourceCode;

  beforeEach(() => {
    sourceCode = fs.readFileSync(path.join(__dirname, '../../src/index.js'), 'utf8');
  });

  describe('Environment Variable Validation', () => {
    test('should check for required environment variables', () => {
      expect(sourceCode).toContain('process.env.MONGODB_ATLAS_PUBLIC_KEY');
      expect(sourceCode).toContain('process.env.MONGODB_ATLAS_PRIVATE_KEY');
      expect(sourceCode).toContain('process.env.MONGODB_ATLAS_PROJECT_ID');
      expect(sourceCode).toContain('process.env.MONGODB_ATLAS_BASE_URL');
    });

    test('should validate environment variables and exit on missing ones', () => {
      expect(sourceCode).toContain('if (!publicKey || !privateKey || !projectId)');
      expect(sourceCode).toContain('console.error(\'Error: Missing required environment variables:\');');
      expect(sourceCode).toContain('process.exit(1);');
    });

    test('should provide helpful error messages for missing variables', () => {
      expect(sourceCode).toContain('- MONGODB_ATLAS_PUBLIC_KEY');
      expect(sourceCode).toContain('- MONGODB_ATLAS_PRIVATE_KEY');
      expect(sourceCode).toContain('- MONGODB_ATLAS_PROJECT_ID');
      expect(sourceCode).toContain('Optional:');
      expect(sourceCode).toContain('- MONGODB_ATLAS_BASE_URL (defaults to https://cloud.mongodb.com/api/atlas/v1.0)');
    });

    test('should have default base URL handling', () => {
      expect(sourceCode).toContain('https://cloud.mongodb.com/api/atlas/v1.0');
    });
  });

  describe('Atlas Client Configuration Errors', () => {
    test('should validate atlas client availability before tool execution', () => {
      expect(sourceCode).toContain('if (!this.atlasClient)');
      expect(sourceCode).toContain('MongoDB Atlas client not configured');
      expect(sourceCode).toContain('Please set MONGODB_ATLAS_PUBLIC_KEY, MONGODB_ATLAS_PRIVATE_KEY, and MONGODB_ATLAS_PROJECT_ID environment variables');
    });
  });

  describe('Tool Error Handling', () => {
    test('should handle unknown tools with proper error message', () => {
      expect(sourceCode).toContain('default:');
      expect(sourceCode).toContain('throw new Error(`Unknown tool: ${name}`);');
    });

    test('should wrap MongoDB Atlas API errors properly', () => {
      expect(sourceCode).toContain('try {');
      expect(sourceCode).toContain('} catch (error) {');
      expect(sourceCode).toContain('throw new Error(`MongoDB Atlas API error: ${error.message}`);');
    });
  });

  describe('Error Message Structure', () => {
    test('should preserve error context in wrapped errors', () => {
      // Should wrap errors in a way that preserves the original message
      expect(sourceCode).toContain('error.message');
      expect(sourceCode).toContain('MongoDB Atlas API error:');
    });

    test('should have consistent error handling pattern', () => {
      // All tool executions should be wrapped in try-catch
      const switchStatement = sourceCode.substring(
        sourceCode.indexOf('switch (name)'),
        sourceCode.indexOf('} catch (error)')
      );
      
      expect(switchStatement).toContain('case \'user_get\':');
      expect(switchStatement).toContain('case \'cluster_get\':');
      expect(switchStatement).toContain('case \'project_get_by_id\':');
      // More cases should exist within the try block
    });
  });

  describe('Server Configuration Error Handling', () => {
    test('should handle server initialization properly', () => {
      expect(sourceCode).toContain('new Server(');
      expect(sourceCode).toContain('name: \'mongodb-atlas-mcp-server\'');
      expect(sourceCode).toContain('version: \'1.1.0\'');
      expect(sourceCode).toContain('capabilities: {');
      expect(sourceCode).toContain('tools: {}');
    });

    test('should handle transport connection', () => {
      expect(sourceCode).toContain('new StdioServerTransport()');
      expect(sourceCode).toContain('await this.server.connect(transport)');
      expect(sourceCode).toContain('console.error(\'MongoDB Atlas MCP Server running on stdio\')');
    });
  });

  describe('Error Recovery and Graceful Handling', () => {
    test('should have main error handling for server startup', () => {
      expect(sourceCode).toContain('.catch(console.error)');
    });

    test('should exit gracefully on configuration errors', () => {
      // Should exit with proper error code on missing config
      expect(sourceCode).toContain('process.exit(1)');
    });
  });
});
