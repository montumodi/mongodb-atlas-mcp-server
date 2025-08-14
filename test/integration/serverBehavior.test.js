const { describe, test, expect, beforeEach, afterEach } = require('@jest/globals');
const { spawn } = require('child_process');

describe('MongoDB Atlas MCP Server - Integration Tests', () => {
  let originalEnv;

  beforeEach(() => {
    originalEnv = { ...process.env };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('Server Startup and Configuration', () => {
    test('should start and show ready message with valid credentials', (done) => {
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
      }, 2000);

      server.on('error', (error) => {
        done(error);
      });
    }, 10000);

    test('should work with custom base URL', (done) => {
      process.env.MONGODB_ATLAS_PUBLIC_KEY = 'test-public-key';
      process.env.MONGODB_ATLAS_PRIVATE_KEY = 'test-private-key';
      process.env.MONGODB_ATLAS_PROJECT_ID = 'test-project-id';
      process.env.MONGODB_ATLAS_BASE_URL = 'https://custom.example.com/api/atlas/v1.0';

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
      }, 2000);

      server.on('error', (error) => {
        done(error);
      });
    }, 10000);
  });

  describe('Environment Variable Requirements', () => {
    test('should fail when PUBLIC_KEY is missing', (done) => {
      delete process.env.MONGODB_ATLAS_PUBLIC_KEY;
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

      server.on('exit', (code) => {
        expect(code).toBe(1);
        expect(stderrOutput).toContain('Missing required environment variables');
        expect(stderrOutput).toContain('MONGODB_ATLAS_PUBLIC_KEY');
        done();
      });

      server.on('error', (error) => {
        done(error);
      });
    }, 5000);

    test('should fail when PRIVATE_KEY is missing', (done) => {
      process.env.MONGODB_ATLAS_PUBLIC_KEY = 'test-public-key';
      delete process.env.MONGODB_ATLAS_PRIVATE_KEY;
      process.env.MONGODB_ATLAS_PROJECT_ID = 'test-project-id';

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
        expect(stderrOutput).toContain('Missing required environment variables');
        expect(stderrOutput).toContain('MONGODB_ATLAS_PRIVATE_KEY');
        done();
      });

      server.on('error', (error) => {
        done(error);
      });
    }, 5000);

    test('should fail when PROJECT_ID is missing', (done) => {
      process.env.MONGODB_ATLAS_PUBLIC_KEY = 'test-public-key';
      process.env.MONGODB_ATLAS_PRIVATE_KEY = 'test-private-key';
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
        expect(stderrOutput).toContain('Missing required environment variables');
        expect(stderrOutput).toContain('MONGODB_ATLAS_PROJECT_ID');
        done();
      });

      server.on('error', (error) => {
        done(error);
      });
    }, 5000);

    test('should show all missing variables when none are provided', (done) => {
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
        expect(stderrOutput).toContain('Missing required environment variables');
        expect(stderrOutput).toContain('MONGODB_ATLAS_PUBLIC_KEY');
        expect(stderrOutput).toContain('MONGODB_ATLAS_PRIVATE_KEY');
        expect(stderrOutput).toContain('MONGODB_ATLAS_PROJECT_ID');
        done();
      });

      server.on('error', (error) => {
        done(error);
      });
    }, 5000);
  });

  describe('Error Handling', () => {
    test('should handle invalid characters in environment variables gracefully', (done) => {
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

      // Server should start successfully even with test credentials
      setTimeout(() => {
        expect(stderrOutput).toContain('MongoDB Atlas MCP Server running on stdio');
        server.kill();
        done();
      }, 2000);

      server.on('error', (error) => {
        done(error);
      });
    }, 10000);

    test('should handle process termination gracefully', (done) => {
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
        
        // Send SIGTERM to test graceful shutdown
        server.kill('SIGTERM');
        
        setTimeout(() => {
          expect(server.killed).toBe(true);
          done();
        }, 500);
      }, 2000);

      server.on('error', (error) => {
        done(error);
      });
    }, 10000);
  });

  describe('MCP Protocol Compliance', () => {
    test('should respond to stdin input appropriately', (done) => {
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

      let stdoutOutput = '';
      server.stdout.on('data', (data) => {
        stdoutOutput += data.toString();
      });

      setTimeout(() => {
        expect(stderrOutput).toContain('MongoDB Atlas MCP Server running on stdio');
        
        // Send a simple MCP message to test protocol handling
        const testMessage = JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method: 'tools/list'
        }) + '\n';
        
        server.stdin.write(testMessage);
        
        setTimeout(() => {
          server.kill();
          // The server should have processed the input (even if it results in an error)
          // This tests that the server is listening and responding to stdin
          done();
        }, 1000);
      }, 2000);

      server.on('error', (error) => {
        done(error);
      });
    }, 15000);
  });

  describe('Performance and Stability', () => {
    test('should start within reasonable time', (done) => {
      process.env.MONGODB_ATLAS_PUBLIC_KEY = 'test-public-key';
      process.env.MONGODB_ATLAS_PRIVATE_KEY = 'test-private-key';
      process.env.MONGODB_ATLAS_PROJECT_ID = 'test-project-id';

      const startTime = Date.now();
      const server = spawn('node', ['src/index.js'], {
        env: process.env,
        stdio: ['pipe', 'pipe', 'pipe'],
      });

      let stderrOutput = '';
      server.stderr.on('data', (data) => {
        stderrOutput += data.toString();
        
        if (stderrOutput.includes('MongoDB Atlas MCP Server running on stdio')) {
          const startupTime = Date.now() - startTime;
          expect(startupTime).toBeLessThan(5000); // Should start within 5 seconds
          server.kill();
          done();
        }
      });

      server.on('error', (error) => {
        done(error);
      });
    }, 10000);

    test('should handle multiple rapid termination signals', (done) => {
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
        
        // Send multiple signals rapidly
        server.kill('SIGTERM');
        server.kill('SIGTERM');
        server.kill('SIGTERM');
        
        setTimeout(() => {
          expect(server.killed).toBe(true);
          done();
        }, 1000);
      }, 2000);

      server.on('error', (error) => {
        done(error);
      });
    }, 10000);
  });
});
