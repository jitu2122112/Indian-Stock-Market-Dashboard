// DhanHQ CORS proxy — Cloudflare Worker
// ---------------------------------------------------------------------------
// Why this exists:
//   `dhan-live.html` is a static page (GitHub Pages / file://). Browsers block
//   its direct XHR/fetch calls to https://api.dhan.co because Dhan's API does
//   not send `Access-Control-Allow-Origin` headers. This worker sits in front of
//   the Dhan API and adds the CORS headers the browser requires.
//
// Request flow:
//   browser -> https://<your-worker>.workers.dev/v2/funds -> https://api.dhan.co/v2/funds
//
// Deploy: see proxy/README.md (wrangler deploy, ~2 minutes, free tier).
//
// Security notes (read before exposing this publicly):
//   * Set ALLOWED_ORIGINS to your own site(s). Requests from any other Origin
//     are rejected with 403, so a stranger cannot borrow your proxy.
//   * Set ALLOW_TOKENS to a shared secret and add the same value as the
//     `x-proxy-token` header on your client, if you want to stop people
//     scraping the Worker URL directly (curl, other tools) without a browser
//     Origin header.
//   * This worker forwards your Dhan `access-token`. It never logs or stores
//     it, but it does pass through Cloudflare. Only deploy it yourself —
//     never point the field at a proxy you do not control.

const DHAN_API = 'https://api.dhan.co';
const API_VERSIONS = ['/v1/', '/v2/'];
const DEFAULT_API_VERSION = '/v2';

// Comma-separated list of browser Origins allowed to use this proxy.
// Override per-environment with the ALLOWED_ORIGINS secret/variable.
const DEFAULT_ALLOWED_ORIGINS = [
    'https://jitu2122112.github.io',
    'http://localhost:8000',
    'http://localhost:8080',
    'http://127.0.0.1:8000',
    'http://127.0.0.1:8080'
].join(',');

// Headers worth forwarding to Dhan. Everything else (cookies, host, cf-*) is
// deliberately dropped so the Worker cannot be abused as an open relay.
const FORWARDED_HEADERS = [
    'content-type',
    'accept',
    'access-token',
    'client-id',
    'version',
    'authorization',
    'user-agent'
];

function parseList(value, fallback) {
    const raw = value || fallback;
    return String(raw)
        .split(',')
        .map(function (s) { return s.trim(); })
        .filter(Boolean);
}

function buildCorsHeaders(env, origin) {
    const allowed = parseList(env.ALLOWED_ORIGINS, DEFAULT_ALLOWED_ORIGINS);
    const isAllowed = allowed.indexOf(origin) !== -1;
    const headers = {
        'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Accept, access-token, client-id, version, Authorization, x-proxy-token',
        'Access-Control-Expose-Headers': 'Content-Type, x-ratelimit-limit, x-ratelimit-remaining',
        'Access-Control-Max-Age': '86400',
        'Vary': 'Origin'
    };
    // Echo back the exact Origin when allowed; never send '*' together with
    // credentialed requests. Fall back to the first allowlisted origin so an
    // unrelated caller still cannot read the response.
    headers['Access-Control-Allow-Origin'] = isAllowed ? origin : (allowed[0] || 'null');
    return { headers: headers, isAllowed: isAllowed };
}

function jsonResponse(body, status, extraHeaders) {
    const headers = Object.assign({ 'Content-Type': 'application/json; charset=utf-8' }, extraHeaders || {});
    return new Response(JSON.stringify(body, null, 2), { status: status, headers: headers });
}

// `/funds` -> `/v2/funds`; `/v2/funds` -> `/v2/funds` (already versioned).
function toDhanPath(pathname) {
    const clean = pathname.replace(/\/+$/, '') || '/';
    const isVersioned = API_VERSIONS.some(function (v) {
        return clean === v.slice(0, -1) || clean.indexOf(v) === 0;
    });
    return isVersioned ? clean : DEFAULT_API_VERSION + clean;
}

export default {
    async fetch(request, env, ctx) {
        const url = new URL(request.url);
        const origin = request.headers.get('Origin') || '';
        const cors = buildCorsHeaders(env, origin);

        // 1. Preflight — answer immediately, never forward to Dhan.
        if (request.method === 'OPTIONS') {
            return new Response(null, { status: 204, headers: cors.headers });
        }

        // 2. Reject callers outside the allowlist before touching the upstream.
        if (!cors.isAllowed) {
            return jsonResponse(
                {
                    status: 'blocked',
                    message: 'Origin not allowed by this proxy.',
                    hint: 'Set the ALLOWED_ORIGINS variable on the Worker to include ' + (origin || '(the calling origin)') + '.'
                },
                403,
                cors.headers
            );
        }

        // 3. Optional shared-secret check (stops non-browser callers).
        const allowTokens = parseList(env.ALLOW_TOKENS, '');
        if (allowTokens.length > 0) {
            const presented = request.headers.get('x-proxy-token') || '';
            if (allowTokens.indexOf(presented) === -1) {
                return jsonResponse(
                    { status: 'unauthorized', message: 'Missing or invalid x-proxy-token header.' },
                    401,
                    cors.headers
                );
            }
        }

        // 4. Health check — handy right after `wrangler deploy`.
        if (url.pathname === '/' || url.pathname === '/healthz') {
            return jsonResponse(
                {
                    status: 'ok',
                    service: 'dhan-cors-proxy',
                    upstream: DHAN_API,
                    allowedOrigins: parseList(env.ALLOWED_ORIGINS, DEFAULT_ALLOWED_ORIGINS),
                    tokenRequired: allowTokens.length > 0,
                    time: new Date().toISOString()
                },
                200,
                cors.headers
            );
        }

        // 5. Forward to Dhan.
        const upstreamUrl = DHAN_API + toDhanPath(url.pathname) + url.search;

        const forwardHeaders = new Headers();
        FORWARDED_HEADERS.forEach(function (name) {
            const value = request.headers.get(name);
            if (value !== null && value !== undefined) forwardHeaders.set(name, value);
        });
        forwardHeaders.set('Accept', forwardHeaders.get('Accept') || 'application/json');

        const hasBody = ['POST', 'PUT', 'PATCH', 'DELETE'].indexOf(request.method) !== -1
            && request.headers.get('Content-Length') !== '0';

        try {
            const upstream = await fetch(upstreamUrl, {
                method: request.method,
                headers: forwardHeaders,
                body: hasBody ? await request.clone().arrayBuffer() : undefined,
                redirect: 'follow'
            });

            // Copy the response, then attach CORS headers so the browser lets
            // the page read it. Response headers are immutable, hence the copy.
            const responseHeaders = new Headers(upstream.headers);
            Object.keys(cors.headers).forEach(function (key) {
                responseHeaders.set(key, cors.headers[key]);
            });
            // Dhan sends gzip/br; the Workers runtime already decoded it, so
            // advertising the original encoding would corrupt the payload.
            responseHeaders.delete('content-encoding');
            responseHeaders.delete('content-length');

            return new Response(upstream.body, {
                status: upstream.status,
                statusText: upstream.statusText,
                headers: responseHeaders
            });
        } catch (err) {
            return jsonResponse(
                {
                    status: 'upstream_error',
                    message: 'Could not reach api.dhan.co.',
                    detail: String(err && err.message ? err.message : err),
                    upstream: upstreamUrl
                },
                502,
                cors.headers
            );
        }
    }
};
