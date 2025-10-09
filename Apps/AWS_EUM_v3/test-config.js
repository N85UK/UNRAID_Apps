#!/usr/bin/env node

/**
 * AWS EUM Configuration Test Script
 * Tests AWS configuration and connectivity
 */

const { PinpointSMSVoiceV2Client, DescribeOriginationIdentitiesCommand } = require('@aws-sdk/client-pinpoint-sms-voice-v2');

async function testConfiguration() {
    console.log('AWS EUM Configuration Test\n');
    
    // Check environment variables
    console.log('1. Environment Variables:');
    console.log(`   AWS_ACCESS_KEY_ID: ${process.env.AWS_ACCESS_KEY_ID ? '✓ Set' : '✗ Missing'}`);
    console.log(`   AWS_SECRET_ACCESS_KEY: ${process.env.AWS_SECRET_ACCESS_KEY ? '✓ Set' : '✗ Missing'}`);
    console.log(`   AWS_REGION: ${process.env.AWS_REGION || 'eu-west-2 (default)'}`);
    console.log(`   PORT: ${process.env.PORT || '80 (default)'}`);
    console.log(`   ORIGINATORS: ${process.env.ORIGINATORS || 'None (will auto-fetch from AWS)'}`);
    
    if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
        console.log('\n❌ AWS credentials not configured. Please set AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY.');
        return;
    }
    
    // Test AWS connection
    console.log('\n2. AWS Connection Test:');
    try {
        const client = new PinpointSMSVoiceV2Client({
            region: process.env.AWS_REGION || 'eu-west-2',
            credentials: {
                accessKeyId: process.env.AWS_ACCESS_KEY_ID,
                secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
            }
        });
        
        console.log('   Creating AWS client... ✓');
        
        const command = new DescribeOriginationIdentitiesCommand({});
        const response = await client.send(command);
        
        console.log('   AWS API connection... ✓');
        console.log(`   Found ${response.OriginationIdentities?.length || 0} origination identities`);
        
        if (response.OriginationIdentities && response.OriginationIdentities.length > 0) {
            console.log('\n3. Available Phone Numbers/Originators:');
            response.OriginationIdentities.forEach((identity, index) => {
                const label = identity.OriginationIdentityArn?.split('/').pop() || identity.OriginationIdentity;
                console.log(`   ${index + 1}. ${label} (${identity.IdentityType})`);
                console.log(`      ARN: ${identity.OriginationIdentityArn}`);
                if (identity.TwoWayEnabled) {
                    console.log(`      Two-way: ✓ Enabled`);
                }
            });
        } else {
            console.log('\n3. Available Phone Numbers/Originators:');
            console.log('   ⚠️  No phone numbers found in AWS account.');
            console.log('   You may need to:');
            console.log('   - Request phone numbers in AWS Pinpoint');
            console.log('   - Check your AWS region');
            console.log('   - Verify IAM permissions');
        }
        
        console.log('\n✅ Configuration test completed successfully!');
        console.log('   Your AWS EUM application should work correctly.');
        
    } catch (error) {
        console.log(`   ❌ AWS connection failed: ${error.message}`);
        
        if (error.name === 'UnauthorizedOperation' || error.name === 'AccessDenied') {
            console.log('\n   Possible issues:');
            console.log('   - Invalid AWS credentials');
            console.log('   - Insufficient IAM permissions');
            console.log('   - Required permissions: pinpoint-sms-voice:*');
        } else if (error.name === 'InvalidRegion') {
            console.log('\n   Possible issues:');
            console.log('   - Invalid AWS region specified');
            console.log('   - Pinpoint SMS not available in this region');
        } else {
            console.log('\n   Possible issues:');
            console.log('   - Network connectivity');
            console.log('   - AWS service outage');
            console.log('   - Configuration error');
        }
    }
}

// Run the test
testConfiguration().catch(console.error);