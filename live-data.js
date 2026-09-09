/*
 * Resolve-only market-data helpers for a static GitHub Pages dashboard.
 *
 * Stooq's CSV endpoint is intentionally the first choice because it needs no
 * account or key. Public quote feeds can be delayed and can fail from browsers;
 * every exported async helper therefore resolves to an empty/demo result rather
 * than rejecting and leaving the dashboard unusable.
 */
(function (root, factory) {
    const api = factory(root);
    if (typeof module !== 'undefined' && module.exports) module.exports = api;
    root.LiveData = api;
}(typeof globalThis !== 'undefined' ? globalThis : this, function (root) {
    'use strict';

    const STOOQ_QUOTE_URL = 'https://stooq.com/q/l/';
    const STOOQ_HISTORY_URL = 'https://stooq.com/q/d/l/';
    const YAHOO_CHART_URL = 'https://query1.finance.yahoo.com/v8/finance/chart/';
    const YAHOO_PROXIES = [
        function (url) { return url; },
        function (url) { return 'https://corsproxy.io/?' + encodeURIComponent(url); },
        function (url) { return 'https://api.allorigins.win/raw?url=' + encodeURIComponent(url); }
    ];
    // Start each Yahoo fallback at a different relay. This avoids repeatedly
    // leaning on one free relay when a browser has it blocked or rate-limited.
    let yahooProxyCursor = 0;

    function normalizeSymbol(symbol) {
        return String(symbol || '').trim().toUpperCase().replace(/\.NS$/i, '').replace(/[^A-Z0-9&-]/g, '');
    }

    function stooqSymbol(symbol) {
        return normalizeSymbol(symbol).toLowerCase() + '.ns';
    }

    function finite(value, fallback) {
        const number = Number(value);
        return Number.isFinite(number) ? number : (fallback === undefined ? null : fallback);
    }

    function clamp(value, min, max) {
        return Math.max(min, Math.min(max, value));
    }

    function safeDate() {
        return new Date().toISOString();
    }

    function parseCsv(text) {
        const rows = [];
        let row = [];
        let cell = '';
        let quoted = false;
        const source = String(text || '').replace(/^\uFEFF/, '');
        for (let i = 0; i < source.length; i += 1) {
            const char = source[i];
            if (char === '"') {
                if (quoted && source[i + 1] === '"') { cell += '"'; i += 1; }
                else quoted = !quoted;
            } else if (char === ',' && !quoted) {
                row.push(cell.trim()); cell = '';
            } else if ((char === '\n' || char === '\r') && !quoted) {
                if (char === '\r' && source[i + 1] === '\n') i += 1;
                row.push(cell.trim());
                if (row.some(function (value) { return value !== ''; })) rows.push(row);
                row = []; cell = '';
            } else {
                cell += char;
            }
        }
        row.push(cell.trim());
        if (row.some(function (value) { return value !== ''; })) rows.push(row);
        return rows;
    }

    function headerMap(row) {
        const map = {};
        (row || []).forEach(function (name, index) {
            map[String(name).toLowerCase().replace(/[^a-z]/g, '')] = index;
        });
        return map;
    }

    function csvValue(row, headers, names, fallbackIndex) {
        for (let index = 0; index < names.length; index += 1) {
            const headerIndex = headers[names[index]];
            if (headerIndex !== undefined) return row[headerIndex];
        }
        return row[fallbackIndex];
    }

    function isNoData(value) {
        return value === undefined || value === null || String(value).trim() === '' || /^n\/d$/i.test(String(value).trim());
    }

    function parseStooqQuotes(csv, requestedSymbols) {
        const rows = parseCsv(csv);
        if (rows.length < 2) return [];
        const headers = headerMap(rows[0]);
        const requested = (requestedSymbols || []).map(normalizeSymbol).filter(Boolean);
        const bySymbol = new Map();

        rows.slice(1).forEach(function (row) {
            const rawSymbol = csvValue(row, headers, ['symbol'], 0);
            const symbol = normalizeSymbol(rawSymbol);
            const date = csvValue(row, headers, ['date'], 1);
            const time = csvValue(row, headers, ['time'], 2);
            const openRaw = csvValue(row, headers, ['open'], 3);
            const highRaw = csvValue(row, headers, ['high'], 4);
            const lowRaw = csvValue(row, headers, ['low'], 5);
            const closeRaw = csvValue(row, headers, ['close'], 6);
            const volumeRaw = csvValue(row, headers, ['volume'], 7);
            // Stooq emits N/D rows for symbols it cannot serve. Do not turn
            // those into zeroes because that would incorrectly pass/lose ranks.
            if (!symbol || [date, time, openRaw, highRaw, lowRaw, closeRaw, volumeRaw].some(isNoData)) return;
            const open = finite(openRaw);
            const high = finite(highRaw);
            const low = finite(lowRaw);
            const close = finite(closeRaw);
            const volume = finite(volumeRaw);
            if (![open, high, low, close, volume].every(Number.isFinite) || close <= 0) return;
            bySymbol.set(symbol, {
                symbol: symbol,
                date: String(date),
                time: String(time),
                open: open,
                high: high,
                low: low,
                close: close,
                price: close,
                volume: volume,
                change: close - open,
                percent: open ? ((close - open) / open) * 100 : 0,
                source: 'Stooq'
            });
        });

        // Stooq generally preserves query order. Reordering here makes the
        // contract explicit even if the response is sorted by the provider.
        return requested.map(function (symbol) { return bySymbol.get(symbol); }).filter(Boolean);
    }

    function parseStooqHistory(csv, symbol) {
        const rows = parseCsv(csv);
        if (rows.length < 2) return [];
        const headers = headerMap(rows[0]);
        return rows.slice(1).map(function (row) {
            const date = csvValue(row, headers, ['date'], 0);
            const openRaw = csvValue(row, headers, ['open'], 1);
            const highRaw = csvValue(row, headers, ['high'], 2);
            const lowRaw = csvValue(row, headers, ['low'], 3);
            const closeRaw = csvValue(row, headers, ['close'], 4);
            const volumeRaw = csvValue(row, headers, ['volume'], 5);
            if ([date, openRaw, highRaw, lowRaw, closeRaw, volumeRaw].some(isNoData)) return null;
            const open = finite(openRaw);
            const high = finite(highRaw);
            const low = finite(lowRaw);
            const close = finite(closeRaw);
            const volume = finite(volumeRaw, 0);
            if (![open, high, low, close].every(Number.isFinite)) return null;
            return { symbol: normalizeSymbol(symbol), date: String(date), open: open, high: high, low: low, close: close, volume: volume, source: 'Stooq' };
        }).filter(Boolean);
    }

    async function fetchText(url, options) {
        const opts = options || {};
        const fetchFn = opts.fetch || root.fetch;
        if (typeof fetchFn !== 'function') return '';
        let controller;
        let timer;
        try {
            if (typeof AbortController !== 'undefined') {
                controller = new AbortController();
                timer = setTimeout(function () { controller.abort(); }, opts.timeoutMs || 9000);
            }
            const response = await fetchFn(url, controller ? { signal: controller.signal } : undefined);
            if (!response || response.ok === false) return '';
            return await response.text();
        } catch (error) {
            return '';
        } finally {
            if (timer) clearTimeout(timer);
        }
    }

    async function fetchJson(url, options) {
        const opts = options || {};
        const fetchFn = opts.fetch || root.fetch;
        if (typeof fetchFn !== 'function') return null;
        let controller;
        let timer;
        try {
            if (typeof AbortController !== 'undefined') {
                controller = new AbortController();
                timer = setTimeout(function () { controller.abort(); }, opts.timeoutMs || 9000);
            }
            const response = await fetchFn(url, controller ? { signal: controller.signal } : undefined);
            if (!response || response.ok === false) return null;
            return await response.json();
        } catch (error) {
            return null;
        } finally {
            if (timer) clearTimeout(timer);
        }
    }

    /** Get one Stooq CSV batch. Always resolves to a result object. */
    async function fetchStooqBatch(symbols, options) {
        const requested = (Array.isArray(symbols) ? symbols : [symbols]).map(normalizeSymbol).filter(Boolean);
        if (!requested.length) return { quotes: [], source: 'Stooq', updated: safeDate(), error: 'No symbols requested' };
        try {
            const stooqSymbols = requested.map(function (symbol) { return encodeURIComponent(stooqSymbol(symbol)); }).join(',');
            // f has exactly Symbol, Date, Time, Open, High, Low, Close, Volume.
            const url = STOOQ_QUOTE_URL + '?s=' + stooqSymbols + '&f=sd2t2ohlcv&h&e=csv';
            const csv = await fetchText(url, options);
            const quotes = parseStooqQuotes(csv, requested);
            return { quotes: quotes, source: quotes.length ? 'Stooq' : 'Unavailable', updated: safeDate(), error: quotes.length ? null : 'No usable Stooq rows' };
        } catch (error) {
            return { quotes: [], source: 'Unavailable', updated: safeDate(), error: 'Stooq request failed' };
        }
    }

    function yahooChartUrl(symbol, range, interval) {
        return YAHOO_CHART_URL + encodeURIComponent(normalizeSymbol(symbol) + '.NS') + '?range=' + (range || '5d') + '&interval=' + (interval || '5m') + '&includePrePost=false';
    }

    function yahooBars(payload, symbol) {
        try {
            const result = payload && payload.chart && payload.chart.result && payload.chart.result[0];
            const quote = result && result.indicators && result.indicators.quote && result.indicators.quote[0];
            const timestamps = result && result.timestamp;
            if (!quote || !Array.isArray(timestamps)) return [];
            return timestamps.map(function (timestamp, index) {
                const open = finite(quote.open && quote.open[index]);
                const high = finite(quote.high && quote.high[index]);
                const low = finite(quote.low && quote.low[index]);
                const close = finite(quote.close && quote.close[index]);
                const volume = finite(quote.volume && quote.volume[index], 0);
                if (![open, high, low, close].every(Number.isFinite)) return null;
                return {
                    symbol: normalizeSymbol(symbol), date: new Date(timestamp * 1000).toISOString(),
                    open: open, high: high, low: low, close: close, volume: volume, source: 'Yahoo Finance'
                };
            }).filter(Boolean);
        } catch (error) {
            return [];
        }
    }

    async function fetchYahooHistory(symbol, options) {
        const opts = options || {};
        const url = yahooChartUrl(symbol, opts.range || '3mo', opts.interval || '1d');
        const start = yahooProxyCursor % YAHOO_PROXIES.length;
        yahooProxyCursor += 1;
        for (let offset = 0; offset < YAHOO_PROXIES.length; offset += 1) {
            const index = (start + offset) % YAHOO_PROXIES.length;
            const payload = await fetchJson(YAHOO_PROXIES[index](url), opts);
            const bars = yahooBars(payload, symbol);
            if (bars.length) return bars;
        }
        return [];
    }

    async function fetchYahooQuote(symbol, options) {
        const bars = await fetchYahooHistory(symbol, Object.assign({}, options || {}, { range: '1d', interval: '5m' }));
        if (!bars.length) return null;
        const latest = bars[bars.length - 1];
        const first = bars[0];
        return Object.assign({}, latest, {
            price: latest.close,
            change: latest.close - first.open,
            percent: first.open ? ((latest.close - first.open) / first.open) * 100 : 0,
            source: 'Yahoo Finance'
        });
    }

    async function fetchTwelveDataQuote(symbol, options) {
        const opts = options || {};
        const key = opts.twelveDataKey || opts.apiKey;
        if (!key) return null;
        const url = 'https://api.twelvedata.com/quote?symbol=' + encodeURIComponent(normalizeSymbol(symbol) + ':NSE') + '&apikey=' + encodeURIComponent(key);
        const payload = await fetchJson(url, opts);
        try {
            const close = finite(payload && (payload.close || payload.price));
            const open = finite(payload && payload.open, close);
            const high = finite(payload && payload.high, close);
            const low = finite(payload && payload.low, close);
            const volume = finite(payload && payload.volume, 0);
            if (!Number.isFinite(close) || close <= 0) return null;
            return {
                symbol: normalizeSymbol(symbol), date: payload.datetime || '', time: '', open: open, high: high, low: low,
                close: close, price: close, volume: volume, change: close - open,
                percent: open ? ((close - open) / open) * 100 : 0, source: 'Twelve Data'
            };
        } catch (error) {
            return null;
        }
    }

    // Stable pseudo quotes are only a last-resort visual fallback. They are
    // explicitly marked demo, allowing the UI to avoid calling them a scan.
    function demoQuote(symbol) {
        const clean = normalizeSymbol(symbol);
        let seed = 0;
        for (let i = 0; i < clean.length; i += 1) seed = ((seed * 31) + clean.charCodeAt(i)) >>> 0;
        const price = Math.max(22, 40 + (seed % 2400) + ((seed >>> 8) % 100) / 10);
        const move = (((seed >>> 4) % 241) - 120) / 100;
        const open = price / (1 + move / 100);
        const high = Math.max(price, open) * 1.008;
        const low = Math.min(price, open) * 0.992;
        return {
            symbol: clean, date: '', time: '', open: open, high: high, low: low, close: price, price: price,
            volume: 50000 + (seed % 900000), change: price - open, percent: move, source: 'Demo fallback'
        };
    }

    /**
     * Quote a universe in batches of roughly 100 with at most four in flight.
     * onProgress receives {completed,total,quotes,stage}; callback failures are
     * isolated so they cannot reject the request.
     */
    async function fetchUniverseQuotes(symbols, options) {
        try {
            return await fetchUniverseQuotesInternal(symbols, options);
        } catch (error) {
            return { quotes: [], source: 'Unavailable', updated: safeDate(), realQuoteCount: 0, requestedCount: 0, error: 'Universe snapshot unavailable' };
        }
    }

    async function fetchUniverseQuotesInternal(symbols, options) {
        const opts = options || {};
        const requested = (Array.isArray(symbols) ? symbols : [symbols]).map(normalizeSymbol).filter(Boolean);
        const chunkSize = Math.max(20, Math.min(120, Number(opts.chunkSize) || 100));
        const concurrency = Math.max(1, Math.min(4, Number(opts.concurrency) || 4));
        const chunks = [];
        for (let index = 0; index < requested.length; index += chunkSize) chunks.push(requested.slice(index, index + chunkSize));
        const found = new Map();
        let completed = 0;

        function progress(stage) {
            try {
                if (typeof opts.onProgress === 'function') opts.onProgress({ completed: completed, total: requested.length, quotes: found.size, stage: stage });
            } catch (error) { /* UI callback must not break data loading */ }
        }

        async function worker() {
            while (chunks.length) {
                const chunk = chunks.shift();
                const result = await fetchStooqBatch(chunk, opts);
                result.quotes.forEach(function (quote) { found.set(quote.symbol, quote); });
                completed += chunk.length;
                progress('snapshot');
            }
        }

        try {
            progress('snapshot');
            const workers = Array.from({ length: Math.min(concurrency, chunks.length) }, worker);
            await Promise.all(workers);
        } catch (error) {
            // A worker should already be resolve-only, but keep the public API so.
        }

        // Yahoo chart requests are much more expensive. Use it as a bounded
        // fallback for missing symbols, rather than creating hundreds of calls.
        const yahooLimit = Math.max(0, Number(opts.yahooFallbackLimit === undefined ? 20 : opts.yahooFallbackLimit));
        const missing = requested.filter(function (symbol) { return !found.has(symbol); }).slice(0, yahooLimit);
        for (let index = 0; index < missing.length; index += 1) {
            const yahooQuote = await fetchYahooQuote(missing[index], opts);
            if (yahooQuote) found.set(yahooQuote.symbol, yahooQuote);
            else {
                const twelveQuote = await fetchTwelveDataQuote(missing[index], opts);
                if (twelveQuote) found.set(twelveQuote.symbol, twelveQuote);
            }
            progress('fallback');
        }

        if (opts.allowDemo !== false) {
            requested.forEach(function (symbol) {
                if (!found.has(symbol)) found.set(symbol, demoQuote(symbol));
            });
        }
        const quotes = requested.map(function (symbol) { return found.get(symbol); }).filter(Boolean);
        const realQuoteCount = quotes.filter(function (quote) { return quote.source !== 'Demo fallback'; }).length;
        const realSources = Array.from(new Set(quotes.filter(function (quote) { return quote.source !== 'Demo fallback'; }).map(function (quote) { return quote.source; })));
        return {
            quotes: quotes,
            source: realSources.length ? realSources.join(' + ') + (quotes.length > realQuoteCount ? ' + demo fallback' : '') : 'Demo fallback',
            updated: safeDate(),
            realQuoteCount: realQuoteCount,
            requestedCount: requested.length,
            error: quotes.length ? null : 'No quotes available'
        };
    }

    /** A convenient resolve-only entry point for curated or full snapshots. */
    async function fetchMarketSnapshot(symbols, options) {
        try {
            return await fetchUniverseQuotes(symbols || [], options);
        } catch (error) {
            return { quotes: [], source: 'Unavailable', updated: safeDate(), realQuoteCount: 0, requestedCount: 0, error: 'Snapshot unavailable' };
        }
    }

    /** Fetch daily OHLCV data, with Yahoo's chart endpoint as a CORS fallback. */
    async function fetchStooqHistory(symbol, options) {
        const clean = normalizeSymbol(symbol);
        const opts = options || {};
        if (!clean) return { bars: [], source: 'Unavailable', updated: safeDate(), error: 'No symbol requested' };
        try {
            const url = STOOQ_HISTORY_URL + '?s=' + encodeURIComponent(stooqSymbol(clean)) + '&i=d';
            const csv = await fetchText(url, opts);
            const bars = parseStooqHistory(csv, clean);
            if (bars.length) return { bars: bars, source: 'Stooq', updated: safeDate(), error: null };
            const yahoo = await fetchYahooHistory(clean, Object.assign({}, opts, { range: '3mo', interval: '1d' }));
            return { bars: yahoo, source: yahoo.length ? 'Yahoo Finance' : 'Unavailable', updated: safeDate(), error: yahoo.length ? null : 'No history available' };
        } catch (error) {
            return { bars: [], source: 'Unavailable', updated: safeDate(), error: 'History unavailable' };
        }
    }

    function sma(values, period) {
        const list = (values || []).map(function (value) { return finite(value); }).filter(Number.isFinite);
        const size = Math.max(1, Number(period) || 20);
        if (list.length < size) return null;
        const slice = list.slice(-size);
        return slice.reduce(function (sum, value) { return sum + value; }, 0) / slice.length;
    }

    // Wilder-style RSI, returned as a single latest value.
    function rsi(values, period) {
        const list = (values || []).map(function (value) { return finite(value); }).filter(Number.isFinite);
        const size = Math.max(1, Number(period) || 14);
        if (list.length <= size) return null;
        let gains = 0;
        let losses = 0;
        for (let index = 1; index <= size; index += 1) {
            const change = list[index] - list[index - 1];
            gains += Math.max(change, 0);
            losses += Math.max(-change, 0);
        }
        let avgGain = gains / size;
        let avgLoss = losses / size;
        for (let index = size + 1; index < list.length; index += 1) {
            const change = list[index] - list[index - 1];
            avgGain = ((avgGain * (size - 1)) + Math.max(change, 0)) / size;
            avgLoss = ((avgLoss * (size - 1)) + Math.max(-change, 0)) / size;
        }
        if (avgLoss === 0) return 100;
        const relativeStrength = avgGain / avgLoss;
        return 100 - (100 / (1 + relativeStrength));
    }

    function atr(bars, period) {
        const list = (bars || []).filter(function (bar) {
            return bar && [bar.high, bar.low, bar.close].every(function (value) { return Number.isFinite(Number(value)); });
        });
        const size = Math.max(1, Number(period) || 14);
        if (list.length <= size) return null;
        const trueRanges = [];
        for (let index = 1; index < list.length; index += 1) {
            const high = Number(list[index].high);
            const low = Number(list[index].low);
            const priorClose = Number(list[index - 1].close);
            trueRanges.push(Math.max(high - low, Math.abs(high - priorClose), Math.abs(low - priorClose)));
        }
        if (trueRanges.length < size) return null;
        let current = trueRanges.slice(0, size).reduce(function (sum, value) { return sum + value; }, 0) / size;
        for (let index = size; index < trueRanges.length; index += 1) current = ((current * (size - 1)) + trueRanges[index]) / size;
        return current;
    }

    /** NSE continuous market hours, Monday–Friday, evaluated in Asia/Kolkata. */
    function isMarketOpen(date) {
        try {
            const parts = new Intl.DateTimeFormat('en-US', {
                timeZone: 'Asia/Kolkata', weekday: 'short', hour: '2-digit', minute: '2-digit', hourCycle: 'h23'
            }).formatToParts(date || new Date());
            const get = function (type) { const part = parts.find(function (value) { return value.type === type; }); return part ? part.value : ''; };
            const weekday = get('weekday');
            const minutes = (Number(get('hour')) * 60) + Number(get('minute'));
            return weekday !== 'Sat' && weekday !== 'Sun' && minutes >= (9 * 60 + 15) && minutes <= (15 * 60 + 30);
        } catch (error) {
            return false;
        }
    }

    return {
        fetchMarketSnapshot: fetchMarketSnapshot,
        fetchStooqBatch: fetchStooqBatch,
        fetchUniverseQuotes: fetchUniverseQuotes,
        fetchStooqHistory: fetchStooqHistory,
        rsi: rsi,
        sma: sma,
        atr: atr,
        isMarketOpen: isMarketOpen,
        // Useful for tests; application code only needs the functions above.
        parseStooqQuotes: parseStooqQuotes,
        parseStooqHistory: parseStooqHistory
    };
}));
