const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cookieParser = require('cookie-parser');
const { getUserFromCookie, getCachedUserForCookie } = require('./auth');

const app = express();
app.use(cookieParser());

// Configure target of FileBrowser sidecar
const target = process.env.FILEBROWSER_URL || 'http://127.0.0.1:8080';

// Pre-middleware to populate req.user for normal HTTP requests
app.use('/proxy', async (req, res, next) => {
  try {
    const user = await getUserFromCookie(req);
    if (user) req.user = user;
  } catch (e) {
    // ignore
  }
  next();
});

// Endpoint for iframe to fetch resolved session (avoids probing GraphQL every request)
app.get('/proxy/_session', async (req, res) => {
  try {
    const user = await getUserFromCookie(req);
    if (user) return res.json({ok:true,user});
    return res.json({ok:false,user:null});
  } catch (e) {
    return res.status(500).json({ok:false,error:e.message});
  }
});

async function addUnraidHeaders(proxyReq, req, res) {
  try {
    const user = req.user || (req.headers && req.headers.cookie && getCachedUserForCookie(req.headers.cookie));
    if (user) {
      proxyReq.setHeader('X-Unraid-User', user.username);
      proxyReq.setHeader('X-Unraid-Roles', Array.isArray(user.roles) ? user.roles.join(',') : String(user.roles));
    } else {
      proxyReq.setHeader('X-Unraid-User', 'anonymous');
      proxyReq.setHeader('X-Unraid-Roles', 'guest');
    }
  } catch (e) {
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
    // set headers for websocket upgrade requests using cached user
    try {
      const cookie = req.headers && req.headers.cookie;
      const user = cookie ? getCachedUserForCookie(cookie) : null;
      if (user) {
        proxyReq.setHeader('X-Unraid-User', user.username);
        proxyReq.setHeader('X-Unraid-Roles', Array.isArray(user.roles) ? user.roles.join(',') : String(user.roles));
      } else {
        proxyReq.setHeader('X-Unraid-User', 'anonymous');
        proxyReq.setHeader('X-Unraid-Roles', 'guest');
      }
    } catch (e) {
      proxyReq.setHeader('X-Unraid-User', 'anonymous');
      proxyReq.setHeader('X-Unraid-Roles', 'guest');
    }
  }
});

app.use('/proxy', proxy);

app.get('/health', (req, res) => res.json({ok:true, target}));

const port = process.env.PORT || 9090;
app.listen(port, () => console.log(`File Explorer proxy listening on ${port}, proxying to ${target}`));
