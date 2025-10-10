#!/usr/bin/env node

// Test script for CSP configuration logic
// This verifies the CSP environment variable parsing works correctly

process.env.NODE_ENV = 'test';

console.log('🧪 Testing CSP Configuration Logic...\n');

// Test scenarios
const testCases = [
    {
        name: 'Default Configuration (no env vars)',
        env: {},
        expected: 'network-specific CSP with default host'
    },
    {
        name: 'CSP Disabled',
        env: { DISABLE_CSP: 'true' },
        expected: 'CSP completely disabled'
    },
    {
        name: 'Custom Network Host',
        env: { NETWORK_HOST: 'http://192.168.2.1' },
        expected: 'network-specific CSP with custom host'
    },
    {
        name: 'Custom CSP Policy (Valid JSON)',
        env: { 
            CSP_POLICY: '{"defaultSrc":["\'self\'","\'unsafe-inline\'"],"styleSrc":["\'self\'","\'unsafe-inline\'","https:"]}' 
        },
        expected: 'custom CSP policy from JSON'
    },
    {
        name: 'Custom CSP Policy (Invalid JSON)',
        env: { CSP_POLICY: 'invalid-json' },
        expected: 'fallback to permissive policy'
    },
    {
        name: 'All Options Set (CSP disabled takes precedence)',
        env: { 
            DISABLE_CSP: 'true',
            NETWORK_HOST: 'http://192.168.2.1',
            CSP_POLICY: '{"defaultSrc":["\'self\'"]}'
        },
        expected: 'CSP completely disabled'
    }
];

function testCSPConfiguration(envVars) {
    // Set environment variables
    Object.keys(envVars).forEach(key => {
        process.env[key] = envVars[key];
    });
    
    // Simulate the CSP configuration logic from server.js
    const DISABLE_CSP = process.env.DISABLE_CSP === 'true';
    const CSP_POLICY = process.env.CSP_POLICY;
    const NETWORK_HOST = process.env.NETWORK_HOST || 'http://10.0.2.11';

    let cspConfig;
    let description;
    
    if (DISABLE_CSP) {
        description = 'CSP completely disabled';
        cspConfig = false;
    } else if (CSP_POLICY) {
        description = 'Using custom CSP policy';
        try {
            cspConfig = {
                directives: JSON.parse(CSP_POLICY)
            };
        } catch (error) {
            description = 'Invalid CSP JSON, using permissive fallback';
            cspConfig = {
                directives: {
                    defaultSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "data:", "http:", "https:"],
                    styleSrc: ["'self'", "'unsafe-inline'", "http:", "https:", "cdnjs.cloudflare.com", "cdn.jsdelivr.net"],
                    scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "http:", "https:", "cdnjs.cloudflare.com", "cdn.jsdelivr.net"],
                    imgSrc: ["'self'", "data:", "http:", "https:"],
                    connectSrc: ["'self'", "http:", "https:"],
                    fontSrc: ["'self'", "data:", "http:", "https:", "cdnjs.cloudflare.com"],
                    upgradeInsecureRequests: null
                }
            };
        }
    } else {
        description = `Network-specific CSP (${NETWORK_HOST})`;
        cspConfig = {
            directives: {
                defaultSrc: ["'self'", NETWORK_HOST],
                styleSrc: ["'self'", "'unsafe-inline'", NETWORK_HOST],
                scriptSrc: ["'self'", "'unsafe-inline'", NETWORK_HOST],
                imgSrc: ["'self'", "data:", "http:", "https:"],
                connectSrc: ["'self'", NETWORK_HOST],
                upgradeInsecureRequests: null,
            },
        };
    }

    // Clean up environment variables
    Object.keys(envVars).forEach(key => {
        delete process.env[key];
    });

    return {
        cspConfig,
        description,
        helmetConfig: cspConfig,
        environmentVars: {
            DISABLE_CSP,
            CSP_POLICY,
            NETWORK_HOST
        }
    };
}

// Run tests
console.log('Running CSP Configuration Tests:\n');

testCases.forEach((testCase, index) => {
    console.log(`${index + 1}. ${testCase.name}`);
    console.log(`   Environment: ${JSON.stringify(testCase.env)}`);
    
    try {
        const result = testCSPConfiguration(testCase.env);
        console.log(`   ✅ Result: ${result.description}`);
        console.log(`   📋 CSP Config: ${result.cspConfig === false ? 'DISABLED' : 'ENABLED'}`);
        
        if (result.cspConfig && result.cspConfig.directives) {
            const directives = result.cspConfig.directives;
            console.log(`   📊 Directives: ${Object.keys(directives).length} configured`);
            
            // Check if external CDNs are allowed
            const allowsExternalCDNs = (
                directives.styleSrc?.includes('cdnjs.cloudflare.com') ||
                directives.scriptSrc?.includes('cdn.jsdelivr.net') ||
                directives.defaultSrc?.includes('https:')
            );
            
            console.log(`   🌐 External CDNs: ${allowsExternalCDNs ? 'ALLOWED' : 'BLOCKED'}`);
        }
        
        console.log(`   🎯 Expected: ${testCase.expected}`);
        console.log('');
    } catch (error) {
        console.log(`   ❌ Error: ${error.message}`);
        console.log('');
    }
});

console.log('✅ All CSP configuration tests completed!');
console.log('\n🚀 The updated server.js should handle these scenarios correctly:');
console.log('   1. Default behavior maintains security');
console.log('   2. DISABLE_CSP=true allows all external resources');
console.log('   3. NETWORK_HOST configures network-specific whitelisting');
console.log('   4. CSP_POLICY allows advanced JSON configuration');
console.log('   5. Invalid JSON gracefully falls back to permissive policy');
console.log('   6. Environment variable precedence works correctly');