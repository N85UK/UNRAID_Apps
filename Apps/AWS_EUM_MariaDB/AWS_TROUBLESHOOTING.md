# AWS Credentials Troubleshooting Guide

## 🚨 Common Error: "The security token included in the request is invalid"

This error typically indicates an issue with your AWS credentials configuration.

## 🔧 Step-by-Step Fix

### 1. Verify Your AWS Credentials

**Check your UNRAID Docker container environment variables:**

- `AWS_ACCESS_KEY_ID` - Should be 20 characters, starting with "AKIA"
- `AWS_SECRET_ACCESS_KEY` - Should be 40 characters
- `AWS_REGION` - Should match where your phone numbers are registered

### 2. Test Your Credentials

Visit your app at `http://your-unraid-ip:8080/api/aws/test` to test your AWS connection. This will give you specific error information.

### 3. Common Issues & Solutions

#### ❌ **Invalid Access Key ID**

```
Error: The security token included in the request is invalid
```

**Solution:**

- Double-check your `AWS_ACCESS_KEY_ID` in UNRAID
- Ensure there are no extra spaces or characters
- Verify it's exactly 20 characters long

#### ❌ **Invalid Secret Access Key**

```
Error: The security token included in the request is invalid
```

**Solution:**

- Double-check your `AWS_SECRET_ACCESS_KEY` in UNRAID
- Ensure there are no extra spaces or characters
- Verify it's exactly 40 characters long

#### ❌ **Wrong AWS Region**

```
Error: No phone numbers found
```

**Solution:**

- Check which region your AWS phone numbers are in
- Update `AWS_REGION` to match (e.g., `us-east-1`, `eu-west-2`)

#### ❌ **Insufficient Permissions**

```
Error: User is not authorized to perform pinpoint-sms-voice-v2:DescribePhoneNumbers
```

**Solution:**

- Your AWS user needs additional permissions
- See "Required AWS Permissions" below

## 🔐 Required AWS Permissions

Your AWS user/role needs these permissions:

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "pinpoint-sms-voice-v2:DescribePhoneNumbers",
                "pinpoint-sms-voice-v2:DescribeSenderIds",
                "pinpoint-sms-voice-v2:SendTextMessage",
                "pinpoint-sms-voice-v2:DescribeOriginationIdentities"
            ],
            "Resource": "*"
        }
    ]
}
```

## 🛠️ How to Fix AWS Permissions

### Method 1: AWS Console (Easy)

1. Go to **AWS IAM Console** → **Users**
2. Click on your user
3. Click **Add permissions** → **Attach policies directly**
4. Search for "**PinpointSMSVoiceFullAccess**" and attach it

### Method 2: Custom Policy (Recommended)

1. Go to **AWS IAM Console** → **Policies**
2. Click **Create policy**
3. Use the JSON above
4. Name it "AWS-EUM-SMS-Policy"
5. Attach to your user

## 📋 Getting New AWS Credentials

If you need to create new credentials:

1. **AWS Console** → **IAM** → **Users**
2. Click your username
3. **Security credentials** tab
4. **Create access key**
5. Choose "**Application running outside AWS**"
6. Copy the **Access Key ID** and **Secret Access Key**
7. Update your UNRAID container environment variables

## 🔄 Quick Fix Checklist

- [ ] AWS_ACCESS_KEY_ID is exactly 20 characters
- [ ] AWS_SECRET_ACCESS_KEY is exactly 40 characters  
- [ ] No extra spaces in environment variables
- [ ] AWS_REGION matches your phone number region
- [ ] AWS user has PinpointSMSVoice permissions
- [ ] Tested at `/api/aws/test` endpoint

## 📱 Verifying Your Setup

### 1. Check AWS Phone Numbers

In AWS Console:

- Go to **Amazon Pinpoint** → **SMS and voice** → **Phone numbers**
- Ensure you have at least one phone number in your region
- Note the region where your numbers are located

### 2. Test the Connection

```bash
# Test your AWS connection
curl http://your-unraid-ip:8080/api/aws/test
```

### 3. Check Container Logs

In UNRAID:

- **Docker** tab → **AWS_EUM** → **Logs**
- Look for specific error messages and suggestions

## 🎯 Success Indicators

When working correctly, you'll see:

```
✅ AWS SMS client initialized successfully  
📍 Region: eu-west-2
🔑 Access Key: AKIA****XXXX
🔍 Fetching originators from AWS...
✅ Found 2 phone numbers from AWS
📞 Total originators available: 2
```

## 💡 Still Having Issues?

1. **Create a test AWS user** with only SMS permissions
2. **Use a different AWS region** (try `us-east-1`)
3. **Check AWS service health** at status.aws.amazon.com
4. **Contact AWS support** if credentials definitely should work

## 📞 Support

If none of these steps work:

- Open an issue at: <https://github.com/N85UK/UNRAID_Apps/issues>
- Include the output from `/api/aws/test`
- Include relevant container logs (without revealing credentials)

---

**⚠️ Security Note**: Never share your actual AWS credentials. The app will show masked versions in logs for security.
