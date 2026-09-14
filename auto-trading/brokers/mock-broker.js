// Mock Broker - Paper Trading (No real money)
// Perfect for testing strategies before going live

// Load base class for Node.js
let BrokerInterface;
if (typeof module !== 'undefined' && module.exports) {
    try {
        BrokerInterface = require('../broker-interface.js');
    } catch (e) {
        // Fallback if path differs
        BrokerInterface = global.BrokerInterface || class {};
    }
} else {
    BrokerInterface = window.BrokerInterface;
}

class MockBroker extends BrokerInterface {
    constructor(config) {
        super(config);
        this.name = 'MOCK';
        this.isConnected = false;
        this.orders = [];
        this.positions = new Map(); // symbol -> {quantity, avgPrice, pnl}
        this.funds = { available: config.capital || 100000, used: 0 };
        this.orderIdCounter = 1000;
        this.trades = [];
    }

    async connect() {
        console.log('[MockBroker] Connecting in PAPER mode...');
        this.isConnected = true;
        return { success: true, message: 'Connected to Mock Broker (Paper Trading)' };
    }

    async getProfile() {
        return { name: 'Paper Trader', clientId: 'PAPER123', broker: 'MOCK' };
    }

    async getLTP(symbol) {
        // Try to get from global STOCKS array (from dashboard)
        if (typeof window !== 'undefined' && window.STOCKS) {
            const stock = window.STOCKS.find(s => s.symbol === symbol);
            if (stock) return stock.price;
        }
        // Fallback random price
        return 100 + Math.random() * 1000;
    }

    async getQuote(symbol) {
        if (typeof window !== 'undefined' && window.STOCKS) {
            const stock = window.STOCKS.find(s => s.symbol === symbol);
            if (stock) return stock;
        }
        const price = await this.getLTP(symbol);
        return {
            symbol,
            price,
            open: price * 0.99,
            high: price * 1.02,
            low: price * 0.98,
            close: price,
            volume: 500000,
            change: price * 0.01,
            percent: 1
        };
    }

    async getHistoricalData(symbol, interval = '5minute', from, to) {
        // Generate fake historical data for strategy backtesting
        const now = Date.now();
        const candles = [];
        let price = 1000;
        for (let i = 100; i >= 0; i--) {
            const time = new Date(now - i * 5 * 60 * 1000);
            const open = price;
            const change = (Math.random() - 0.5) * 10;
            price = price + change;
            const high = Math.max(open, price) + Math.random() * 2;
            const low = Math.min(open, price) - Math.random() * 2;
            const close = price;
            candles.push({
                timestamp: time,
                open, high, low, close,
                volume: 100000 + Math.random() * 500000
            });
        }
        return candles;
    }

    async placeOrder(order) {
        if (!this.isConnected) throw new Error('Not connected');

        const orderId = `MOCK${this.orderIdCounter++}`;
        const ltp = await this.getLTP(order.symbol);
        const executionPrice = order.orderType === 'MARKET' ? ltp : (order.price || ltp);

        const orderObj = {
            orderId,
            symbol: order.symbol,
            side: order.side,
            quantity: order.quantity,
            price: executionPrice,
            orderType: order.orderType || 'MARKET',
            product: order.product || 'INTRADAY',
            exchange: order.exchange || 'NSE',
            status: 'COMPLETE',
            timestamp: new Date().toISOString(),
            tag: order.tag || 'auto-trading'
        };

        this.orders.push(orderObj);

        // Update positions
        const existing = this.positions.get(order.symbol) || { quantity: 0, avgPrice: 0, pnl: 0, product: order.product };
        
        if (order.side === 'BUY') {
            const totalCost = existing.quantity * existing.avgPrice + order.quantity * executionPrice;
            const totalQty = existing.quantity + order.quantity;
            existing.avgPrice = totalQty > 0 ? totalCost / totalQty : 0;
            existing.quantity = totalQty;
        } else {
            // SELL
            const pnl = (executionPrice - existing.avgPrice) * order.quantity;
            existing.pnl += pnl;
            existing.quantity -= order.quantity;
            
            // Record trade
            this.trades.push({
                symbol: order.symbol,
                entry: existing.avgPrice,
                exit: executionPrice,
                quantity: order.quantity,
                pnl: pnl,
                side: 'LONG',
                timestamp: new Date().toISOString()
            });

            if (existing.quantity <= 0) {
                existing.quantity = 0;
            }
        }
        
        existing.product = order.product || existing.product;
        existing.ltp = executionPrice;
        existing.currentPnl = existing.quantity > 0 ? (executionPrice - existing.avgPrice) * existing.quantity : 0;
        
        this.positions.set(order.symbol, existing);

        console.log(`[MockBroker] ${order.side} ${order.quantity} ${order.symbol} @ ₹${executionPrice} - Order ${orderId} COMPLETE`);

        return {
            orderId,
            status: 'COMPLETE',
            price: executionPrice,
            message: `Paper order executed`
        };
    }

    async getOrderStatus(orderId) {
        const order = this.orders.find(o => o.orderId === orderId);
        return order || { status: 'NOT_FOUND' };
    }

    async cancelOrder(orderId) {
        const order = this.orders.find(o => o.orderId === orderId);
        if (order) {
            order.status = 'CANCELLED';
            return { success: true };
        }
        return { success: false, message: 'Order not found' };
    }

    async getOrders() {
        return this.orders;
    }

    async getPositions() {
        const positions = [];
        for (const [symbol, pos] of this.positions.entries()) {
            if (pos.quantity !== 0) {
                const ltp = await this.getLTP(symbol);
                positions.push({
                    symbol,
                    quantity: pos.quantity,
                    avgPrice: pos.avgPrice,
                    ltp: ltp,
                    pnl: (ltp - pos.avgPrice) * pos.quantity,
                    product: pos.product,
                    exchange: 'NSE'
                });
            }
        }
        return positions;
    }

    async getHoldings() {
        return [];
    }

    async getFunds() {
        const positions = await this.getPositions();
        const used = positions.reduce((sum, p) => sum + (p.avgPrice * p.quantity), 0);
        const totalPnl = this.trades.reduce((sum, t) => sum + t.pnl, 0) + positions.reduce((sum, p) => sum + p.pnl, 0);
        
        return {
            available: this.funds.available - used,
            used: used,
            total: this.funds.available,
            pnl: totalPnl,
            trades: this.trades.length
        };
    }

    async squareOffAll() {
        const positions = await this.getPositions();
        const results = [];
        for (const pos of positions) {
            if (pos.quantity !== 0) {
                const result = await this.placeOrder({
                    symbol: pos.symbol,
                    side: pos.quantity > 0 ? 'SELL' : 'BUY',
                    quantity: Math.abs(pos.quantity),
                    orderType: 'MARKET',
                    product: pos.product,
                    exchange: 'NSE',
                    tag: 'auto-squareoff'
                });
                results.push(result);
            }
        }
        return results;
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = MockBroker;
}
if (typeof window !== 'undefined') {
    window.MockBroker = MockBroker;
}
