// Auto Trading Backend Server - Real trading with Groww/Dhan/Zerodha
// Run: npm install && npm start
// API: http://localhost:3001
// WebSocket: ws://localhost:3001

const express = require('express');
const cors = require('cors');
const http = require('http');
const WebSocket = require('ws');
require('dotenv').config();

// Import trading components
const AutoTradingConfig = require('../../auto-trading/config.js');
const BrokerInterface = require('../../auto-trading/broker-interface.js');
const MockBroker = require('../../auto-trading/brokers/mock-broker.js');
const TradingStrategies = require('../../auto-trading/strategies.js');
const RiskManager = require('../../auto-trading/risk-manager.js');
const AutoTradingEngine = require('../../auto-trading/engine.js');

// Try to import optional brokers
let DhanBroker, GrowwBroker, ZerodhaBroker;
try { DhanBroker = require('../../auto-trading/brokers/dhan-broker.js'); } catch (e) { console.log('Dhan broker not available'); }
try { GrowwBroker = require('../../auto-trading/brokers/groww-broker.js'); } catch (e) { console.log('Groww broker not available'); }

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.use(cors());
app.use(express.json());
app.use(express.static('../../')); // Serve dashboard

// Load config from env
const config = {
    ...AutoTradingConfig,
    mode: process.env.MODE || AutoTradingConfig.mode,
    broker: process.env.BROKER || AutoTradingConfig.broker,
    capital: parseFloat(process.env.CAPITAL) || AutoTradingConfig.capital,
    riskPerTrade: parseFloat(process.env.RISK_PER_TRADE) || AutoTradingConfig.riskPerTrade,
    maxDailyLoss: parseFloat(process.env.MAX_DAILY_LOSS) || AutoTradingConfig.maxDailyLoss,
    maxPositions: parseInt(process.env.MAX_POSITIONS) || AutoTradingConfig.maxPositions,
    customSymbols: process.env.SYMBOLS ? process.env.SYMBOLS.split(',') : AutoTradingConfig.customSymbols,
    activeStrategies: process.env.STRATEGIES ? process.env.STRATEGIES.split(',') : AutoTradingConfig.activeStrategies,
    
    // Broker specific
    clientId: process.env.DHAN_CLIENT_ID,
    accessToken: process.env.DHAN_ACCESS_TOKEN,
    DHAN_CLIENT_ID: process.env.DHAN_CLIENT_ID,
    DHAN_ACCESS_TOKEN: process.env.DHAN_ACCESS_TOKEN,
    GROWW_TOKEN: process.env.GROWW_TOKEN,
    GROWW_METHOD: process.env.GROWW_METHOD,
    GROWW_SESSION_FILE: process.env.GROWW_SESSION_FILE,
    ZERODHA_API_KEY: process.env.ZERODHA_API_KEY,
    ZERODHA_API_SECRET: process.env.ZERODHA_API_SECRET,
    
    headless: process.env.GROWW_HEADLESS === 'true',
    growwMethod: process.env.GROWW_METHOD || 'PLAYWRIGHT',
    sessionFile: process.env.GROWW_SESSION_FILE || './groww-session.json'
};

// Create broker instance
function createBroker() {
    const brokerType = config.broker.toUpperCase();
    
    console.log(`Creating broker: ${brokerType} in ${config.mode} mode`);
    
    switch (brokerType) {
        case 'DHAN':
            if (!DhanBroker) throw new Error('Dhan broker not loaded');
            return new DhanBroker(config);
        
        case 'GROWW':
            if (!GrowwBroker) throw new Error('Groww broker not loaded');
            return new GrowwBroker(config);
        
        case 'MOCK':
        default:
            return new MockBroker(config);
    }
}

let broker = createBroker();
let riskManager = new RiskManager(config);
let engine = new AutoTradingEngine(config, broker, riskManager);

// WebSocket clients
const clients = new Set();

wss.on('connection', (ws) => {
    console.log('WebSocket client connected');
    clients.add(ws);
    
    // Send current status
    ws.send(JSON.stringify({
        type: 'STATUS',
        data: engine.getStatus()
    }));
    
    ws.on('close', () => {
        clients.delete(ws);
        console.log('WebSocket client disconnected');
    });
    
    ws.on('message', async (message) => {
        try {
            const data = JSON.parse(message);
            
            if (data.type === 'START') {
                const result = await engine.start();
                broadcast({ type: 'STATUS', data: engine.getStatus() });
            } else if (data.type === 'STOP') {
                const result = await engine.stop();
                broadcast({ type: 'STATUS', data: engine.getStatus() });
            } else if (data.type === 'GET_STATUS') {
                ws.send(JSON.stringify({
                    type: 'STATUS',
                    data: engine.getStatus()
                }));
            }
        } catch (e) {
            ws.send(JSON.stringify({ type: 'ERROR', message: e.message }));
        }
    });
});

function broadcast(message) {
    const data = JSON.stringify(message);
    clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(data);
        }
    });
}

// Setup engine callbacks to broadcast to WebSocket
engine.onLog = (logEntry) => {
    broadcast({ type: 'LOG', data: logEntry });
};

engine.onStatusUpdate = (status) => {
    broadcast({ type: 'STATUS', data: engine.getStatus() });
};

engine.onTrade = (trade) => {
    broadcast({ type: 'TRADE', data: trade });
};

// REST API Routes

app.get('/api/status', (req, res) => {
    res.json(engine.getStatus());
});

app.get('/api/config', (req, res) => {
    res.json({
        ...config,
        // Hide secrets
        accessToken: config.accessToken ? '***' : undefined,
        GROWW_TOKEN: config.GROWW_TOKEN ? '***' : undefined,
        DHAN_ACCESS_TOKEN: config.DHAN_ACCESS_TOKEN ? '***' : undefined
    });
});

app.post('/api/config', (req, res) => {
    const newConfig = req.body;
    
    // Update config (only allow safe fields)
    if (newConfig.capital) config.capital = parseFloat(newConfig.capital);
    if (newConfig.riskPerTrade) config.riskPerTrade = parseFloat(newConfig.riskPerTrade);
    if (newConfig.maxPositions) config.maxPositions = parseInt(newConfig.maxPositions);
    if (newConfig.customSymbols) config.customSymbols = newConfig.customSymbols;
    if (newConfig.activeStrategies) config.activeStrategies = newConfig.activeStrategies;
    
    // Recreate risk manager and engine with new config
    riskManager = new RiskManager(config);
    engine = new AutoTradingEngine(config, broker, riskManager);
    
    // Re-setup callbacks
    engine.onLog = (logEntry) => broadcast({ type: 'LOG', data: logEntry });
    engine.onStatusUpdate = (status) => broadcast({ type: 'STATUS', data: engine.getStatus() });
    engine.onTrade = (trade) => broadcast({ type: 'TRADE', data: trade });
    
    res.json({ success: true, config: config });
});

app.post('/api/start', async (req, res) => {
    try {
        const result = await engine.start();
        res.json(result);
    } catch (e) {
        res.status(500).json({ success: false, message: e.message });
    }
});

app.post('/api/stop', async (req, res) => {
    try {
        const result = await engine.stop();
        res.json(result);
    } catch (e) {
        res.status(500).json({ success: false, message: e.message });
    }
});

app.get('/api/logs', (req, res) => {
    res.json(engine.getLogs());
});

app.get('/api/positions', async (req, res) => {
    try {
        const positions = await broker.getPositions();
        res.json(positions);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.get('/api/funds', async (req, res) => {
    try {
        const funds = await broker.getFunds();
        res.json(funds);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.get('/api/orders', async (req, res) => {
    try {
        const orders = await broker.getOrders();
        res.json(orders);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.post('/api/place-order', async (req, res) => {
    try {
        const order = req.body;
        const result = await broker.placeOrder(order);
        res.json(result);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.post('/api/square-off', async (req, res) => {
    try {
        const { symbol } = req.body;
        let result;
        if (symbol) {
            result = await broker.squareOffPosition(symbol);
        } else {
            result = await broker.squareOffAll();
        }
        res.json({ success: true, result });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.post('/api/analyze/:symbol', async (req, res) => {
    try {
        const symbol = req.params.symbol.toUpperCase();
        const strategy = req.query.strategy || 'COMBINED';
        
        // Get candles
        let candles;
        try {
            candles = await broker.getHistoricalData(symbol, '5', null, null);
        } catch (e) {
            candles = [];
        }
        
        if (!candles || candles.length === 0) {
            // Generate mock candles
            candles = engine.generateMockCandles(symbol);
        }
        
        const quote = await broker.getQuote(symbol);
        const stock = typeof quote === 'object' ? quote : { symbol, price: quote };
        
        const analysis = TradingStrategies.analyze(stock, candles, strategy, config);
        
        res.json({
            symbol,
            quote: stock,
            analysis,
            candles: candles.slice(-20) // Last 20 candles
        });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// Health check
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        timestamp: new Date().toISOString(),
        broker: broker.name,
        mode: config.mode,
        running: engine.isRunning
    });
});

// Serve dashboard
app.get('/', (req, res) => {
    res.sendFile(require('path').join(__dirname, '../../index.html'));
});

// Start server
const PORT = process.env.PORT || 3001;

server.listen(PORT, '0.0.0.0', () => {
    console.log('');
    console.log('🤖 Indian Stock Auto Trading Backend');
    console.log('=====================================');
    console.log(`📡 Server running on http://localhost:${PORT}`);
    console.log(`📊 Dashboard: http://localhost:${PORT}/`);
    console.log(`🔌 WebSocket: ws://localhost:${PORT}`);
    console.log(`💼 Broker: ${config.broker} (${config.mode} mode)`);
    console.log(`💰 Capital: ₹${config.capital}`);
    console.log(`📈 Strategies: ${config.activeStrategies.join(', ')}`);
    console.log(`📋 Symbols: ${config.customSymbols.join(', ')}`);
    console.log('');
    console.log('API Endpoints:');
    console.log(`  GET  /api/status - Engine status`);
    console.log(`  POST /api/start - Start trading`);
    console.log(`  POST /api/stop - Stop trading`);
    console.log(`  GET  /api/positions - Current positions`);
    console.log(`  GET  /api/funds - Available funds`);
    console.log(`  POST /api/analyze/:symbol - Analyze stock`);
    console.log('');
    console.log('For Groww:');
    console.log('  1. Run: npm run groww-login (first time)');
    console.log('  2. Login manually with OTP');
    console.log('  3. Session saved, then npm start');
    console.log('');
    
    if (config.broker === 'MOCK') {
        console.log('⚠️  Running in MOCK (paper) mode - No real money');
        console.log('   Set BROKER=DHAN or GROWW and MODE=LIVE in .env for real trading');
    } else if (config.mode === 'LIVE') {
        console.log('🔴 LIVE MODE - Real money will be used!');
        console.log('   Make sure you tested in PAPER mode first');
    }
    console.log('');
});

// Graceful shutdown
process.on('SIGINT', async () => {
    console.log('\nShutting down...');
    if (engine.isRunning) {
        await engine.stop();
    }
    if (broker.disconnect) {
        await broker.disconnect();
    }
    server.close(() => {
        console.log('Server closed');
        process.exit(0);
    });
});
