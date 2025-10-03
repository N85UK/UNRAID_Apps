import httpProxy from 'http-proxy';

// Lightweight websocket proxy helper - create a ws-capable proxy instance
export function createWebsocketProxy(target: string) {
  const proxy = httpProxy.createProxyServer({ target, ws: true });

  // Allow consumers to supply headers at the moment of ws proxying via options
  proxy.on('error', (err: any) => {
    // Real implementation should log errors centrally
    // console.error('ws-proxy-error', err);
  });

  return proxy;
}
