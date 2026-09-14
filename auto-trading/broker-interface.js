// Abstract Broker Interface - All brokers must implement this
class BrokerInterface {
    constructor(config) {
        this.config = config;
        this.isConnected = false;
        this.name = 'BaseBroker';
    }

    // Connection
    async connect() {
        throw new Error('connect() not implemented');
    }

    async disconnect() {
        this.isConnected = false;
    }

    async getProfile() {
        throw new Error('getProfile() not implemented');
    }

    // Market Data
    async getLTP(symbol) {
        // Last Traded Price
        throw new Error('getLTP() not implemented');
    }

    async getQuote(symbol) {
        // Full quote: open, high, low, close, volume, etc
        throw new Error('getQuote() not implemented');
    }

    async getHistoricalData(symbol, interval, from, to) {
        throw new Error('getHistoricalData() not implemented');
    }

    // Orders
    async placeOrder(order) {
        /*
        order = {
            symbol: 'RELIANCE',
            side: 'BUY' or 'SELL',
            quantity: 10,
            price: 2525 (for LIMIT) or 0 for MARKET,
            orderType: 'MARKET' or 'LIMIT' or 'SL' or 'SL-M',
            product: 'INTRADAY' or 'CNC',
            exchange: 'NSE',
            tag: 'auto-trading-bot'
        }
        Returns: { orderId, status, message }
        */
        throw new Error('placeOrder() not implemented');
    }

    async getOrderStatus(orderId) {
        throw new Error('getOrderStatus() not implemented');
    }

    async cancelOrder(orderId) {
        throw new Error('cancelOrder() not implemented');
    }

    async getOrders() {
        throw new Error('getOrders() not implemented');
    }

    // Positions & Holdings
    async getPositions() {
        throw new Error('getPositions() not implemented');
    }

    async getHoldings() {
        throw new Error('getHoldings() not implemented');
    }

    async getFunds() {
        throw new Error('getFunds() not implemented');
    }

    // Helpers
    async squareOffPosition(symbol) {
        // Close all open positions for symbol
        const positions = await this.getPositions();
        const pos = positions.find(p => p.symbol === symbol && p.quantity !== 0);
        if (!pos) return null;

        const side = pos.quantity > 0 ? 'SELL' : 'BUY';
        return await this.placeOrder({
            symbol: symbol,
            side: side,
            quantity: Math.abs(pos.quantity),
            orderType: 'MARKET',
            product: pos.product || 'INTRADAY',
            exchange: pos.exchange || 'NSE'
        });
    }

    async squareOffAll() {
        const positions = await this.getPositions();
        const results = [];
        for (const pos of positions) {
            if (pos.quantity !== 0) {
                const res = await this.squareOffPosition(pos.symbol);
                results.push(res);
            }
        }
        return results;
    }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = BrokerInterface;
}
if (typeof window !== 'undefined') {
    window.BrokerInterface = BrokerInterface;
}
