# Dhan CORS proxy (optional)

`dhan-live.html` is a **static page** — served from GitHub Pages, or opened
straight off disk. Browsers refuse its calls to `https://api.dhan.co` because
Dhan's API responds without `Access-Control-Allow-Origin` headers. The page
detects that, tells you so, and keeps running in **paper mode** with simulated
fills.

To trade **live** from the browser page, put this small proxy in front of the
Dhan API. It adds the CORS headers the browser wants and forwards everything
else untouched.

```
browser  →  https://<your-worker>.workers.dev/v2/funds  →  https://api.dhan.co/v2/funds
```

> **Nothing here is required to use the dashboard.** Paper mode is fully
> functional without a proxy. Only set this up if you want real orders and
> positions from the static page.

---

## 1. Deploy the Worker (Cloudflare, ~2 minutes, free tier)

Install [Wrangler](https://developers.cloudflare.com/workers/wrangler/) and log in:

```bash
npm install -g wrangler
wrangler login
```

From the `proxy/` folder:

```bash
wrangler deploy dhan-cors-worker.js \
  --name dhan-cors-proxy \
  --compatibility-date 2025-01-01
```

Wrangler prints your URL, e.g. `https://dhan-cors-proxy.<your-subdomain>.workers.dev`.

Verify it is alive:

```bash
curl https://dhan-cors-proxy.<your-subdomain>.workers.dev/healthz
```

You should see `{"status": "ok", ...}`.

## 2. Allowlist your site

By default the Worker accepts requests from
`https://jitu2122112.github.io`, `localhost:8000` and `localhost:8080`
(see `DEFAULT_ALLOWED_ORIGINS` in the file). Any other Origin gets a `403`.

To change it without redeploying:

```bash
wrangler secret put ALLOWED_ORIGINS
# then paste, comma-separated, no trailing slashes:
# https://jitu2122112.github.io,http://localhost:8000
```

The default list covers this repository's GitHub Pages URL. If you forked the
repo, update it to **your** username.

## 3. Paste the URL into the dashboard

Open `dhan-live.html` → **🔑 Dhan Account** card → **API proxy** field, and
paste the Worker URL:

```
https://dhan-cors-proxy.<your-subdomain>.workers.dev
```

Both of these work — the Worker prepends `/v2` when the path is not already
versioned:

| What you paste | Resolves to |
| --- | --- |
| `https://dhan-cors-proxy.x.workers.dev` | `…/v2/funds` |
| `https://dhan-cors-proxy.x.workers.dev/v2` | `…/v2/funds` |

Then click **🔌 Connect to Dhan**. Leave the field blank to attempt direct
calls (which will work only if you run your own reverse proxy locally, or if
Dhan starts sending CORS headers).

The value is stored in this browser's `localStorage` alongside your Client ID
and Access Token, under the same key the page already uses.

## 4. Optional: require a shared secret

The Origin check only stops **browsers**. Anything that can guess your Worker
URL (`curl`, another script) can still use it. To lock that down:

```bash
wrangler secret put ALLOW_TOKENS
# paste a long random string, e.g. the output of: openssl rand -hex 24
```

Then send it from the page as an `x-proxy-token` request header. Until you set
`ALLOW_TOKENS`, the check is skipped and the Worker relies on the Origin
allowlist alone.

---

## Security — please read

* **You are forwarding a live brokerage access token.** The Worker passes it
  through to Dhan and does not log or store it, but it does transit Cloudflare.
  **Only ever point the API proxy field at a Worker you deployed yourself.**
  A third-party proxy URL would receive your token in plaintext.
* Keep the Origin allowlist tight. An empty/wildcard list turns this into an
  open relay that anyone can use to reach the Dhan API from your Cloudflare
  account (and burn your request quota).
* Dhan access tokens expire daily. Treat them as live credentials anyway —
  revoke them from dhan.co if a Worker URL ever leaks.
* The free Workers tier is 100,000 requests/day. The dashboard polls positions
  and quotes on a timer, so a long trading session can get close to that; watch
  your Cloudflare analytics if you leave it running all day.

## Alternatives if you would rather not use Cloudflare

* **Local reverse proxy** — any static server that forwards `/v2/*` to
  `https://api.dhan.co/v2/*` works identically. For example, run the page from
  `http://localhost:8000` and point the API proxy field at your local proxy.
* **Node/Express** — `http-proxy-middleware` pointed at `https://api.dhan.co`
  with `cors()` enabled is about ten lines.
* **Dhan's own tooling** — the DhanHQ desktop/web terminal and official
  libraries have no CORS problem, since they are not browser pages calling the
  API cross-origin.

## Files

| File | Purpose |
| --- | --- |
| `dhan-cors-worker.js` | The Cloudflare Worker: CORS headers, Origin allowlist, optional token check, request forwarding. |
| `README.md` | This document. |

Client-side wiring lives in `../dhan-live.html` (the **API proxy** field) and
`../auto-trading/brokers/dhan-broker.js` (`proxyUrl` config → `baseUrl`).
