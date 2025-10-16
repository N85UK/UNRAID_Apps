# IAM Policies for AWS EUM X

## Minimal Least-Privilege Policy

The policy in `minimal-policy.json` provides the minimum permissions required for AWS EUM X to function:

### Required Actions
- `sms-voice:SendTextMessage` - Send SMS messages via Pinpoint SMS and Voice v2
- `sms-voice:DescribePhoneNumbers` - List and discover provisioned phone numbers
- `sms-voice:DescribeSenderIds` - List and discover sender IDs

### Resource Scoping
By default, the policy uses `"Resource": "*"` for simplicity. For production environments, you can scope resources to specific:

**Phone Number ARNs:**
```json
"Resource": "arn:aws:sms-voice:us-east-1:123456789012:phone-number/*"
```

**Sender ID ARNs:**
```json
"Resource": "arn:aws:sms-voice:eu-west-2:123456789012:sender-id/*"
```

### Region Restriction
The example policy includes a condition to restrict operations to specific regions:
```json
"Condition": {
  "StringEquals": {
    "aws:RequestedRegion": ["us-east-1", "eu-west-2"]
  }
}
```

Modify the regions list to match where your SMS resources are provisioned.

## Creating an IAM User

### AWS Console Steps:
1. Navigate to IAM → Users → Create User
2. User name: `aws-eum-x-sender`
3. Access type: **Programmatic access** (Access key ID and secret key)
4. Permissions: **Attach policy directly** → Create policy → Paste `minimal-policy.json`
5. Tags (optional): `Application=AWS-EUM-X`, `Environment=Production`
6. Review and create
7. **Download credentials CSV** - You'll need the Access Key ID and Secret Access Key

### AWS CLI Alternative:
```bash
# Create the policy
aws iam create-policy \
  --policy-name AWSEUMXMinimalPolicy \
  --policy-document file://minimal-policy.json

# Create the user
aws iam create-user --user-name aws-eum-x-sender

# Attach the policy
aws iam attach-user-policy \
  --user-name aws-eum-x-sender \
  --policy-arn arn:aws:iam::YOUR_ACCOUNT_ID:policy/AWSEUMXMinimalPolicy

# Create access key
aws iam create-access-key --user-name aws-eum-x-sender
```

## Using IAM Roles (Recommended for EC2/ECS/EKS)

If running AWS EUM X on AWS infrastructure (EC2, ECS, EKS), use IAM roles instead of access keys:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Service": "ec2.amazonaws.com"
      },
      "Action": "sts:AssumeRole"
    }
  ]
}
```

Then attach the minimal policy to the role and assign the role to your compute instance. The AWS SDK will automatically use the instance metadata service to retrieve temporary credentials.

## Security Best Practices

1. **Never commit credentials to Git** - Use environment variables or secrets management
2. **Rotate access keys regularly** - Every 90 days minimum
3. **Enable MFA for IAM user** - If console access is needed for the IAM user
4. **Use AWS Secrets Manager** - Store credentials in Secrets Manager with automatic rotation
5. **Monitor with CloudTrail** - Enable CloudTrail to audit all SMS API calls
6. **Set up billing alerts** - Monitor unexpected SMS charges
7. **Use condition keys** - Add IP restrictions or VPC endpoint conditions where applicable

## Testing Permissions

Use the `/api/test/credentials` endpoint to verify IAM permissions without sending messages:

```bash
curl -X POST http://your-unraid-ip:8080/api/test/credentials \
  -H "Content-Type: application/json" \
  -d '{
    "accessKeyId": "AKIAIOSFODNN7EXAMPLE",
    "secretAccessKey": "wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY",
    "region": "us-east-1"
  }'
```

Expected response for valid credentials:
```json
{
  "ok": true,
  "phoneNumbers": 2
}
```

## Troubleshooting

### Error: "User is not authorized to perform: sms-voice:SendTextMessage"
- Verify the IAM policy is attached to the user
- Check the policy action names match AWS service authorization reference
- Ensure the region in the request matches the policy condition

### Error: "Access Denied"
- Verify credentials are not expired
- Check if MFA is required but not provided
- Verify the user/role has the policy attached

### Error: "Invalid security token"
- Access key ID or secret access key is incorrect
- Credentials may have been rotated or deleted
- Check for typos in environment variables

## Additional Resources

- [AWS Pinpoint SMS and Voice v2 API Reference](https://docs.aws.amazon.com/pinpoint/latest/apireference_smsvoicev2/Welcome.html)
- [AWS Service Authorization Reference](https://docs.aws.amazon.com/service-authorization/latest/reference/list_amazonpinpoint.html)
- [IAM Best Practices](https://docs.aws.amazon.com/IAM/latest/UserGuide/best-practices.html)
- [AWS Secrets Manager](https://docs.aws.amazon.com/secretsmanager/latest/userguide/intro.html)
