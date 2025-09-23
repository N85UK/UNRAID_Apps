%name: AWS End User Messaging (EUM)
%slug: AWS_EUM
%version: 1.0.0
%author: Paul McCann
%category: Utilities
%description: Simple web UI for sending SMS using AWS Pinpoint SMS (originators provided by user). No keys are included; end users must set their own credentials.

# AWS End User Messaging (EUM)

This template deploys the AWS SMS App in a docker container. The app allows users to send SMS messages using AWS Pinpoint SMS/Voice v2. All secrets MUST be provided by the end user via the CA template environment variables.

### Environment variables exposed to the user
- `AWS_ACCESS_KEY_ID` (required)
- `AWS_SECRET_ACCESS_KEY` (required)
- `AWS_REGION` (default: eu-west-2)
- `PORT` (default: 80)
- `ORIGINATORS` (optional; comma-separated list of label:arn pairs)

### Notes for reviewers
- This template intentionally omits secrets. The `.env.example` file is included for convenience but contains no secrets.
- The app stores SMS history in a volume mounted to `/config/data` (UnRaid appdata recommended).

### Docker image
- The template references the image `ghcr.io/n85uk/aws-eum:latest`. A GitHub Actions workflow is included to build and publish the image to GHCR on push to `main` or on release.
