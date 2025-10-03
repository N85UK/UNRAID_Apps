import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

// Portable fetch helper: prefer global fetch (Node >= 18), fall back to CommonJS node-fetch v2,
// then attempt dynamic ESM import if available.
async function doFetch(url: string, opts: any) {
  if (typeof (globalThis as any).fetch === 'function') {
    return (globalThis as any).fetch(url, opts);
  }
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const nf = require('node-fetch');
    return nf(url, opts);
  } catch (e) {
    try {
      const mod = await import('node-fetch');
      const f = (mod as any)?.default || (mod as any);
      return f(url, opts);
    } catch (er) {
      return null;
    }
  }
}

type CachedEntry = { user: { username: string; roles: string[] } | null; expiresAt: number };

@Injectable()
export class TokenBridgeService {
  private readonly logger = new Logger(TokenBridgeService.name);
  private readonly cache = new Map<string, CachedEntry>();
  private readonly cacheTtlMs: number;
  private readonly validateUrl?: string;

  constructor(private readonly configService: ConfigService) {
    const ttl = Number(this.configService.get('FILEMANAGER_BRIDGE_CACHE_TTL') || 5 * 60); // seconds
    this.cacheTtlMs = ttl * 1000;
    this.validateUrl = (this.configService.get('UNRAID_API_URL') as string) || (this.configService.get('FILEMANAGER_BRIDGE_VALIDATE_URL') as string);
    if (!this.validateUrl) {
      this.logger.warn('TokenBridgeService: no UNRAID_API_URL or FILEMANAGER_BRIDGE_VALIDATE_URL configured; falling back to stubbed validation');
    }
  }

  private cacheSet(key: string, user: { username: string; roles: string[] } | null) {
    this.cache.set(key, { user, expiresAt: Date.now() + this.cacheTtlMs });
  }

  private cacheGet(key: string) {
    const e = this.cache.get(key);
    if (!e) return null;
    if (Date.now() > e.expiresAt) {
      this.cache.delete(key);
      return null;
    }
    return e.user;
  }

  // Public: returns a user object or null
  async getUserFromRequest(req: any) {
    // Check header API key first
    const apiKey = req.headers?.['x-api-key'] || req.headers?.['X-API-KEY'];
    if (apiKey) {
      const cacheKey = `api:${String(apiKey)}`;
      const cached = this.cacheGet(cacheKey);
      if (cached) return cached;
      const validated = await this.validateApiKey(String(apiKey));
      this.cacheSet(cacheKey, validated);
      return validated;
    }

    // Then check cookies/session
    const cookies = req.cookies || {};
    const cookieHeader = req.headers?.cookie || Object.keys(cookies).map((k) => `${k}=${cookies[k]}`).join('; ');
    const sess = cookies['UNRAIDSESSID'] || cookies['unraid_session'] || null;
    const cacheKey = cookieHeader ? `cookie:${cookieHeader}` : null;
    if (cacheKey) {
      const cached = this.cacheGet(cacheKey);
      if (cached) return cached;
    }

    const user = await this.validateSessionWithUnraid(cookieHeader);
    if (cacheKey) this.cacheSet(cacheKey, user);
    return user;
  }

  // Validate API key against Unraid GraphQL 'me' query using x-api-key header
  private async validateApiKey(key: string) {
    if (!this.validateUrl) return null;
    try {
      const gqlUrl = this.validateUrl.replace(/\/$/, '') + '/graphql';
      const resp = await doFetch(gqlUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': key,
        },
        body: JSON.stringify({ query: '{ me { username roles } }' }),
      });
      if (!resp) return null;
      const body: any = await resp.json();
      const me = body?.data?.me;
      if (!me) return null;
      // Map roles as needed
      return { username: me.username, roles: this.mapRoles(me.roles || []) };
    } catch (err) {
      this.logger.debug('validateApiKey error', err as any);
      return null;
    }
  }

  private async validateSessionWithUnraid(cookieHeader?: string | null) {
    if (!this.validateUrl) return null;
    try {
      const gqlUrl = this.validateUrl.replace(/\/$/, '') + '/graphql';
      const resp = await doFetch(gqlUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(cookieHeader ? { cookie: cookieHeader } : {}),
        },
        body: JSON.stringify({ query: '{ me { username roles } }' }),
      });

      if (!resp) return null;
      const body: any = await resp.json();
      const me = body?.data?.me;
      if (!me) return null;
      return { username: me.username, roles: this.mapRoles(me.roles || []) };
    } catch (err) {
      this.logger.debug('validateSessionWithUnraid error', err as any);
      return null;
    }
  }

  // Map Unraid roles to a normalized roles array suitable for proxy headers
  private mapRoles(unraidRoles: any): string[] {
    // Expect unraidRoles to be an array like ['admin']
    if (!Array.isArray(unraidRoles)) return [];
    const out = new Set<string>();
    for (const r of unraidRoles) {
      const rr = String(r).toLowerCase();
      if (rr === 'admin') out.add('admin');
      else if (rr === 'connect') out.add('connect');
      else if (rr === 'guest') out.add('guest');
      else out.add(rr);
    }
    return Array.from(out);
  }

  // Helper for other modules
  getUserFromCookie(cookies: any) {
    const fakeReq: any = { cookies };
    return this.getUserFromRequest(fakeReq);
  }
}
