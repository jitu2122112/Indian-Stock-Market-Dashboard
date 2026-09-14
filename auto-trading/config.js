// Auto Trading Configuration
const AutoTradingConfig = {
    // Trading Mode
    mode: 'PAPER', // PAPER or LIVE
    broker: 'MOCK', // MOCK, DHAN, ZERODHA, ANGEL, GROWW

    // Capital & Risk
    capital: 100000, // ₹1L
    riskPerTrade: 1, // 1% per trade
    maxDailyLoss: 2, // Stop if daily loss >2%
    maxPositions: 3, // Max concurrent positions
    maxTradesPerDay: 10,

    // Order Settings
    orderType: 'MARKET', // MARKET or LIMIT
    productType: 'INTRADAY', // INTRADAY or CNC
    exchange: 'NSE',

    // Risk-Reward
    minRiskReward: 2, // Minimum 1:2
    defaultStopLossPercent: 0.8, // 0.8%
    defaultTargetPercent: 1.5, // 1.5% for T1, 3% for T2
    useTrailingSL: true,
    trailingSLPercent: 0.5,

    // Time Settings (IST)
    marketStart: '09:15',
    marketEnd: '15:30',
    autoSquareOff: '15:15',
    noNewTradesAfter: '14:30',

    // Strategy Settings
    activeStrategies: ['EMA_CROSSOVER', 'RSI_REVERSAL'],
    // Available: RSI_REVERSAL, EMA_CROSSOVER, BREAKOUT, SUPERTREND, VWAP_RSI

    // Stock Universe
    universe: 'NIFTY_50', // NIFTY_50, CURATED_28, CUSTOM
    customSymbols: ['RELIANCE', 'TCS', 'INFY', 'HDFCBANK', 'ICICIBANK', 'SBIN', 'BHARTIARTL', 'ITC', 'LT', 'MARUTI'],

    // Filters
    filters: {
        minPrice: 20,
        minVolume: 100000,
        minRSI: 30,
        maxRSI: 70,
        requireVolumeSpike: false,
        volumeSpikeMultiplier: 1.5
    },

    // Execution
    scanInterval: 30000, // 30 seconds
    priceCheckInterval: 5000, // 5 seconds for monitoring exits

    // Notifications
    enableNotifications: true,
    logLevel: 'INFO' // DEBUG, INFO, WARN, ERROR
};

// Export for both Node and browser
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AutoTradingConfig;
}
if (typeof window !== 'undefined') {
    window.AutoTradingConfig = AutoTradingConfig;
}
