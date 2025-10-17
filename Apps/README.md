# UNRAID Apps

A collection of Docker applications packaged for UNRAID Community Applications (CA).

## Applications

### AWS End User Messaging (EUM)

A web-based SMS sending application using AWS Pinpoint SMS services.

**Status**: ✅ Ready for CA submission
**Docker Image**: `ghcr.io/n85uk/aws-eum:latest`
**Category**: Utilities

#### Features

- Web interface for sending SMS messages
- AWS Pinpoint SMS integration
- Configurable originators (phone numbers)
- Message history tracking
- Secure credential management (no secrets included)

#### Installation

1. **Via UNRAID Community Applications** (recommended):
   - Once approved, search for "AWS End User Messaging" in the Apps tab
   - Configure your AWS credentials in the template

2. **Manual Docker Installation**:

   ```bash
   docker run -d \
     --name aws-eum \
     -p 80:80 \
     -e AWS_ACCESS_KEY_ID=your_key \
     -e AWS_SECRET_ACCESS_KEY=your_secret \
     -e AWS_REGION=eu-west-2 \
     -v /mnt/user/appdata/aws-eum:/app/data \
     ghcr.io/n85uk/aws-eum:latest
   ```

#### Configuration

- `AWS_ACCESS_KEY_ID`: Your AWS access key (required)
- `AWS_SECRET_ACCESS_KEY`: Your AWS secret key (required)
- `AWS_REGION`: AWS region (default: eu-west-2)
- `ORIGINATORS`: Comma-separated list of label:arn pairs for phone numbers

## Development

### Prerequisites

- Node.js 20+
- Docker
- AWS Account with Pinpoint SMS configured

### Building

```bash
cd Apps/AWS_EUM
npm install
npm run build  # if needed
docker build -t aws-eum .
```

### Publishing

The GitHub Actions workflow automatically builds and publishes the Docker image to GHCR on pushes to main branch.

## Community Applications Submission

This repository contains properly formatted templates for UNRAID Community Applications submission.

### Submission Status

- **AWS EUM**: Ready for submission to <https://github.com/Squidly271/community.applications>

### Files Included

- `my-aws-*.xml` - UNRAID CA template configuration (XML format)
- `doc.md` - Application documentation with CA metadata
- Docker image published to GHCR
- Security compliance (no secrets included)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see [LICENSE](../LICENSE) file for details.

## Support

For issues with specific applications, please check their respective documentation or create an issue in this repository.

---

**Copyright (c) 2025 N85UK**
