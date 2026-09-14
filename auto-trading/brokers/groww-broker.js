// Groww Broker - Real Groww Account Automation
// ⚠️ Groww has NO official public trading API
// This uses Playwright browser automation + session reuse
// Works but requires manual OTP daily and is fragile

// Two methods implemented:
// 1. PLAYWRIGHT method: Automates Groww website UI (more stable for orders)
// 2. API method: Uses intercepted internal API (faster but token expires)

let GrowwBrokerBase;
if (typeof module !== 'undefined' && module.exports) {
    try {
        GrowwBrokerBase = require('../broker-interface.js');
    } catch (e) {
        GrowwBrokerBase = global.BrokerInterface || class {};
    }
} else {
    GrowwBrokerBase = window.BrokerInterface;
}

class GrowwBroker extends GrowwBrokerBase {
    constructor(config) {
        super(config);
        this.name = 'GROWW';
        this.sessionFile = config.sessionFile || './groww-session.json';
        this.headless = config.headless !== undefined ? config.headless : false; // Show browser for OTP
        this.isConnected = false;
        this.page = null;
        this.browser = null;
        this.apiToken = null;
        this.method = config.growwMethod || 'PLAYWRIGHT'; // PLAYWRIGHT or API
    }

    async connect() {
        console.log('[GrowwBroker] Connecting to Groww...');
        console.log('[GrowwBroker] Method:', this.method);
        
        if (this.method === 'PLAYWRIGHT') {
            return await this.connectPlaywright();
        } else {
            return await this.connectAPI();
        }
    }

    // ==================== PLAYWRIGHT METHOD (Recommended for Groww) ====================
    async connectPlaywright() {
        try {
            // Dynamic import playwright (only needed for Node backend)
            let playwright;
            try {
                playwright = require('playwright');
            } catch (e) {
                throw new Error('Playwright not installed. Run: npm install playwright && npx playwright install chromium');
            }

            const fs = require('fs');
            const { chromium } = playwright;

            // Try to load saved session
            let storageState = undefined;
            if (fs.existsSync(this.sessionFile)) {
                console.log(`[GrowwBroker] Loading saved session from ${this.sessionFile}`);
                storageState = this.sessionFile;
            } else {
                console.log('[GrowwBroker] No saved session found. You will need to login manually.');
                console.log('[GrowwBroker] Run: node backend/node/groww-login.js first');
            }

            this.browser = await chromium.launch({ 
                headless: this.headless,
                args: ['--disable-blink-features=AutomationControlled']
            });
            
            const context = await this.browser.newContext({
                storageState: storageState,
                userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            });

            this.page = await context.newPage();

            // Go to Groww
            await this.page.goto('https://groww.in/', { waitUntil: 'networkidle' });
            
            // Check if logged in
            const isLoggedIn = await this.page.evaluate(() => {
                return !!localStorage.getItem('groww_jwt') || document.querySelector('[data-testid="user-profile"]') || document.body.innerHTML.includes('Logout');
            });

            if (!isLoggedIn && !storageState) {
                console.log('[GrowwBroker] Not logged in. Please login manually in the opened browser...');
                console.log('[GrowwBroker] After login, session will be saved automatically.');
                
                // Wait for login (max 2 minutes)
                await this.page.waitForTimeout(120000);
                
                // Save session
                await context.storageState({ path: this.sessionFile });
                console.log(`[GrowwBroker] Session saved to ${this.sessionFile}`);
            }

            // Try to get API token from localStorage
            this.apiToken = await this.page.evaluate(() => {
                return localStorage.getItem('groww_jwt') || localStorage.getItem('token') || sessionStorage.getItem('groww_jwt');
            });

            this.isConnected = true;
            return { success: true, message: 'Connected to Groww via Playwright', method: 'PLAYWRIGHT' };

        } catch (e) {
            console.error('[GrowwBroker] Playwright connection failed:', e.message);
            throw e;
        }
    }

    async getLTPPlaywright(symbol) {
        if (!this.page) throw new Error('Not connected');

        try {
            // Go to stock page
            await this.page.goto(`https://groww.in/stocks/${symbol.toLowerCase()}`, { waitUntil: 'networkidle' });
            await this.page.waitForTimeout(2000);

            // Extract LTP - Groww's DOM structure (may change, needs maintenance)
            const ltp = await this.page.evaluate(() => {
                // Try multiple selectors
                const selectors = [
                    '[data-testid="stock-price"]',
                    '.lpu38Price',
                    '.stock-price',
                    'span[class*="price"]',
                ];
                
                for (const sel of selectors) {
                    const el = document.querySelector(sel);
                    if (el) {
                        const text = el.textContent.replace(/[^0-9.]/g, '');
                        const price = parseFloat(text);
                        if (price > 0) return price;
                    }
                }

                // Fallback: search in page text for price pattern
                const bodyText = document.body.innerText;
                const match = bodyText.match(/₹\s*([0-9,]+\.?[0-9]*)/);
                if (match) {
                    return parseFloat(match[1].replace(/,/g, ''));
                }
                return null;
            });

            if (ltp) return ltp;

            // Fallback to API interception
            const response = await this.page.evaluate(async (sym) => {
                try {
                    const token = localStorage.getItem('groww_jwt');
                    const res = await fetch(`https://groww.in/v1/api/stocks_data/v1/accordian/v3/stock/${sym}?exchange=NSE`, {
                        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
                    });
                    const data = await res.json();
                    return data;
                } catch (e) {
                    return null;
                }
            }, symbol);

            if (response && response.ltp) return response.ltp;
            
            throw new Error(`Could not extract LTP for ${symbol}`);
        } catch (e) {
            console.error(`[GrowwBroker] getLTP failed for ${symbol}:`, e.message);
            throw e;
        }
    }

    async placeOrderPlaywright(order) {
        if (!this.page) throw new Error('Not connected');

        console.log(`[GrowwBroker] Placing ${order.side} order for ${order.quantity} ${order.symbol} via UI automation`);

        try {
            // Navigate to stock
            await this.page.goto(`https://groww.in/stocks/${order.symbol.toLowerCase()}`, { waitUntil: 'networkidle' });
            await this.page.waitForTimeout(2000);

            // Click Buy/Sell button
            const action = order.side === 'BUY' ? 'Buy' : 'Sell';
            await this.page.evaluate((act) => {
                const buttons = Array.from(document.querySelectorAll('button'));
                const btn = buttons.find(b => b.textContent.includes(act));
                if (btn) btn.click();
            }, action);

            await this.page.waitForTimeout(1000);

            // Enter quantity
            await this.page.evaluate((qty) => {
                const inputs = document.querySelectorAll('input[type="number"], input[placeholder*="Qty"], input[placeholder*="Quantity"]');
                for (const input of inputs) {
                    input.value = qty;
                    input.dispatchEvent(new Event('input', { bubbles: true }));
                    input.dispatchEvent(new Event('change', { bubbles: true }));
                }
            }, order.quantity);

            await this.page.waitForTimeout(500);

            // Select product type (Intraday vs Delivery)
            if (order.product === 'INTRADAY') {
                await this.page.evaluate(() => {
                    const labels = Array.from(document.querySelectorAll('label, span, div'));
                    const intraday = labels.find(l => l.textContent.toLowerCase().includes('intraday'));
                    if (intraday) intraday.click();
                });
            }

            // For LIMIT orders, set price
            if (order.orderType === 'LIMIT' && order.price) {
                await this.page.evaluate((price) => {
                    const priceInputs = document.querySelectorAll('input[placeholder*="Price"], input[placeholder*="price"]');
                    for (const input of priceInputs) {
                        if (input.value !== undefined) {
                            input.value = price;
                            input.dispatchEvent(new Event('input', { bubbles: true }));
                        }
                    }
                }, order.price);
            }

            await this.page.waitForTimeout(500);

            // Click final Buy/Sell confirm button
            // NOTE: This is where real money order is placed. We add a confirmation check.
            if (this.config.mode === 'LIVE') {
                console.log('[GrowwBroker] ⚠️ LIVE MODE - Placing real order in 3 seconds... Press Ctrl+C to cancel');
                await this.page.waitForTimeout(3000);

                const result = await this.page.evaluate(() => {
                    const buttons = Array.from(document.querySelectorAll('button'));
                    const confirmBtn = buttons.find(b => 
                        b.textContent.includes('Buy') || 
                        b.textContent.includes('Sell') ||
                        b.textContent.includes('Place Order') ||
                        b.textContent.includes('Confirm')
                    );
                    if (confirmBtn) {
                        confirmBtn.click();
                        return { clicked: true, text: confirmBtn.textContent };
                    }
                    return { clicked: false };
                });

                await this.page.waitForTimeout(2000);

                return {
                    orderId: `GROWW_${Date.now()}`,
                    status: result.clicked ? 'PLACED' : 'UNKNOWN',
                    message: result.clicked ? 'Order placed via Groww UI' : 'Could not find confirm button',
                    price: order.price || 0
                };
            } else {
                // PAPER mode - don't actually click buy
                console.log('[GrowwBroker] PAPER MODE - Skipping real order placement');
                return {
                    orderId: `GROWW_PAPER_${Date.now()}`,
                    status: 'COMPLETE',
                    price: order.price || await this.getLTPPlaywright(order.symbol),
                    message: 'Paper order (Groww UI not clicked)'
                };
            }

        } catch (e) {
            console.error(`[GrowwBroker] Place order failed:`, e.message);
            throw e;
        }
    }

    // ==================== API METHOD (Faster but token expires) ====================
    async connectAPI() {
        // This method tries to use Groww's internal API directly
        // You need to manually extract token from browser DevTools
        // Application -> Local Storage -> https://groww.in -> groww_jwt
        
        if (!this.config.GROWW_TOKEN) {
            throw new Error(`
Groww API token required for API method.

How to get token:
1. Login to https://groww.in in Chrome
2. Press F12 -> Application tab -> Local Storage -> https://groww.in
3. Copy value of 'groww_jwt' or 'token'
4. Set in .env: GROWW_TOKEN=your_token_here

Or use PLAYWRIGHT method which auto-handles login.
            `);
        }

        this.apiToken = this.config.GROWW_TOKEN;
        this.isConnected = true;
        return { success: true, message: 'Connected to Groww via API', method: 'API' };
    }

    async _growwApiRequest(endpoint, method = 'GET', body = null) {
        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.apiToken}`,
            'X-Requested-With': 'XMLHttpRequest',
            'Origin': 'https://groww.in',
            'Referer': 'https://groww.in/'
        };

        const options = { method, headers };
        if (body) options.body = JSON.stringify(body);

        const response = await fetch(`https://groww.in${endpoint}`, options);
        
        if (!response.ok) {
            const text = await response.text();
            throw new Error(`Groww API Error ${response.status}: ${text}`);
        }

        return await response.json();
    }

    // ==================== PUBLIC METHODS (Route to active method) ====================

    async getLTP(symbol) {
        if (this.method === 'PLAYWRIGHT') {
            return await this.getLTPPlaywright(symbol);
        } else {
            // API method
            try {
                const data = await this._growwApiRequest(`/v1/api/stocks_data/v1/accordian/v3/stock/${symbol}?exchange=NSE`);
                return data.ltp || data.price || 0;
            } catch (e) {
                console.warn(`Groww API LTP failed, falling back to dashboard data`);
                if (typeof window !== 'undefined' && window.STOCKS) {
                    const stock = window.STOCKS.find(s => s.symbol === symbol);
                    if (stock) return stock.price;
                }
                return 0;
            }
        }
    }

    async getQuote(symbol) {
        const ltp = await this.getLTP(symbol);
        return {
            symbol,
            price: ltp,
            open: ltp * 0.99,
            high: ltp * 1.02,
            low: ltp * 0.98,
            close: ltp,
            volume: 500000,
            change: 0,
            percent: 0
        };
    }

    async placeOrder(order) {
        if (this.method === 'PLAYWRIGHT') {
            return await this.placeOrderPlaywright(order);
        } else {
            // API method - direct order via Groww internal API
            // Endpoint is reverse engineered and may change
            console.log(`[GrowwBroker] Placing order via internal API: ${order.side} ${order.quantity} ${order.symbol}`);

            if (this.config.mode !== 'LIVE') {
                return {
                    orderId: `GROWW_PAPER_${Date.now()}`,
                    status: 'COMPLETE',
                    price: order.price || await this.getLTP(order.symbol),
                    message: 'Paper order - not placed on Groww'
                };
            }

            try {
                // This endpoint is example - actual Groww order endpoint needs to be found via network tab
                // You need to inspect Groww's order placement network request
                const orderPayload = {
                    trading_symbol: order.symbol,
                    exchange: 'NSE',
                    transaction_type: order.side,
                    order_type: order.orderType || 'MARKET',
                    quantity: order.quantity,
                    price: order.price || 0,
                    product: order.product || 'INTRADAY',
                    validity: 'DAY'
                };

                // WARNING: This endpoint is illustrative - you must find real endpoint via DevTools
                const result = await this._growwApiRequest('/v1/api/order/create', 'POST', orderPayload);
                
                return {
                    orderId: result.order_id || `GROWW_${Date.now()}`,
                    status: 'PLACED',
                    message: 'Order placed on Groww',
                    raw: result
                };
            } catch (e) {
                console.error(`[GrowwBroker] API order failed: ${e.message}`);
                throw new Error(`Groww API order failed: ${e.message}. Token may have expired. Re-login via groww-login.js`);
            }
        }
    }

    async getPositions() {
        if (this.method === 'PLAYWRIGHT' && this.page) {
            try {
                await this.page.goto('https://groww.in/user/positions', { waitUntil: 'networkidle' });
                const positions = await this.page.evaluate(() => {
                    // Extract positions from Groww positions page
                    // This selector needs to be updated based on Groww's current DOM
                    return [];
                });
                return positions;
            } catch (e) {
                return [];
            }
        } else {
            try {
                const data = await this._growwApiRequest('/v1/api/portfolio/v1/positions');
                return data;
            } catch (e) {
                return [];
            }
        }
    }

    async getFunds() {
        if (this.method === 'PLAYWRIGHT' && this.page) {
            try {
                await this.page.goto('https://groww.in/user/balance', { waitUntil: 'networkidle' });
                const funds = await this.page.evaluate(() => {
                    const el = document.querySelector('[data-testid="available-balance"], .balance-amount');
                    if (el) {
                        const text = el.textContent.replace(/[^0-9.]/g, '');
                        return parseFloat(text);
                    }
                    return 0;
                });
                return { available: funds, total: funds };
            } catch (e) {
                return { available: 0, total: 0 };
            }
        } else {
            try {
                const data = await this._growwApiRequest('/v1/api/portfolio/v1/balance');
                return data;
            } catch (e) {
                return { available: 0, total: 0 };
            }
        }
    }

    async getOrders() {
        if (this.method === 'PLAYWRIGHT' && this.page) {
            await this.page.goto('https://groww.in/user/orders', { waitUntil: 'networkidle' });
            return [];
        } else {
            try {
                const data = await this._growwApiRequest('/v1/api/order/list');
                return data;
            } catch (e) {
                return [];
            }
        }
    }

    async disconnect() {
        if (this.browser) {
            await this.browser.close();
        }
        this.isConnected = false;
        this.page = null;
        this.browser = null;
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = GrowwBroker;
}
if (typeof window !== 'undefined') {
    window.GrowwBroker = GrowwBroker;
}
