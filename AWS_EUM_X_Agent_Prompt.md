# Agent Brief: Review and Advance `AWS_EUM_X`

**Date:** 14 Oct 2025  
**Owner:** Paul McCann  
**Repository:** https://github.com/N85UK/UNRAID_Apps/tree/main/Apps/AWS_EUM_X  
**Primary Docs:** AWS End User Messaging via Pinpoint SMS and Voice v2  
- Service overview: https://docs.aws.amazon.com/end-user-messaging/  
- API reference: https://docs.aws.amazon.com/pinpoint/latest/apireference_smsvoicev2/Welcome.html

## Goal
Perform a tight technical and UX review of `AWS_EUM_X` and deliver a production minded MVP that is secure by default, observable, and easy to install through Unraid Community Apps. Keep the footprint small and the upgrade path smooth. Prepare for future channels without committing to them today.

## Outcomes
1. A short audit that confirms what is present, what is missing, and what is risky.  
2. A minimal but complete MVP with: first run readiness, structured logs with redaction, health and readiness endpoints, DryRun support, and improved template XML.  
3. Documentation and CI smoke tests so new users can install and verify in under ten minutes.

## Review Tasks
- Read all files under `Apps/AWS_EUM_X`. Identify server entry points, UI assets, template XML, docs, and CI content.
- Cross reference implemented features with the AWS Pinpoint SMS and Voice v2 APIs. Confirm parameters, pagination, and limits.
- Confirm no secrets are printed in logs or HTML. Check for CSP and basic security headers.
- Verify that `/health` and `/ready` are implemented. If present, check that readiness exercises a low cost AWS read such as `DescribePhoneNumbers` with `MaxResults=1`. If missing, add them.
- Check the Unraid template for clear labels and sensible defaults. Ensure the WebUI link is correct, the icon URLs resolve, and that variables use explicit AWS terms in brackets.
- Review rate limiting. Align server limits with AWS Messages Per Second guidance. Provide safe defaults and surface the setting in the template.
- Verify or add DryRun support to `SendTextMessage`. Add a live character and message part estimator for GSM and UCS 2.
- Confirm inbound webhook handling. If using SNS, add signature verification and reject unverified messages with 403.

## Required Changes
- **Logging**: Switch to structured JSON logs with redaction of access keys, secret keys, session tokens, and authorisation headers. Provide an option to mirror to a readable text stream.
- **Health and readiness**: `/health` returns status, version, and build timestamp. `/ready` exercises AWS connectivity and returns 200 only when the app can make a low cost API call successfully.
- **Template**: New `my-aws-eum-x.xml` with grouped sections. Required settings first. Advanced and logging later. Each variable has a one line label followed by a clear help text that references the AWS concept in brackets.
- **DryRun and validation**: Add a DryRun boolean in the API and the UI. Implement a shared validation schema used by both client and server. Show character count and parts estimate before sending.
- **Rate limiting**: Implement an MPS aware throttle with queue and backoff. Expose caps via environment variables and the Unraid template.
- **Security**: Enable CSP by default. Provide a toggle to disable CSP only when required by certain reverse proxies. Set X Frame Options to SAMEORIGIN. Add CSRF protection if using cookie based forms.
- **SNS verification**: Implement the full AWS SNS signature verification path. Handle `SubscriptionConfirmation` and `Notification` types correctly. Reject anything that fails verification.
- **Support bundle**: Add a support bundle export that includes version info, health output, sanitised logs, and template config minus secrets.

## Deliverables
- Pull request to `Apps/AWS_EUM_X` that includes:
  - Source updates for logging, DryRun, validation, readiness, and SNS verification.
  - Updated `templates/my-aws-eum-x.xml` with clear sections and sensible defaults.
  - `docs/README.md`, `docs/SECURITY.md`, `docs/CHANGELOG.md`, `docs/CONTRIBUTING.md`, and `docs/AUDIT.md`.
  - `ci/smoke-test.yml` that builds the image, runs the container, and polls `/ready` until it is 200 or times out.
  - `scripts/support-bundle.sh` that redacts secrets by default.
- Short `AUDIT.md` covering findings, the AWS cross reference, and decisions taken.

## Acceptance Criteria
- A fresh Unraid user can import the template, start the container, complete a short wizard or readiness step, and perform a DryRun send in under ten minutes.
- `/health` returns status, version, and build timestamp. `/ready` returns 200 only when AWS connectivity is verified.
- Logs are structured and contain no secrets when log level is set to debug.
- The template shows clear labels and the WebUI opens successfully.
- The support bundle is exportable from the UI or a script and contains only redacted data.

## Implementation Notes
- Use the AWS SDK for JavaScript v3 clients for Pinpoint SMS and Voice v2. Keep requests small and timeouts reasonable.
- Provide environment variable toggles for region, credentials mode, log level, MPS caps, and CSP disable.
- Keep the image small. Use a multi stage Node build and run as a non root user. Add a healthcheck that calls `/ready`.

## Future Roadmap
- Prometheus metrics endpoint and Grafana dashboard.
- In app log viewer and guided first run.
- Optional role assumption and SSO support where Unraid environments permit it.
- Additional channels when the core SMS path is stable.
