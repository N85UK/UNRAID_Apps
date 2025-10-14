Security disclosure and guidance

- Report vulnerabilities by opening a GitHub issue and tagging `security`.
- Do not include secrets in issue descriptions.
- The app redacts common secret values in logs; verify redaction before sharing logs.

Minimum IAM permissions (see examples in `iam/policy.json`).

Sensitive data handling:
- All persisted config files are created with file mode `0600` when written by the app.
- The app does not persist credentials provided to the /api/test/credentials endpoint.

TLS and reverse proxy guidance:
- Run behind a reverse proxy (nginx or the Unraid built-in) and terminate TLS there.
- Ensure `X-Forwarded-Proto` and `X-Forwarded-For` headers are preserved.
