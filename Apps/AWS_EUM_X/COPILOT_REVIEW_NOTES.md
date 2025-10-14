Applied Copilot review suggestions:

- Fixed label in `views/first-run.ejs` to read 'AWS Region' (removed duplicate text).
- Updated E.164 regex in `server.js` to require '+' and 7-15 digits: `/^\+[1-9]\d{6,14}$/`.
- Avoid duplicate redactKey calls by storing `redactedAccessKey` and logging once.
- Fixed `package.json` smoke script to use jest on the smoke test file.

Pushed fixes to branch `feature/aws-eum-x-scaffold` and opened PR #1. CI will re-run automatically.
