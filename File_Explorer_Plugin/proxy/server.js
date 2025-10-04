const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cookieParser = require('cookie-parser');
const { getUserFromCookie } = require('./auth');

const app = express();
app.use(cookieParser());

// Configure target of FileBrowser sidecar
const target = process.env.FILEBROWSER_URL || 'http://127.0.0.1:8080';

async function addUnraidHeaders(proxyReq, req, res) {
  try {
    const user = await getUserFromCookie(req);
    if (user) {
      proxyReq.setHeader('X-Unraid-User', user.username);
      proxyReq.setHeader('X-Unraid-Roles', Array.isArray(user.roles) ? user.roles.join(',') : String(user.roles));
    } else {
      proxyReq.setHeader('X-Unraid-User', 'anonymous');
      proxyReq.setHeader('X-Unraid-Roles', 'guest');
    }
  } catch (e) {
    // Best-effort; do not block request
    proxyReq.setHeader('X-Unraid-User', 'anonymous');
    proxyReq.setHeader('X-Unraid-Roles', 'guest');
  }
}

const proxy = createProxyMiddleware({
  target,
  changeOrigin: true,
  ws: true,
  logLevel: 'warn',
  pathRewrite: {
    '^/proxy': ''
  },
  onProxyReq: (proxyReq, req, res) => {
    // set headers for regular HTTP
    addUnraidHeaders(proxyReq, req, res);
  },
  onProxyReqWs: (proxyReq, req, socket, options, head) => {
    // set headers for websocket upgrade requests
    // Note: addUserFromCookie is async, but this callback is sync; attempt best-effort sync header
    if (req.headers && req.headers.cookie) {
      // Lightweight parsing to extract username cookie if present
      // Real-world should pre-populate req.user earlier via middleware
      proxyReq.setHeader('X-Unraid-User', 'ws-user');
      proxyReq.setHeader('X-Unraid-Roles', 'user');
    }
  }
});

app.use('/proxy', proxy);

app.get('/health', (req, res) => res.json({ok:true, target}));

const port = process.env.PORT || 9090;
app.listen(port, () => console.log(`File Explorer proxy listening on ${port}, proxying to ${target}`));
