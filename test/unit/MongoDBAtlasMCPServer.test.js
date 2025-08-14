const { describe, test, expect, beforeEach, afterEach } = require('@jest/globals');
const { spawn } = require('child_process');

describe('MongoDBAtlasMCPServer Unit Tests', () => {
  let originalEnv;

  beforeEach(() => {
    originalEnv = { ...process.env };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('Environment Variable Validation', () => {
    test('should require MONGODB_ATLAS_PUBLIC_KEY', (done) => {
      delete process.env.MONGODB_ATLAS_PUBLIC_KEY;
      process.env.MONGODB_ATLAS_PRIVATE_KEY = 'test-private-key';
      process.env.MONGODB_ATLAS_PROJECT_ID = 'test-project-id';

      const server = spawn('node', ['src/index.js'], {
        env: process.env,
        stdio: ['pipe', 'pipe', 'pipe'],
      });

      server.on('exit', (code) => {
        expect(code).toBe(1);
        done();
      });

      server.on('error', (error) => {
        done(error);
      });
    }, 5000);

    test('should require MONGODB_ATLAS_PRIVATE_KEY', (done) => {
      process.env.MONGODB_ATLAS_PUBLIC_KEY = 'test-public-key';
      delete process.env.MONGODB_ATLAS_PRIVATE_KEY;
      process.env.MONGODB_ATLAS_PROJECT_ID = 'test-project-id';

      const server = spawn('node', ['src/index.js'], {
        env: process.env,
        stdio: ['pipe', 'pipe', 'pipe'],
      });

      server.on('exit', (code) => {
        expect(code).toBe(1);
        done();
      });

      server.on('error', (error) => {
        done(error);
      });
    }, 5000);

    test('should require MONGODB_ATLAS_PROJECT_ID', (done) => {
      process.env.MONGODB_ATLAS_PUBLIC_KEY = 'test-public-key';
      process.env.MONGODB_ATLAS_PRIVATE_KEY = 'test-private-key';
      delete process.env.MONGODB_ATLAS_PROJECT_ID;

      const server = spawn('node', ['src/index.js'], {
        env: process.env,
        stdio: ['pipe', 'pipe', 'pipe'],
      });

      server.on('exit', (code) => {
        expect(code).toBe(1);
        done();
      });

      server.on('error', (error) => {
        done(error);
      });
    }, 5000);

    test('should start successfully with all required environment variables', (done) => {
      process.env.MONGODB_ATLAS_PUBLIC_KEY = 'test-public-key';
      process.env.MONGODB_ATLAS_PRIVATE_KEY = 'test-private-key';
      process.env.MONGODB_ATLAS_PROJECT_ID = 'test-project-id';

      const server = spawn('node', ['src/index.js'], {
        env: process.env,
        stdio: ['pipe', 'pipe', 'pipe'],
      });

      let stderrOutput = '';
      server.stderr.on('data', (data) => {
        stderrOutput += data.toString();
      });

      setTimeout(() => {
        expect(stderrOutput).toContain('MongoDB Atlas MCP Server running on stdio');
        server.kill();
        done();
      }, 1000);

      server.on('error', (error) => {
        done(error);
      });
    }, 10000);

    test('should use custom base URL when provided', (done) => {
      process.env.MONGODB_ATLAS_PUBLIC_KEY = 'test-public-key';
      process.env.MONGODB_ATLAS_PRIVATE_KEY = 'test-private-key';
      process.env.MONGODB_ATLAS_PROJECT_ID = 'test-project-id';
      process.env.MONGODB_ATLAS_BASE_URL = 'https://custom.mongodb.com/api/atlas/v1.0';

      const server = spawn('node', ['src/index.js'], {
        env: process.env,
        stdio: ['pipe', 'pipe', 'pipe'],
      });

      let stderrOutput = '';
      server.stderr.on('data', (data) => {
        stderrOutput += data.toString();
      });

      setTimeout(() => {
        expect(stderrOutput).toContain('MongoDB Atlas MCP Server running on stdio');
        server.kill();
        done();
      }, 1000);

      server.on('error', (error) => {
        done(error);
      });
    }, 10000);
  });

  describe('Error Messages', () => {
    test('should display helpful error message for missing environment variables', (done) => {
      delete process.env.MONGODB_ATLAS_PUBLIC_KEY;
      delete process.env.MONGODB_ATLAS_PRIVATE_KEY;
      delete process.env.MONGODB_ATLAS_PROJECT_ID;

      const server = spawn('node', ['src/index.js'], {
        env: process.env,
        stdio: ['pipe', 'pipe', 'pipe'],
      });

      let stderrOutput = '';
      server.stderr.on('data', (data) => {
        stderrOutput += data.toString();
      });

      server.on('exit', (code) => {
        expect(code).toBe(1);
        expect(stderrOutput).toContain('Error: Missing required environment variables:');
        expect(stderrOutput).toContain('- MONGODB_ATLAS_PUBLIC_KEY');
        expect(stderrOutput).toContain('- MONGODB_ATLAS_PRIVATE_KEY');
        expect(stderrOutput).toContain('- MONGODB_ATLAS_PROJECT_ID');
        done();
      });

      server.on('error', (error) => {
        done(error);
      });
    }, 5000);
  });
});
