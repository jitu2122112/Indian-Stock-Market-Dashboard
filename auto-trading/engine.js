// Auto Trading Engine - Core loop that scans, analyzes, places orders, and exits

// For Node.js - load dependencies
let TradingStrategies, RiskManager;
if (typeof module !== 'undefined' && module.exports) {
    try {
        TradingStrategies = require('./strategies.js');
    } catch (e) {
        TradingStrategies = global.TradingStrategies;
    }
    try {
        RiskManager = require('./risk-manager.js');
    } catch (e) {
        RiskManager = global.RiskManager;
    }
} else {
    TradingStrategies = window.TradingStrategies;
    RiskManager = window.RiskManager;
}

class AutoTradingEngine {
    constructor(config, broker, riskManager) {
        this.config = config;
        this.broker = broker;
        this.riskManager = riskManager;
        this.isRunning = false;
        this.scanInterval = null;
        this.monitorInterval = null;
        this.logs = [];
        this.activeOrders = new Map(); // symbol -> {order, signal, trailingSL}
        this.candlesCache = new Map(); // symbol -> candles
        this.onLog = null; // Callback for UI
        this.onStatusUpdate = null; // Callback for UI
        this.onTrade = null; // Callback for UI
    }

    log(message, level = 'INFO') {
        const entry = {
            timestamp: new Date().toISOString(),
            level,
            message
        };
        this.logs.push(entry);
        if (this.logs.length > 500) this.logs.shift(); // Keep last 500
        
        console.log(`[Engine][${level}] ${message}`);
        
        if (this.onLog) {
            this.onLog(entry);
        }
    }

    async start() {
        if (this.isRunning) {
            this.log('Engine already running', 'WARN');
            return;
        }

        if (!this.broker.isConnected) {
            this.log('Connecting to broker...', 'INFO');
            await this.broker.connect();
        }

        this.isRunning = true;
        this.log(`🚀 Auto Trading Engine STARTED in ${this.config.mode} mode`, 'INFO');
        this.log(`Broker: ${this.broker.name}, Capital: ₹${this.config.capital}, Risk: ${this.config.riskPerTrade}%`, 'INFO');
        this.log(`Strategies: ${this.config.activeStrategies.join(', ')}`, 'INFO');

        // Initial scan
        await this.scanMarket();

        // Start intervals
        this.scanInterval = setInterval(() => this.scanMarket(), this.config.scanInterval);
        this.monitorInterval = setInterval(() => this.monitorPositions(), this.config.priceCheckInterval);

        if (this.onStatusUpdate) this.onStatusUpdate({ running: true });

        return { success: true, message: 'Engine started' };
    }

    async stop() {
        if (!this.isRunning) {
            return { success: false, message: 'Engine not running' };
        }

        this.isRunning = false;
        
        if (this.scanInterval) clearInterval(this.scanInterval);
        if (this.monitorInterval) clearInterval(this.monitorInterval);

        this.log('🛑 Auto Trading Engine STOPPED', 'INFO');
        
        // Square off all positions if configured
        if (this.config.squareOffOnStop) {
            this.log('Squaring off all positions...', 'INFO');
            try {
                await this.broker.squareOffAll();
                this.log('All positions squared off', 'INFO');
            } catch (e) {
                this.log(`Square off failed: ${e.message}`, 'ERROR');
            }
        }

        if (this.onStatusUpdate) this.onStatusUpdate({ running: false });

        return { success: true, message: 'Engine stopped' };
    }

    async scanMarket() {
        if (!this.isRunning) return;

        try {
            // Check if market is open
            if (!this.riskManager.isMarketOpen()) {
                this.log('Market is closed, skipping scan', 'INFO');
                return;
            }

            // Check if should square off
            if (this.riskManager.shouldSquareOff()) {
                this.log('Auto square-off time reached (15:15), closing all positions', 'WARN');
                await this.broker.squareOffAll();
                await this.stop();
                return;
            }

            // Check risk manager halt
            const riskStatus = this.riskManager.getStatus();
            if (riskStatus.isHalted) {
                this.log(`Trading halted: ${riskStatus.haltReason}`, 'ERROR');
                await this.stop();
                return;
            }

            this.log(`🔍 Scanning market... Open positions: ${riskStatus.openPositions}, Daily PnL: ₹${riskStatus.dailyPnl.toFixed(2)}`, 'INFO');

            // Get symbols to scan
            const symbols = this.getSymbolsToScan();
            
            for (const symbol of symbols) {
                if (!this.isRunning) break; // Stop if engine stopped during scan
                
                try {
                    await this.analyzeSymbol(symbol);
                    
                    // Small delay to avoid rate limiting
                    await new Promise(resolve => setTimeout(resolve, 200));
                } catch (e) {
                    this.log(`Error analyzing ${symbol}: ${e.message}`, 'ERROR');
                }
            }

            this.log(`Scan complete. Checked ${symbols.length} symbols`, 'INFO');
            
            if (this.onStatusUpdate) {
                this.onStatusUpdate({
                    running: this.isRunning,
                    riskStatus: this.riskManager.getStatus(),
                    lastScan: new Date().toISOString()
                });
            }

        } catch (e) {
            this.log(`Scan failed: ${e.message}`, 'ERROR');
        }
    }

    getSymbolsToScan() {
        // Get from config
        if (this.config.universe === 'CUSTOM' && this.config.customSymbols) {
            return this.config.customSymbols;
        }

        // Try to get from dashboard STOCKS
        if (typeof window !== 'undefined' && window.STOCKS) {
            return window.STOCKS.slice(0, 15).map(s => s.symbol); // Top 15
        }

        // Fallback to config custom symbols
        return this.config.customSymbols || ['RELIANCE', 'TCS', 'INFY', 'HDFCBANK', 'ICICIBANK'];
    }

    async analyzeSymbol(symbol) {
        // Get historical candles
        let candles = this.candlesCache.get(symbol);
        
        if (!candles || Math.random() < 0.2) { // Refresh 20% of time or if no cache
            try {
                candles = await this.broker.getHistoricalData(symbol, '5', null, null);
                
                // If broker doesn't return candles, generate from live data or mock
                if (!candles || candles.length === 0) {
                    candles = this.generateMockCandles(symbol);
                }
                
                this.candlesCache.set(symbol, candles);
            } catch (e) {
                candles = this.generateMockCandles(symbol);
            }
        }

        // Get current quote
        let stock;
        try {
            stock = await this.broker.getQuote(symbol);
            if (!stock.price) {
                // Fallback to dashboard
                if (typeof window !== 'undefined' && window.STOCKS) {
                    const s = window.STOCKS.find(st => st.symbol === symbol);
                    if (s) stock = s;
                }
            }
        } catch (e) {
            // Use cached or mock
            if (typeof window !== 'undefined' && window.STOCKS) {
                stock = window.STOCKS.find(s => s.symbol === symbol);
            }
            if (!stock) {
                stock = { symbol, price: 1000 + Math.random() * 1000 };
            }
        }

        // Apply filters
        if (!this.passesFilters(stock, candles)) {
            return;
        }

        // Run strategies
        const strategies = this.config.activeStrategies || ['COMBINED'];
        let bestSignal = null;

        for (const strategyName of strategies) {
            const result = TradingStrategies.analyze(stock, candles, strategyName, this.config);
            
            if (!bestSignal || result.confidence > bestSignal.confidence) {
                bestSignal = result;
            }
        }

        // If no signal or HOLD, skip
        if (!bestSignal || bestSignal.signal === 'HOLD' || bestSignal.confidence < 60) {
            return;
        }

        this.log(`📊 ${symbol}: ${bestSignal.signal} signal from ${bestSignal.strategy} (${bestSignal.confidence}%) - ${bestSignal.reasons[0]}`, 'INFO');

        // Check risk manager
        const canTrade = this.riskManager.canTakeTrade(bestSignal, stock);
        if (!canTrade.allowed) {
            this.log(`⛔ ${symbol} trade blocked: ${canTrade.reason}`, 'WARN');
            return;
        }

        // Calculate position size
        const quantity = this.riskManager.calculatePositionSize(
            bestSignal.entry,
            bestSignal.stopLoss,
            this.config.capital
        );

        this.log(`✅ ${symbol} BUY signal validated - Qty: ${quantity}, Entry: ₹${bestSignal.entry.toFixed(2)}, SL: ₹${bestSignal.stopLoss.toFixed(2)}, Target: ₹${bestSignal.target.toFixed(2)}`, 'INFO');

        // Place order
        await this.placeOrder(symbol, bestSignal, quantity);
    }

    passesFilters(stock, candles) {
        const filters = this.config.filters;
        if (!filters) return true;

        if (stock.price < filters.minPrice) return false;
        
        const volume = stock.volume || candles[candles.length - 1]?.volume || 0;
        if (volume < filters.minVolume) return false;

        // RSI filter if we have it
        if (candles.length > 14) {
            const prices = candles.map(c => c.close);
            const rsi = TradingStrategies.calculateRSI(prices, 14);
            if (rsi < filters.minRSI || rsi > filters.maxRSI) {
                // Allow if it's a strong reversal signal (RSI <30 or >70) even if outside filter
                if (rsi > 30 && rsi < 70) {
                    // Only filter if in neutral zone but outside our range
                    if (filters.minRSI > 0 || filters.maxRSI < 100) {
                        // For now, don't filter strictly on RSI, just log
                    }
                }
            }
        }

        return true;
    }

    generateMockCandles(symbol) {
        // Generate realistic mock candles for testing
        const candles = [];
        let price = 1000 + Math.random() * 2000;
        const now = Date.now();
        
        for (let i = 100; i >= 0; i--) {
            const time = new Date(now - i * 5 * 60 * 1000);
            const open = price;
            const volatility = price * 0.005;
            const change = (Math.random() - 0.5) * volatility * 2;
            price = Math.max(price * 0.95, price + change);
            const high = Math.max(open, price) + Math.random() * volatility;
            const low = Math.min(open, price) - Math.random() * volatility;
            const close = price;
            
            candles.push({
                timestamp: time,
                open, high, low, close,
                volume: 50000 + Math.random() * 500000,
                symbol
            });
        }
        
        return candles;
    }

    async placeOrder(symbol, signal, quantity) {
        try {
            const order = {
                symbol: symbol,
                side: signal.signal, // BUY or SELL
                quantity: quantity,
                price: signal.entry,
                orderType: this.config.orderType || 'MARKET',
                product: this.config.productType || 'INTRADAY',
                exchange: this.config.exchange || 'NSE',
                tag: `auto-${signal.strategy.toLowerCase()}`
            };

            this.log(`📤 Placing ${order.side} order: ${quantity} ${symbol} @ ₹${order.price.toFixed(2)}`, 'INFO');

            const result = await this.broker.placeOrder(order);

            this.log(`✅ Order placed: ${symbol} - Order ID: ${result.orderId}`, 'INFO');

            // Track order for monitoring
            this.activeOrders.set(symbol, {
                orderId: result.orderId,
                symbol,
                signal,
                quantity,
                entry: signal.entry,
                stopLoss: signal.stopLoss,
                target: signal.target,
                trailingSL: signal.stopLoss,
                highestPrice: signal.entry,
                lowestPrice: signal.entry,
                timestamp: new Date().toISOString(),
                status: 'OPEN'
            });

            // Register with risk manager
            this.riskManager.addPosition(symbol, {
                symbol,
                quantity: signal.signal === 'BUY' ? quantity : -quantity,
                entry: signal.entry,
                stopLoss: signal.stopLoss,
                target: signal.target
            });

            if (this.onTrade) {
                this.onTrade({
                    type: 'ORDER_PLACED',
                    symbol,
                    signal,
                    quantity,
                    orderId: result.orderId,
                    timestamp: new Date().toISOString()
                });
            }

            return result;

        } catch (e) {
            this.log(`❌ Order failed for ${symbol}: ${e.message}`, 'ERROR');
            throw e;
        }
    }

    async monitorPositions() {
        if (!this.isRunning) return;
        if (this.activeOrders.size === 0) return;

        try {
            const positions = await this.broker.getPositions();
            
            for (const [symbol, orderInfo] of this.activeOrders.entries()) {
                try {
                    const ltp = await this.broker.getLTP(symbol);
                    if (!ltp) continue;

                    const position = positions.find(p => p.symbol === symbol);
                    const currentPnl = position ? position.pnl : (ltp - orderInfo.entry) * orderInfo.quantity * (orderInfo.signal.signal === 'BUY' ? 1 : -1);

                    // Update trailing SL
                    if (this.config.useTrailingSL) {
                        if (orderInfo.signal.signal === 'BUY') {
                            if (ltp > orderInfo.highestPrice) {
                                orderInfo.highestPrice = ltp;
                                const newSL = ltp * (1 - this.config.trailingSLPercent / 100);
                                if (newSL > orderInfo.trailingSL) {
                                    orderInfo.trailingSL = newSL;
                                    this.log(`📈 ${symbol} trailing SL updated: ₹${orderInfo.trailingSL.toFixed(2)} (LTP: ₹${ltp.toFixed(2)})`, 'INFO');
                                }
                            }
                        } else {
                            if (ltp < orderInfo.lowestPrice) {
                                orderInfo.lowestPrice = ltp;
                                const newSL = ltp * (1 + this.config.trailingSLPercent / 100);
                                if (newSL < orderInfo.trailingSL) {
                                    orderInfo.trailingSL = newSL;
                                    this.log(`📉 ${symbol} trailing SL updated: ₹${orderInfo.trailingSL.toFixed(2)} (LTP: ₹${ltp.toFixed(2)})`, 'INFO');
                                }
                            }
                        }
                    }

                    // Check exit conditions
                    let shouldExit = false;
                    let exitReason = '';

                    if (orderInfo.signal.signal === 'BUY') {
                        if (ltp <= orderInfo.trailingSL) {
                            shouldExit = true;
                            exitReason = `Stop Loss hit: ₹${ltp.toFixed(2)} <= ₹${orderInfo.trailingSL.toFixed(2)}`;
                        } else if (ltp >= orderInfo.target) {
                            shouldExit = true;
                            exitReason = `Target hit: ₹${ltp.toFixed(2)} >= ₹${orderInfo.target.toFixed(2)}`;
                        }
                    } else {
                        if (ltp >= orderInfo.trailingSL) {
                            shouldExit = true;
                            exitReason = `Stop Loss hit: ₹${ltp.toFixed(2)} >= ₹${orderInfo.trailingSL.toFixed(2)}`;
                        } else if (ltp <= orderInfo.target) {
                            shouldExit = true;
                            exitReason = `Target hit: ₹${ltp.toFixed(2)} <= ₹${orderInfo.target.toFixed(2)}`;
                        }
                    }

                    if (shouldExit) {
                        this.log(`🎯 Exit signal for ${symbol}: ${exitReason}`, 'INFO');
                        await this.exitPosition(symbol, ltp, exitReason);
                    }

                } catch (e) {
                    this.log(`Monitor error for ${symbol}: ${e.message}`, 'ERROR');
                }
            }

        } catch (e) {
            this.log(`Monitor positions failed: ${e.message}`, 'ERROR');
        }
    }

    async exitPosition(symbol, ltp, reason) {
        const orderInfo = this.activeOrders.get(symbol);
        if (!orderInfo) return;

        try {
            const exitSide = orderInfo.signal.signal === 'BUY' ? 'SELL' : 'BUY';
            
            const order = {
                symbol: symbol,
                side: exitSide,
                quantity: orderInfo.quantity,
                price: ltp,
                orderType: 'MARKET',
                product: this.config.productType,
                exchange: this.config.exchange,
                tag: `auto-exit-${reason.replace(/\s/g, '-')}`
            };

            this.log(`📤 Exiting ${symbol}: ${exitSide} ${orderInfo.quantity} @ ₹${ltp.toFixed(2)} - ${reason}`, 'INFO');

            const result = await this.broker.placeOrder(order);

            const pnl = orderInfo.signal.signal === 'BUY' 
                ? (ltp - orderInfo.entry) * orderInfo.quantity
                : (orderInfo.entry - ltp) * orderInfo.quantity;

            this.log(`✅ ${symbol} exited: PnL ₹${pnl.toFixed(2)} - ${reason}`, pnl >= 0 ? 'INFO' : 'WARN');

            this.activeOrders.delete(symbol);
            this.riskManager.removePosition(symbol, pnl);

            if (this.onTrade) {
                this.onTrade({
                    type: 'ORDER_EXITED',
                    symbol,
                    entry: orderInfo.entry,
                    exit: ltp,
                    quantity: orderInfo.quantity,
                    pnl,
                    reason,
                    timestamp: new Date().toISOString()
                });
            }

            return result;

        } catch (e) {
            this.log(`❌ Exit failed for ${symbol}: ${e.message}`, 'ERROR');
            throw e;
        }
    }

    getStatus() {
        return {
            running: this.isRunning,
            broker: this.broker.name,
            mode: this.config.mode,
            activeOrders: Array.from(this.activeOrders.values()),
            riskStatus: this.riskManager.getStatus(),
            logs: this.logs.slice(-20), // Last 20 logs
            config: this.config
        };
    }

    getLogs() {
        return this.logs;
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = AutoTradingEngine;
}
if (typeof window !== 'undefined') {
    window.AutoTradingEngine = AutoTradingEngine;
}
