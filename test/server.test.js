import { describe, test, expect, beforeAll } from '@jest/globals';
import { spawn } from 'child_process';

describe('MongoDB Atlas MCP Server', () => {
  let serverProcess;

  beforeAll(() => {
    // Set test environment variables
    process.env.MONGODB_ATLAS_PUBLIC_KEY = 'test-public-key';
    process.env.MONGODB_ATLAS_PRIVATE_KEY = 'test-private-key';
    process.env.MONGODB_ATLAS_PROJECT_ID = 'test-project-id';
  });

  test('should start without errors when environment variables are set', (done) => {
    const server = spawn('node', ['src/index.js'], {
      env: {
        ...process.env,
        MONGODB_ATLAS_PUBLIC_KEY: 'test-public-key',
        MONGODB_ATLAS_PRIVATE_KEY: 'test-private-key',
        MONGODB_ATLAS_PROJECT_ID: 'test-project-id',
      },
      stdio: ['pipe', 'pipe', 'pipe'],
    });

    let stderrOutput = '';
    server.stderr.on('data', (data) => {
      stderrOutput += data.toString();
    });

    // Give the server a moment to start
    setTimeout(() => {
      expect(stderrOutput).toContain('MongoDB Atlas MCP Server running on stdio');
      server.kill();
      done();
    }, 1000);

    server.on('error', (error) => {
      done(error);
    });
  }, 10000);

  test('should exit with error when environment variables are missing', (done) => {
    const server = spawn('node', ['src/index.js'], {
      env: {
        ...process.env,
        MONGODB_ATLAS_PUBLIC_KEY: undefined,
        MONGODB_ATLAS_PRIVATE_KEY: undefined,
        MONGODB_ATLAS_PROJECT_ID: undefined,
      },
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
});
