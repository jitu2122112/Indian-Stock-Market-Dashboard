/*
 * NSE equity universe for the static dashboard.
 *
 * A liquid seed list makes the screener useful when the NSE directory or a
 * public CORS relay is unavailable.  When it can be reached, the official
 * Equity List is used instead and cached for the current IST trading day.
 */
(function (root, factory) {
    const api = factory(root);
    if (typeof module !== 'undefined' && module.exports) module.exports = api;
    root.NSEUniverse = api;
}(typeof globalThis !== 'undefined' ? globalThis : this, function (root) {
    'use strict';

    const OFFICIAL_URL = 'https://nsearchives.nseindia.com/content/equity/EQUITY_L.csv';
    const CACHE_KEY = 'indian-market-nse-universe-v1';
    const MIN_OFFICIAL_SYMBOLS = 500;

    // Direct is tried first (it is the least privacy-invasive option). The
    // relay URLs make this work from GitHub Pages where NSE often blocks CORS.
    const CORS_PROXIES = [
        function (url) { return url; },
        function (url) { return 'https://corsproxy.io/?' + encodeURIComponent(url); },
        function (url) { return 'https://api.allorigins.win/raw?url=' + encodeURIComponent(url); }
    ];

    // Nifty 50, Nifty Next 50 and frequently traded mid/small caps.  Keep this
    // bundled rather than downloading a large list at build time: this file is
    // deliberately usable offline and contains no API key.
    const BASE_SYMBOLS = uniqueSymbols(`
        ADANIENT ADANIPORTS APOLLOHOSP ASIANPAINT AXISBANK BAJAJ-AUTO BAJFINANCE
        BAJAJFINSV BEL BHARTIARTL CIPLA COALINDIA DRREDDY EICHERMOT GRASIM HCLTECH
        HDFCBANK HDFCLIFE HEROMOTOCO HINDALCO HINDUNILVR ICICIBANK INDUSINDBK INFY
        ITC JSWSTEEL KOTAKBANK LT LTIM M&M MARUTI NESTLEIND NTPC ONGC POWERGRID
        RELIANCE SBILIFE SHRIRAMFIN SBIN SUNPHARMA TATACONSUM TATAMOTORS TATASTEEL
        TCS TECHM TITAN TRENT ULTRACEMCO WIPRO JIOFIN

        ABB ACC AUBANK ASTRAL AUROPHARMA BAJAJHLDNG BANDHANBNK BANKBARODA BATAINDIA
        BERGEPAINT BHARATFORG BHEL BIOCON BOSCHLTD CANBK CHOLAFIN COLPAL CONCOR
        CUMMINSIND DALBHARAT DLF DMART FEDERALBNK GAIL GLENMARK GODREJCP HAL HAVELLS
        HDFCAMC HINDPETRO ICICIGI ICICIPRULI IDFCFIRSTB IEX INDHOTEL INDIAMART INDIGO
        INDUSTOWER IRCTC JINDALSTEL JUBLFOOD KALYANKJIL LICHSGFIN LODHA LUPIN M&MFIN
        MANAPPURAM MARICO MAXHEALTH MCDOWELL-N MFSL MOTHERSON MPHASIS MUTHOOTFIN NMDC
        OFSS PAGEIND PEL PERSISTENT PETRONET PIDILITIND PIIND POLYCAB PNB RECLTD
        SAIL SBICARD SUNDARMFIN SUPREMEIND TATACHEM TATACOMM TATAELXSI TATAPOWER
        TORNTPOWER TVSMOTOR UPL VBL VEDL VOLTAS YESBANK ZYDUSLIFE

        3MINDIA AARTIIND AAVAS ABFRL ADANIGREEN ADANIPOWER AEGL AFFLE AIAENG
        AJANTPHARM ALKEM AMBER AMBUJACEM ANGELONE ANURAS APLAPOLLO APOLLOTYRE
        ASHOKLEY ATGL ATUL AWHCL BALRAMCHIN BALKRISIND BANSALWIRE BDL BEML BFUTILITIE
        BFINVEST BLUESTARCO BOMDYEING BRIGADE BSOFT CAMPUS CANFINHOME CARBORUNIV
        CASTROLIND CCL CDSL CEATLTD CENTRALBK CENTURYPLY CERA CESC CGCL CHAMBLFERT
        CHEMPLAST CHENNPETRO CIGNITITEC CLEAN COCHINSHIP COFORGE CONCORDBIO COROMANDEL
        CROMPTON CUB CYIENT DABUR DEEPAKNTR DEVYANI DIVISLAB DIXON EASEMYTRIP ECLERX
        EDELWEISS EIDPARRY ELGIEQUIP EMAMILTD ENDURANCE ENGINERSIN EQUITASBNK ERIS
        ESABINDIA EXIDEIND FDC FINCABLES FINPIPE FIVESTAR FLUOROCHEM FORTIS FSL GESHIP
        GICRE GLAND GMRINFRA GNFC GODFRYPHLP GODREJAGRO GODREJIND GODREJPROP GPPL
        GRANULES GRAPHITE GREAVESCOT GRINDWELL GUJGASLTD GSFC GSPL HEG HINDCOPPER
        HINDZINC HONAUT IGL IIFL IIFLWAM INDGN INDIACEM INDIANB INDIANHUME INDIGOPNTS
        INDUSINDBK INOXWIND INTELLECT IOC IPCA IRB IRCON IRFC ISEC J&KBANK JAIBALAJI
        JAMNAAUTO JBCHEPHARM JINDWORLD JKCEMENT JMFINANCIL JPPOWER JSL JUBLPHARMA
        JUSTDIAL JYOTHYLAB KANSAINER KAYNES KEC KEI KFINTECH KIMS KIOCL KPITTECH
        KNRCON KPRMILL KRBL LALPATHLAB LATENTVIEW LAURUSLAB LAXMIMACH LEMONTREE
        LEMONTREE LINC LLOYDSME LTF LTFOODS MAHABANK MAHLIFE MAPMYINDIA MASTEK
        MAZDOCK MCX MEDANTA METROPOLIS METROBRAND MINDAIND MINDACORP MOLDTKPAC
        MON100 MRPL MTARTECH NATCOPHARM NATIONALUM NAVINFLUOR NBCC NBIFIN NESCO
        NETWORK18 NH NHPC NIACL NLCIND NUVAMA NYKAA OBEROIRLTY OIL ORIENTCEM
        PAGEIND PFC PFIZER PFOCUS PHOENIXLTD PNCINFRA POONAWALLA PRAJIND PRINCEPIPE
        PRSMJOHNSN PVRINOX RAINBOW RALLIS RAMCOCEM RAYMOND RBA RBLBANK REDINGTON
        RECLTD REPCOHOME RITES RPOWER RTNINDIA RVNL SAPPHIRE SCHAEFFLER SCI SFL
        SHOPERSTOP SIGNATURE SIEMENS SJVN SKF SONA BLW SONATSOFTW SPARC STARHEALTH
        STLTECH SUMICHEM SUNDRMFAST SUNTV SUZLON SYNGENE TATATECH TEAMLEASE
        TECHNOPRO TEJASNET TFIN TIDEWATER TIINDIA TIMKEN TIPSINDL TITAGARH
        TORNTPHARM TORNTPOWER TRIDENT TRITURBINE TTML TV18BRDCST UCOBANK UJJIVANSFB
        UNIONBANK UNITDSPR UNOMINDA UTIAMC VAIBHAVGBL VARROC VGUARD VINATIORGA VIPIND
        VTL WELCORP WESTLIFE WHIRLPOOL WOCKPHARMA WOODLAND WSTCSTPAPR ZEEL ZENSARTECH
    `).slice(0, 285);

    function uniqueSymbols(text) {
        const seen = new Set();
        return String(text || '').trim().split(/\s+/).map(normalizeSymbol).filter(function (symbol) {
            if (!symbol || seen.has(symbol)) return false;
            seen.add(symbol);
            return true;
        });
    }

    function normalizeSymbol(symbol) {
        return String(symbol || '').trim().toUpperCase().replace(/\.NS$/i, '').replace(/[^A-Z0-9&-]/g, '');
    }

    function istDateStamp(date) {
        try {
            const parts = new Intl.DateTimeFormat('en-CA', {
                timeZone: 'Asia/Kolkata', year: 'numeric', month: '2-digit', day: '2-digit'
            }).formatToParts(date || new Date());
            const pick = function (type) { return parts.find(function (part) { return part.type === type; }).value; };
            return pick('year') + '-' + pick('month') + '-' + pick('day');
        } catch (error) {
            return new Date().toISOString().slice(0, 10);
        }
    }

    function safeGet(key) {
        try { return root.localStorage ? root.localStorage.getItem(key) : null; } catch (error) { return null; }
    }

    function safeSet(key, value) {
        try { if (root.localStorage) root.localStorage.setItem(key, value); } catch (error) { /* private mode */ }
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

    function symbolsFromOfficialCsv(text) {
        const rows = parseCsv(text);
        if (!rows.length) return [];
        const header = rows[0].map(function (value) { return value.toUpperCase().trim(); });
        const symbolIndex = header.indexOf('SYMBOL');
        const seriesIndex = header.indexOf('SERIES');
        if (symbolIndex < 0 || seriesIndex < 0) return [];
        return rows.slice(1).filter(function (row) {
            return String(row[seriesIndex] || '').toUpperCase() === 'EQ';
        }).map(function (row) {
            return normalizeSymbol(row[symbolIndex]);
        }).filter(Boolean);
    }

    async function fetchText(url, fetchFn, timeoutMs) {
        if (typeof fetchFn !== 'function') return '';
        let controller;
        let timer;
        try {
            if (typeof AbortController !== 'undefined') {
                controller = new AbortController();
                timer = setTimeout(function () { controller.abort(); }, timeoutMs || 8000);
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

    async function fetchOfficialUniverse(options) {
        const opts = options || {};
        const fetchFn = opts.fetch || root.fetch;
        for (let index = 0; index < CORS_PROXIES.length; index += 1) {
            try {
                const csv = await fetchText(CORS_PROXIES[index](OFFICIAL_URL), fetchFn, opts.timeoutMs || 8000);
                const symbols = uniqueSymbols(symbolsFromOfficialCsv(csv).join(' '));
                if (symbols.length >= MIN_OFFICIAL_SYMBOLS) return symbols;
            } catch (error) {
                // Continue to another relay. getUniverse must never reject.
            }
        }
        return [];
    }

    /**
     * Resolve the available NSE symbol universe. A valid official cache is
     * used for the current IST day; failure deliberately returns the bundled
     * liquid list rather than throwing or claiming a full-market result.
     */
    async function getUniverse(options) {
        const today = istDateStamp();
        try {
            const cached = JSON.parse(safeGet(CACHE_KEY) || 'null');
            if (cached && cached.date === today && Array.isArray(cached.symbols) && cached.symbols.length >= MIN_OFFICIAL_SYMBOLS) {
                return {
                    symbols: uniqueSymbols(cached.symbols.join(' ')),
                    count: cached.symbols.length,
                    source: 'Official NSE EQ list (daily cache)',
                    updated: cached.updated || today
                };
            }
        } catch (error) {
            // A malformed localStorage value should not block the fallback.
        }

        try {
            const symbols = await fetchOfficialUniverse(options);
            if (symbols.length >= MIN_OFFICIAL_SYMBOLS) {
                const result = {
                    symbols: symbols,
                    count: symbols.length,
                    source: 'Official NSE EQ list',
                    updated: new Date().toISOString()
                };
                safeSet(CACHE_KEY, JSON.stringify({ date: today, symbols: symbols, updated: result.updated }));
                return result;
            }
        } catch (error) {
            // Intentional: this public function has a resolve-only contract.
        }

        return {
            symbols: BASE_SYMBOLS.slice(),
            count: BASE_SYMBOLS.length,
            source: 'Bundled liquid NSE universe (offline fallback)',
            updated: 'Bundled list'
        };
    }

    return {
        BASE_SYMBOLS: BASE_SYMBOLS.slice(),
        OFFICIAL_URL: OFFICIAL_URL,
        getUniverse: getUniverse,
        // Exposed for deterministic tests and harmless for the static app.
        parseOfficialCsv: symbolsFromOfficialCsv
    };
}));
