AWS End User Messaging - Community Applications submission

This package bundles the AWS SMS App as a Community Applications (CA) template for UnRaid.

What this package contains
- Docker image and docker-compose configuration for the app
- `.env.example` (no secrets) — end users must copy to `.env` and provide their own AWS credentials
- README and submission notes for UnRaid CA

Privacy & Secrets
- This submission intentionally does not include any AWS keys or secrets.
- All credentials must be set by the end-user via the UnRaid CA template environment variables or by copying `.env.example` to the appdata directory and editing.

Resources
- UnRaid CA policies: https://forums.unraid.net/topic/87144-ca-application-policies-privacy-policy/
- Community Applications docs: https://docs.unraid.net/unraid-os/using-unraid-to/run-docker-containers/community-applications/

How to configure
1. Install via CA (once published)
2. In the template, set `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` and `AWS_REGION`
3. Optionally set `ORIGINATORS` to override default originators

Support
- This template is provided as-is. End users are responsible for AWS account configuration and billing.
