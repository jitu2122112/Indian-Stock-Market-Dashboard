// DhanHQ Broker - FREE Official API - Recommended for real auto trading
// Docs: https://dhanhq.co/docs/v2/
// Free, stable, SEBI compliant

let BrokerInterface;
if (typeof module !== 'undefined' && module.exports) {
    try {
        BrokerInterface = require('../broker-interface.js');
    } catch (e) {
        BrokerInterface = global.BrokerInterface || class {};
    }
} else {
    BrokerInterface = window.BrokerInterface;
}

class DhanBroker extends BrokerInterface {
    constructor(config) {
        super(config);
        this.name = 'DHAN';
        this.clientId = config.clientId || config.DHAN_CLIENT_ID;
        this.accessToken = config.accessToken || config.DHAN_ACCESS_TOKEN;
        this.baseUrl = 'https://api.dhan.co/v2';
        this.isConnected = false;
    }

    async connect() {
        if (!this.clientId || !this.accessToken) {
            throw new Error('Dhan Client ID and Access Token required. Get from https://dhan.co -> Profile -> DhanHQ API');
        }

        // Test connection by getting profile/funds
        try {
            const funds = await this.getFunds();
            this.isConnected = true;
            console.log('[DhanBroker] Connected successfully');
            return { success: true, message: 'Connected to Dhan', funds };
        } catch (e) {
            throw new Error(`Dhan connection failed: ${e.message}`);
        }
    }

    async _request(endpoint, method = 'GET', body = null) {
        const headers = {
            'Content-Type': 'application/json',
            'access-token': this.accessToken,
            'client-id': this.clientId
        };

        const options = { method, headers };
        if (body) options.body = JSON.stringify(body);

        const response = await fetch(this.baseUrl + endpoint, options);
        
        if (!response.ok) {
            const text = await response.text();
            throw new Error(`Dhan API Error ${response.status}: ${text}`);
        }

        return await response.json();
    }

    async getProfile() {
        // Dhan doesn't have profile endpoint, use funds as check
        const funds = await this.getFunds();
        return { clientId: this.clientId, broker: 'DHAN', funds };
    }

    async getLTP(symbol) {
        // Dhan market feed API
        // For simplicity, using quote API
        try {
            const data = await this._request('/marketfeed/ltp', 'POST', {
                'NSE_EQ': [symbol]
            });
            if (data.data && data.data.NSE_EQ && data.data.NSE_EQ[symbol]) {
                return data.data.NSE_EQ[symbol].last_price;
            }
        } catch (e) {
            console.warn(`Dhan LTP failed for ${symbol}, using fallback`);
        }
        
        // Fallback to dashboard data if available
        if (typeof window !== 'undefined' && window.STOCKS) {
            const stock = window.STOCKS.find(s => s.symbol === symbol);
            if (stock) return stock.price;
        }
        return 0;
    }

    async getQuote(symbol) {
        try {
            const data = await this._request('/marketfeed/quote', 'POST', {
                'NSE_EQ': [symbol]
            });
            if (data.data && data.data.NSE_EQ && data.data.NSE_EQ[symbol]) {
                const q = data.data.NSE_EQ[symbol];
                return {
                    symbol,
                    price: q.last_price,
                    open: q.ohlc.open,
                    high: q.ohlc.high,
                    low: q.ohlc.low,
                    close: q.ohlc.close,
                    volume: q.volume,
                    change: q.last_price - q.ohlc.close,
                    percent: ((q.last_price - q.ohlc.close) / q.ohlc.close) * 100
                };
            }
        } catch (e) {
            console.warn(`Dhan quote failed for ${symbol}`);
        }
        return { symbol, price: await this.getLTP(symbol) };
    }

    async getHistoricalData(symbol, interval = '5', from, to) {
        // Dhan historical API: interval = 1, 5, 15, 25, 60, D
        const toDate = to ? new Date(to) : new Date();
        const fromDate = from ? new Date(from) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

        try {
            const data = await this._request('/charts/historical', 'POST', {
                symbol: symbol,
                exchangeSegment: 'NSE_EQ',
                instrument: 'EQUITY',
                expiryCode: 0,
                fromDate: fromDate.toISOString().split('T')[0],
                toDate: toDate.toISOString().split('T')[0]
            });
            return data;
        } catch (e) {
            throw new Error(`Historical data failed: ${e.message}`);
        }
    }

    async placeOrder(order) {
        // Map to Dhan order format
        // Docs: https://dhanhq.co/docs/v2/orders/
        const dhanOrder = {
            dhanClientId: this.clientId,
            transactionType: order.side, // BUY or SELL
            exchangeSegment: 'NSE_EQ',
            productType: order.product === 'CNC' ? 'CNC' : 'INTRADAY',
            orderType: order.orderType || 'MARKET', // MARKET, LIMIT, STOP_LOSS, etc
            validity: 'DAY',
            securityId: await this._getSecurityId(order.symbol), // Need to map symbol to securityId
            quantity: order.quantity,
            price: order.price || 0,
            // For SL orders
            triggerPrice: order.triggerPrice || 0,
            afterMarketOrder: false,
            amoTime: 'OPEN'
        };

        // If we don't have securityId mapping, try direct symbol (some versions support)
        if (!dhanOrder.securityId) {
            dhanOrder.tradingSymbol = order.symbol;
        }

        try {
            const result = await this._request('/orders', 'POST', dhanOrder);
            console.log(`[DhanBroker] ${order.side} ${order.quantity} ${order.symbol} - Order ID: ${result.orderId}`);
            return {
                orderId: result.orderId,
                status: result.orderStatus || 'PENDING',
                message: 'Order placed successfully'
            };
        } catch (e) {
            // Fallback: log and simulate if securityId issue (for demo)
            console.error(`[DhanBroker] Order failed: ${e.message}`);
            throw e;
        }
    }

    async _getSecurityId(symbol) {
        // In production, you need to download Dhan security list CSV
        // https://images.dhan.co/api-data/api-scrip-master.csv
        // For now, return null and let API handle tradingSymbol
        // This is a simplified version - you should implement CSV lookup
        return null;
    }

    async getOrderStatus(orderId) {
        try {
            const data = await this._request(`/orders/${orderId}`, 'GET');
            return data;
        } catch (e) {
            throw new Error(`Get order status failed: ${e.message}`);
        }
    }

    async getOrders() {
        try {
            const data = await this._request('/orders', 'GET');
            return data;
        } catch (e) {
            throw new Error(`Get orders failed: ${e.message}`);
        }
    }

    async getPositions() {
        try {
            const data = await this._request('/positions', 'GET');
            return data.map(p => ({
                symbol: p.tradingSymbol,
                quantity: p.netQty,
                avgPrice: p.buyAvg || p.sellAvg,
                ltp: p.ltp,
                pnl: p.unrealizedProfit,
                product: p.productType,
                exchange: 'NSE'
            }));
        } catch (e) {
            throw new Error(`Get positions failed: ${e.message}`);
        }
    }

    async getFunds() {
        try {
            const data = await this._request('/funds', 'GET');
            return {
                available: data.availableBalance || data.withdrawableBalance,
                used: data.utilizedAmount,
                total: data.availableBalance + data.utilizedAmount,
                raw: data
            };
        } catch (e) {
            throw new Error(`Get funds failed: ${e.message}`);
        }
    }

    async getHoldings() {
        try {
            const data = await this._request('/holdings', 'GET');
            return data;
        } catch (e) {
            throw new Error(`Get holdings failed: ${e.message}`);
        }
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = DhanBroker;
}
if (typeof window !== 'undefined') {
    window.DhanBroker = DhanBroker;
}
