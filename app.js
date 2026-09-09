/**
 * Indian Stock Market Live Dashboard
 * Complete trading platform for beginners with intraday signals
 * 
 * Features:
 * - Live market data (NSE, BSE)
 * - Intraday trading signals with entry/exit/stop loss
 * - Technical analysis with indicators
 * - Stock screener
 * - Watchlist management
 * - Educational resources
 */

// ============================================
// CONFIGURATION
// ============================================
const CONFIG = {
    debug: false,
    autoRefresh: true,
    refreshInterval: 30000, // 30 seconds
    dataSource: 'mock', // 'mock', 'nse', 'twelve-data', 'yahoo'
    apiKey: '', // For Twelve Data API
    maxWatchlistItems: 20,
    signalHistoryLimit: 50
};

// ============================================
// MARKET DATA (MOCK - Replace with API calls)
// ============================================
const MARKET_DATA = {
    nifty50: {
        name: 'NIFTY 50',
        symbol: '^NSEI',
        price: 19850.25,
        change: +125.40,
        percent: +0.64,
        high: 19950.75,
        low: 19780.50,
        volume: 125000000,
        open: 19780.50,
        prevClose: 19724.85
    },
    sensex: {
        name: 'SENSEX',
        symbol: '^BSESN',
        price: 66850.75,
        change: +230.50,
        percent: +0.35,
        high: 67100.25,
        low: 66650.50,
        volume: 85000000,
        open: 66650.50,
        prevClose: 66620.25
    },
    banknifty: {
        name: 'NIFTY Bank',
        symbol: '^NSEBANK',
        price: 45250.50,
        change: -85.25,
        percent: -0.19,
        high: 45400.75,
        low: 45100.25,
        volume: 95000000,
        open: 45300.25,
        prevClose: 45335.75
    }
};

// Market stats
const MARKET_STATS = {
    advances: 1850,
    declines: 950,
    unchanged: 200,
    fii: { buy: 850, sell: 420, net: +430 },
    dii: { buy: 650, sell: 380, net: +270 }
};

// ============================================
// STOCK DATA
// ============================================
const STOCKS = [
    // IT Sector
    { symbol: 'TCS', name: 'Tata Consultancy Services', sector: 'it', marketCap: 'large', price: 3850.00, change: +52.00, percent: +1.37, volume: 6800000, rsi: 62.4, signal: 'buy', trend: 'bullish' },
    { symbol: 'INFY', name: 'Infosys', sector: 'it', marketCap: 'large', price: 1450.25, change: +32.50, percent: +2.29, volume: 8200000, rsi: 65.1, signal: 'buy', trend: 'bullish' },
    { symbol: 'HCLTECH', name: 'HCL Technologies', sector: 'it', marketCap: 'large', price: 1150.50, change: +18.75, percent: +1.65, volume: 4500000, rsi: 58.2, signal: 'buy', trend: 'bullish' },
    { symbol: 'WIPRO', name: 'Wipro', sector: 'it', marketCap: 'large', price: 425.75, change: +5.50, percent: +1.31, volume: 3800000, rsi: 52.8, signal: 'neutral', trend: 'bullish' },
    { symbol: 'TECHM', name: 'Tech Mahindra', sector: 'it', marketCap: 'large', price: 1050.00, change: -8.25, percent: -0.78, volume: 2500000, rsi: 45.6, signal: 'sell', trend: 'bearish' },
    
    // Banking & Finance
    { symbol: 'HDFCBANK', name: 'HDFC Bank', sector: 'banking', marketCap: 'large', price: 1625.50, change: +22.75, percent: +1.42, volume: 10500000, rsi: 55.8, signal: 'buy', trend: 'bullish' },
    { symbol: 'ICICIBANK', name: 'ICICI Bank', sector: 'banking', marketCap: 'large', price: 950.25, change: +12.75, percent: +1.36, volume: 8200000, rsi: 58.4, signal: 'buy', trend: 'bullish' },
    { symbol: 'KOTAKBANK', name: 'Kotak Mahindra Bank', sector: 'banking', marketCap: 'large', price: 1650.00, change: -8.50, percent: -0.51, volume: 5500000, rsi: 42.3, signal: 'sell', trend: 'bearish' },
    { symbol: 'SBIN', name: 'State Bank of India', sector: 'banking', marketCap: 'large', price: 585.75, change: +5.25, percent: +0.90, volume: 12000000, rsi: 54.2, signal: 'buy', trend: 'bullish' },
    { symbol: 'AXISBANK', name: 'Axis Bank', sector: 'banking', marketCap: 'large', price: 850.50, change: +7.75, percent: +0.92, volume: 7500000, rsi: 56.8, signal: 'buy', trend: 'bullish' },
    
    // Pharma
    { symbol: 'SUNPHARMA', name: 'Sun Pharmaceutical', sector: 'pharma', marketCap: 'large', price: 1050.00, change: -12.50, percent: -1.18, volume: 3200000, rsi: 40.5, signal: 'sell', trend: 'bearish' },
    { symbol: 'DRREDDY', name: 'Dr. Reddy\'s Laboratories', sector: 'pharma', marketCap: 'large', price: 4850.00, change: +35.00, percent: +0.73, volume: 1800000, rsi: 52.1, signal: 'neutral', trend: 'bullish' },
    { symbol: 'CIPLA', name: 'Cipla', sector: 'pharma', marketCap: 'large', price: 1250.00, change: +15.50, percent: +1.25, volume: 2500000, rsi: 57.3, signal: 'buy', trend: 'bullish' },
    
    // FMCG
    { symbol: 'HINDUNILVR', name: 'Hindustan Unilever', sector: 'fmcg', marketCap: 'large', price: 2450.75, change: +18.25, percent: +0.75, volume: 4200000, rsi: 48.2, signal: 'neutral', trend: 'bullish' },
    { symbol: 'ITC', name: 'ITC Limited', sector: 'fmcg', marketCap: 'large', price: 425.50, change: +5.75, percent: +1.37, volume: 6800000, rsi: 52.4, signal: 'buy', trend: 'bullish' },
    { symbol: 'NESTLEIND', name: 'Nestle India', sector: 'fmcg', marketCap: 'large', price: 22500.00, change: +150.00, percent: +0.67, volume: 120000, rsi: 55.8, signal: 'buy', trend: 'bullish' },
    
    // Energy
    { symbol: 'RELIANCE', name: 'Reliance Industries', sector: 'energy', marketCap: 'large', price: 2525.50, change: +25.75, percent: +1.03, volume: 15800000, rsi: 58.2, signal: 'buy', trend: 'bullish' },
    { symbol: 'ONGC', name: 'Oil & Natural Gas Corp', sector: 'energy', marketCap: 'large', price: 185.50, change: -4.25, percent: -2.25, volume: 14800000, rsi: 38.4, signal: 'sell', trend: 'bearish' },
    { symbol: 'BPCL', name: 'Bharat Petroleum', sector: 'energy', marketCap: 'large', price: 425.75, change: -10.50, percent: -2.41, volume: 7200000, rsi: 35.6, signal: 'sell', trend: 'bearish' },
    { symbol: 'IOC', name: 'Indian Oil Corporation', sector: 'energy', marketCap: 'large', price: 95.25, change: -1.75, percent: -1.80, volume: 25000000, rsi: 39.2, signal: 'sell', trend: 'bearish' },
    
    // Auto
    { symbol: 'TATAMOTORS', name: 'Tata Motors', sector: 'auto', marketCap: 'large', price: 650.25, change: +12.75, percent: +1.99, volume: 18500000, rsi: 61.5, signal: 'buy', trend: 'bullish' },
    { symbol: 'MARUTI', name: 'Maruti Suzuki', sector: 'auto', marketCap: 'large', price: 8500.00, change: +50.00, percent: +0.59, volume: 3200000, rsi: 54.8, signal: 'buy', trend: 'bullish' },
    { symbol: 'MAHINDRA', name: 'Mahindra & Mahindra', sector: 'auto', marketCap: 'large', price: 1450.00, change: +22.50, percent: +1.58, volume: 4500000, rsi: 59.3, signal: 'buy', trend: 'bullish' },
    
    // Metal
    { symbol: 'TATASTEEL', name: 'Tata Steel', sector: 'metal', marketCap: 'large', price: 152.40, change: +4.20, percent: +2.84, volume: 12500000, rsi: 64.2, signal: 'buy', trend: 'bullish' },
    { symbol: 'JSWSTEEL', name: 'JSW Steel', sector: 'metal', marketCap: 'large', price: 750.00, change: +12.50, percent: +1.69, volume: 5200000, rsi: 58.7, signal: 'buy', trend: 'bullish' },
    { symbol: 'HINDALCO', name: 'Hindalco Industries', sector: 'metal', marketCap: 'large', price: 425.00, change: -5.75, percent: -1.33, volume: 3800000, rsi: 42.8, signal: 'sell', trend: 'bearish' },
    
    // Telecom
    { symbol: 'BHARTIARTL', name: 'Bharti Airtel', sector: 'telecom', marketCap: 'large', price: 850.25, change: +12.75, percent: +1.52, volume: 9500000, rsi: 60.1, signal: 'buy', trend: 'bullish' },
    { symbol: 'JIOFIN', name: 'Jio Financial Services', sector: 'telecom', marketCap: 'large', price: 250.00, change: +3.50, percent: +1.42, volume: 4200000, rsi: 56.4, signal: 'buy', trend: 'bullish' }
];

// ============================================
// INTRADAY SIGNALS
// ============================================
const INTRADAY_SIGNALS = [
    { id: 1, stock: 'RELIANCE', name: 'Reliance Industries', signal: 'BUY', entry: 2525, target: 2575, stoploss: 2500, time: '10:15 AM', status: 'active', risk: 'medium', sector: 'energy', confidence: 78, timeframe: 'intraday', result: null },
    { id: 2, stock: 'TCS', name: 'Tata Consultancy', signal: 'BUY', entry: 3850, target: 3900, stoploss: 3820, time: '10:30 AM', status: 'active', risk: 'low', sector: 'it', confidence: 82, timeframe: 'intraday', result: null },
    { id: 3, stock: 'INFY', name: 'Infosys', signal: 'SELL', entry: 1450, target: 1420, stoploss: 1470, time: '10:45 AM', status: 'active', risk: 'medium', sector: 'it', confidence: 75, timeframe: 'intraday', result: null },
    { id: 4, stock: 'HDFCBANK', name: 'HDFC Bank', signal: 'BUY', entry: 1625, target: 1650, stoploss: 1600, time: '11:00 AM', status: 'active', risk: 'low', sector: 'banking', confidence: 80, timeframe: 'intraday', result: null },
    { id: 5, stock: 'TATASTEEL', name: 'Tata Steel', signal: 'BUY', entry: 152.40, target: 156, stoploss: 150, time: '11:15 AM', status: 'active', risk: 'medium', sector: 'metal', confidence: 72, timeframe: 'intraday', result: null },
    { id: 6, stock: 'ADANIPORTS', name: 'Adani Ports', signal: 'SELL', entry: 850, target: 830, stoploss: 870, time: '9:45 AM', status: 'completed', risk: 'high', sector: 'transport', confidence: 65, timeframe: 'intraday', result: 'hit-target' },
    { id: 7, stock: 'SBIN', name: 'State Bank of India', signal: 'BUY', entry: 585, target: 595, stoploss: 580, time: '11:30 AM', status: 'active', risk: 'low', sector: 'banking', confidence: 78, timeframe: 'intraday', result: null }
];

// Signal history (completed signals)
const SIGNAL_HISTORY = [
    { id: 101, stock: 'RELIANCE', signal: 'BUY', entry: 2500, target: 2550, stoploss: 2480, time: 'Yesterday 9:30 AM', status: 'completed', result: 'hit-target', profit: +50 },
    { id: 102, stock: 'TCS', signal: 'BUY', entry: 3800, target: 3850, stoploss: 3780, time: 'Yesterday 10:00 AM', status: 'completed', result: 'hit-target', profit: +50 },
    { id: 103, stock: 'INFY', signal: 'SELL', entry: 1480, target: 1450, stoploss: 1500, time: 'Yesterday 10:30 AM', status: 'completed', result: 'hit-target', profit: +30 },
    { id: 104, stock: 'HDFCBANK', signal: 'BUY', entry: 1600, target: 1640, stoploss: 1580, time: 'Yesterday 11:00 AM', status: 'completed', result: 'hit-stoploss', profit: -20 },
    { id: 105, stock: 'ONGC', signal: 'SELL', entry: 190, target: 185, stoploss: 195, time: 'Yesterday 11:30 AM', status: 'completed', result: 'hit-target', profit: +5 },
    { id: 106, stock: 'TATASTEEL', signal: 'BUY', entry: 150, target: 155, stoploss: 148, time: 'Yesterday 12:00 PM', status: 'completed', result: 'hit-target', profit: +5 },
    { id: 107, stock: 'IT', signal: 'BUY', entry: 425, target: 435, stoploss: 420, time: 'Yesterday 12:30 PM', status: 'completed', result: 'hit-stoploss', profit: -5 },
    { id: 108, stock: 'BHARTIARTL', signal: 'BUY', entry: 840, target: 860, stoploss: 830, time: 'Yesterday 1:00 PM', status: 'completed', result: 'hit-target', profit: +20 }
];

// ============================================
// TECHNICAL INDICATORS DATA
// ============================================
const INDICATORS = {
    RELIANCE: { rsi: 58.2, macd: 12.5, ma50: 2480.50, ma200: 2450.25, bb: { upper: 2580, middle: 2530, lower: 2480 }, volume: 15800000 },
    TCS: { rsi: 62.4, macd: 18.7, ma50: 3780.75, ma200: 3750.50, bb: { upper: 3880, middle: 3830, lower: 3780 }, volume: 6800000 },
    INFY: { rsi: 65.1, macd: 22.3, ma50: 1420.25, ma200: 1400.75, bb: { upper: 1470, middle: 1440, lower: 1410 }, volume: 8200000 },
    HDFCBANK: { rsi: 55.8, macd: 8.9, ma50: 1610.50, ma200: 1580.25, bb: { upper: 1650, middle: 1625, lower: 1600 }, volume: 10500000 },
    SBIN: { rsi: 54.2, macd: 10.2, ma50: 575.25, ma200: 565.75, bb: { upper: 600, middle: 585, lower: 570 }, volume: 12000000 }
};

// Support & Resistance levels
const SR_LEVELS = {
    RELIANCE: { current: 2525.50, r1: 2575, r2: 2590, r3: 2610, s1: 2500, s2: 2480, s3: 2450 },
    TCS: { current: 3850, r1: 3880, r2: 3900, r3: 3920, s1: 3820, s2: 3800, s3: 3770 },
    INFY: { current: 1450.25, r1: 1480, r2: 1495, r3: 1510, s1: 1440, s2: 1420, s3: 1400 },
    HDFCBANK: { current: 1625.50, r1: 1650, r2: 1670, r3: 1690, s1: 1600, s2: 1580, s3: 1550 },
    SBIN: { current: 585.75, r1: 595, r2: 600, r3: 610, s1: 580, s2: 575, s3: 570 }
};

// Chart data
const CHART_DATA = {
    RELIANCE: {
        labels: ['9:30', '10:00', '10:30', '11:00', '11:30', '12:00', '12:30', '1:00', '1:30', '2:00', '2:30', '3:00'],
        prices: [2500, 2510, 2505, 2520, 2515, 2525, 2530, 2520, 2535, 2540, 2535, 2525.50],
        volumes: [1200000, 1500000, 1800000, 2000000, 1600000, 2200000, 1900000, 1700000, 2100000, 1800000, 1500000, 1300000]
    },
    TCS: {
        labels: ['9:30', '10:00', '10:30', '11:00', '11:30', '12:00', '12:30', '1:00', '1:30', '2:00', '2:30', '3:00'],
        prices: [3800, 3820, 3810, 3830, 3825, 3840, 3835, 3850, 3845, 3860, 3855, 3850],
        volumes: [800000, 1000000, 1200000, 1500000, 1300000, 1800000, 1600000, 1900000, 1400000, 2100000, 1700000, 1200000]
    },
    INFY: {
        labels: ['9:30', '10:00', '10:30', '11:00', '11:30', '12:00', '12:30', '1:00', '1:30', '2:00', '2:30', '3:00'],
        prices: [1420, 1430, 1425, 1440, 1435, 1450, 1445, 1460, 1455, 1470, 1465, 1450.25],
        volumes: [900000, 1100000, 1300000, 1600000, 1400000, 2000000, 1800000, 2200000, 1600000, 2500000, 2000000, 1500000]
    }
};

// Sector performance
const SECTOR_DATA = {
    labels: ['IT', 'Banking', 'Pharma', 'FMCG', 'Energy', 'Auto', 'Metal', 'Telecom'],
    values: [2.5, 1.8, -0.5, 1.2, -1.0, 0.8, -0.8, 1.5],
    colors: [
        'rgba(16, 185, 129, 0.8)',
        'rgba(16, 185, 129, 0.8)',
        'rgba(239, 68, 68, 0.8)',
        'rgba(16, 185, 129, 0.8)',
        'rgba(239, 68, 68, 0.8)',
        'rgba(16, 185, 129, 0.8)',
        'rgba(239, 68, 68, 0.8)',
        'rgba(16, 185, 129, 0.8)'
    ]
};

// Heatmap data
const HEATMAP_DATA = [
    { sector: 'IT', value: 2.5 },
    { sector: 'Banking', value: 1.8 },
    { sector: 'Pharma', value: -0.5 },
    { sector: 'FMCG', value: 1.2 },
    { sector: 'Energy', value: -1.0 },
    { sector: 'Auto', value: 0.8 },
    { sector: 'Metal', value: -0.8 },
    { sector: 'Telecom', value: 1.5 },
    { sector: 'PSU', value: -0.3 },
    { sector: 'Realty', value: 0.5 },
    { sector: 'Media', value: -0.2 },
    { sector: 'Infrastructure', value: 1.1 }
];

// ============================================
// SAFE STORAGE HELPERS (localStorage can throw
// in sandboxed iframes / private mode — never
// let that break the whole dashboard)
// ============================================
function safeStorageGet(key, fallback) {
    try {
        if (typeof localStorage === 'undefined') return fallback;
        const value = localStorage.getItem(key);
        return value === null ? fallback : value;
    } catch (e) {
        return fallback;
    }
}

function safeStorageSet(key, value) {
    try {
        if (typeof localStorage === 'undefined') return;
        localStorage.setItem(key, value);
    } catch (e) {
        if (CONFIG.debug) console.warn('Storage unavailable:', e);
    }
}

function safeStorageClear() {
    try {
        if (typeof localStorage === 'undefined') return;
        localStorage.clear();
    } catch (e) {
        if (CONFIG.debug) console.warn('Storage unavailable:', e);
    }
}

// ============================================
// WATCHLIST (Local Storage)
// ============================================
let watchlist = [];
try {
    watchlist = JSON.parse(safeStorageGet('watchlist', '[]')) || [];
    if (!Array.isArray(watchlist)) watchlist = [];
} catch (e) {
    watchlist = [];
}

// ============================================
// INITIALIZATION
// ============================================
// Run an init step safely — one failing widget must
// never prevent the rest of the dashboard (or the
// loading overlay) from working.
function safeInit(stepName, fn) {
    try {
        fn();
    } catch (err) {
        console.error('Dashboard init step failed [' + stepName + ']:', err);
    }
}

function initializeDashboard() {
    if (CONFIG.debug) console.log('Indian Market Dashboard: Initializing...');

    // Initialize all components (each isolated so a single
    // error can't leave the page stuck on "Loading...")
    safeInit('navigation', initNavigation);
    safeInit('marketData', initMarketData);
    safeInit('signals', initSignals);
    safeInit('screener', initScreener);
    safeInit('analysis', initAnalysis);
    safeInit('watchlist', initWatchlist);
    safeInit('learningCenter', initLearningCenter);
    safeInit('settings', initSettings);
    safeInit('charts', initCharts);

    // ALWAYS hide the loading overlay, even if something failed above
    hideLoadingOverlay();

    // Start auto-refresh
    if (CONFIG.autoRefresh) {
        safeInit('autoRefresh', startAutoRefresh);
    }

    // Show welcome toast
    setTimeout(() => {
        safeInit('welcomeToast', () => {
            showToast('🎉 Welcome to Indian Market Live Dashboard! Start exploring stocks.', 'info');
        });
    }, 1000);

    if (CONFIG.debug) console.log('Indian Market Dashboard: Loaded successfully');

    // Signal to the inline failsafe in index.html that the app started OK.
    window.__dashboardReady = true;
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeDashboard);
} else {
    // Script loaded after DOM was already parsed
    initializeDashboard();
}

// Absolute fallback: never leave the loading overlay up forever,
// even if something catastrophic happens above.
window.addEventListener('load', function() {
    setTimeout(hideLoadingOverlay, 500);
});
setTimeout(hideLoadingOverlay, 6000);

// ============================================
// NAVIGATION
// ============================================
function initNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const sectionId = this.getAttribute('onclick').match(/showSection\(['"]([^'"]+)['"]\)/)?.[1];
            if (sectionId) {
                showSection(sectionId);
            }
        });
    });
    
    // Mobile menu toggle (if needed)
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', toggleMobileMenu);
    }
}

function showSection(sectionId) {
    // Hide all sections
    const sections = document.querySelectorAll('.section');
    sections.forEach(section => {
        section.classList.remove('active');
    });
    
    // Show selected section
    const section = document.getElementById(sectionId);
    if (section) {
        section.classList.add('active');
    }
    
    // Update nav links
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.classList.remove('active');
        const linkSection = link.getAttribute('onclick').match(/showSection\(['"]([^'"]+)['"]\)/)?.[1];
        if (linkSection === sectionId) {
            link.classList.add('active');
        }
    });
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    // Close mobile menu if open
    const sidebar = document.querySelector('.sidebar');
    if (sidebar.classList.contains('active')) {
        sidebar.classList.remove('active');
    }
}

function toggleMobileMenu() {
    const sidebar = document.querySelector('.sidebar');
    sidebar.classList.toggle('active');
}

// ============================================
// MARKET DATA
// ============================================
function initMarketData() {
    updateMarketOverview();
    updateMarketStats();
    updateMarketMood();
    updateFIIDIIActivity();
    updateTopMovers();
    updateHeatmap();
    updateMarketStatus();
}

function updateMarketOverview() {
    // NIFTY 50
    updateMarketCard('nifty', MARKET_DATA.nifty50);
    
    // SENSEX
    updateMarketCard('sensex', MARKET_DATA.sensex);
    
    // NIFTY Bank
    updateMarketCard('banknifty', MARKET_DATA.banknifty);
}

function updateMarketCard(prefix, data) {
    const priceEl = document.getElementById(`${prefix}-price`);
    const changeEl = document.getElementById(`${prefix}-change`);
    const highEl = document.getElementById(`${prefix}-high`);
    const lowEl = document.getElementById(`${prefix}-low`);
    const volumeEl = document.getElementById(`${prefix}-volume`);
    
    if (priceEl) priceEl.textContent = formatPrice(data.price);
    if (changeEl) {
        changeEl.textContent = formatChange(data.change, data.percent);
        changeEl.className = 'card-change ' + (data.change >= 0 ? 'positive' : 'negative');
    }
    if (highEl) highEl.textContent = formatPrice(data.high);
    if (lowEl) lowEl.textContent = formatPrice(data.low);
    if (volumeEl) volumeEl.textContent = formatVolume(data.volume);
}

function updateMarketStats() {
    document.getElementById('advances').textContent = MARKET_STATS.advances.toLocaleString('en-IN');
    document.getElementById('declines').textContent = MARKET_STATS.declines.toLocaleString('en-IN');
    document.getElementById('unchanged').textContent = MARKET_STATS.unchanged.toLocaleString('en-IN');
}

function updateMarketMood() {
    // Calculate market mood based on indices
    const niftyChange = MARKET_DATA.nifty50.change;
    const sensexChange = MARKET_DATA.sensex.change;
    const bankniftyChange = MARKET_DATA.banknifty.change;
    
    const totalChange = niftyChange + sensexChange + bankniftyChange;
    const moodValue = totalChange > 0 ? 'Bullish' : totalChange < 0 ? 'Bearish' : 'Neutral';
    
    // Calculate sentiment percentage
    const positiveIndices = [niftyChange, sensexChange, bankniftyChange].filter(c => c > 0).length;
    const sentiment = Math.round((positiveIndices / 3) * 100);
    
    const moodEl = document.getElementById('market-mood');
    const sentimentEl = document.getElementById('market-sentiment');
    
    if (moodEl) {
        moodEl.innerHTML = `
            <div class="mood-value ${moodValue.toLowerCase()}">${moodValue}</div>
            <div class="mood-meter">
                <div class="mood-bar bearish" style="width: ${100 - sentiment}%"></div>
                <div class="mood-bar bullish" style="width: ${sentiment}%"></div>
            </div>
            <div class="mood-labels">
                <span>Bearish</span>
                <span>Neutral</span>
                <span>Bullish</span>
            </div>
        `;
    }
    
    if (sentimentEl) {
        sentimentEl.textContent = `${sentiment}% ${moodValue}`;
        sentimentEl.className = 'card-change ' + (moodValue === 'Bullish' ? 'positive' : moodValue === 'Bearish' ? 'negative' : '');
    }
}

function updateFIIDIIActivity() {
    // FII
    document.getElementById('fii-buy').textContent = `₹${MARKET_STATS.fii.buy}Cr`;
    document.getElementById('fii-sell').textContent = `₹${MARKET_STATS.fii.sell}Cr`;
    document.getElementById('fii-net').textContent = `₹${MARKET_STATS.fii.net}Cr`;
    document.getElementById('fii-flow').textContent = `+₹${MARKET_STATS.fii.net}Cr`;
    
    // DII
    document.getElementById('dii-buy').textContent = `₹${MARKET_STATS.dii.buy}Cr`;
    document.getElementById('dii-sell').textContent = `₹${MARKET_STATS.dii.sell}Cr`;
    document.getElementById('dii-net').textContent = `₹${MARKET_STATS.dii.net}Cr`;
    document.getElementById('dii-flow').textContent = `+₹${MARKET_STATS.dii.net}Cr`;
}

function updateTopMovers() {
    // Sort stocks by change percentage
    const gainers = [...STOCKS].filter(s => s.change > 0).sort((a, b) => b.percent - a.percent).slice(0, 5);
    const losers = [...STOCKS].filter(s => s.change < 0).sort((a, b) => a.percent - b.percent).slice(0, 5);
    
    // Update gainers table
    const gainersTable = document.getElementById('gainers-table');
    if (gainersTable) {
        gainersTable.innerHTML = gainers.map((stock, index) => `
            <tr>
                <td>
                    <div class="stock-symbol">${stock.symbol}</div>
                    <div class="stock-name">${stock.name}</div>
                </td>
                <td>₹${stock.price.toFixed(2)}</td>
                <td class="positive">+${stock.change.toFixed(2)} (${stock.percent.toFixed(2)}%)</td>
                <td>${formatVolume(stock.volume)}</td>
            </tr>
        `).join('');
    }
    
    // Update losers table
    const losersTable = document.getElementById('losers-table');
    if (losersTable) {
        losersTable.innerHTML = losers.map((stock, index) => `
            <tr>
                <td>
                    <div class="stock-symbol">${stock.symbol}</div>
                    <div class="stock-name">${stock.name}</div>
                </td>
                <td>₹${stock.price.toFixed(2)}</td>
                <td class="negative">-${Math.abs(stock.change).toFixed(2)} (${Math.abs(stock.percent).toFixed(2)}%)</td>
                <td>${formatVolume(stock.volume)}</td>
            </tr>
        `).join('');
    }
}

function updateHeatmap() {
    const heatmap = document.getElementById('market-heatmap');
    if (!heatmap) return;
    
    heatmap.innerHTML = HEATMAP_DATA.map(data => {
        const value = data.value;
        let className = '';
        
        if (value > 2) className = 'positive-5';
        else if (value > 1.5) className = 'positive-4';
        else if (value > 1) className = 'positive-3';
        else if (value > 0.5) className = 'positive-2';
        else if (value > 0) className = 'positive-1';
        else if (value < -2) className = 'negative-5';
        else if (value < -1.5) className = 'negative-4';
        else if (value < -1) className = 'negative-3';
        else if (value < -0.5) className = 'negative-2';
        else if (value < 0) className = 'negative-1';
        else className = '';
        
        return `<div class="heatmap-cell ${className}" title="${data.sector}: ${value > 0 ? '+' : ''}${value.toFixed(1)}%">${value > 0 ? '+' : ''}${value.toFixed(1)}%</div>`;
    }).join('');
}

function updateMarketStatus() {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const isMarketOpen = (hours >= 9 && hours < 15) || (hours === 15 && minutes <= 30);
    
    const statusEl = document.getElementById('market-status');
    if (!statusEl) return;
    const dotEl = statusEl.querySelector('.status-dot');
    const textEl = statusEl.querySelector('span:last-child');
    
    if (dotEl) {
        dotEl.className = 'status-dot ' + (isMarketOpen ? 'open' : 'closed');
    }
    
    if (textEl) {
        textEl.textContent = isMarketOpen ? 'Market: OPEN (9:15 AM - 3:30 PM IST)' : 'Market: CLOSED (Opens at 9:15 AM IST)';
    }
    
    // Update last updated time
    const lastUpdatedEl = document.getElementById('last-updated');
    if (lastUpdatedEl) {
        lastUpdatedEl.textContent = `Last updated: ${now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}`;
    }
}

// ============================================
// INTRADAY SIGNALS
// ============================================
function initSignals() {
    updateActiveSignals();
    updateSignalHistory();
    updateSignalPerformance();
    updateSignalsCount();
}

function updateActiveSignals() {
    const container = document.getElementById('active-signals');
    if (!container) return;
    
    const activeSignals = INTRADAY_SIGNALS.filter(s => s.status === 'active');
    
    container.innerHTML = activeSignals.map(signal => `
        <div class="signal-card ${signal.signal.toLowerCase()}">
            <div class="signal-header">
                <div>
                    <div class="signal-symbol">${signal.stock}</div>
                    <div class="signal-name">${signal.name}</div>
                </div>
                <div class="signal-type ${signal.signal.toLowerCase()}">${signal.signal}</div>
            </div>
            <div class="signal-body">
                <div class="signal-price">₹${signal.entry.toFixed(2)}</div>
                <div class="signal-change ${signal.signal === 'BUY' ? 'positive' : 'negative'}">
                    ${signal.signal === 'BUY' ? '+' : ''}₹${Math.abs(signal.target - signal.entry).toFixed(2)} (${((Math.abs(signal.target - signal.entry) / signal.entry) * 100).toFixed(2)}%)
                </div>
            </div>
            <div class="signal-details">
                <div class="signal-detail">
                    <span class="signal-detail-label">Target</span>
                    <span class="signal-detail-value">₹${signal.target.toFixed(2)}</span>
                </div>
                <div class="signal-detail">
                    <span class="signal-detail-label">Stop Loss</span>
                    <span class="signal-detail-value">₹${signal.stoploss.toFixed(2)}</span>
                </div>
                <div class="signal-detail">
                    <span class="signal-detail-label">Risk</span>
                    <span class="signal-detail-value">${signal.risk}</span>
                </div>
                <div class="signal-detail">
                    <span class="signal-detail-label">Confidence</span>
                    <span class="signal-detail-value">${signal.confidence}%</span>
                </div>
            </div>
            <div class="signal-footer">
                <span class="signal-confidence">${signal.time}</span>
                <div class="signal-actions">
                    <button class="btn btn-small btn-secondary" onclick="viewSignalDetails(${signal.id})">Details</button>
                </div>
            </div>
        </div>
    `).join('');
    
    if (activeSignals.length === 0) {
        container.innerHTML = '<p class="loading">No active signals at the moment. Check back later.</p>';
    }
}

function updateSignalHistory() {
    const table = document.getElementById('signals-history-table');
    if (!table) return;
    
    // NOTE: history times are display strings ("Yesterday 9:30 AM"), not
    // parseable dates, so keep stored order instead of sorting by NaN.
    const history = [...SIGNAL_HISTORY].slice(-10).reverse();
    
    table.innerHTML = history.map(signal => {
        const profitClass = signal.result === 'hit-target' ? 'positive' : signal.result === 'hit-stoploss' ? 'negative' : '';
        const profit = signal.profit !== null ? (signal.profit >= 0 ? '+' : '') + '₹' + Math.abs(signal.profit).toFixed(2) : '-';
        
        return `
            <tr>
                <td>${signal.stock}</td>
                <td class="signal-${signal.signal.toLowerCase()}">${signal.signal}</td>
                <td>₹${signal.entry.toFixed(2)}</td>
                <td>₹${signal.target.toFixed(2)}</td>
                <td>₹${signal.stoploss.toFixed(2)}</td>
                <td class="${profitClass}">${profit}</td>
                <td>${signal.time}</td>
                <td class="status-${signal.status}">${signal.status === 'completed' ? 'Completed' : signal.status}</td>
            </tr>
        `;
    }).join('');
}

function updateSignalPerformance() {
    const totalSignals = SIGNAL_HISTORY.length;
    const winningSignals = SIGNAL_HISTORY.filter(s => s.result === 'hit-target').length;
    const losingSignals = SIGNAL_HISTORY.filter(s => s.result === 'hit-stoploss').length;
    const winRate = totalSignals > 0 ? Math.round((winningSignals / totalSignals) * 100) : 0;
    
    const totalProfit = SIGNAL_HISTORY.reduce((sum, s) => sum + (s.profit || 0), 0);
    const avgReturn = totalSignals > 0 ? (totalProfit / totalSignals).toFixed(2) : 0;
    
    document.getElementById('total-signals').textContent = totalSignals;
    document.getElementById('winning-signals').textContent = winningSignals;
    document.getElementById('losing-signals').textContent = losingSignals;
    document.getElementById('win-rate').textContent = `${winRate}%`;
    document.getElementById('avg-return').textContent = `${avgReturn > 0 ? '+' : ''}${avgReturn}%`;
}

function updateSignalsCount() {
    const activeCount = INTRADAY_SIGNALS.filter(s => s.status === 'active').length;
    const countEl = document.getElementById('signals-count');
    const activeCountEl = document.getElementById('active-signals-count');
    
    if (countEl) countEl.textContent = activeCount;
    if (activeCountEl) activeCountEl.textContent = activeCount;
}

function filterSignals() {
    const type = document.getElementById('signal-type')?.value || 'all';
    const risk = document.getElementById('signal-risk')?.value || 'all';
    const sector = document.getElementById('signal-sector')?.value || 'all';
    const timeframe = document.getElementById('signal-timeframe')?.value || 'all';
    
    const filtered = INTRADAY_SIGNALS.filter(signal => {
        return (type === 'all' || signal.signal.toLowerCase() === type) &&
               (risk === 'all' || signal.risk === risk) &&
               (sector === 'all' || signal.sector === sector) &&
               (timeframe === 'all' || signal.timeframe === timeframe);
    });
    
    // Update active signals display
    const container = document.getElementById('active-signals');
    if (container) {
        if (filtered.length === 0) {
            container.innerHTML = '<p class="loading">No signals match your criteria.</p>';
        } else {
            container.innerHTML = filtered.map(signal => `
                <div class="signal-card ${signal.signal.toLowerCase()}">
                    <div class="signal-header">
                        <div>
                            <div class="signal-symbol">${signal.stock}</div>
                            <div class="signal-name">${signal.name}</div>
                        </div>
                        <div class="signal-type ${signal.signal.toLowerCase()}">${signal.signal}</div>
                    </div>
                    <div class="signal-body">
                        <div class="signal-price">₹${signal.entry.toFixed(2)}</div>
                        <div class="signal-change ${signal.signal === 'BUY' ? 'positive' : 'negative'}">
                            ${signal.signal === 'BUY' ? '+' : ''}₹${Math.abs(signal.target - signal.entry).toFixed(2)}
                        </div>
                    </div>
                    <div class="signal-footer">
                        <span class="signal-confidence">${signal.time}</span>
                    </div>
                </div>
            `).join('');
        }
    }
}

function viewSignalDetails(signalId) {
    const signal = INTRADAY_SIGNALS.find(s => s.id === signalId);
    if (!signal) return;
    
    const modal = document.getElementById('modal');
    const modalTitle = document.getElementById('modal-title');
    const modalBody = document.getElementById('modal-body');
    
    modalTitle.textContent = `${signal.stock} - ${signal.signal} Signal`;
    
    const riskReward = calculateRiskReward(signal.entry, signal.target, signal.stoploss);
    
    modalBody.innerHTML = `
        <div class="signal-detail-modal">
            <div class="signal-info-grid">
                <div class="signal-info-item">
                    <div class="signal-info-label">Stock</div>
                    <div class="signal-info-value">${signal.stock} - ${signal.name}</div>
                </div>
                <div class="signal-info-item">
                    <div class="signal-info-label">Signal Type</div>
                    <div class="signal-info-value signal-type ${signal.signal.toLowerCase()}">${signal.signal}</div>
                </div>
                <div class="signal-info-item">
                    <div class="signal-info-label">Sector</div>
                    <div class="signal-info-value">${signal.sector.toUpperCase()}</div>
                </div>
                <div class="signal-info-item">
                    <div class="signal-info-label">Risk Level</div>
                    <div class="signal-info-value">${signal.risk}</div>
                </div>
            </div>
            
            <div class="signal-trade-setup">
                <h3>Trade Setup</h3>
                <div class="setup-grid">
                    <div class="setup-item">
                        <div class="setup-label">Entry Price</div>
                        <div class="setup-value">₹${signal.entry.toFixed(2)}</div>
                    </div>
                    <div class="setup-item">
                        <div class="setup-label">Target</div>
                        <div class="setup-value">₹${signal.target.toFixed(2)}</div>
                    </div>
                    <div class="setup-item">
                        <div class="setup-label">Stop Loss</div>
                        <div class="setup-value">₹${signal.stoploss.toFixed(2)}</div>
                    </div>
                    <div class="setup-item">
                        <div class="setup-label">Risk-Reward Ratio</div>
                        <div class="setup-value">1:${riskReward.toFixed(1)}</div>
                    </div>
                </div>
            </div>
            
            <div class="signal-analysis">
                <h3>Signal Analysis</h3>
                <div class="analysis-grid">
                    <div class="analysis-item">
                        <div class="analysis-label">Confidence Level</div>
                        <div class="analysis-value">${signal.confidence}%</div>
                        <div class="confidence-bar">
                            <div class="confidence-fill" style="width: ${signal.confidence}%"></div>
                        </div>
                    </div>
                    <div class="analysis-item">
                        <div class="analysis-label">Potential Profit</div>
                        <div class="analysis-value positive">+₹${(signal.target - signal.entry).toFixed(2)}</div>
                    </div>
                    <div class="analysis-item">
                        <div class="analysis-label">Potential Loss</div>
                        <div class="analysis-value negative">-₹${(signal.entry - signal.stoploss).toFixed(2)}</div>
                    </div>
                </div>
            </div>
            
            <div class="signal-rationale">
                <h3>Why This Signal?</h3>
                <p>This ${signal.signal} signal is generated based on technical analysis of ${signal.stock}. The stock has shown ${signal.signal === 'BUY' ? 'bullish' : 'bearish'} momentum with strong volume support.</p>
                <p><strong>Note:</strong> This is for educational purposes only. Always do your own research and consider your risk tolerance before trading.</p>
            </div>
        </div>
    `;
    
    modal.classList.add('active');
}

function calculateRiskReward(entry, target, stoploss) {
    const risk = entry - stoploss;
    const reward = target - entry;
    return risk > 0 ? reward / risk : 0;
}

// ============================================
// STOCK SCREENER
// ============================================
function initScreener() {
    // Load all stocks by default
    loadScreenerResults(STOCKS);
    
    // Add event listeners
    document.getElementById('stock-search')?.addEventListener('input', searchStocks);
}

function searchStocks() {
    const searchTerm = document.getElementById('stock-search')?.value.toLowerCase() || '';
    
    if (searchTerm.length < 2) {
        applyScreener();
        return;
    }
    
    const filtered = STOCKS.filter(stock => 
        stock.symbol.toLowerCase().includes(searchTerm) ||
        stock.name.toLowerCase().includes(searchTerm)
    );
    
    loadScreenerResults(filtered);
}

function applyScreener() {
    const sector = document.getElementById('screener-sector')?.value || 'all';
    const marketcap = document.getElementById('screener-marketcap')?.value || 'all';
    const minPrice = parseFloat(document.getElementById('min-price')?.value || 0);
    const maxPrice = parseFloat(document.getElementById('max-price')?.value || Infinity);
    const rsiMin = parseFloat(document.getElementById('rsi-min')?.value || 0);
    const rsiMax = parseFloat(document.getElementById('rsi-max')?.value || 100);
    const volume = document.getElementById('screener-volume')?.value || 'all';
    const trend = document.getElementById('screener-trend')?.value || 'all';
    const signal = document.getElementById('screener-signal')?.value || 'all';
    const pattern = document.getElementById('screener-pattern')?.value || 'all';
    
    const filtered = STOCKS.filter(stock => {
        // Sector filter
        if (sector !== 'all' && stock.sector !== sector) return false;
        
        // Market cap filter
        if (marketcap === 'large' && stock.marketCap !== 'large') return false;
        if (marketcap === 'mid' && stock.marketCap !== 'mid') return false;
        if (marketcap === 'small' && stock.marketCap !== 'small') return false;
        
        // Price range filter
        if (stock.price < minPrice || stock.price > maxPrice) return false;
        
        // RSI filter
        if (stock.rsi < rsiMin || stock.rsi > rsiMax) return false;
        
        // Volume filter
        if (volume === 'high' && stock.volume < 1000000) return false;
        if (volume === 'medium' && (stock.volume < 100000 || stock.volume > 1000000)) return false;
        if (volume === 'low' && stock.volume < 100000) return false;
        
        // Trend filter
        if (trend === 'bullish' && stock.trend !== 'bullish') return false;
        if (trend === 'bearish' && stock.trend !== 'bearish') return false;
        
        // Signal filter
        if (signal !== 'all' && stock.signal !== signal) return false;
        
        // Pattern filter (simplified)
        if (pattern === 'breakout' && stock.signal !== 'buy') return false;
        if (pattern === 'pullback' && stock.signal !== 'buy') return false;
        if (pattern === 'reversal' && stock.signal !== 'sell') return false;
        
        return true;
    });
    
    loadScreenerResults(filtered);
}

function loadScreenerResults(stocks) {
    const table = document.getElementById('screener-results-table');
    const countEl = document.getElementById('results-count');
    
    if (!table) return;
    
    if (stocks.length === 0) {
        table.innerHTML = '<tr><td colspan="8" class="loading">No stocks match your criteria. Try adjusting the filters.</td></tr>';
        if (countEl) countEl.textContent = '0';
        return;
    }
    
    table.innerHTML = stocks.map((stock, index) => {
        const signalClass = stock.signal === 'buy' ? 'positive' : stock.signal === 'sell' ? 'negative' : '';
        return `
            <tr>
                <td>${index + 1}</td>
                <td>
                    <div class="stock-symbol">${stock.symbol}</div>
                    <div class="stock-name">${stock.name}</div>
                </td>
                <td>₹${stock.price.toFixed(2)}</td>
                <td class="${stock.change >= 0 ? 'positive' : 'negative'}">
                    ${stock.change >= 0 ? '+' : ''}₹${Math.abs(stock.change).toFixed(2)} (${stock.change >= 0 ? '+' : ''}${Math.abs(stock.percent).toFixed(2)}%)
                </td>
                <td>${formatVolume(stock.volume)}</td>
                <td>${stock.rsi.toFixed(1)}</td>
                <td class="${signalClass}">${stock.signal.toUpperCase()}</td>
                <td>
                    <button class="btn btn-small" onclick="addToWatchlistFromScreener('${stock.symbol}')">+ Watchlist</button>
                </td>
            </tr>
        `;
    }).join('');
    
    if (countEl) countEl.textContent = stocks.length;
}

function resetScreener() {
    document.getElementById('stock-search').value = '';
    document.getElementById('screener-sector').value = 'all';
    document.getElementById('screener-marketcap').value = 'all';
    document.getElementById('min-price').value = '0';
    document.getElementById('max-price').value = '10000';
    document.getElementById('rsi-min').value = '0';
    document.getElementById('rsi-max').value = '100';
    document.getElementById('screener-volume').value = 'all';
    document.getElementById('screener-trend').value = 'all';
    document.getElementById('screener-signal').value = 'all';
    document.getElementById('screener-pattern').value = 'all';
    
    applyScreener();
}

function saveScreener() {
    showToast('Screener settings saved!', 'success');
}

function sortResults(by) {
    const table = document.getElementById('screener-results-table');
    if (!table) return;

    // NOTE: the header row lives in <thead>, so every <tr> here is data —
    // do not shift anything off (that used to delete the first result row).
    const rows = Array.from(table.querySelectorAll('tr')).filter(r => r.cells.length > 1);
    if (rows.length === 0) return;

    const colIndex = by === 'name' ? 1 : by === 'price' ? 2 : by === 'change' ? 3 : 0;

    rows.sort((a, b) => {
        const aValue = (a.cells[colIndex]?.textContent || '').trim();
        const bValue = (b.cells[colIndex]?.textContent || '').trim();

        if (by === 'name') {
            return aValue.localeCompare(bValue);
        } else if (by === 'price' || by === 'change') {
            const aNum = parseFloat(aValue.replace(/[^0-9.\-]/g, '')) || 0;
            const bNum = parseFloat(bValue.replace(/[^0-9.\-]/g, '')) || 0;
            return by === 'change' ? bNum - aNum : aNum - bNum;
        }
        return 0;
    });

    // Rebuild table body in sorted order
    rows.forEach(row => table.appendChild(row));
    showToast('Results sorted!', 'info');
}

function loadQuickScreen(type) {
    let filtered = [];
    
    switch (type) {
        case 'top-gainers':
            filtered = [...STOCKS].filter(s => s.change > 0).sort((a, b) => b.percent - a.percent).slice(0, 10);
            break;
        case 'top-losers':
            filtered = [...STOCKS].filter(s => s.change < 0).sort((a, b) => a.percent - b.percent).slice(0, 10);
            break;
        case 'high-volume':
            filtered = [...STOCKS].sort((a, b) => b.volume - a.volume).slice(0, 10);
            break;
        case 'breakout':
            filtered = [...STOCKS].filter(s => s.signal === 'buy' && s.rsi > 50).slice(0, 10);
            break;
        case 'oversold':
            filtered = [...STOCKS].filter(s => s.rsi < 30).slice(0, 10);
            break;
        case 'overbought':
            filtered = [...STOCKS].filter(s => s.rsi > 70).slice(0, 10);
            break;
        default:
            filtered = STOCKS.slice(0, 10);
    }
    
    loadScreenerResults(filtered);
    showSection('screener');
}

function exportResults() {
    const stocks = STOCKS;
    const csv = [
        ['Symbol', 'Name', 'Price', 'Change', 'Change%', 'Volume', 'RSI', 'Signal', 'Sector'],
        ...stocks.map(s => [
            s.symbol,
            s.name,
            s.price.toFixed(2),
            s.change.toFixed(2),
            s.percent.toFixed(2),
            s.volume,
            s.rsi.toFixed(1),
            s.signal,
            s.sector
        ])
    ].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
    
    downloadCSV(csv, 'stock_screener_results.csv');
    showToast('Results exported to CSV!', 'success');
}

// ============================================
// TECHNICAL ANALYSIS
// ============================================
function initAnalysis() {
    loadStockAnalysis();
}

// Only a few stocks ship with hand-written indicator/chart data.
// For every other stock in the dropdown, derive sensible demo
// values from its live price so Technical Analysis never shows
// a blank/stale panel.
function ensureStockMeta(stockSymbol) {
    const stock = STOCKS.find(s => s.symbol === stockSymbol);
    if (!stock) return;
    const price = stock.price;

    if (!INDICATORS[stockSymbol]) {
        INDICATORS[stockSymbol] = {
            rsi: stock.rsi || 50,
            macd: stock.signal === 'sell' ? -5.2 : 6.4,
            ma50: price * 0.985,
            ma200: price * 0.965,
            bb: { upper: price * 1.02, middle: price, lower: price * 0.98 },
            volume: stock.volume
        };
    }
    if (!SR_LEVELS[stockSymbol]) {
        SR_LEVELS[stockSymbol] = {
            current: price,
            r1: price * 1.015, r2: price * 1.03, r3: price * 1.05,
            s1: price * 0.985, s2: price * 0.97, s3: price * 0.95
        };
    } else {
        SR_LEVELS[stockSymbol].current = price;
    }
    if (!CHART_DATA[stockSymbol]) {
        const labels = ['9:30', '10:00', '10:30', '11:00', '11:30', '12:00', '12:30', '1:00', '1:30', '2:00', '2:30', '3:00'];
        const prices = [];
        const volumes = [];
        let p = price * 0.992;
        // Deterministic pseudo-random walk seeded by symbol so the
        // chart is stable between re-renders.
        let seed = 0;
        for (let i = 0; i < stockSymbol.length; i++) seed += stockSymbol.charCodeAt(i);
        const rand = () => {
            seed = (seed * 9301 + 49297) % 233280;
            return seed / 233280;
        };
        for (let i = 0; i < labels.length; i++) {
            p = p + (rand() - 0.48) * price * 0.002;
            prices.push(i === labels.length - 1 ? price : p);
            volumes.push(Math.floor(stock.volume * (0.05 + rand() * 0.06)));
        }
        CHART_DATA[stockSymbol] = { labels, prices, volumes };
    }
}

function loadStockAnalysis() {
    const stockSelect = document.getElementById('analysis-stock');
    const selectedStock = stockSelect?.value || 'RELIANCE';

    ensureStockMeta(selectedStock);
    updateStockChart(selectedStock);
    updateIndicators(selectedStock);
    updateRecommendation(selectedStock);
}

function updateStockChart(stockSymbol) {
    ensureStockMeta(stockSymbol);
    const stockData = CHART_DATA[stockSymbol];
    if (!stockData) return;
    
    const chartTitle = document.getElementById('chart-title');
    const chartPrice = document.getElementById('chart-price');
    const chartChange = document.getElementById('chart-change');
    
    if (chartTitle) {
        const stock = STOCKS.find(s => s.symbol === stockSymbol);
        chartTitle.textContent = `${stockSymbol} - ${stock?.name || stockSymbol} - Technical Analysis`;
    }
    
    if (chartPrice && chartChange) {
        const stock = STOCKS.find(s => s.symbol === stockSymbol);
        if (stock) {
            chartPrice.textContent = `₹${stock.price.toFixed(2)}`;
            chartChange.textContent = formatChange(stock.change, stock.percent);
            chartChange.className = 'chart-change ' + (stock.change >= 0 ? 'positive' : 'negative');
        }
    }
    
    // Update chart
    updateChart(stockSymbol, stockData);
}

function updateChart(stockSymbol, stockData) {
    const chartType = document.getElementById('analysis-chart-type')?.value || 'line';
    const canvas = document.getElementById('analysisChart');

    if (!canvas) return;

    // Chart.js is loaded from a CDN — if it failed (offline page,
    // blocked CDN, ad-blocker), show a friendly note instead of
    // throwing and breaking the whole dashboard.
    if (typeof Chart === 'undefined') {
        showChartFallback(canvas, 'Chart library failed to load. Check your internet connection and refresh.');
        return;
    }

    // Destroy existing chart if it exists
    if (window.analysisChart) {
        try {
            window.analysisChart.destroy();
        } catch (e) {
            if (CONFIG.debug) console.warn('Could not destroy old chart:', e);
        }
        window.analysisChart = null;
    }

    const labels = stockData.labels;
    const prices = stockData.prices;

    // 'candlestick' needs the chartjs-chart-financial plugin which is
    // NOT bundled — fall back to a line chart so selecting it never
    // crashes ("Unknown controller: candlestick").
    const wantsCandles = chartType === 'candlestick';
    const hasCandlePlugin = typeof Chart !== 'undefined' &&
        Chart.registry && (() => { try { return !!Chart.registry.getController('candlestick'); } catch (e) { return false; } })();
    const effectiveType = (wantsCandles && hasCandlePlugin) ? 'candlestick' : 'line';

    let chartConfig = {
        type: effectiveType,
        data: {
            labels: labels,
            datasets: []
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            },
            scales: {
                x: { grid: { display: false } },
                y: {
                    grid: { color: 'rgba(0, 0, 0, 0.05)' },
                    ticks: {
                        callback: function(value) {
                            return '₹' + Number(value).toFixed(2);
                        }
                    }
                }
            }
        }
    };

    if (effectiveType === 'candlestick') {
        const step = Math.max(prices[0] * 0.001, 0.05);
        const candlestickData = prices.map((price, i) => ({
            x: labels[i],
            o: price - step,
            h: price + step,
            l: price - step,
            c: price
        }));

        chartConfig.data.datasets.push({
            label: 'Price',
            data: candlestickData,
            color: {
                up: 'rgba(16, 185, 129, 0.8)',
                down: 'rgba(239, 68, 68, 0.8)',
                unchanged: '#6b7280'
            }
        });
    } else {
        chartConfig.data.datasets.push({
            label: 'Price',
            data: prices,
            borderColor: '#4361ee',
            backgroundColor: chartType === 'line' ? 'rgba(67, 97, 238, 0.05)' : 'rgba(67, 97, 238, 0.15)',
            fill: true,
            tension: 0.4
        });
    }

    try {
        window.analysisChart = new Chart(canvas.getContext('2d'), chartConfig);
    } catch (err) {
        console.error('Failed to render analysis chart:', err);
        showChartFallback(canvas, 'Could not render this chart. Please try another chart type.');
    }
}

// Replaces a <canvas> with a friendly message box when Chart.js
// is unavailable or a render fails. Never throws.
function showChartFallback(canvas, message) {
    try {
        const wrapper = canvas.parentElement;
        if (!wrapper) return;
        let note = wrapper.querySelector('.chart-fallback');
        if (!note) {
            note = document.createElement('div');
            note.className = 'chart-fallback';
            note.style.cssText = 'padding:32px 16px;text-align:center;color:#64748b;font-size:14px;background:#f1f5f9;border-radius:12px;margin-top:8px;';
            canvas.style.display = 'none';
            canvas.after(note);
        }
        note.textContent = '📊 ' + message;
    } catch (e) {
        console.warn('Chart fallback failed:', e);
    }
}

function updateIndicators(stockSymbol) {
    const indicators = INDICATORS[stockSymbol];
    if (!indicators) return;
    
    const stock = STOCKS.find(s => s.symbol === stockSymbol);
    if (!stock) return;
    
    // RSI
    updateIndicator('rsi', indicators.rsi.toFixed(1), getRSISignal(indicators.rsi), getRSISignalClass(indicators.rsi));
    document.getElementById('rsi-bar').style.width = `${indicators.rsi}%`;
    
    // MACD
    updateIndicator('macd', indicators.macd.toFixed(1), indicators.macd > 0 ? 'Bullish' : 'Bearish', indicators.macd > 0 ? 'buy' : 'sell');
    document.getElementById('macd-bar').style.width = `${Math.min(Math.abs(indicators.macd) * 2, 100)}%`;
    
    // MA 50
    updateIndicator('ma50', `₹${indicators.ma50.toFixed(2)}`, stock.price > indicators.ma50 ? 'Above' : 'Below', stock.price > indicators.ma50 ? 'buy' : 'sell');
    
    // MA 200
    updateIndicator('ma200', `₹${indicators.ma200.toFixed(2)}`, stock.price > indicators.ma200 ? 'Above' : 'Below', stock.price > indicators.ma200 ? 'buy' : 'sell');
    
    // Bollinger Bands
    updateIndicator('bb', `₹${indicators.bb.upper.toFixed(2)} / ${indicators.bb.lower.toFixed(2)}`, 
                   getBBSignal(stock.price, indicators.bb), getBBSignalClass(stock.price, indicators.bb));
    
    // Volume
    updateIndicator('volume', formatVolume(indicators.volume), indicators.volume > 5000000 ? 'High' : 'Normal', 'neutral');
    
    // Update overall signal
    updateOverallSignal(stockSymbol);
    
    // Update SR levels
    updateSRLevels(stockSymbol);
}

function updateIndicator(id, value, signal, signalClass) {
    const valueEl = document.getElementById(`${id}-value`);
    const signalEl = document.getElementById(`${id}-signal`);
    
    if (valueEl) valueEl.textContent = value;
    if (signalEl) {
        signalEl.textContent = signal;
        signalEl.className = 'indicator-signal ' + signalClass;
    }
}

function getRSISignal(rsi) {
    if (rsi > 70) return 'Overbought';
    if (rsi < 30) return 'Oversold';
    return 'Neutral';
}

function getRSISignalClass(rsi) {
    if (rsi > 70) return 'sell';
    if (rsi < 30) return 'buy';
    return 'neutral';
}

function getBBSignal(price, bb) {
    if (price >= bb.upper) return 'Overbought';
    if (price <= bb.lower) return 'Oversold';
    return 'Neutral';
}

function getBBSignalClass(price, bb) {
    if (price >= bb.upper) return 'sell';
    if (price <= bb.lower) return 'buy';
    return 'neutral';
}

function updateOverallSignal(stockSymbol) {
    const indicators = INDICATORS[stockSymbol];
    const stock = STOCKS.find(s => s.symbol === stockSymbol);
    if (!indicators || !stock) return;
    
    let buySignals = 0;
    let sellSignals = 0;
    
    if (indicators.rsi < 30) buySignals++; else if (indicators.rsi > 70) sellSignals++;
    if (indicators.macd > 0) buySignals++; else sellSignals++;
    if (stock.price > indicators.ma50) buySignals++; else sellSignals++;
    if (stock.price > indicators.ma200) buySignals++; else sellSignals++;
    if (stock.price <= indicators.bb.lower) buySignals++; else if (stock.price >= indicators.bb.upper) sellSignals++;
    
    const signalBadge = document.getElementById('overall-signal');
    const signalDetails = document.getElementById('signal-details');
    
    if (signalBadge) {
        if (buySignals > sellSignals) {
            signalBadge.innerHTML = '<span class="signal-icon">🟢</span><span class="signal-text">STRONG BUY</span>';
            signalBadge.className = 'signal-badge large buy';
        } else if (sellSignals > buySignals) {
            signalBadge.innerHTML = '<span class="signal-icon">🔴</span><span class="signal-text">STRONG SELL</span>';
            signalBadge.className = 'signal-badge large sell';
        } else {
            signalBadge.innerHTML = '<span class="signal-icon">🟡</span><span class="signal-text">HOLD</span>';
            signalBadge.className = 'signal-badge large hold';
        }
    }
    
    if (signalDetails) {
        const signalStrength = Math.abs(buySignals - sellSignals);
        let message = '';
        
        if (buySignals > sellSignals) {
            message = `Strong buy signal with ${buySignals} bullish indicators and ${sellSignals} bearish indicators.`;
        } else if (sellSignals > buySignals) {
            message = `Strong sell signal with ${sellSignals} bearish indicators and ${buySignals} bullish indicators.`;
        } else {
            message = `Mixed signals. Consider waiting for a clearer trend.`;
        }
        
        signalDetails.innerHTML = `<p>${message}</p>`;
    }
    
    // Update recommendation
    updateRecommendation(stockSymbol);
}

function updateSRLevels(stockSymbol) {
    const sr = SR_LEVELS[stockSymbol];
    if (!sr) return;
    
    document.getElementById('current-price').textContent = `₹${sr.current.toFixed(2)}`;
    document.getElementById('r1').textContent = `₹${sr.r1.toFixed(2)}`;
    document.getElementById('r2').textContent = `₹${sr.r2.toFixed(2)}`;
    document.getElementById('r3').textContent = `₹${sr.r3.toFixed(2)}`;
    document.getElementById('s1').textContent = `₹${sr.s1.toFixed(2)}`;
    document.getElementById('s2').textContent = `₹${sr.s2.toFixed(2)}`;
    document.getElementById('s3').textContent = `₹${sr.s3.toFixed(2)}`;
}

function updateRecommendation(stockSymbol) {
    const stock = STOCKS.find(s => s.symbol === stockSymbol);
    const indicators = INDICATORS[stockSymbol];
    const sr = SR_LEVELS[stockSymbol];
    
    if (!stock || !indicators || !sr) return;
    
    // Generate recommendation based on signals
    let action, entry, target, stoploss, riskReward, confidence;
    
    const buySignals = countBuySignals(stockSymbol);
    const sellSignals = countSellSignals(stockSymbol);
    
    if (buySignals > sellSignals) {
        action = 'BUY';
        entry = stock.price;
        target = sr.r1;
        stoploss = sr.s1;
        confidence = Math.min(90, 50 + (buySignals * 10));
    } else if (sellSignals > buySignals) {
        action = 'SELL';
        entry = stock.price;
        target = sr.s1;
        stoploss = sr.r1;
        confidence = Math.min(90, 50 + (sellSignals * 10));
    } else {
        action = 'HOLD';
        entry = '-';
        target = '-';
        stoploss = '-';
        confidence = 50;
    }
    
    if (entry !== '-') {
        riskReward = calculateRiskReward(entry, target, stoploss);
    } else {
        riskReward = '-';
    }
    
    // Update recommendation cards
    document.getElementById('rec-action').textContent = action;
    document.getElementById('rec-action').className = 'rec-value';
    
    if (action === 'BUY') {
        document.getElementById('rec-action').className = 'rec-value positive';
    } else if (action === 'SELL') {
        document.getElementById('rec-action').className = 'rec-value negative';
    }
    
    document.getElementById('rec-entry').textContent = entry === '-' ? '-' : `₹${entry.toFixed(2)}`;
    document.getElementById('rec-target').textContent = target === '-' ? '-' : `₹${target.toFixed(2)}`;
    document.getElementById('rec-stoploss').textContent = stoploss === '-' ? '-' : `₹${stoploss.toFixed(2)}`;
    document.getElementById('rec-risk-reward').textContent = riskReward === '-' ? '-' : `1:${riskReward.toFixed(1)}`;
    document.getElementById('rec-confidence').textContent = `${confidence}%`;
}

function countBuySignals(stockSymbol) {
    const indicators = INDICATORS[stockSymbol];
    const stock = STOCKS.find(s => s.symbol === stockSymbol);
    if (!indicators || !stock) return 0;
    
    let count = 0;
    if (indicators.rsi < 30) count++;
    if (indicators.macd > 0) count++;
    if (stock.price > indicators.ma50) count++;
    if (stock.price > indicators.ma200) count++;
    if (stock.price <= indicators.bb.lower) count++;
    return count;
}

function countSellSignals(stockSymbol) {
    const indicators = INDICATORS[stockSymbol];
    const stock = STOCKS.find(s => s.symbol === stockSymbol);
    if (!indicators || !stock) return 0;
    
    let count = 0;
    if (indicators.rsi > 70) count++;
    if (indicators.macd < 0) count++;
    if (stock.price < indicators.ma50) count++;
    if (stock.price < indicators.ma200) count++;
    if (stock.price >= indicators.bb.upper) count++;
    return count;
}

// ============================================
// WATCHLIST
// ============================================
function initWatchlist() {
    updateWatchlist();
    updateWatchlistStats();
}

function addToWatchlist() {
    const input = document.getElementById('watchlist-stock-input');
    const symbol = input?.value?.trim().toUpperCase();
    
    if (!symbol) {
        showToast('Please enter a stock symbol', 'error');
        return;
    }
    
    // Check if already in watchlist
    if (watchlist.some(item => item.symbol === symbol)) {
        showToast(`${symbol} is already in your watchlist!`, 'warning');
        return;
    }
    
    // Find stock data
    const stock = STOCKS.find(s => s.symbol === symbol);
    
    if (!stock) {
        showToast(`Stock ${symbol} not found. Try a valid NSE symbol.`, 'error');
        return;
    }
    
    // Add to watchlist
    watchlist.push({
        symbol: stock.symbol,
        name: stock.name,
        addedAt: new Date().toISOString()
    });
    
    // Save to localStorage
    saveWatchlist();
    
    // Update UI
    updateWatchlist();
    updateWatchlistStats();
    
    // Clear input
    if (input) input.value = '';
    
    showToast(`${symbol} added to watchlist!`, 'success');
}

function quickAdd(symbol) {
    const input = document.getElementById('watchlist-stock-input');
    if (input) input.value = symbol;
    addToWatchlist();
}

function addToWatchlistFromScreener(symbol) {
    const input = document.getElementById('watchlist-stock-input');
    if (input) input.value = symbol;
    addToWatchlist();
    showSection('portfolio');
}

function removeFromWatchlist(symbol) {
    watchlist = watchlist.filter(item => item.symbol !== symbol);
    saveWatchlist();
    updateWatchlist();
    updateWatchlistStats();
    showToast(`${symbol} removed from watchlist`, 'success');
}

function saveWatchlist() {
    safeStorageSet('watchlist', JSON.stringify(watchlist));
}

function updateWatchlist() {
    const table = document.getElementById('watchlist-table');
    const countEl = document.getElementById('watchlist-count');
    
    if (!table) return;
    
    if (watchlist.length === 0) {
        table.innerHTML = `
            <tr>
                <td colspan="7" class="empty-state">
                    <div class="empty-icon">📭</div>
                    <div class="empty-text">
                        <h4>Your watchlist is empty</h4>
                        <p>Add stocks to track their live prices and get alerts</p>
                    </div>
                </td>
            </tr>
        `;
        if (countEl) countEl.textContent = '0';
        return;
    }
    
    table.innerHTML = watchlist.map((item, index) => {
        const stock = STOCKS.find(s => s.symbol === item.symbol);
        if (!stock) return '';
        
        const signalClass = stock.signal === 'buy' ? 'positive' : stock.signal === 'sell' ? 'negative' : '';
        
        return `
            <tr>
                <td>${index + 1}</td>
                <td>
                    <div class="stock-symbol">${stock.symbol}</div>
                    <div class="stock-name">${stock.name}</div>
                </td>
                <td>₹${stock.price.toFixed(2)}</td>
                <td class="${stock.change >= 0 ? 'positive' : 'negative'}">
                    ${stock.change >= 0 ? '+' : ''}₹${Math.abs(stock.change).toFixed(2)} (${stock.change >= 0 ? '+' : ''}${Math.abs(stock.percent).toFixed(2)}%)
                </td>
                <td>${formatVolume(stock.volume)}</td>
                <td class="${signalClass}">${stock.signal.toUpperCase()}</td>
                <td>
                    <button class="btn btn-small btn-danger" onclick="removeFromWatchlist('${stock.symbol}')">Remove</button>
                </td>
            </tr>
        `;
    }).join('');
    
    if (countEl) countEl.textContent = watchlist.length;
}

function updateWatchlistStats() {
    const gainers = watchlist.filter(item => {
        const stock = STOCKS.find(s => s.symbol === item.symbol);
        return stock && stock.change > 0;
    }).length;
    
    const losers = watchlist.filter(item => {
        const stock = STOCKS.find(s => s.symbol === item.symbol);
        return stock && stock.change < 0;
    }).length;
    
    const unchanged = watchlist.filter(item => {
        const stock = STOCKS.find(s => s.symbol === item.symbol);
        return stock && stock.change === 0;
    }).length;
    
    const totalChange = watchlist.reduce((sum, item) => {
        const stock = STOCKS.find(s => s.symbol === item.symbol);
        return sum + (stock ? stock.change : 0);
    }, 0);
    
    document.getElementById('watchlist-gainers').textContent = gainers;
    document.getElementById('watchlist-losers').textContent = losers;
    document.getElementById('watchlist-unchanged').textContent = unchanged;
    document.getElementById('watchlist-total-change').textContent = formatPrice(totalChange);
    document.getElementById('watchlist-total-change').className = 'stat-value ' + (totalChange >= 0 ? 'positive' : 'negative');
}

function refreshWatchlist() {
    updateWatchlist();
    showToast('Watchlist refreshed!', 'success');
}

function clearWatchlist() {
    if (watchlist.length === 0) return;
    
    if (confirm('Are you sure you want to clear your entire watchlist?')) {
        watchlist = [];
        saveWatchlist();
        updateWatchlist();
        updateWatchlistStats();
        showToast('Watchlist cleared!', 'success');
    }
}

function exportWatchlist() {
    if (watchlist.length === 0) {
        showToast('Your watchlist is empty!', 'warning');
        return;
    }
    
    const csv = [
        ['Symbol', 'Name', 'Price', 'Change', 'Change%', 'Volume', 'Signal'],
        ...watchlist.map(item => {
            const stock = STOCKS.find(s => s.symbol === item.symbol);
            return [
                item.symbol,
                item.name,
                stock ? stock.price.toFixed(2) : '',
                stock ? stock.change.toFixed(2) : '',
                stock ? stock.percent.toFixed(2) : '',
                stock ? stock.volume : '',
                stock ? stock.signal : ''
            ];
        })
    ].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
    
    downloadCSV(csv, 'watchlist.csv');
    showToast('Watchlist exported to CSV!', 'success');
}

function importWatchlist() {
    showToast('Import feature coming soon!', 'info');
}

// ============================================
// LEARNING CENTER
// ============================================
function initLearningCenter() {
    // Initialize checklist
    initChecklist();
    
    // Add event listeners for tutorials
    // (Already in HTML via onclick)
}

function initChecklist() {
    const checkboxes = document.querySelectorAll('.checklist-item input[type="checkbox"]');
    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', updateChecklist);
    });
    updateChecklist();
}

function updateChecklist() {
    const checkboxes = document.querySelectorAll('.checklist-item input[type="checkbox"]:checked');
    const completed = checkboxes.length;
    const total = 8;
    
    document.getElementById('checklist-completed').textContent = completed;
    
    const messageEl = document.getElementById('checklist-message');
    if (messageEl) {
        if (completed === total) {
            messageEl.textContent = 'Great! You are ready to start trading!';
            messageEl.style.color = 'var(--success)';
        } else if (completed >= total * 0.7) {
            messageEl.textContent = 'Almost there! Complete the remaining steps.';
            messageEl.style.color = 'var(--warning)';
        } else {
            messageEl.textContent = 'Complete all steps before trading with real money!';
            messageEl.style.color = 'var(--danger)';
        }
    }
    
    // Update progress bar
    const progressBar = document.querySelector('.progress-fill');
    if (progressBar) {
        progressBar.style.width = `${(completed / total) * 100}%`;
    }
    
    const progressText = document.querySelector('.progress-text');
    if (progressText) {
        progressText.textContent = `${Math.round((completed / total) * 100)}% Complete`;
    }
    
    // Update path steps
    const pathSteps = document.querySelectorAll('.path-step');
    pathSteps.forEach((step, index) => {
        step.classList.remove('current', 'completed', 'pending');
        if (index < Math.ceil((completed / total) * pathSteps.length)) {
            step.classList.add('completed');
        } else if (index === Math.ceil((completed / total) * pathSteps.length)) {
            step.classList.add('current');
        } else {
            step.classList.add('pending');
        }
    });
}

function startTutorial(tutorialKey) {
    const tutorials = {
        'market-basics': {
            title: 'Stock Market Basics',
            content: `
                <div class="tutorial-content">
                    <h3>What is the Stock Market?</h3>
                    <p>The stock market is a marketplace where buyers and sellers meet to trade shares (stocks) of publicly listed companies. In India, there are two main stock exchanges:</p>
                    
                    <div class="tutorial-section">
                        <h4>🏢 National Stock Exchange (NSE)</h4>
                        <ul>
                            <li>India's largest stock exchange</li>
                            <li>Established in 1992</li>
                            <li>Major indices: NIFTY 50, NIFTY Bank, NIFTY IT</li>
                            <li>Fully electronic trading</li>
                        </ul>
                    </div>
                    
                    <div class="tutorial-section">
                        <h4>🏛️ Bombay Stock Exchange (BSE)</h4>
                        <ul>
                            <li>Asia's oldest stock exchange (established 1875)</li>
                            <li>Major index: SENSEX (30 largest companies)</li>
                            <li>Both electronic and traditional trading</li>
                        </ul>
                    </div>
                    
                    <div class="tutorial-section">
                        <h4>💰 How Does the Stock Market Work?</h4>
                        <ol>
                            <li><strong>Companies List:</strong> Companies issue shares (stocks) to raise capital</li>
                            <li><strong>Investors Buy:</strong> Investors buy these shares through brokers</li>
                            <li><strong>Price Discovery:</strong> Share prices are determined by supply and demand</li>
                            <li><strong>Trading:</strong> Investors can buy/sell shares during market hours</li>
                            <li><strong>Profit:</strong> Make money by buying low and selling high</li>
                        </ol>
                    </div>
                    
                    <div class="tutorial-section">
                        <h4>📊 Key Concepts</h4>
                        <div class="concepts-grid">
                            <div class="concept-card">
                                <strong>Share/Stock</strong>
                                <p>A unit of ownership in a company</p>
                            </div>
                            <div class="concept-card">
                                <strong>Price</strong>
                                <p>Current market price of a share</p>
                            </div>
                            <div class="concept-card">
                                <strong>Volume</strong>
                                <p>Number of shares traded in a day</p>
                            </div>
                            <div class="concept-card">
                                <strong>Market Cap</strong>
                                <p>Total value of all shares of a company</p>
                            </div>
                            <div class="concept-card">
                                <strong>Index</strong>
                                <p>A basket of stocks (e.g., NIFTY 50)</p>
                            </div>
                            <div class="concept-card">
                                <strong>Dividend</strong>
                                <p>Portion of profits distributed to shareholders</p>
                            </div>
                        </div>
                    </div>
                    
                    <div class="tutorial-note">
                        <p><strong>💡 Tip:</strong> The stock market is like a giant marketplace where you can buy and sell small pieces (shares) of companies. The price goes up when more people want to buy, and down when more people want to sell.</p>
                    </div>
                </div>
            `
        },
        'demat-account': {
            title: 'How to Open a Demat Account',
            content: `
                <div class="tutorial-content">
                    <h3>What is a Demat Account?</h3>
                    <p>A Demat (Dematerialized) account holds your shares in electronic format. It's like a bank account for your stocks. You need a Demat account to buy and sell shares in India.</p>
                    
                    <div class="tutorial-section">
                        <h4>📋 Documents Required</h4>
                        <ol>
                            <li><strong>PAN Card:</strong> Mandatory for all investors (Permanent Account Number)</li>
                            <li><strong>Aadhaar Card:</strong> For identity and address proof</li>
                            <li><strong>Passport Size Photographs:</strong> 2-3 recent photographs</li>
                            <li><strong>Bank Account Details:</strong> Cancelled cheque or bank statement</li>
                            <li><strong>Income Proof:</strong> For derivatives trading (optional for equity)</li>
                        </ol>
                    </div>
                    
                    <div class="tutorial-section">
                        <h4>🏦 How to Open a Demat Account</h4>
                        <ol>
                            <li><strong>Choose a Depository Participant (DP):</strong> Banks or brokers like Zerodha, Upstox, Angel Broking, HDFC Securities, ICICI Direct, etc.</li>
                            <li><strong>Fill the Account Opening Form:</strong> Available online or at the broker's office</li>
                            <li><strong>Submit Documents:</strong> Upload or submit physical copies of required documents</li>
                            <li><strong>In-Person Verification (IPV):</strong> Can be done online via video call or in-person at the broker's office</li>
                            <li><strong>Sign the Agreement:</strong> Read and sign the terms and conditions</li>
                            <li><strong>Receive Account Details:</strong> You'll get your Demat and Trading account numbers via email/SMS</li>
                        </ol>
                    </div>
                    
                    <div class="tutorial-section">
                        <h4>💰 Types of Accounts</h4>
                        <div class="accounts-grid">
                            <div class="account-card">
                                <h5>Demat Account</h5>
                                <p>Holds your shares in electronic format</p>
                            </div>
                            <div class="account-card">
                                <h5>Trading Account</h5>
                                <p>Used to buy and sell stocks</p>
                            </div>
                            <div class="account-card">
                                <h5>Bank Account</h5>
                                <p>Linked for funds transfer (debit/credit)</p>
                            </div>
                        </div>
                    </div>
                    
                    <div class="tutorial-section">
                        <h4>💵 Charges</h4>
                        <div class="charges-grid">
                            <div class="charge-item">
                                <strong>Account Opening:</strong>
                                <p>Usually free or minimal charge (₹0-₹500)</p>
                            </div>
                            <div class="charge-item">
                                <strong>Annual Maintenance:</strong>
                                <p>₹300-₹800 per year (varies by broker)</p>
                            </div>
                            <div class="charge-item">
                                <strong>Brokerage:</strong>
                                <p>₹0-₹20 per trade (varies by broker and plan)</p>
                            </div>
                            <div class="charge-item">
                                <strong>Transaction Charges:</strong>
                                <p>NSE/BSE charges (₹0.00325% of turnover)</p>
                            </div>
                            <div class="charge-item">
                                <strong>STT (Securities Transaction Tax):</strong>
                                <p>0.0125% for intraday, 0.1% for delivery</p>
                            </div>
                            <div class="charge-item">
                                <strong>GST:</strong>
                                <p>18% on brokerage and transaction charges</p>
                            </div>
                        </div>
                    </div>
                    
                    <div class="tutorial-section">
                        <h4>🎯 Popular Brokers in India</h4>
                        <div class="brokers-grid">
                            <div class="broker-card">
                                <strong>Zerodha</strong>
                                <p>₹0 brokerage on equity delivery, ₹20 or 0.03% on intraday</p>
                                <p><a href="https://zerodha.com/" target="_blank">Visit Zerodha</a></p>
                            </div>
                            <div class="broker-card">
                                <strong>Upstox</strong>
                                <p>₹0 brokerage on equity delivery, ₹20 or 0.05% on intraday</p>
                                <p><a href="https://upstox.com/" target="_blank">Visit Upstox</a></p>
                            </div>
                            <div class="broker-card">
                                <strong>Angel Broking</strong>
                                <p>₹0 brokerage on equity delivery, ₹20 or 0.25% on intraday</p>
                                <p><a href="https://www.angelbroking.com/" target="_blank">Visit Angel Broking</a></p>
                            </div>
                            <div class="broker-card">
                                <strong>HDFC Securities</strong>
                                <p>0.50% brokerage on equity delivery, 0.10% on intraday</p>
                                <p><a href="https://www.hdfcsec.com/" target="_blank">Visit HDFC Securities</a></p>
                            </div>
                            <div class="broker-card">
                                <strong>ICICI Direct</strong>
                                <p>0.55% brokerage on equity delivery, 0.05% on intraday</p>
                                <p><a href="https://www.icicidirect.com/" target="_blank">Visit ICICI Direct</a></p>
                            </div>
                        </div>
                    </div>
                    
                    <div class="tutorial-note">
                        <p><strong>💡 Tip:</strong> Choose a broker based on brokerage charges, trading platform, customer service, and research tools. Zerodha and Upstox are popular for their low charges and user-friendly platforms.</p>
                    </div>
                </div>
            `
        },
        'candlesticks': {
            title: 'Understanding Candlestick Patterns',
            content: `
                <div class="tutorial-content">
                    <h3>What are Candlestick Charts?</h3>
                    <p>Candlestick charts are a visual representation of price movements in the stock market. Each candlestick represents a specific time period (1 minute, 5 minutes, 1 hour, 1 day, etc.) and shows four key pieces of information:</p>
                    
                    <div class="tutorial-section">
                        <h4>📊 Parts of a Candlestick</h4>
                        <div class="candlestick-diagram">
                            <div class="candlestick bullish">
                                <div class="candle-body"></div>
                                <div class="candle-wick top"></div>
                                <div class="candle-wick bottom"></div>
                                <div class="candle-labels">
                                    <span class="label-top">High</span>
                                    <span class="label-open">Open</span>
                                    <span class="label-close">Close</span>
                                    <span class="label-bottom">Low</span>
                                </div>
                            </div>
                            <div class="candlestick bearish">
                                <div class="candle-body"></div>
                                <div class="candle-wick top"></div>
                                <div class="candle-wick bottom"></div>
                            </div>
                        </div>
                        <ul>
                            <li><strong>Open:</strong> Price at the start of the period</li>
                            <li><strong>Close:</strong> Price at the end of the period</li>
                            <li><strong>High:</strong> Highest price during the period</li>
                            <li><strong>Low:</strong> Lowest price during the period</li>
                            <li><strong>Body:</strong> Range between open and close</li>
                            <li><strong>Wick/Shadow:</strong> Lines above and below the body showing high and low</li>
                        </ul>
                    </div>
                    
                    <div class="tutorial-section">
                        <h4>🟢 Bullish vs Bearish Candles</h4>
                        <div class="bullish-bearish">
                            <div class="bullish-candle">
                                <h5>Bullish Candle (Green/White)</h5>
                                <p><strong>Close > Open</strong></p>
                                <p>Indicates buying pressure</p>
                                <p>Price moved up during the period</p>
                            </div>
                            <div class="bearish-candle">
                                <h5>Bearish Candle (Red/Black)</h5>
                                <p><strong>Close < Open</strong></p>
                                <p>Indicates selling pressure</p>
                                <p>Price moved down during the period</p>
                            </div>
                        </div>
                    </div>
                    
                    <div class="tutorial-section">
                        <h4>🎯 Important Candlestick Patterns</h4>
                        
                        <div class="patterns-section">
                            <h5>Bullish Patterns (Buy Signals)</h5>
                            <div class="patterns-grid">
                                <div class="pattern-card">
                                    <div class="pattern-name">Hammer</div>
                                    <div class="pattern-diagram">🔨</div>
                                    <p>Small body, long lower wick, little/no upper wick</p>
                                    <p><strong>Meaning:</strong> Potential bullish reversal after downtrend</p>
                                </div>
                                <div class="pattern-card">
                                    <div class="pattern-name">Bullish Engulfing</div>
                                    <div class="pattern-diagram">📈</div>
                                    <p>Small bearish candle followed by large bullish candle</p>
                                    <p><strong>Meaning:</strong> Strong bullish reversal</p>
                                </div>
                                <div class="pattern-card">
                                    <div class="pattern-name">Morning Star</div>
                                    <div class="pattern-diagram">⭐</div>
                                    <p>Three candles: bearish, small body, bullish</p>
                                    <p><strong>Meaning:</strong> Bullish reversal pattern</p>
                                </div>
                                <div class="pattern-card">
                                    <div class="pattern-name">Piercing Line</div>
                                    <div class="pattern-diagram">🔍</div>
                                    <p>Bearish candle followed by bullish candle closing above midpoint</p>
                                    <p><strong>Meaning:</strong> Bullish reversal</p>
                                </div>
                                <div class="pattern-card">
                                    <div class="pattern-name">Three White Soldiers</div>
                                    <div class="pattern-diagram">🪐</div>
                                    <p>Three consecutive long bullish candles</p>
                                    <p><strong>Meaning:</strong> Strong bullish momentum</p>
                                </div>
                            </div>
                        </div>
                        
                        <div class="patterns-section">
                            <h5>Bearish Patterns (Sell Signals)</h5>
                            <div class="patterns-grid">
                                <div class="pattern-card">
                                    <div class="pattern-name">Shooting Star</div>
                                    <div class="pattern-diagram">✨</div>
                                    <p>Small body, long upper wick, little/no lower wick</p>
                                    <p><strong>Meaning:</strong> Potential bearish reversal after uptrend</p>
                                </div>
                                <div class="pattern-card">
                                    <div class="pattern-name">Bearish Engulfing</div>
                                    <div class="pattern-diagram">📉</div>
                                    <p>Small bullish candle followed by large bearish candle</p>
                                    <p><strong>Meaning:</strong> Strong bearish reversal</p>
                                </div>
                                <div class="pattern-card">
                                    <div class="pattern-name">Evening Star</div>
                                    <div class="pattern-diagram">🌙</div>
                                    <p>Three candles: bullish, small body, bearish</p>
                                    <p><strong>Meaning:</strong> Bearish reversal pattern</p>
                                </div>
                                <div class="pattern-card">
                                    <div class="pattern-name">Dark Cloud Cover</div>
                                    <div class="pattern-diagram">☁️</div>
                                    <p>Bullish candle followed by bearish candle closing below midpoint</p>
                                    <p><strong>Meaning:</strong> Bearish reversal</p>
                                </div>
                                <div class="pattern-card">
                                    <div class="pattern-name">Three Black Crows</div>
                                    <div class="pattern-diagram">🐦</div>
                                    <p>Three consecutive long bearish candles</p>
                                    <p><strong>Meaning:</strong> Strong bearish momentum</p>
                                </div>
                            </div>
                        </div>
                        
                        <div class="patterns-section">
                            <h5>Continuation Patterns</h5>
                            <div class="patterns-grid">
                                <div class="pattern-card">
                                    <div class="pattern-name">Doji</div>
                                    <div class="pattern-diagram">⚖️</div>
                                    <p>Open and close are the same (or very close)</p>
                                    <p><strong>Meaning:</strong> Indecision, potential reversal</p>
                                </div>
                                <div class="pattern-card">
                                    <div class="pattern-name">Spinning Top</div>
                                    <div class="pattern-diagram">🎠</div>
                                    <p>Small body with long upper and lower wicks</p>
                                    <p><strong>Meaning:</strong> Indecision</p>
                                </div>
                                <div class="pattern-card">
                                    <div class="pattern-name">Marubozu</div>
                                    <div class="pattern-diagram">🟢/🔴</div>
                                    <p>No wicks, only body (bullish or bearish)</p>
                                    <p><strong>Meaning:</strong> Strong momentum in one direction</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="tutorial-section">
                        <h4>📈 How to Read Candlestick Charts</h4>
                        <ol>
                            <li><strong>Identify the Trend:</strong> Look at the overall direction of the price</li>
                            <li><strong>Look for Patterns:</strong> Identify candlestick patterns at support/resistance levels</li>
                            <li><strong>Check Volume:</strong> High volume confirms the pattern</li>
                            <li><strong>Use Multiple Timeframes:</strong> Check patterns on different timeframes for confirmation</li>
                            <li><strong>Combine with Indicators:</strong> Use RSI, MACD, Moving Averages for confirmation</li>
                        </ol>
                    </div>
                    
                    <div class="tutorial-note">
                        <p><strong>💡 Tip:</strong> Candlestick patterns are more reliable when they occur at key support/resistance levels and are confirmed by high volume.</p>
                    </div>
                </div>
            `
        },
        'support-resistance': {
            title: 'Support & Resistance Levels',
            content: `
                <div class="tutorial-content">
                    <h3>What are Support & Resistance?</h3>
                    <p>Support and resistance are key price levels that help traders identify potential reversal points in the market. They are among the most important concepts in technical analysis.</p>
                    
                    <div class="tutorial-section">
                        <h4>🛡️ Support Level</h4>
                        <p>A support level is a price level where the stock tends to stop falling and may reverse direction (start rising). It's like a floor that prevents the price from falling further.</p>
                        <div class="sr-diagram">
                            <div class="sr-chart">
                                <div class="sr-support-line"></div>
                                <div class="sr-price-action support"></div>
                            </div>
                            <div class="sr-labels">
                                <span>Support Level</span>
                            </div>
                        </div>
                        <p><strong>Why does support work?</strong></p>
                        <ul>
                            <li>Buyers see the price as a good value and start buying</li>
                            <li>Previous buyers who missed the initial move may buy at support</li>
                            <li>Short sellers may cover their positions (buy back)</li>
                        </ul>
                    </div>
                    
                    <div class="tutorial-section">
                        <h4>🚧 Resistance Level</h4>
                        <p>A resistance level is a price level where the stock tends to stop rising and may reverse direction (start falling). It's like a ceiling that prevents the price from rising further.</p>
                        <div class="sr-diagram">
                            <div class="sr-chart">
                                <div class="sr-resistance-line"></div>
                                <div class="sr-price-action resistance"></div>
                            </div>
                            <div class="sr-labels">
                                <span>Resistance Level</span>
                            </div>
                        </div>
                        <p><strong>Why does resistance work?</strong></p>
                        <ul>
                            <li>Sellers see the price as overvalued and start selling</li>
                            <li>Previous sellers who missed the initial move may sell at resistance</li>
                            <li>Long buyers may take profits (sell)</li>
                        </ul>
                    </div>
                    
                    <div class="tutorial-section">
                        <h4>🎯 How to Identify Support & Resistance</h4>
                        <ol>
                            <li><strong>Look for Price Reversals:</strong> Find areas where the price has reversed direction multiple times</li>
                            <li><strong>Use Previous Highs/Lows:</strong> Previous swing highs and lows often act as support/resistance</li>
                            <li><strong>Draw Horizontal Lines:</strong> Draw lines at key price levels where reversals have occurred</li>
                            <li><strong>Check Multiple Timeframes:</strong> Support/resistance on higher timeframes are stronger</li>
                            <li><strong>Look for Round Numbers:</strong> Psychological levels (e.g., 1000, 5000, 10000) often act as support/resistance</li>
                        </ol>
                    </div>
                    
                    <div class="tutorial-section">
                        <h4>📊 Types of Support & Resistance</h4>
                        <div class="types-grid">
                            <div class="type-card">
                                <h5>Horizontal Support/Resistance</h5>
                                <p>Price levels that have been tested multiple times</p>
                                <p><strong>Strength:</strong> Stronger with more touches</p>
                            </div>
                            <div class="type-card">
                                <h5>Trendline Support/Resistance</h5>
                                <p>Diagonal lines drawn by connecting higher lows (uptrend) or lower highs (downtrend)</p>
                                <p><strong>Strength:</strong> Stronger with more touches</p>
                            </div>
                            <div class="type-card">
                                <h5>Moving Average Support/Resistance</h5>
                                <p>Key moving averages (50, 100, 200 DMA) often act as dynamic support/resistance</p>
                                <p><strong>Strength:</strong> Stronger on higher timeframes</p>
                            </div>
                            <div class="type-card">
                                <h5>Fibonacci Levels</h5>
                                <p>Retracement levels (23.6%, 38.2%, 50%, 61.8%, 78.6%) based on Fibonacci sequence</p>
                                <p><strong>Strength:</strong> Works best in trending markets</p>
                            </div>
                        </div>
                    </div>
                    
                    <div class="tutorial-section">
                        <h4>💥 Breakout vs Bounce</h4>
                        <div class="breakout-bounce">
                            <div class="breakout">
                                <h5>Breakout</h5>
                                <p>When price moves above resistance or below support with strong volume</p>
                                <p><strong>Action:</strong> Trade in the direction of the breakout</p>
                                <p><strong>Stop Loss:</strong> Just below/above the broken level</p>
                            </div>
                            <div class="bounce">
                                <h5>Bounce</h5>
                                <p>When price reverses from support or resistance</p>
                                <p><strong>Action:</strong> Trade in the opposite direction (buy at support, sell at resistance)</p>
                                <p><strong>Stop Loss:</strong> Below/above the support/resistance level</p>
                            </div>
                        </div>
                    </div>
                    
                    <div class="tutorial-section">
                        <h4>🎯 Trading Strategies Using Support & Resistance</h4>
                        <ol>
                            <li><strong>Buy at Support, Sell at Resistance:</strong> Classic range-bound trading strategy</li>
                            <li><strong>Breakout Trading:</strong> Buy when price breaks above resistance, sell when it breaks below support</li>
                            <li><strong>Pullback Trading:</strong> Buy on pullback to support in an uptrend</li>
                            <li><strong>Reversal Trading:</strong> Sell at resistance, buy at support</li>
                        </ol>
                    </div>
                    
                    <div class="tutorial-note">
                        <p><strong>💡 Tip:</strong> The more times a support/resistance level is tested, the stronger it becomes. However, once broken, it can reverse roles (support becomes resistance and vice versa).</p>
                    </div>
                </div>
            `
        },
        'indicators': {
            title: 'Technical Indicators Explained',
            content: `
                <div class="tutorial-content">
                    <h3>What are Technical Indicators?</h3>
                    <p>Technical indicators are mathematical calculations based on price, volume, or open interest of a stock. They help traders identify trends, momentum, volatility, and potential reversal points. Indicators are used to confirm price action and generate trading signals.</p>
                    
                    <div class="tutorial-section">
                        <h4>📊 Types of Technical Indicators</h4>
                        <div class="types-grid">
                            <div class="type-card">
                                <h5>Trend Indicators</h5>
                                <p>Help identify the direction and strength of a trend</p>
                                <p><strong>Examples:</strong> Moving Averages, MACD, ADX</p>
                            </div>
                            <div class="type-card">
                                <h5>Momentum Indicators</h5>
                                <p>Measure the speed of price movements</p>
                                <p><strong>Examples:</strong> RSI, Stochastic, ROC</p>
                            </div>
                            <div class="type-card">
                                <h5>Volatility Indicators</h5>
                                <p>Measure the rate of price movements</p>
                                <p><strong>Examples:</strong> Bollinger Bands, ATR</p>
                            </div>
                            <div class="type-card">
                                <h5>Volume Indicators</h5>
                                <p>Measure trading volume and its relationship with price</p>
                                <p><strong>Examples:</strong> OBV, Volume Oscillator</p>
                            </div>
                        </div>
                    </div>
                    
                    <div class="tutorial-section">
                        <h4>🔧 Most Important Technical Indicators</h4>
                        
                        <div class="indicator-detail">
                            <h5>1. Relative Strength Index (RSI)</h5>
                            <p><strong>What it measures:</strong> Speed and change of price movements</p>
                            <p><strong>Formula:</strong> RSI = 100 - [100 / (1 + RS)] where RS = Average Gain / Average Loss</p>
                            <p><strong>Period:</strong> Typically 14</p>
                            <p><strong>Range:</strong> 0 to 100</p>
                            <div class="indicator-visual">
                                <div class="rsi-meter">
                                    <div class="rsi-zone overbought">Overbought (>70)</div>
                                    <div class="rsi-zone neutral">Neutral (30-70)</div>
                                    <div class="rsi-zone oversold">Oversold (<30)</div>
                                </div>
                            </div>
                            <p><strong>Interpretation:</strong></p>
                            <ul>
                                <li><strong>Above 70:</strong> Overbought - Potential sell signal</li>
                                <li><strong>Below 30:</strong> Oversold - Potential buy signal</li>
                                <li><strong>50:</strong> Neutral</li>
                                <li><strong>Divergence:</strong> When price makes new high/low but RSI doesn't - potential reversal</li>
                            </ul>
                        </div>
                        
                        <div class="indicator-detail">
                            <h5>2. Moving Average Convergence Divergence (MACD)</h5>
                            <p><strong>What it measures:</strong> Relationship between two moving averages</p>
                            <p><strong>Components:</strong></p>
                            <ul>
                                <li><strong>MACD Line:</strong> Difference between 12-period and 26-period EMA</li>
                                <li><strong>Signal Line:</strong> 9-period EMA of MACD line</li>
                                <li><strong>Histogram:</strong> Difference between MACD and Signal line</li>
                            </ul>
                            <p><strong>Interpretation:</strong></p>
                            <ul>
                                <li><strong>MACD > Signal Line:</strong> Bullish signal</li>
                                <li><strong>MACD < Signal Line:</strong> Bearish signal</li>
                                <li><strong>Histogram increasing:</strong> Bullish momentum</li>
                                <li><strong>Histogram decreasing:</strong> Bearish momentum</li>
                                <li><strong>Zero Line Cross:</strong> MACD crossing above/below zero line</li>
                                <li><strong>Divergence:</strong> Price makes new high/low but MACD doesn't - potential reversal</li>
                            </ul>
                        </div>
                        
                        <div class="indicator-detail">
                            <h5>3. Moving Averages (MA)</h5>
                            <p><strong>What it measures:</strong> Smooths out price data to identify trends</p>
                            <p><strong>Types:</strong></p>
                            <ul>
                                <li><strong>Simple Moving Average (SMA):</strong> Average of prices over a period</li>
                                <li><strong>Exponential Moving Average (EMA):</strong> Gives more weight to recent prices</li>
                            </ul>
                            <p><strong>Common Periods:</strong> 50-day, 100-day, 200-day</p>
                            <p><strong>Interpretation:</strong></p>
                            <ul>
                                <li><strong>Price > MA:</strong> Bullish trend</li>
                                <li><strong>Price < MA:</strong> Bearish trend</li>
                                <li><strong>Golden Cross:</strong> 50 MA crosses above 200 MA - Strong bullish signal</li>
                                <li><strong>Death Cross:</strong> 50 MA crosses below 200 MA - Strong bearish signal</li>
                                <li><strong>MA as Support/Resistance:</strong> Moving averages often act as dynamic support/resistance</li>
                            </ul>
                        </div>
                        
                        <div class="indicator-detail">
                            <h5>4. Bollinger Bands</h5>
                            <p><strong>What it measures:</strong> Volatility and identifies overbought/oversold levels</p>
                            <p><strong>Components:</strong></p>
                            <ul>
                                <li><strong>Middle Band:</strong> 20-period SMA</li>
                                <li><strong>Upper Band:</strong> Middle band + 2 standard deviations</li>
                                <li><strong>Lower Band:</strong> Middle band - 2 standard deviations</li>
                            </ul>
                            <p><strong>Interpretation:</strong></p>
                            <ul>
                                <li><strong>Price touches Upper Band:</strong> Overbought - Potential sell</li>
                                <li><strong>Price touches Lower Band:</strong> Oversold - Potential buy</li>
                                <li><strong>Bands expanding:</strong> Increasing volatility</li>
                                <li><strong>Bands contracting:</strong> Decreasing volatility (potential breakout)</li>
                                <li><strong>Squeeze:</strong> Bands come very close together - potential breakout</li>
                            </ul>
                        </div>
                        
                        <div class="indicator-detail">
                            <h5>5. Average True Range (ATR)</h5>
                            <p><strong>What it measures:</strong> Market volatility</p>
                            <p><strong>Period:</strong> Typically 14</p>
                            <p><strong>Interpretation:</strong></p>
                            <ul>
                                <li><strong>High ATR:</strong> High volatility</li>
                                <li><strong>Low ATR:</strong> Low volatility</li>
                                <li><strong>ATR as Stop Loss:</strong> Can be used to set stop loss based on volatility</li>
                            </ul>
                        </div>
                    </div>
                    
                    <div class="tutorial-section">
                        <h4>🎯 How to Use Technical Indicators</h4>
                        <ol>
                            <li><strong>Don't Use Alone:</strong> Always use indicators in combination with price action</li>
                            <li><strong>Confirm Signals:</strong> Wait for confirmation from multiple indicators</li>
                            <li><strong>Avoid Overloading:</strong> Use 2-3 indicators at most to avoid confusion</li>
                            <li><strong>Understand the Market:</strong> Some indicators work better in trending markets, others in ranging markets</li>
                            <li><strong>Backtest:</strong> Test indicators on historical data before using them live</li>
                        </ol>
                    </div>
                    
                    <div class="tutorial-note">
                        <p><strong>💡 Tip:</strong> Technical indicators are lagging (based on past data) and should be used to confirm price action, not predict it. Always combine them with support/resistance and candlestick patterns.</p>
                    </div>
                </div>
            `
        },
        'intraday': {
            title: 'Intraday Trading Guide for Beginners',
            content: `
                <div class="tutorial-content">
                    <h3>What is Intraday Trading?</h3>
                    <p>Intraday trading, also known as day trading, involves buying and selling stocks on the same day. All positions must be squared off (closed) before the market closes. No delivery of shares happens in intraday trading.</p>
                    
                    <div class="tutorial-section">
                        <h4>📌 Key Features of Intraday Trading</h4>
                        <div class="features-grid">
                            <div class="feature-card">
                                <h5>No Delivery</h5>
                                <p>You don't take delivery of shares</p>
                                <p>All trades are settled in cash</p>
                            </div>
                            <div class="feature-card">
                                <h5>Leverage (Margin)</h5>
                                <p>Can trade with more money than you have</p>
                                <p>Typically 3-5x for stocks, higher for F&O</p>
                            </div>
                            <div class="feature-card">
                                <h5>Same-Day Settlement</h5>
                                <p>All trades are settled on the same day</p>
                                <p>No STT (Securities Transaction Tax) on intraday trades</p>
                            </div>
                            <div class="feature-card">
                                <h5>Lower Costs</h5>
                                <p>No delivery charges</p>
                                <p>Lower brokerage (typically)</p>
                            </div>
                        </div>
                    </div>
                    
                    <div class="tutorial-section">
                        <h4>🕒 Intraday Trading Rules & Timings</h4>
                        <div class="rules-grid">
                            <div class="rule-card">
                                <h5>Market Timings</h5>
                                <p><strong>Regular Trading:</strong> 9:15 AM to 3:30 PM (Monday to Friday)</p>
                                <p><strong>Pre-Open Session:</strong> 9:00 AM to 9:15 AM</p>
                            </div>
                            <div class="rule-card">
                                <h5>Square-Off Time</h5>
                                <p><strong>All positions must be closed by:</strong> 3:15 PM</p>
                                <p><strong>After 3:15 PM:</strong> Broker will auto-square off at market price</p>
                            </div>
                            <div class="rule-card">
                                <h5>Margin Requirements</h5>
                                <p><strong>Equity Intraday:</strong> Typically 3-5x (varies by broker)</p>
                                <p><strong>F&O:</strong> Higher margin requirements</p>
                            </div>
                            <div class="rule-card">
                                <h5>Brokerage</h5>
                                <p><strong>Discount Brokers:</strong> ₹20 or 0.03% per trade</p>
                                <p><strong>Full-Service Brokers:</strong> 0.1% - 0.5% per trade</p>
                            </div>
                        </div>
                    </div>
                    
                    <div class="tutorial-section">
                        <h4>🎯 Intraday Trading Strategies for Beginners</h4>
                        
                        <div class="strategy-detail">
                            <h5>1. Breakout Trading</h5>
                            <p><strong>Concept:</strong> Buy when price breaks above resistance with high volume</p>
                            <p><strong>Steps:</strong></p>
                            <ol>
                                <li>Identify key resistance level</li>
                                <li>Wait for price to approach resistance</li>
                                <li>Look for high volume on breakout</li>
                                <li>Enter trade when price breaks above resistance</li>
                                <li>Set stop loss just below the breakout level</li>
                                <li>Take profit at next resistance level</li>
                            </ol>
                            <p><strong>Risk:</strong> Medium</p>
                            <p><strong>Win Rate:</strong> 60-65%</p>
                        </div>
                        
                        <div class="strategy-detail">
                            <h5>2. Pullback Trading</h5>
                            <p><strong>Concept:</strong> Buy on retracement to support in an uptrend</p>
                            <p><strong>Steps:</strong></p>
                            <ol>
                                <li>Identify an uptrend (higher highs and higher lows)</li>
                                <li>Wait for price to pull back to support level</li>
                                <li>Look for bullish candlestick pattern at support</li>
                                <li>Enter trade with stop loss below support</li>
                                <li>Take profit at recent swing high</li>
                            </ol>
                            <p><strong>Risk:</strong> Low</p>
                            <p><strong>Win Rate:</strong> 65-70%</p>
                        </div>
                        
                        <div class="strategy-detail">
                            <h5>3. Momentum Trading</h5>
                            <p><strong>Concept:</strong> Follow stocks with strong price movement and volume</p>
                            <p><strong>Steps:</strong></p>
                            <ol>
                                <li>Look for stocks with high volume (2x average)</li>
                                <li>Check if price is making higher highs</li>
                                <li>Enter trade in the direction of momentum</li>
                                <li>Use trailing stop loss</li>
                                <li>Exit when momentum slows down</li>
                            </ol>
                            <p><strong>Risk:</strong> High</p>
                            <p><strong>Win Rate:</strong> 50-55%</p>
                        </div>
                        
                        <div class="strategy-detail">
                            <h5>4. Reversal Trading</h5>
                            <p><strong>Concept:</strong> Buy at support, sell at resistance</p>
                            <p><strong>Steps:</strong></p>
                            <ol>
                                <li>Identify key support and resistance levels</li>
                                <li>Wait for price to approach support/resistance</li>
                                <li>Look for reversal candlestick patterns</li>
                                <li>Enter trade at support/resistance</li>
                                <li>Set stop loss on the other side of the level</li>
                                <li>Take profit at the opposite level</li>
                            </ol>
                            <p><strong>Risk:</strong> Medium</p>
                            <p><strong>Win Rate:</strong> 55-60%</p>
                        </div>
                        
                        <div class="strategy-detail">
                            <h5>5. Scalping</h5>
                            <p><strong>Concept:</strong> Make multiple small-profit trades throughout the day</p>
                            <p><strong>Steps:</strong></p>
                            <ol>
                                <li>Focus on highly liquid stocks</li>
                                <li>Use 1-5 minute charts</li>
                                <li>Enter trade with tight stop loss (0.25-0.5%)</li>
                                <li>Take profit at small targets (0.5-1%)</li>
                                <li>Repeat multiple times in a day</li>
                            </ol>
                            <p><strong>Risk:</strong> High</p>
                            <p><strong>Win Rate:</strong> 55-60%</p>
                        </div>
                    </div>
                    
                    <div class="tutorial-section">
                        <h4>⚠️ Intraday Trading Tips for Beginners</h4>
                        <div class="tips-grid">
                            <div class="tip-card">
                                <div class="tip-icon">⏰</div>
                                <div class="tip-content">
                                    <h5>Trade in First Hour</h5>
                                    <p>Most intraday movement happens in the first hour (9:15-10:15 AM)</p>
                                </div>
                            </div>
                            <div class="tip-card">
                                <div class="tip-icon">🛡️</div>
                                <div class="tip-content">
                                    <h5>Always Use Stop Loss</h5>
                                    <p>Never trade without a stop loss. Risk only 1-2% of capital per trade</p>
                                </div>
                            </div>
                            <div class="tip-card">
                                <div class="tip-icon">📊</div>
                                <div class="tip-content">
                                    <h5>Follow Volume</h5>
                                    <p>High volume confirms the price movement. Low volume = weak signal</p>
                                </div>
                            </div>
                            <div class="tip-card">
                                <div class="tip-icon">🎯</div>
                                <div class="tip-content">
                                    <h5>Stick to 1-2 Stocks</h5>
                                    <p>As a beginner, focus on 1-2 stocks at a time. Don't over-diversify</p>
                                </div>
                            </div>
                            <div class="tip-card">
                                <div class="tip-icon">📉</div>
                                <div class="tip-content">
                                    <h5>Avoid Overtrading</h5>
                                    <p>Limit to 2-3 trades per day as a beginner. Quality over quantity</p>
                                </div>
                            </div>
                            <div class="tip-card">
                                <div class="tip-icon">📈</div>
                                <div class="tip-content">
                                    <h5>Follow the Trend</h5>
                                    <p>"The trend is your friend" - Trade in the direction of the trend</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="tutorial-section">
                        <h4>❌ Common Intraday Trading Mistakes to Avoid</h4>
                        <div class="mistakes-grid">
                            <div class="mistake-card">
                                <h5>1. Trading Without Stop Loss</h5>
                                <p>Can lead to huge losses. Always use stop loss!</p>
                            </div>
                            <div class="mistake-card">
                                <h5>2. Overleveraging</h5>
                                <p>Using too much margin can wipe out your account quickly</p>
                            </div>
                            <div class="mistake-card">
                                <h5>3. Chasing Tips</h5>
                                <p>Don't trade based on tips without your own analysis</p>
                            </div>
                            <div class="mistake-card">
                                <h5>4. Revenge Trading</h5>
                                <p>Don't try to recover losses by taking reckless trades</p>
                            </div>
                            <div class="mistake-card">
                                <h5>5. Ignoring News</h5>
                                <p>Always check news before trading. News can move markets</p>
                            </div>
                            <div class="mistake-card">
                                <h5>6. Trading Against the Trend</h5>
                                <p>"Don't fight the tape" - Trading against the trend is risky</p>
                            </div>
                            <div class="mistake-card">
                                <h5>7. Holding Losing Trades</h5>
                                <p>Cut your losses early. Don't hope for a reversal</p>
                            </div>
                            <div class="mistake-card">
                                <h5>8. Not Taking Profits</h5>
                                <p>Take profits when your target is hit. Don't be greedy</p>
                            </div>
                        </div>
                    </div>
                    
                    <div class="tutorial-note">
                        <p><strong>💡 Tip:</strong> Intraday trading is risky and requires skill, discipline, and quick decision-making. As a beginner, start with paper trading (simulated trading) before using real money. Focus on learning and improving your skills rather than making profits.</p>
                    </div>
                </div>
            `
        },
        'risk-management': {
            title: 'Risk Management in Trading',
            content: `
                <div class="tutorial-content">
                    <h3>Why Risk Management is Important</h3>
                    <p>Risk management is the most important aspect of trading. It's not about making profits, but about protecting your capital and ensuring longevity in the markets. Many traders focus only on finding winning trades, but the real secret to success is managing losses.</p>
                    
                    <div class="tutorial-section">
                        <h4>📉 The 80/20 Rule of Trading</h4>
                        <p>In trading, 80% of your success comes from risk management, and only 20% comes from your trading strategy. You can have a winning strategy, but without proper risk management, you will eventually lose all your money.</p>
                        <div class="rule-visual">
                            <div class="rule-chart">
                                <div class="rule-segment risk-management" style="width: 80%"></div>
                                <div class="rule-segment strategy" style="width: 20%"></div>
                            </div>
                            <div class="rule-labels">
                                <span>Risk Management (80%)</span>
                                <span>Strategy (20%)</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="tutorial-section">
                        <h4>🎯 The 1% Rule</h4>
                        <p><strong>What it is:</strong> Never risk more than 1% of your trading capital on a single trade.</p>
                        <p><strong>Example:</strong> If you have ₹1,00,000 capital, you should risk only ₹1,000 per trade.</p>
                        <p><strong>How to calculate position size:</strong></p>
                        <p>Number of shares = (1% of capital) / (Entry price - Stop loss price)</p>
                        <div class="calculation-example">
                            <p><strong>Example:</strong> Capital = ₹1,00,000, Entry = ₹500, Stop Loss = ₹480</p>
                            <p>Number of shares = (₹1,000) / (₹500 - ₹480) = 50 shares</p>
                            <p>If the trade hits stop loss, you lose ₹1,000 (1% of capital)</p>
                        </div>
                        <p><strong>Why it works:</strong> Even if you have 10 losing trades in a row, you won't lose more than 10% of your capital. This ensures you stay in the game long enough to recover.</p>
                    </div>
                    
                    <div class="tutorial-section">
                        <h4>🛡️ Stop Loss</h4>
                        <p><strong>What it is:</strong> An order to automatically sell a stock when it reaches a certain price.</p>
                        <p><strong>Why it's important:</strong></p>
                        <ul>
                            <li>Limits your losses</li>
                            <li>Removes emotion from trading</li>
                            <li>Protects your capital</li>
                            <li>Allows you to define your risk before entering a trade</li>
                        </ul>
                        <p><strong>Types of Stop Loss:</strong></p>
                        <div class="types-grid">
                            <div class="type-card">
                                <h5>Fixed Stop Loss</h5>
                                <p>Fixed percentage or amount from entry price</p>
                                <p><strong>Example:</strong> 2% below entry price</p>
                            </div>
                            <div class="type-card">
                                <h5>Trailing Stop Loss</h5>
                                <p>Moves up as price increases, stays fixed if price decreases</p>
                                <p><strong>Example:</strong> 2% below highest price since entry</p>
                            </div>
                            <div class="type-card">
                                <h5>Time-Based Stop Loss</h5>
                                <p>Exit after a certain time period regardless of price</p>
                                <p><strong>Example:</strong> Exit after 2 hours if target not hit</p>
                            </div>
                        </div>
                        <p><strong>Where to place stop loss:</strong></p>
                        <ul>
                            <li>Below recent swing low (for long trades)</li>
                            <li>Above recent swing high (for short trades)</li>
                            <li>Based on volatility (ATR)</li>
                            <li>Based on support/resistance levels</li>
                        </ul>
                    </div>
                    
                    <div class="tutorial-section">
                        <h4>⚖️ Risk-Reward Ratio</h4>
                        <p><strong>What it is:</strong> The ratio of potential profit to potential loss.</p>
                        <p><strong>Minimum Ratio:</strong> Always aim for at least 1:2 (risk ₹1 to make ₹2)</p>
                        <div class="rr-example">
                            <p><strong>Example:</strong> If your stop loss is ₹10, your target should be at least ₹20</p>
                            <p><strong>Why it matters:</strong> Even if you win only 50% of your trades, you'll be profitable</p>
                            <div class="rr-calculation">
                                <p>Win Rate: 50%</p>
                                <p>Average Loss: ₹10</p>
                                <p>Average Profit: ₹20</p>
                                <p><strong>Result:</strong> Net profit per trade = ₹5</p>
                            </div>
                        </div>
                        <p><strong>Ideal Ratio:</strong> 1:3 or higher (risk ₹1 to make ₹3)</p>
                        <p><strong>Note:</strong> Higher risk-reward ratios require lower win rates to be profitable</p>
                    </div>
                    
                    <div class="tutorial-section">
                        <h4>💼 Position Sizing</h4>
                        <p><strong>What it is:</strong> Determining how many shares to buy based on your risk tolerance.</p>
                        <p><strong>Formula:</strong></p>
                        <p>Number of shares = (Risk amount) / (Entry price - Stop loss price)</p>
                        <p><strong>Example:</strong> Risk amount = ₹1,000, Entry = ₹500, Stop Loss = ₹480</p>
                        <p>Number of shares = ₹1,000 / (₹500 - ₹480) = 50 shares</p>
                        <p><strong>Why it's important:</strong> Ensures you don't risk more than you can afford to lose on any single trade.</p>
                    </div>
                    
                    <div class="tutorial-section">
                        <h4>🌐 Diversification</h4>
                        <p><strong>What it is:</strong> Spreading your capital across different stocks, sectors, and asset classes.</p>
                        <p><strong>Why it's important:</strong> Reduces risk by not putting all eggs in one basket.</p>
                        <p><strong>How to diversify:</strong></p>
                        <ul>
                            <li>Invest in different sectors (IT, Banking, Pharma, FMCG, etc.)</li>
                            <li>Invest in different market caps (Large, Mid, Small)</li>
                            <li>Invest in different asset classes (Stocks, Bonds, Gold, etc.)</li>
                            <li>Don't allocate more than 10-15% of your capital to a single stock</li>
                        </ul>
                        <p><strong>Note:</strong> While diversification reduces risk, don't over-diversify. As a beginner, focus on 5-10 stocks that you understand well.</p>
                    </div>
                    
                    <div class="tutorial-section">
                        <h4>😊 Emotional Control</h4>
                        <p><strong>Common Trading Emotions:</strong></p>
                        <div class="emotions-grid">
                            <div class="emotion-card">
                                <h5>Fear</h5>
                                <p>Causes you to exit trades too early or miss opportunities</p>
                                <p><strong>Solution:</strong> Follow your trading plan strictly</p>
                            </div>
                            <div class="emotion-card">
                                <h5>Greed</h5>
                                <p>Causes you to hold onto winning trades too long</p>
                                <p><strong>Solution:</strong> Take profits at your target</p>
                            </div>
                            <div class="emotion-card">
                                <h5>Hope</h5>
                                <p>Causes you to hold onto losing trades expecting a reversal</p>
                                <p><strong>Solution:</strong> Cut losses at your stop loss</p>
                            </div>
                            <div class="emotion-card">
                                <h5>Regret</h5>
                                <p>Causes you to chase trades you missed</p>
                                <p><strong>Solution:</strong> Stick to your strategy, don't FOMO</p>
                            </div>
                        </div>
                        <p><strong>How to Control Emotions:</strong></p>
                        <ul>
                            <li>Follow your trading plan strictly</li>
                            <li>Use stop loss and target orders</li>
                            <li>Take breaks between trades</li>
                            <li>Don't trade when emotional</li>
                            <li>Keep a trading journal</li>
                            <li>Accept that losses are part of trading</li>
                        </ul>
                    </div>
                    
                    <div class="tutorial-section">
                        <h4>📊 Risk Management Checklist</h4>
                        <div class="checklist-grid">
                            <div class="checklist-item">
                                <input type="checkbox" id="risk-check-1">
                                <label for="risk-check-1">I always use stop loss</label>
                            </div>
                            <div class="checklist-item">
                                <input type="checkbox" id="risk-check-2">
                                <label for="risk-check-2">I never risk more than 1-2% per trade</label>
                            </div>
                            <div class="checklist-item">
                                <input type="checkbox" id="risk-check-3">
                                <label for="risk-check-3">I always calculate position size before entering a trade</label>
                            </div>
                            <div class="checklist-item">
                                <input type="checkbox" id="risk-check-4">
                                <label for="risk-check-4">I maintain a 1:2 or better risk-reward ratio</label>
                            </div>
                            <div class="checklist-item">
                                <input type="checkbox" id="risk-check-5">
                                <label for="risk-check-5">I diversify my portfolio</label>
                            </div>
                            <div class="checklist-item">
                                <input type="checkbox" id="risk-check-6">
                                <label for="risk-check-6">I don't trade when emotional</label>
                            </div>
                        </div>
                    </div>
                    
                    <div class="tutorial-note">
                        <p><strong>💡 Final Tip:</strong> The key to successful trading is not about finding the perfect strategy, but about managing risk effectively. A good trader can make money with a simple strategy and excellent risk management, but will lose money with a great strategy and poor risk management.</p>
                    </div>
                </div>
            `
        },
        'advanced-strategies': {
            title: 'Advanced Trading Strategies',
            content: `
                <div class="tutorial-content">
                    <h3>Advanced Trading Strategies</h3>
                    <p>Once you've mastered the basics, you can explore these advanced trading strategies to improve your trading skills and profitability.</p>
                    
                    <div class="tutorial-section">
                        <h4>🎯 Breakout Trading Strategy</h4>
                        <p><strong>Concept:</strong> Buy when price breaks above resistance or sell when it breaks below support with high volume.</p>
                        <p><strong>Steps:</strong></p>
                        <ol>
                            <li><strong>Identify Key Levels:</strong> Find important support and resistance levels</li>
                            <li><strong>Wait for Price Action:</strong> Wait for price to approach the level</li>
                            <li><strong>Check Volume:</strong> Look for high volume on the breakout</li>
                            <li><strong>Confirm with Indicators:</strong> Check if RSI, MACD, etc. support the breakout</li>
                            <li><strong>Enter Trade:</strong> Buy when price breaks above resistance, sell when it breaks below support</li>
                            <li><strong>Set Stop Loss:</strong> Just below/above the broken level</li>
                            <li><strong>Take Profit:</strong> At next support/resistance level or based on risk-reward ratio</li>
                        </ol>
                        <p><strong>Example:</strong> RELIANCE breaks above ₹2,500 resistance with high volume. Buy at ₹2,505, stop loss at ₹2,480, target at ₹2,550.</p>
                        <p><strong>Risk:</strong> Medium</p>
                        <p><strong>Win Rate:</strong> 60-65%</p>
                        <p><strong>Best Timeframe:</strong> 15 min, 1 hour, Daily</p>
                    </div>
                    
                    <div class="tutorial-section">
                        <h4>📉 Pullback Trading Strategy</h4>
                        <p><strong>Concept:</strong> Buy on retracement to support in an uptrend or sell on rally to resistance in a downtrend.</p>
                        <p><strong>Steps:</strong></p>
                        <ol>
                            <li><strong>Identify Trend:</strong> Confirm the market is in an uptrend (higher highs and higher lows) or downtrend</li>
                            <li><strong>Find Pullback:</strong> Wait for price to pull back to a support/resistance level</li>
                            <li><strong>Check Fibonacci:</strong> Look for pullback to 38.2%, 50%, or 61.8% Fibonacci levels</li>
                            <li><strong>Look for Patterns:</strong> Wait for bullish/bearish candlestick patterns at pullback level</li>
                            <li><strong>Enter Trade:</strong> Buy at support in uptrend, sell at resistance in downtrend</li>
                            <li><strong>Set Stop Loss:</strong> Below/above the pullback level</li>
                            <li><strong>Take Profit:</strong> At recent swing high/low or based on risk-reward ratio</li>
                        </ol>
                        <p><strong>Example:</strong> TCS in uptrend pulls back to ₹3,800 support. Buy at ₹3,805, stop loss at ₹3,780, target at ₹3,850.</p>
                        <p><strong>Risk:</strong> Low</p>
                        <p><strong>Win Rate:</strong> 65-70%</p>
                        <p><strong>Best Timeframe:</strong> 1 hour, Daily</p>
                    </div>
                    
                    <div class="tutorial-section">
                        <h4>⚡ Momentum Trading Strategy</h4>
                        <p><strong>Concept:</strong> Follow stocks that are showing strong upward or downward movement with high volume.</p>
                        <p><strong>Steps:</strong></p>
                        <ol>
                            <li><strong>Scan for Momentum:</strong> Look for stocks with high volume (2x average)</li>
                            <li><strong>Check Price Action:</strong> Confirm price is making higher highs (for long) or lower lows (for short)</li>
                            <li><strong>Use Indicators:</strong> Check if RSI > 50 (for long) or RSI < 50 (for short), MACD in right direction</li>
                            <li><strong>Enter Trade:</strong> Buy if momentum is up, sell if momentum is down</li>
                            <li><strong>Set Stop Loss:</strong> Use trailing stop loss or based on volatility (ATR)</li>
                            <li><strong>Take Profit:</strong> Exit when momentum slows down or at predefined target</li>
                        </ol>
                        <p><strong>Example:</strong> INFY shows strong momentum with volume 2x average. Buy at ₹1,450, trailing stop loss, target at ₹1,480.</p>
                        <p><strong>Risk:</strong> High</p>
                        <p><strong>Win Rate:</strong> 50-55%</p>
                        <p><strong>Best Timeframe:</strong> 5 min, 15 min, 1 hour</p>
                    </div>
                    
                    <div class="tutorial-section">
                        <h4>🔄 Reversal Trading Strategy</h4>
                        <p><strong>Concept:</strong> Identify potential trend reversals using candlestick patterns and indicators.</p>
                        <p><strong>Steps:</strong></p>
                        <ol>
                            <li><strong>Identify Trend:</strong> Confirm the market is in a strong uptrend or downtrend</li>
                            <li><strong>Look for Divergence:</strong> Check if price makes new high/low but indicators (RSI, MACD) don't</li>
                            <li><strong>Find Patterns:</strong> Look for reversal candlestick patterns (Hammer, Shooting Star, Engulfing, etc.)</li>
                            <li><strong>Check Volume:</strong> Look for high volume on reversal</li>
                            <li><strong>Enter Trade:</strong> Buy at bullish reversal, sell at bearish reversal</li>
                            <li><strong>Set Stop Loss:</strong> On the other side of the reversal pattern</li>
                            <li><strong>Take Profit:</strong> At previous swing high/low or based on risk-reward ratio</li>
                        </ol>
                        <p><strong>Example:</strong> HDFCBANK in uptrend forms a Shooting Star at ₹1,650. Sell at ₹1,645, stop loss at ₹1,660, target at ₹1,620.</p>
                        <p><strong>Risk:</strong> Medium</p>
                        <p><strong>Win Rate:</strong> 55-60%</p>
                        <p><strong>Best Timeframe:</strong> 15 min, 1 hour, Daily</p>
                    </div>
                    
                    <div class="tutorial-section">
                        <h4>🎲 Scalping Strategy</h4>
                        <p><strong>Concept:</strong> Make multiple small-profit trades throughout the day by capturing small price movements.</p>
                        <p><strong>Steps:</strong></p>
                        <ol>
                            <li><strong>Choose Liquid Stocks:</strong> Focus on highly liquid stocks with tight spreads</li>
                            <li><strong>Use Short Timeframes:</strong> Use 1-5 minute charts</li>
                            <li><strong>Identify Levels:</strong> Find key support and resistance levels</li>
                            <li><strong>Enter Trade:</strong> Buy at support, sell at resistance with tight stop loss</li>
                            <li><strong>Set Stop Loss:</strong> Very tight (0.25-0.5%)</li>
                            <li><strong>Take Profit:</strong> Small targets (0.5-1%)</li>
                            <li><strong>Repeat:</strong> Make multiple trades throughout the day</li>
                        </ol>
                        <p><strong>Example:</strong> RELIANCE trading between ₹2,500-₹2,520. Buy at ₹2,505, stop loss at ₹2,500, target at ₹2,515. Repeat multiple times.</p>
                        <p><strong>Risk:</strong> High</p>
                        <p><strong>Win Rate:</strong> 55-60%</p>
                        <p><strong>Best Timeframe:</strong> 1 min, 5 min</p>
                    </div>
                    
                    <div class="tutorial-section">
                        <h4>📊 Mean Reversion Strategy</h4>
                        <p><strong>Concept:</strong> Bet that the price will revert to its mean (average) after moving too far from it.</p>
                        <p><strong>Steps:</strong></p>
                        <ol>
                            <li><strong>Identify Mean:</strong> Calculate the mean price (e.g., 20-day average)</li>
                            <li><strong>Measure Deviation:</strong> Check how far price is from the mean</li>
                            <li><strong>Use Bollinger Bands:</strong> Price touching upper/lower band indicates overbought/oversold</li>
                            <li><strong>Check RSI:</strong> RSI > 70 (overbought) or RSI < 30 (oversold)</li>
                            <li><strong>Enter Trade:</strong> Sell when price is overbought, buy when oversold</li>
                            <li><strong>Set Stop Loss:</strong> On the other side of the deviation</li>
                            <li><strong>Take Profit:</strong> At the mean or previous deviation level</li>
                        </ol>
                        <p><strong>Example:</strong> TCS price touches upper Bollinger Band with RSI > 70. Sell at ₹3,850, stop loss at ₹3,870, target at ₹3,820.</p>
                        <p><strong>Risk:</strong> Medium</p>
                        <p><strong>Win Rate:</strong> 55-60%</p>
                        <p><strong>Best Timeframe:</strong> 15 min, 1 hour, Daily</p>
                    </div>
                    
                    <div class="tutorial-note">
                        <p><strong>💡 Tip:</strong> No single strategy works all the time. The key is to understand multiple strategies and apply the right one based on market conditions. Always backtest strategies on historical data before using them live.</p>
                    </div>
                </div>
            `
        }
    };
    
    const tutorial = tutorials[tutorialKey];
    if (!tutorial) {
        showToast('Tutorial not found!', 'error');
        return;
    }
    
    const modal = document.getElementById('modal');
    const modalTitle = document.getElementById('modal-title');
    const modalBody = document.getElementById('modal-body');
    
    modalTitle.textContent = tutorial.title;
    modalBody.innerHTML = tutorial.content;
    modal.classList.add('active');
    
    // Initialize any interactive elements in the tutorial
    initTutorialInteractions();
}

function initTutorialInteractions() {
    // Initialize checklist in risk management tutorial
    const riskCheckboxes = document.querySelectorAll('.checklist-item input[type="checkbox"]');
    riskCheckboxes.forEach(checkbox => {
        if (!checkbox.id.startsWith('risk-check-')) return;
        checkbox.addEventListener('change', function() {
            const checked = document.querySelectorAll('.checklist-item input[type="checkbox"]:checked').length;
            const total = 6;
            showToast(`Risk management checklist: ${checked}/${total} completed!`, 'info');
        });
    });
}

// ============================================
// SETTINGS
// ============================================
function initSettings() {
    // Load saved settings
    loadProfileSettings();
    loadNotificationSettings();
    loadRefreshSettings();
    
    // Add event listeners
    document.getElementById('data-provider')?.addEventListener('change', toggleAPIKey);
    document.getElementById('theme-selector')?.addEventListener('change', changeTheme);
}

function loadProfileSettings() {
    const userName = safeStorageGet('userName') || 'Beginner Trader';
    const userExperience = safeStorageGet('userExperience') || 'beginner';
    const userRisk = safeStorageGet('userRiskTolerance') || 'medium';
    const userCapital = safeStorageGet('userCapital') || '100000';
    
    document.getElementById('user-name').value = userName;
    document.getElementById('user-experience').value = userExperience;
    document.getElementById('user-risk-tolerance').value = userRisk;
    document.getElementById('user-capital').value = userCapital;
}

function saveProfileSettings() {
    const userName = document.getElementById('user-name')?.value || 'Beginner Trader';
    const userExperience = document.getElementById('user-experience')?.value || 'beginner';
    const userRisk = document.getElementById('user-risk-tolerance')?.value || 'medium';
    const userCapital = document.getElementById('user-capital')?.value || '100000';
    
    safeStorageSet('userName', userName);
    safeStorageSet('userExperience', userExperience);
    safeStorageSet('userRiskTolerance', userRisk);
    safeStorageSet('userCapital', userCapital);
    
    showToast('Profile settings saved!', 'success');
}

function loadNotificationSettings() {
    const notifyPrice = safeStorageGet('notifyPrice') !== 'false';
    const notifySignal = safeStorageGet('notifySignal') !== 'false';
    const notifyMarket = safeStorageGet('notifyMarket') !== 'false';
    const notifyEducational = safeStorageGet('notifyEducational') === 'true';
    
    document.getElementById('notify-price').checked = notifyPrice;
    document.getElementById('notify-signal').checked = notifySignal;
    document.getElementById('notify-market').checked = notifyMarket;
    document.getElementById('notify-educational').checked = notifyEducational;
}

function saveNotificationSettings() {
    const notifyPrice = document.getElementById('notify-price')?.checked;
    const notifySignal = document.getElementById('notify-signal')?.checked;
    const notifyMarket = document.getElementById('notify-market')?.checked;
    const notifyEducational = document.getElementById('notify-educational')?.checked;
    
    safeStorageSet('notifyPrice', notifyPrice);
    safeStorageSet('notifySignal', notifySignal);
    safeStorageSet('notifyMarket', notifyMarket);
    safeStorageSet('notifyEducational', notifyEducational);
    
    showToast('Notification settings saved!', 'success');
}

function loadRefreshSettings() {
    const refreshInterval = safeStorageGet('refreshInterval') || '30000';
    const refreshEnabled = safeStorageGet('refreshEnabled') !== 'false';
    
    document.getElementById('refresh-interval').value = refreshInterval;
    document.getElementById('refresh-enabled').checked = refreshEnabled;
    
    CONFIG.refreshInterval = parseInt(refreshInterval);
    CONFIG.autoRefresh = refreshEnabled;
}

function saveRefreshSettings() {
    const refreshInterval = document.getElementById('refresh-interval')?.value || '30000';
    const refreshEnabled = document.getElementById('refresh-enabled')?.checked;
    
    safeStorageSet('refreshInterval', refreshInterval);
    safeStorageSet('refreshEnabled', refreshEnabled);
    
    CONFIG.refreshInterval = parseInt(refreshInterval);
    CONFIG.autoRefresh = refreshEnabled;
    
    // Restart auto-refresh
    startAutoRefresh();
    
    showToast('Refresh settings saved!', 'success');
}

function toggleAPIKey() {
    const provider = document.getElementById('data-provider')?.value;
    const apiKeyGroup = document.getElementById('api-key-group');
    
    if (apiKeyGroup) {
        apiKeyGroup.style.display = (provider === 'twelve-data' || provider === 'yahoo') ? 'block' : 'none';
    }
}

function testAPIConnection() {
    const provider = document.getElementById('data-provider')?.value;
    const apiKey = document.getElementById('api-key')?.value;
    
    if (provider === 'mock') {
        showToast('Mock data is working!', 'success');
        return;
    }
    
    if (!apiKey && (provider === 'twelve-data' || provider === 'yahoo')) {
        showToast('Please enter your API key!', 'error');
        return;
    }
    
    showToast('Testing API connection...', 'info');
    
    // Simulate API test
    setTimeout(() => {
        const success = Math.random() > 0.3; // 70% chance of success for demo
        if (success) {
            showToast('API connection successful!', 'success');
            CONFIG.dataSource = provider;
            CONFIG.apiKey = apiKey;
        } else {
            showToast('API connection failed. Check your API key and network connection.', 'error');
        }
    }, 1500);
}

function changeTheme() {
    const theme = document.getElementById('theme-selector')?.value || 'light';
    
    if (theme === 'dark') {
        document.body.classList.add('dark-mode');
    } else if (theme === 'light') {
        document.body.classList.remove('dark-mode');
    } else {
        // System default
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        if (prefersDark) {
            document.body.classList.add('dark-mode');
        } else {
            document.body.classList.remove('dark-mode');
        }
    }
    
    safeStorageSet('theme', theme);
    showToast(`Theme changed to ${theme}!`, 'success');
}

function resetSettings() {
    if (confirm('Are you sure you want to reset all settings to default?')) {
        safeStorageClear();
        location.reload();
    }
}

function clearCache() {
    showToast('Cache cleared!', 'success');
}

// ============================================
// CHARTS
// ============================================
function initCharts() {
    // Each chart is independent — one failing must not break the others.
    safeInit('niftyChart', initNiftyChart);
    safeInit('sectorChart', initSectorChart);
    safeInit('heatmap', initHeatmap);
    safeInit('chartButtons', initChartTimeframeButtons);
}

// The 1D / 5D / 1M / 3M buttons above the NIFTY chart had no click
// handler at all — wire them up so they actually switch the chart.
function initChartTimeframeButtons() {
    const buttons = document.querySelectorAll('.chart-btn[data-timeframe]');
    if (!buttons.length) return;
    buttons.forEach(btn => {
        btn.addEventListener('click', function() {
            buttons.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            renderNiftySeries(this.getAttribute('data-timeframe') || '1D');
        });
    });
}

// Demo intraday/daily series per timeframe, anchored to the live NIFTY price.
function getNiftySeries(timeframe) {
    const base = MARKET_DATA.nifty50.price;
    let labels, count, step;
    if (timeframe === '5D') {
        labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
        count = 5; step = 0.004;
    } else if (timeframe === '1M') {
        count = 22; step = 0.006;
        labels = Array.from({ length: count }, (_, i) => 'D' + (i + 1));
    } else if (timeframe === '3M') {
        count = 12; step = 0.012;
        labels = Array.from({ length: count }, (_, i) => 'W' + (i + 1));
    } else {
        return {
            labels: ['9:30', '10:00', '10:30', '11:00', '11:30', '12:00', '12:30', '1:00', '1:30', '2:00', '2:30', '3:00'],
            prices: [19780, 19800, 19790, 19820, 19810, 19840, 19835, 19850, 19845, 19860, 19855, base]
        };
    }
    let seed = timeframe.length * 7919 + 13;
    const rand = () => { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; };
    let p = base * (1 - step * count * 0.35);
    const prices = [];
    for (let i = 0; i < count; i++) {
        p = p + (rand() - 0.46) * base * step;
        prices.push(i === count - 1 ? base : p);
    }
    return { labels, prices };
}

function renderNiftySeries(timeframe) {
    if (typeof Chart === 'undefined' || !window.niftyChart) {
        initNiftyChart();
        return;
    }
    try {
        const series = getNiftySeries(timeframe);
        window.niftyChart.data.labels = series.labels;
        window.niftyChart.data.datasets[0].data = series.prices;
        window.niftyChart.update();
    } catch (err) {
        console.error('Failed to switch chart timeframe:', err);
    }
}

// NOTE: this function was missing entirely, which crashed startup
// (ReferenceError) and left the page stuck on "Loading..." forever.
function initHeatmap() {
    updateHeatmap();
}

function initNiftyChart() {
    const canvas = document.getElementById('niftyChart');
    if (!canvas) return;

    if (typeof Chart === 'undefined') {
        showChartFallback(canvas, 'Chart library failed to load. Check your internet connection and refresh.');
        return;
    }

    const labels = ['9:30', '10:00', '10:30', '11:00', '11:30', '12:00', '12:30', '1:00', '1:30', '2:00', '2:30', '3:00'];
    const prices = [19780, 19800, 19790, 19820, 19810, 19840, 19835, 19850, 19845, 19860, 19855, 19850.25];

    if (window.niftyChart) {
        try { window.niftyChart.destroy(); } catch (e) { /* ignore */ }
        window.niftyChart = null;
    }

    try {
        window.niftyChart = new Chart(canvas.getContext('2d'), {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'NIFTY 50',
                    data: prices,
                    borderColor: '#4361ee',
                    backgroundColor: 'rgba(67, 97, 238, 0.1)',
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    x: { grid: { display: false } },
                    y: {
                        grid: { color: 'rgba(0, 0, 0, 0.05)' },
                        ticks: {
                            callback: function(value) {
                                return '₹' + Number(value).toFixed(2);
                            }
                        }
                    }
                }
            }
        });
    } catch (err) {
        console.error('Failed to render NIFTY chart:', err);
        showChartFallback(canvas, 'Could not render this chart.');
    }
}

function initSectorChart() {
    const canvas = document.getElementById('sectorChart');
    if (!canvas) return;

    if (typeof Chart === 'undefined') {
        showChartFallback(canvas, 'Chart library failed to load. Check your internet connection and refresh.');
        return;
    }

    if (window.sectorChart) {
        try { window.sectorChart.destroy(); } catch (e) { /* ignore */ }
        window.sectorChart = null;
    }

    try {
        window.sectorChart = new Chart(canvas.getContext('2d'), {
            type: 'bar',
            data: {
                labels: SECTOR_DATA.labels,
                datasets: [{
                    label: 'Sector Performance (%)',
                    data: SECTOR_DATA.values,
                    backgroundColor: SECTOR_DATA.colors,
                    borderRadius: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    x: { grid: { display: false } },
                    y: {
                        grid: { color: 'rgba(0, 0, 0, 0.05)' },
                        ticks: {
                            callback: function(value) {
                                return value + '%';
                            }
                        }
                    }
                }
            }
        });
    } catch (err) {
        console.error('Failed to render sector chart:', err);
        showChartFallback(canvas, 'Could not render this chart.');
    }
}

// ============================================
// AUTO-REFRESH
// ============================================
function startAutoRefresh() {
    // Clear any existing interval
    if (window.refreshInterval) {
        clearInterval(window.refreshInterval);
    }
    
    if (!CONFIG.autoRefresh) return;
    
    // Refresh data every X seconds
    window.refreshInterval = setInterval(() => {
        refreshAllData();
    }, CONFIG.refreshInterval);
}

function refreshAllData() {
    if (CONFIG.debug) console.log('Refreshing all data...');
    
    // Simulate data changes
    simulateMarketDataChanges();
    
    // Update all sections
    updateMarketOverview();
    updateMarketStats();
    updateMarketMood();
    updateFIIDIIActivity();
    updateTopMovers();
    updateHeatmap();
    updateMarketStatus();
    
    updateActiveSignals();
    updateSignalHistory();
    updateSignalPerformance();
    updateSignalsCount();
    
    updateWatchlist();
    updateWatchlistStats();
    
    showToast('Data refreshed!', 'info');
}

function simulateMarketDataChanges() {
    // Simulate small price changes
    MARKET_DATA.nifty50.price += (Math.random() - 0.5) * 50;
    MARKET_DATA.nifty50.change = MARKET_DATA.nifty50.price - 19850.25;
    MARKET_DATA.nifty50.percent = (MARKET_DATA.nifty50.change / 19850.25) * 100;
    
    MARKET_DATA.sensex.price += (Math.random() - 0.5) * 80;
    MARKET_DATA.sensex.change = MARKET_DATA.sensex.price - 66850.75;
    MARKET_DATA.sensex.percent = (MARKET_DATA.sensex.change / 66850.75) * 100;
    
    MARKET_DATA.banknifty.price += (Math.random() - 0.5) * 60;
    MARKET_DATA.banknifty.change = MARKET_DATA.banknifty.price - 45250.50;
    MARKET_DATA.banknifty.percent = (MARKET_DATA.banknifty.change / 45250.50) * 100;
    
    // Simulate stock price changes
    STOCKS.forEach(stock => {
        const change = (Math.random() - 0.5) * 20;
        stock.price += change;
        stock.change = change;
        stock.percent = (change / (stock.price - change)) * 100;
        
        // Update RSI randomly
        stock.rsi += (Math.random() - 0.5) * 10;
        stock.rsi = Math.max(0, Math.min(100, stock.rsi));
        
        // Update signal based on RSI
        if (stock.rsi < 30) stock.signal = 'buy';
        else if (stock.rsi > 70) stock.signal = 'sell';
        else if (stock.rsi > 50) stock.signal = 'buy';
        else if (stock.rsi < 50) stock.signal = 'sell';
        else stock.signal = 'neutral';
    });
    
    // Simulate market stats changes
    MARKET_STATS.advances += Math.floor((Math.random() - 0.5) * 100);
    MARKET_STATS.declines += Math.floor((Math.random() - 0.5) * 100);
    MARKET_STATS.advances = Math.max(0, MARKET_STATS.advances);
    MARKET_STATS.declines = Math.max(0, MARKET_STATS.declines);
    
    // Simulate FII/DII changes
    MARKET_STATS.fii.net += Math.floor((Math.random() - 0.5) * 100);
    MARKET_STATS.dii.net += Math.floor((Math.random() - 0.5) * 100);
}

// ============================================
// MODAL & TOAST
// ============================================
function closeModal() {
    const modal = document.getElementById('modal');
    if (modal) modal.classList.remove('active');
}

// NOTE: use addEventListener instead of `window.onclick = ...` so we
// never clobber other click handlers (e.g. the loading failsafe).
window.addEventListener('click', function(event) {
    const modal = document.getElementById('modal');
    if (modal && event.target === modal) {
        modal.classList.remove('active');
    }
});

document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        closeModal();
    }
});

function showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    if (!toast) return;
    
    toast.textContent = message;
    toast.className = 'toast ' + type;
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 5000);
}

// ============================================
// LOADING OVERLAY
// ============================================
function hideLoadingOverlay() {
    const overlay = document.getElementById('loading-overlay');
    if (overlay) {
        overlay.style.display = 'none';
        overlay.classList.add('hidden');
    }
}

// ============================================
// SIDEBAR QUICK ACTIONS + FAQ
// (Called from index.html onclick handlers — these
// functions were missing, which threw ReferenceError
// whenever the buttons were clicked.)
// ============================================
function showHotStocks() {
    const hot = [...STOCKS]
        .sort((a, b) => Math.abs(b.percent) - Math.abs(a.percent))
        .slice(0, 8);

    const modal = document.getElementById('modal');
    const modalTitle = document.getElementById('modal-title');
    const modalBody = document.getElementById('modal-body');
    if (!modal || !modalTitle || !modalBody) return;

    modalTitle.textContent = '🔥 Hot Stocks Right Now';
    modalBody.innerHTML = `
        <p>Biggest movers by absolute % change. Click <strong>+ Watch</strong> to track any of them.</p>
        <div class="stocks-table">
            <table>
                <thead>
                    <tr><th>Stock</th><th>Price</th><th>Change</th><th>Signal</th><th></th></tr>
                </thead>
                <tbody>
                    ${hot.map(s => `
                        <tr>
                            <td><strong>${s.symbol}</strong><br><small>${s.name}</small></td>
                            <td>₹${s.price.toFixed(2)}</td>
                            <td class="${s.change >= 0 ? 'positive' : 'negative'}">
                                ${s.change >= 0 ? '+' : ''}${s.percent.toFixed(2)}%
                            </td>
                            <td>${s.signal.toUpperCase()}</td>
                            <td><button class="btn btn-small" onclick="addToWatchlistFromScreener('${s.symbol}'); closeModal();">+ Watch</button></td>
                        </tr>`).join('')}
                </tbody>
            </table>
        </div>`;
    modal.classList.add('active');
}

function showMarketNews() {
    const modal = document.getElementById('modal');
    const modalTitle = document.getElementById('modal-title');
    const modalBody = document.getElementById('modal-body');
    if (!modal || !modalTitle || !modalBody) return;

    const gainers = [...STOCKS].filter(s => s.change > 0).sort((a, b) => b.percent - a.percent).slice(0, 3);
    const losers = [...STOCKS].filter(s => s.change < 0).sort((a, b) => a.percent - b.percent).slice(0, 3);
    const nifty = MARKET_DATA.nifty50;

    modalTitle.textContent = '📰 Market News & Highlights';
    modalBody.innerHTML = `
        <div class="tutorial-content">
            <div class="tutorial-section">
                <h4>📊 Market Snapshot</h4>
                <p>NIFTY 50 is trading at <strong>${formatPrice(nifty.price)}</strong>
                (${formatChange(nifty.change, nifty.percent)}).
                Advances: <strong>${MARKET_STATS.advances.toLocaleString('en-IN')}</strong> |
                Declines: <strong>${MARKET_STATS.declines.toLocaleString('en-IN')}</strong>.</p>
            </div>
            <div class="tutorial-section">
                <h4>🚀 Buzzing Stocks (Gainers)</h4>
                <ul>
                    ${gainers.map(s => `<li><strong>${s.symbol}</strong> up ${s.percent.toFixed(2)}% at ₹${s.price.toFixed(2)} — ${s.name}</li>`).join('')}
                </ul>
            </div>
            <div class="tutorial-section">
                <h4>📉 Under Pressure (Losers)</h4>
                <ul>
                    ${losers.map(s => `<li><strong>${s.symbol}</strong> down ${Math.abs(s.percent).toFixed(2)}% at ₹${s.price.toFixed(2)} — ${s.name}</li>`).join('')}
                </ul>
            </div>
            <div class="tutorial-section">
                <h4>💰 Institutional Flows</h4>
                <p>FII net: <strong>₹${MARKET_STATS.fii.net} Cr</strong> |
                DII net: <strong>₹${MARKET_STATS.dii.net} Cr</strong></p>
            </div>
            <div class="tutorial-note">
                <p><strong>💡 Note:</strong> This dashboard currently uses demo data.
                Connect a market-data API in <strong>Settings → Data Source</strong> for live news and prices.</p>
            </div>
        </div>`;
    modal.classList.add('active');
}

function toggleFAQ(element) {
    if (!element) return;
    const item = element.closest('.faq-item');
    if (!item) return;
    const wasActive = item.classList.contains('active');
    // Accordion behaviour: close others, toggle this one
    document.querySelectorAll('.faq-item.active').forEach(el => el.classList.remove('active'));
    if (!wasActive) item.classList.add('active');
}

// ============================================
// UTILITY FUNCTIONS
// ============================================
function formatPrice(price) {
    return '₹' + price.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatChange(change, percent) {
    const sign = change >= 0 ? '+' : '';
    return `${sign}₹${Math.abs(change).toFixed(2)} (${sign}${Math.abs(percent).toFixed(2)}%)`;
}

function formatVolume(volume) {
    if (volume >= 10000000) {
        return (volume / 10000000).toFixed(1) + 'Cr';
    } else if (volume >= 100000) {
        return (volume / 100000).toFixed(1) + 'L';
    } else if (volume >= 1000) {
        return (volume / 1000).toFixed(1) + 'K';
    }
    return volume.toString();
}

function downloadCSV(csv, filename) {
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
}

// ============================================
// EXPORT FOR OTHER FILES
// ============================================
window.MARKET_DATA = MARKET_DATA;
window.STOCKS = STOCKS;
window.INTRADAY_SIGNALS = INTRADAY_SIGNALS;
window.SIGNAL_HISTORY = SIGNAL_HISTORY;
window.INDICATORS = INDICATORS;
window.SR_LEVELS = SR_LEVELS;
window.CHART_DATA = CHART_DATA;
window.CONFIG = CONFIG;
