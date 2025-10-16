#!/usr/bin/env node

/**
 * Support Bundle Generator for AWS_EUM_X
 * Creates a diagnostic bundle with automatic secret redaction
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, '..', 'data');
const BUNDLE_DIR = path.join(DATA_DIR, 'support-bundles');
const TIMESTAMP = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
const BUNDLE_NAME = `aws-eum-x-support-${TIMESTAMP}.txt`;

// Ensure bundle directory exists
if (!fs.existsSync(BUNDLE_DIR)) {
  fs.mkdirSync(BUNDLE_DIR, { recursive: true });
}

const outputPath = path.join(BUNDLE_DIR, BUNDLE_NAME);
const output = [];

function log(section, content) {
  output.push('='.repeat(60));
  output.push(section);
  output.push('='.repeat(60));
  output.push(content);
  output.push('');
}

function redact(str) {
  if (!str) return str;
  
  // Redact AWS credentials
  str = str.replace(/AKIA[0-9A-Z]{16}/g, 'AKIA****REDACTED****');
  str = str.replace(/(aws_access_key_id|AWS_ACCESS_KEY_ID)[\s:=]+[A-Z0-9]+/gi, '$1=***REDACTED***');
  str = str.replace(/(aws_secret_access_key|AWS_SECRET_ACCESS_KEY)[\s:=]+[^\s]+/gi, '$1=***REDACTED***');
  str = str.replace(/(secretAccessKey|secret|password)[\s:=]*[^\s,}]+/gi, '$1=***REDACTED***');
  
  // Redact phone numbers (keep country code visible)
  str = str.replace(/\+(\d{1,3})\d{6,}/g, '+$1****REDACTED');
  
  // Redact message bodies longer than 20 chars
  str = str.replace(/"MessageBody":\s*"([^"]{20})[^"]+"/g, '"MessageBody":"$1...REDACTED"');
  
  return str;
}

function safeExec(command) {
  try {
    return execSync(command, { encoding: 'utf8', timeout: 5000 }).trim();
  } catch {
    return 'N/A';
  }
}

// Collect system information
log('System Information', [
  `Node Version: ${process.version}`,
  `Platform: ${process.platform}`,
  `Architecture: ${process.arch}`,
  `Uptime: ${Math.floor(process.uptime())} seconds`,
  `Memory Usage: ${JSON.stringify(process.memoryUsage(), null, 2)}`,
  `Hostname: ${safeExec('hostname')}`,
  `Date: ${new Date().toISOString()}`
].join('\n'));

// Application version
const packageJson = require('../package.json');
log('Application Information', [
  `Name: ${packageJson.name}`,
  `Version: ${packageJson.version}`,
  `Description: ${packageJson.description}`,
  `Node Engine: ${packageJson.engines?.node || 'any'}`
].join('\n'));

// Environment variables (redacted)
log('Environment Variables (Redacted)', redact(
  Object.keys(process.env)
    .filter(key => key.startsWith('AWS_') || key.includes('LOG') || key.includes('RATE') || key === 'NODE_ENV' || key === 'DATA_DIR')
    .map(key => `${key}=${process.env[key]}`)
    .join('\n')
));

// Check data directory
log('Data Directory', [
  `Path: ${DATA_DIR}`,
  `Exists: ${fs.existsSync(DATA_DIR)}`,
  `Writable: ${(() => {
    try {
      const test = path.join(DATA_DIR, '.write-test');
      fs.writeFileSync(test, 'test');
      fs.unlinkSync(test);
      return 'Yes';
    } catch {
      return 'No';
    }
  })()}`
].join('\n'));

// List data directory contents
try {
  const files = fs.readdirSync(DATA_DIR);
  log('Data Directory Contents', files.map(f => {
    const stat = fs.statSync(path.join(DATA_DIR, f));
    return `${f} (${stat.size} bytes, ${stat.isDirectory() ? 'dir' : 'file'})`;
  }).join('\n'));
} catch (error) {
  log('Data Directory Contents', `Error: ${error.message}`);
}

// Recent logs (if available)
const logFile = path.join(DATA_DIR, 'app.log');
if (fs.existsSync(logFile)) {
  try {
    const logs = fs.readFileSync(logFile, 'utf8').split('\n').slice(-50).join('\n');
    log('Recent Logs (Last 50 lines, Redacted)', redact(logs));
  } catch (error) {
    log('Recent Logs', `Error reading logs: ${error.message}`);
  }
} else {
  log('Recent Logs', 'No log file found (using stdout logging)');
}

// Message history (redacted)
const historyFile = path.join(DATA_DIR, 'history.json');
if (fs.existsSync(historyFile)) {
  try {
    const history = fs.readFileSync(historyFile, 'utf8');
    log('Message History (Redacted)', redact(history));
  } catch (error) {
    log('Message History', `Error reading history: ${error.message}`);
  }
} else {
  log('Message History', 'No message history found');
}

// Configuration (redacted)
const configFile = path.join(DATA_DIR, 'config.json');
if (fs.existsSync(configFile)) {
  try {
    const config = fs.readFileSync(configFile, 'utf8');
    log('Configuration (Redacted)', redact(config));
  } catch (error) {
    log('Configuration', `Error reading config: ${error.message}`);
  }
} else {
  log('Configuration', 'No configuration file found');
}

// Docker container info (if available)
log('Container Information', [
  `Hostname: ${safeExec('hostname')}`,
  `Container ID: ${safeExec('cat /proc/self/cgroup | grep docker | head -1 | cut -d/ -f3')}`,
  `Network: ${safeExec('ip addr show | grep inet')}`,
  `DNS: ${safeExec('cat /etc/resolv.conf | grep nameserver')}`
].join('\n'));

// Write bundle
const bundle = output.join('\n');
fs.writeFileSync(outputPath, bundle, { mode: 0o600 });

console.log('✅ Support bundle generated successfully!');
console.log(`📦 Bundle location: ${outputPath}`);
console.log(`📊 Bundle size: ${fs.statSync(outputPath).size} bytes`);
console.log('');
console.log('⚠️  This bundle contains redacted logs and configuration.');
console.log('   Review before sharing to ensure no sensitive data is exposed.');
console.log('');
console.log(`To view: cat "${outputPath}"`);
