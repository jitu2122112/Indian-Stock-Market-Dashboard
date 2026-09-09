/*
 * Offline end-to-end smoke test for the static full-market data pipeline.
 * It deliberately stubs every request: no network, API key or browser is used.
 * Run with: node tests/full-market-stub-fetch.test.js
 */
'use strict';

const assert = require('node:assert/strict');
const NSEUniverse = require('../nse-universe.js');
const LiveData = require('../live-data.js');

const officialRows = Array.from({ length: 505 }, function (_, index) {
    const symbol = 'TEST' + String(index + 1).padStart(3, '0');
    const series = index === 504 ? 'BE' : 'EQ'; // prove the EQ filter is applied
    return symbol + ',Test Company ' + (index + 1) + ',' + series + ',01-JAN-2020,10,1,INE000000000,10';
});
const officialCsv = 'SYMBOL,NAME OF COMPANY,SERIES,DATE OF LISTING,PAID UP VALUE,MARKET LOT,ISIN NUMBER,FACE VALUE\n' + officialRows.join('\n');

function responseText(text) {
    return { ok: true, text: async function () { return text; } };
}

async function fakeFetch(url) {
    const address = String(url);
    if (address.includes('EQUITY_L.csv')) return responseText(officialCsv);

    if (address.includes('/q/d/l/')) {
        const header = 'Date,Open,High,Low,Close,Volume';
        const rows = Array.from({ length: 25 }, function (_, index) {
            const open = 100 + index;
            return '2026-08-' + String(index + 1).padStart(2, '0') + ',' + open + ',' + (open + 3) + ',' + (open - 2) + ',' + (open + 1) + ',' + (250000 + index * 1000);
        });
        return responseText(header + '\n' + rows.join('\n'));
    }

    if (address.includes('stooq.com/q/l/')) {
        const requested = new URL(address).searchParams.get('s').split(',');
        const rows = requested.map(function (stooqSymbol, index) {
            if (stooqSymbol === 'test003.ns') return stooqSymbol + ',N/D,N/D,N/D,N/D,N/D,N/D,N/D';
            const open = 100 + index;
            return stooqSymbol + ',2026-09-09,10:30:00,' + open + ',' + (open + 4) + ',' + (open - 2) + ',' + (open + 2) + ',' + (150000 + index * 10000);
        });
        return responseText('Symbol,Date,Time,Open,High,Low,Close,Volume\n' + rows.join('\n'));
    }

    throw new Error('Network access was attempted for an unexpected URL: ' + address);
}

(async function run() {
    const universe = await NSEUniverse.getUniverse({ fetch: fakeFetch });
    assert.equal(universe.source, 'Official NSE EQ list');
    assert.equal(universe.count, 504, 'one non-EQ official row must be omitted');
    assert.equal(universe.symbols[0], 'TEST001');

    const symbols = universe.symbols.slice(0, 5);
    const batch = await LiveData.fetchStooqBatch(symbols, { fetch: fakeFetch });
    assert.equal(batch.quotes.length, 4, 'N/D Stooq rows must be skipped');
    assert.deepEqual(batch.quotes.map(function (quote) { return quote.symbol; }), ['TEST001', 'TEST002', 'TEST004', 'TEST005']);
    assert.equal(batch.quotes[0].close, 102);
    assert.equal(batch.quotes[0].volume, 150000);

    const progress = [];
    const snapshot = await LiveData.fetchUniverseQuotes(symbols, {
        fetch: fakeFetch,
        chunkSize: 2,
        concurrency: 4,
        yahooFallbackLimit: 0,
        allowDemo: false,
        onProgress: function (event) { progress.push(event); }
    });
    assert.equal(snapshot.quotes.length, 4, 'the snapshot must remain usable after an N/D row');
    assert.equal(snapshot.realQuoteCount, 4);
    assert.ok(progress.some(function (event) { return event.completed === 5; }), 'chunk progress should reach the total symbol count');

    const history = await LiveData.fetchStooqHistory(snapshot.quotes[0].symbol, { fetch: fakeFetch });
    assert.equal(history.source, 'Stooq');
    assert.equal(history.bars.length, 25);
    const closes = history.bars.map(function (bar) { return bar.close; });
    assert.ok(LiveData.sma(closes, 20) > 0);
    assert.ok(LiveData.rsi(closes, 14) >= 50);
    assert.ok(LiveData.atr(history.bars, 14) > 0);

    // A Monday 09:30 IST timestamp is open; Saturday is not.
    assert.equal(LiveData.isMarketOpen(new Date('2026-09-07T04:00:00.000Z')), true);
    assert.equal(LiveData.isMarketOpen(new Date('2026-09-05T04:00:00.000Z')), false);

    // Resolve-only contracts are essential for an offline GitHub Pages view.
    const failedSnapshot = await LiveData.fetchUniverseQuotes(['OFFLINE'], {
        fetch: async function () { throw new Error('offline'); },
        yahooFallbackLimit: 0,
        allowDemo: false
    });
    assert.deepEqual(failedSnapshot.quotes, []);
    const failedUniverse = await NSEUniverse.getUniverse({
        fetch: async function () { throw new Error('offline'); }
    });
    assert.equal(failedUniverse.source, 'Bundled liquid NSE universe (offline fallback)');

    console.log('✓ full-market stub-fetch pipeline passed');
}()).catch(function (error) {
    console.error(error);
    process.exitCode = 1;
});
