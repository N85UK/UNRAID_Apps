const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cookieParser = require('cookie-parser');

const app = express();
app.use(cookieParser());

// Configure target of FileBrowser sidecar
const target = process.env.FILEBROWSER_URL || 'http://127.0.0.1:8080';

// Simple auth bridge: for now we add a placeholder header; replace with real session mapping
function addUnraidHeaders(proxyReq, req, res) {
  // TODO: map Unraid session cookie to username/roles
  proxyReq.setHeader('X-Unraid-User', (req.user && req.user.username) || 'unknown');
  proxyReq.setHeader('X-Unraid-Roles', 'user');
}

const proxy = createProxyMiddleware({
  target,
  changeOrigin: true,
  ws: true,
  logLevel: 'warn',
  onProxyReq: addUnraidHeaders,
});

app.use('/proxy', proxy);

app.get('/health', (req, res) => res.json({ok:true, target}));

const port = process.env.PORT || 9090;
app.listen(port, () => console.log(`File Explorer proxy listening on ${port}, proxying to ${target}`));
