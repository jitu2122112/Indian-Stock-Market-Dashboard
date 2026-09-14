// Test auto trading engine locally
const AutoTradingConfig = require('../../auto-trading/config.js');
const MockBroker = require('../../auto-trading/brokers/mock-broker.js');
const TradingStrategies = require('../../auto-trading/strategies.js');
const RiskManager = require('../../auto-trading/risk-manager.js');
const AutoTradingEngine = require('../../auto-trading/engine.js');

async function test() {
    console.log('🧪 Testing Auto Trading Engine...');
    
    const config = {
        ...AutoTradingConfig,
        mode: 'PAPER',
        broker: 'MOCK',
        capital: 100000,
        customSymbols: ['RELIANCE', 'TCS', 'INFY']
    };

    const broker = new MockBroker(config);
    const riskManager = new RiskManager(config);
    const engine = new AutoTradingEngine(config, broker, riskManager);

    engine.onLog = (log) => console.log(`[${log.level}] ${log.message}`);
    engine.onTrade = (trade) => console.log('TRADE:', trade);

    await broker.connect();
    console.log('✅ Broker connected');

    // Test strategy
    const mockCandles = engine.generateMockCandles('RELIANCE');
    const mockStock = { symbol: 'RELIANCE', price: 2525, volume: 500000 };
    
    const analysis = TradingStrategies.analyze(mockStock, mockCandles, 'COMBINED');
    console.log('📊 Analysis:', analysis);

    // Test position sizing
    const qty = riskManager.calculatePositionSize(2525, 2500, 100000);
    console.log(`💰 Position size: ${qty} shares for ₹1000 risk`);

    // Test engine start for 10 seconds
    console.log('🚀 Starting engine for 10 seconds...');
    await engine.start();
    
    setTimeout(async () => {
        console.log('🛑 Stopping engine...');
        await engine.stop();
        console.log('📊 Final status:', engine.getStatus());
        console.log('✅ Test complete');
        process.exit(0);
    }, 10000);
}

test().catch(console.error);
