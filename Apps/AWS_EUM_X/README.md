# AWS_EUM_X

AWS_EUM_X is a modernized successor to AWS_EUM. It provides a simple,
secure, and observable Unraid-ready interface for AWS End User Messaging (SMS).

Status: scaffolded — initial public beta.

Quick start
-----------
1. Install via Community Apps (import the XML template `my-aws-eum-x.xml`) or
   run the container manually.
2. On first run, open the Web UI and complete the first-run wizard (AWS
   credentials, region, test credentials).
3. Use dry-run to validate configuration before sending real messages.

Features
--------
- First-run wizard for safe setup
- Structured JSON logs and redaction
- Health and probe endpoints: `/health`, `/ready`, `/probe/aws`
- Dry-run message testing (no cost)

Security notes
--------------
- Do not paste long-lived secrets into screenshots or public channels.
- Prefer IAM roles for production deployments.

Contributing
------------
See `CONTRIBUTING.md` for guidance.

License
-------
MIT

Screenshots
-----------
Please add screenshots of the running UI in `docs/screenshots/` to help users get started. Recommended captures:
- Dashboard showing system tiles and queue
- Queue view with a pending message and a resend action
- Per-origin MPS override form populated with example overrides

Build notes
-----------
- The persistence layer uses better-sqlite3 (native module). When building locally or in Docker, ensure the system has the C toolchain and SQLite dev headers.
- On Debian/Ubuntu runners (CI) install: build-essential, python3, pkg-config, libsqlite3-dev.
- On Alpine (Dockerfile) the image installs: build-base, python3, sqlite-dev for the build step and then removes build deps.

