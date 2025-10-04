# File Explorer Plugin (scaffold)

Lightweight Unraid plugin that integrates FileBrowser as a sidecar binary and proxies requests through a Node/Express middleware so the embedded UI can authenticate using Unraid session info.

Goals
- Sidecar binary (FileBrowser)
- Proxy in Node/Express for HTTP + WebSocket
- Target: Unraid 7.2.0-rc.1 and above

Quick start (development)
- Install Node (for proxy): `npm install` inside `proxy/`
- Build the plugin archive: `./build/build-txz.sh 2025.10.05.01`
- Upload archive to GitHub Release and update `file-explorer.plg` MD5

Security notes
- This scaffold is a starting point. Implement strict path validation, permission mapping, rate limiting, and audit logging before production use.

