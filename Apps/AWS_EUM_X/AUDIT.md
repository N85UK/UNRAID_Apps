# AWS_EUM_X Audit & Plan (proposal)

Date: 2025-10-14
Author: Automated technical audit (N85UK repo review)

Purpose
-------
This document audits the current `AWS_EUM` implementation and proposes the
scope, design decisions, security hardening, UX patterns, and implementation
plan for a modernized successor `AWS_EUM_X` that is: secure-by-default,
observability-friendly, easy to install via Unraid Community Apps, and
production-ready for small teams and home labs.

Scope
-----
- Code & templates reviewed: `Apps/AWS_EUM` (all files)
- Primary service: AWS End User Messaging (SMS, Voice, Social, Push)
- Reference docs: AWS End User Messaging / Pinpoint SMS & Voice API (v2)
  - SendTextMessage: https://docs.aws.amazon.com/pinpoint/latest/apireference_smsvoicev2/API_SendTextMessage.html
  - DescribePhoneNumbers: https://docs.aws.amazon.com/pinpoint/latest/apireference_smsvoicev2/API_DescribePhoneNumbers.html
  - DescribeSenderIds: https://docs.aws.amazon.com/pinpoint/latest/apireference_smsvoicev2/API_DescribeSenderIds.html
  - MPS limits: https://docs.aws.amazon.com/sms-voice/latest/userguide/sms-limitations-mps.html
  - SMS character limits: https://docs.aws.amazon.com/sms-voice/latest/userguide/sms-limitations-character.html
- Comparable Unraid Community Apps surveyed (pattern extraction) — see section "UX Patterns"

Methodology
-----------
- Static review of repository files (`server.js`, `Dockerfile`, `my-aws-eum-v3.xml`, `public/*`, `views/*`)
- Run-time logs examined (as provided)
- Cross-checked code flows with AWS Pinpoint SMS/Voice v2 API
- Security and UX heuristics applied to defaults, secrets handling, and install flow

Executive Summary (top-level findings)
--------------------------------------
1. Functional: Core SMS send/describe flows exist and match AWS APIs (SendTextMessage,
   DescribePhoneNumbers, DescribeSenderIds). The app successfully initializes AWS
   client and lists originators.
2. UX: UI works but lacks a clear first-run wizard and inline validation. Some fields
   mismatch earlier (fixed) and charts required aspect-ratio adjustments.
3. Security: Secrets are partially redacted in logs but not consistently. CSP is
   configurable and defaults were previously insecure for some networks (fixed).
4. Observability: Minimal health endpoint exists, but no structured JSON logs,
   no metrics endpoint, and no readiness probe to verify AWS connectivity.
5. Operations: Dockerfile uses Node 20-alpine and non-root user — good. Data
   directory permission warnings exist when host mounts are misconfigured.
6. Missing AWS features: DryRun use for safe test messages, explicit message
   part estimation, and send throttling/backoff awareness are not surfaced.

Findings and Recommendations
----------------------------
Below each finding there is: severity (High/Medium/Low), location(s), and
recommended remediation.

A. Template XML / Unraid Template (High)
- Files: `my-aws-eum-v3.xml`, `template.cfg`
- Findings:
  - Some defaults (DISABLE_CSP) were set to false which caused CSP violations on
    br0.x networks.
  - Field descriptions are terse or absent; several env vars not clearly labelled
    with AWS concepts.
- Recommendation:
  - Create `my-aws-eum-x.xml` with clean sections: Overview, Required, Optional,
    Advanced, Logging, Security.
  - Every variable labeled with AWS term in brackets (e.g., `Region [AWS Region]`).
  - Default `DISABLE_CSP=true` when running on bridged custom networks and add
    clear help text when enabling/disabling CSP.
- Effort: 1 day

B. Container image and runtime (Medium)
- Files: `Dockerfile`
- Findings:
  - Uses Node 20-alpine and non-root (`appuser`) — good.
  - No explicit readiness probe that verifies AWS connectivity or DB initialization.
  - Healthcheck exists but merely queries `/health` without deeper checks.
- Recommendation:
  - Keep non-root image, reduce image size with multi-stage build (build deps then
    copy production files). Use `node:20-alpine` minimal final image or `distroless`.
  - Add a readiness probe `/ready` which verifies AWS client can perform a low-cost
    read (DescribePhoneNumbers with `MaxResults=1`) and that DB is open/readable.
  - Expand `HEALTHCHECK` to query `/ready` (or keep liveness vs readiness separation).
- Effort: 1–2 days

C. Secrets handling & logging (High)
- Files: `server.js`, `README.md`, `public/*`
- Findings:
  - AWS key is partially redacted in logs but other secrets may be accidentally logged.
  - Application logs are plain text lines; no structured JSON logs to ship to log systems.
  - Web UI includes a network origin printed which may leak internal IPs.
- Recommendation:
  - Use structured JSON logging (pino or winston) with serializers that redact
    known secrets (AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, session tokens, DB
    passwords). Provide both a JSON stream and a readable text stream.
  - Ensure no secrets are ever embedded in HTML templates or attribute values.
  - Add `process.env.NODE_ENV` handling to reduce debug output in production.
- Effort: 1–2 days

D. Health, readiness, and observability (Medium)
- Files: `server.js`
- Findings:
  - `/health` exists but doesn't return build info nor AWS readiness details.
  - No `/metrics` endpoint for Prometheus; no toggles for verbose logs.
- Recommendation:
  - Extend `/health` to return JSON with `version`, `build_timestamp`, `aws_connected`,
    `originator_count`, `db_ok`. Add `/ready` for readiness checks and `/metrics` optional.
  - Add verbose log toggle at runtime and endpoint `/observability` for debug info.
- Effort: 1–2 days

E. Rate limiting & backoff (High)
- Files: `server.js` (rateLimiter with default 10/min)
- Findings:
  - Server-side rate limiting exists but does not integrate with AWS MPS limits or
    perform queueing/backoff when limits are hit.
  - No visible per-originator or per-country MPS checks, and no DryRun support to
    preview message cost/parts.
- Recommendation:
  - Implement per-origination-identity MPS-aware throttling using server-side
    token bucket or leaky-bucket with configurable caps per identity type (PhoneNumber,
    SenderId) following AWS MPS docs.
  - Surface DryRun option to allow safe verification (`DryRun` param to SendTextMessage).
  - Respect `MessageParts` estimation and calculate projected cost/parts pre-send.
- Effort: 2–4 days

F. API surface and validation (High)
- Files: `public/js/app-v3.js`, `views/index-v3.ejs`, `server.js`
- Findings:
  - Input validation exists but must be robustly mapped against AWS API constraints
    (E.164 format, template matching, MaxPrice limits).
  - Earlier bug: form field mismatch (fixed) indicates need for end-to-end tests.
  - No client-side character & part estimator shown to the user.
- Recommendation:
  - Centralize validation logic server-side and expose same rules to the client
    (small validation library exported as a JSON schema used by both server and client).
  - Add live character count and message-part estimator in the UI.
  - Use `DryRun` UI toggle and UI confirmation flows to avoid accidental mass sends.
- Effort: 2–3 days

G. Webhook verification (High)
- Files: `server.js` contains `/api/webhook/update` but not SNS webhook handling
  for inbound SMS in EUM. The separate `AWS_2WAY` app subscribes to SNS but only
  confirms subscriptions; signature verification of SNS messages is not present.
- Findings:
  - For incoming SNS notifications, signature verification is required to ensure
    messages are from AWS (SNS signature verification docs).
- Recommendation:
  - Implement SNS message signature verification for any SNS-based webhook endpoints.
  - Follow AWS SNS verification steps (verify signature against signing cert URL),
    and reject unverified messages with 403.
- Effort: 1 day

H. Permissions & least privilege (Medium)
- Files: server.js (calls DescribePhoneNumbers, DescribeSenderIds, SendTextMessage)
- Findings:
  - Minimal IAM permissions are referenced in logs but no policy examples in the
    README.
- Recommendation:
  - Add sample IAM policy (least privilege) for `AWS_EUM_X` with explicit actions:
    - `pinpoint-sms-voice-v2:SendTextMessage`
    - `pinpoint-sms-voice-v2:DescribePhoneNumbers`
    - `pinpoint-sms-voice-v2:DescribeSenderIds`
    - `pinpoint-sms-voice-v2:PutMessageFeedback` (optional)
  - Recommend role assumption (IAM role) for EKS/IAM role for service accounts where available.
- Effort: 0.5 day

I. Upgrade and rollback (Medium)
- Files: GitHub Actions workflow + Docker builds
- Findings:
  - Automated workflows exist and produce multi-arch images. No explicit migration
    steps for DB schema changes or config versioning are included.
- Recommendation:
  - Add migration plan: schema version stored in `data/metadata.json` and migration
    scripts run on startup and gated by interactive prompts in UI.
  - Tag and publish release notes and include a `support bundle` export in the UI.
- Effort: 1–2 days

AWS Cross-Reference Table (features ↔ docs)
-------------------------------------------
- Send text message API (send message body, DestinationPhoneNumber, OriginationIdentity, DryRun):
  - https://docs.aws.amazon.com/pinpoint/latest/apireference_smsvoicev2/API_SendTextMessage.html
- Describe phone numbers (pagination, NextToken, MaxResults):
  - https://docs.aws.amazon.com/pinpoint/latest/apireference_smsvoicev2/API_DescribePhoneNumbers.html
- Describe sender IDs (pagination):
  - https://docs.aws.amazon.com/pinpoint/latest/apireference_smsvoicev2/API_DescribeSenderIds.html
- Rate limits & MPS: message parts per second guidance:
  - https://docs.aws.amazon.com/sms-voice/latest/userguide/sms-limitations-mps.html
- SMS character limits (GSM vs UCS-2):
  - https://docs.aws.amazon.com/sms-voice/latest/userguide/sms-limitations-character.html
- SNS webhook verification (SNS docs):
  - https://docs.aws.amazon.com/sns/latest/dg/ (use "Verifying the signature of a message" section)
- IAM actions & resource model for Pinpoint (least privilege):
  - https://docs.aws.amazon.com/service-authorization/latest/reference/list_amazonpinpoint.html

Missing AWS features to consider for AWS_EUM_X
----------------------------------------------
- DryRun send support UI flow (SendTextMessage DryRun boolean).
- Explicit message part calculator and pre-send price estimation.
- Per-originator and per-country MPS-aware throttling and queueing.
- Optional automatic PutMessageFeedback usage (to update message states).
- Role assumption / IAM profile support for hosting environments (EKS/ECS).
- Webhook signing verification for SNS messages (both inbound and subscription confirmation)

Concrete UI and DX patterns to adopt (8–12 patterns)
---------------------------------------------------
Each entry: pattern name — short description — why it helps

1. First-run wizard (Portainer / Home Assistant style)
   - A step-by-step setup (AWS credentials → region → origins → test).
   - Why: reduces configuration errors, increases completion rates.

2. Test/Validate button (Nginx Proxy Manager & Portainer)
   - Allows a dry-run test of credentials without sending real SMS (DryRun).
   - Why: safe verification, quick confidence for users.

3. Copyable CLI/Example commands (Traefik, Certbot docs)
   - Show ready-to-copy curl or aws cli commands for debugging.
   - Why: Saves time for power users and support.

4. Inline validation & estimator (Uptime Kuma message editor)
   - Live character count, message parts estimate, and immediate validation.
   - Why: Prevents invalid sends and unexpected charges.

5. Status dashboard tiles (Portainer/GitLab)
   - Small status cards: AWS connectivity, originators, last send, last error.
   - Why: One glance observability for operators.

6. Structured log viewer & downloadable support bundle (Synology/OMV style)
   - Readable logs with redaction and an option to export trimmed logs.
   - Why: Eases support and reduces secret sprawl.

7. Toggleable verbose / debug logs in UI
   - User can enable verbose via UI toggle or query param for temporary debugging.
   - Why: Minimizes noise in normal operation and helps triage when needed.

8. Export / Import config as YAML/JSON (Portainer/OctoPrint)
   - Backup and replicate configuration across environments.
   - Why: Easier upgrades and disaster recovery.

9. Health and readiness endpoints with build info (Kubernetes best practices)
   - `/health` and `/ready` endpoints returning JSON and exit status codes.
   - Why: Enables automated checks and monitoring integration.

10. Action page for common tasks (clear queue, send test, re-sync origins)
    - Centralize operational actions in one page with confirmations.
    - Why: Saves time and avoids scattered UI controls.

11. Rate-limit indicators and queue depth (Twilio Console inspiration)
    - Indicate remaining throughput, queued messages, and per-originator caps.
    - Why: Prevents accidental throttling and white-hat behaviour.

12. Contextual AWS doc links next to fields
    - For each AWS-specific setting link directly to the exact AWS doc page.
    - Why: Reduces help requests and educates users.

Deliverables for AWS_EUM_X (what will be produced)
-------------------------------------------------
- New Unraid template: `my-aws-eum-x.xml` (clean sections + descriptions)
- App folder: `Apps/AWS_EUM_X/` including:
  - `Dockerfile` (multi-stage optimized, non-root)
  - `server.js` (refactored: modular, pino logs, /health, /ready, /metrics optional)
  - `public/` UI (first-run wizard + dashboard + settings + observability pages)
  - `views/` templates for first-run and admin UI
  - `config/schema.json` or similar (shared validation rules)
  - `docs/` README.md, CHANGELOG.md, SECURITY.md, CONTRIBUTING.md, INSTALL.md
  - `icons/` 512x512 PNG and SVG (for Community Apps)
  - `ci/` smoke-test CI workflow (start container, hit /health, run config-lint)
  - `examples/` sample IAM policies, `docker-compose.yml` for dev
  - `support/` support-bundle script and instructions

Security & Compliance checklist
-------------------------------
- [ ] Secrets never logged in plain text (redaction + structured logs)
- [ ] CSRF protection on forms or cookie-less API usage with CSRF tokens for HTML forms
- [ ] X-Frame-Options set to DENY or SAMEORIGIN (configurable)
- [ ] CSP strict by default, opt-out via DISABLE_CSP true flag (documented)
- [ ] Input validation for phone numbers and message body
- [ ] SNS webhook signature verification
- [ ] Minimal IAM policy examples and guidance for role-based access
- [ ] GDPR friendly log retention and opt-out guidance

Sample Minimal IAM Policy (Least privilege)
-------------------------------------------
Note: confirm action namespace (v2 APIs use `pinpoint-sms-voice` / `mobiletargeting`.
Use service authorization docs to confirm exact action names. Example policy below is illustrative:

{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "pinpoint-sms-voice-v2:SendTextMessage",
        "pinpoint-sms-voice-v2:DescribePhoneNumbers",
        "pinpoint-sms-voice-v2:DescribeSenderIds",
        "pinpoint-sms-voice-v2:PutMessageFeedback"
      ],
      "Resource": "*"
    }
  ]
}

(Recommendation: scope `Resource` with ARNs that match the account/phone number IDs
where possible for least privilege.)

Testing & Quality Gates
-----------------------
- Unit tests for configuration parsing and redaction logic (Node unit tests).
- Linting (ESLint with recommended Node rules), security lint (npm audit in CI), and
  static checks (no secrets in repo).
- CI smoke test: build image, run container, wait for `/health` => status: ok
- Integration test: `DryRun` send text path to validate request formatting without sending
  real SMS charges.

Acceptance Criteria
-------------------
- Fresh Unraid user can install `AWS_EUM_X` and complete first-run wizard and send a
  DryRun test in under 10 minutes.
- All settings are documented and have concise makes-sense defaults.
- Health checks, logs, and support bundle make misconfiguration diagnosable.
- CI smoke tests pass and image runs as non-root.

Project plan & timeline (rough)
-------------------------------
Phase 1 — Audit & design: (this doc) — 1–2 days
Phase 2 — Template + Docker improvements + health endpoints — 2–3 days
Phase 3 — Logging, secrets redaction, readiness, DryRun & throttling — 4–6 days
Phase 4 — First-run wizard UI & validations — 4–6 days
Phase 5 — Observability page, config import/export, support bundle — 2–4 days
Phase 6 — Testing + CI + docs + release assets — 2–3 days
Total (MVP): 2–3 weeks (approx 3–5 dev days/week)

Decisions & trade-offs
----------------------
- Small single-process Node app chosen over multi-service architecture to keep
  resource usage low for Unraid users.
- Use pino for structured logs (low overhead) and provide human-readable stream
  for local logs — trade-off: need to maintain redaction rules.
- Prometheus metrics optional instead of required to reduce surface area and
  keep image small.

Backlog (nice-to-have)
----------------------
- Role assumption via AWS SSO or cross-account support (medium effort)
- Prometheus `/metrics` endpoint and sample Grafana dashboard (medium)
- In-app guided tour and screenshots for first-run (small)
- Signed images in GitHub Container Registry (requires CI signing setup) (small)
- Support for social messaging channels and push (later phase) (larger)

Next steps (per your request)
----------------------------
1. Sign-off on AUDIT.md and priority lists.
2. I will scaffold `Apps/AWS_EUM_X/` with the minimal Dockerfile, template, health
   endpoints, structured logging, and new `README.md` for iterative delivery.
3. Implement first-run wizard and observability features after core runtime
   improvements are merged.

Appendix: Files reviewed
------------------------
- `server.js` — main runtime (express app)
- `public/js/app-v3.js` — client logic
- `views/index-v3.ejs` — HTML template
- `Dockerfile` — container build
- `my-aws-eum-v3.xml` — Unraid template
- `README.md`, `CHANGELOG.md`, `CONTRIBUTING.md`


End of audit. Please review and sign off to begin the implementation phase.
