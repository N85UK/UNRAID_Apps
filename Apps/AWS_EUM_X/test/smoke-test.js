#!/usr/bin/env node

/**
 * Smoke test for AWS_EUM_X
 * Verifies basic functionality without external dependencies
 */

const http = require('http');

const BASE_URL = process.env.BASE_URL || 'http://localhost:80';
const TIMEOUT = 10000;

let exitCode = 0;

function makeRequest(path, method = 'GET', body = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname,
      method,
      headers: body ? { 'Content-Type': 'application/json' } : {},
      timeout: TIMEOUT
    };
    
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, body: parsed });
        } catch {
          resolve({ status: res.statusCode, body: data });
        }
      });
    });
    
    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
    
    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

async function test(name, fn) {
  process.stdout.write(`Testing: ${name}... `);
  try {
    await fn();
    console.log('✅ PASS');
    return true;
  } catch (error) {
    console.log('❌ FAIL');
    console.log(`  Error: ${error.message}`);
    exitCode = 1;
    return false;
  }
}

async function runTests() {
  console.log('🧪 AWS_EUM_X Smoke Tests\n');
  
  // Test 1: Health endpoint
  await test('Health endpoint returns status ok', async () => {
    const { status, body } = await makeRequest('/health');
    if (status !== 200) throw new Error(`Expected 200, got ${status}`);
    if (body.status !== 'ok') throw new Error(`Expected status 'ok', got '${body.status}'`);
    if (!body.version) throw new Error('Missing version field');
  });
  
  // Test 2: Readiness endpoint
  await test('Readiness endpoint responds', async () => {
    const { status, body } = await makeRequest('/ready');
    // 200 or 503 are both acceptable
    if (status !== 200 && status !== 503) throw new Error(`Expected 200 or 503, got ${status}`);
    if (typeof body.ready !== 'boolean') throw new Error('Missing ready field');
  });
  
  // Test 3: AWS probe endpoint
  await test('AWS probe endpoint responds', async () => {
    const { status, body } = await makeRequest('/probe/aws');
    // Should return 200 or 503 depending on AWS config
    if (status !== 200 && status !== 503) throw new Error(`Expected 200 or 503, got ${status}`);
    if (typeof body.ready !== 'boolean') throw new Error('Missing ready field');
  });
  
  // Test 4: Queue status
  await test('Queue status endpoint returns metrics', async () => {
    const { status, body } = await makeRequest('/api/queue/status');
    if (status !== 200) throw new Error(`Expected 200, got ${status}`);
    if (typeof body.queueDepth !== 'number') throw new Error('Missing queueDepth field');
  });
  
  // Test 5: Last sends history
  await test('Last sends endpoint returns history', async () => {
    const { status, body } = await makeRequest('/api/last-sends');
    if (status !== 200) throw new Error(`Expected 200, got ${status}`);
    if (!Array.isArray(body.history)) throw new Error('History should be an array');
  });
  
  // Test 6: Invalid send request (validation)
  await test('Send SMS validates required fields', async () => {
    const { status } = await makeRequest('/api/send-sms', 'POST', {});
    if (status !== 400) throw new Error(`Expected 400 for invalid request, got ${status}`);
  });
  
  // Test 7: Invalid phone number format
  await test('Send SMS validates E.164 format', async () => {
    const { status, body } = await makeRequest('/api/send-sms', 'POST', {
      DestinationPhoneNumber: '1234567890', // Invalid: missing +
      MessageBody: 'Test'
    });
    if (status !== 400) throw new Error(`Expected 400 for invalid phone, got ${status}`);
    if (!body.error.includes('E.164')) throw new Error('Error should mention E.164 format');
  });
  
  console.log('\n' + '='.repeat(50));
  if (exitCode === 0) {
    console.log('✅ All tests passed!');
  } else {
    console.log('❌ Some tests failed');
  }
  console.log('='.repeat(50) + '\n');
  
  process.exit(exitCode);
}

// Run tests
runTests().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
