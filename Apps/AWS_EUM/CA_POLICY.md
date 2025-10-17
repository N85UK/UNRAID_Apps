Community Applications Submission Notes

This package follows UnRaid CA policies:

- Policy thread: <https://forums.unraid.net/topic/87144-ca-application-policies-privacy-policy/>
- CA docs: <https://docs.unraid.net/unraid-os/using-unraid-to/run-docker-containers/community-applications/>

Privacy & Secrets:

- No AWS keys, credentials, or sensitive data are included in this repo or template.
- `.env.example` is provided to allow end users to create their own .env; it contains placeholder values only.

Suggested reviewer checklist:

- Confirm the template exposes environment variables for `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` and that there are no secrets in the template.
- Confirm volumes and paths use `/config` or appdata location (the template uses `./data` and instructions recommend UnRaid appdata mapping).
