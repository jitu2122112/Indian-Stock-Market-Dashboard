// Auto Trading Frontend - Dashboard Integration
// Handles UI for real auto trading with Groww/Dhan

class AutoTradingUI {
    constructor() {
        this.backendUrl = 'http://localhost:3001';
        this.ws = null;
        this.isRunning = false;
        this.logs = [];
        this.trades = [];
        this.config = null;
        this.positions = [];
        this.isBackendConnected = false;
    }

    async init() {
        console.log('[AutoTradingUI] Initializing...');
        
        // Try to connect to backend
        await this.checkBackend();
        
        // Setup UI
        this.setupEventListeners();
        this.loadConfig();
        
        // Connect WebSocket if backend available
        if (this.isBackendConnected) {
            this.connectWebSocket();
        }
        
        // Start local paper trading engine if no backend
        if (!this.isBackendConnected) {
            console.log('[AutoTradingUI] No backend, starting local paper engine');
            this.initLocalEngine();
        }

        // Update UI every 2 seconds
        setInterval(() => this.updateUI(), 2000);
    }

    async checkBackend() {
        try {
            const response = await fetch(`${this.backendUrl}/api/health`, { 
                method: 'GET',
                headers: { 'Content-Type': 'application/json' }
            });
            
            if (response.ok) {
                const data = await response.json();
                this.isBackendConnected = true;
                this.isRunning = data.running;
                console.log('[AutoTradingUI] Backend connected:', data);
                this.showToast(`Backend connected: ${data.broker} (${data.mode})`, 'success');
                return true;
            }
        } catch (e) {
            console.log('[AutoTradingUI] Backend not available, using local mock mode');
            this.isBackendConnected = false;
        }
        
        return false;
    }

    connectWebSocket() {
        try {
            const wsUrl = this.backendUrl.replace('http', 'ws') + '/ws';
            this.ws = new WebSocket(wsUrl);

            this.ws.onopen = () => {
                console.log('[AutoTradingUI] WebSocket connected');
                this.showToast('Live trading connected', 'success');
            };

            this.ws.onmessage = (event) => {
                try {
                    const msg = JSON.parse(event.data);
                    this.handleWebSocketMessage(msg);
                } catch (e) {
                    console.error('WS parse error:', e);
                }
            };

            this.ws.onclose = () => {
                console.log('[AutoTradingUI] WebSocket disconnected');
                setTimeout(() => this.connectWebSocket(), 5000);
            };

            this.ws.onerror = (error) => {
                console.error('[AutoTradingUI] WebSocket error:', error);
            };

        } catch (e) {
            console.error('[AutoTradingUI] WebSocket connection failed:', e);
        }
    }

    handleWebSocketMessage(msg) {
        switch (msg.type) {
            case 'STATUS':
                this.isRunning = msg.data.running;
                this.updateUI();
                break;
            case 'LOG':
                this.addLog(msg.data);
                break;
            case 'TRADE':
                this.addTrade(msg.data);
                break;
        }
    }

    initLocalEngine() {
        // Local paper trading engine using existing dashboard data
        console.log('[AutoTradingUI] Initializing local paper engine');
        
        // Load config from localStorage or default
        const savedConfig = localStorage.getItem('autoTradingConfig');
        if (savedConfig) {
            try {
                this.config = JSON.parse(savedConfig);
            } catch (e) {
                this.config = this.getDefaultConfig();
            }
        } else {
            this.config = this.getDefaultConfig();
        }

        // Initialize mock broker and engine if available
        if (typeof MockBroker !== 'undefined' && typeof RiskManager !== 'undefined' && typeof AutoTradingEngine !== 'undefined') {
            const broker = new MockBroker(this.config);
            const riskManager = new RiskManager(this.config);
            this.localEngine = new AutoTradingEngine(this.config, broker, riskManager);
            
            this.localEngine.onLog = (log) => this.addLog(log);
            this.localEngine.onTrade = (trade) => this.addTrade(trade);
            this.localEngine.onStatusUpdate = (status) => {
                this.isRunning = status.running;
                this.updateUI();
            };

            console.log('[AutoTradingUI] Local engine ready');
        }
    }

    getDefaultConfig() {
        return {
            mode: 'PAPER',
            broker: 'MOCK',
            capital: 100000,
            riskPerTrade: 1,
            maxDailyLoss: 2,
            maxPositions: 3,
            maxTradesPerDay: 10,
            customSymbols: ['RELIANCE', 'TCS', 'INFY', 'HDFCBANK', 'ICICIBANK', 'SBIN', 'BHARTIARTL', 'ITC', 'LT', 'MARUTI'],
            activeStrategies: ['COMBINED'],
            scanInterval: 30000,
            productType: 'INTRADAY',
            useTrailingSL: true,
            trailingSLPercent: 0.5
        };
    }

    setupEventListeners() {
        // Start/Stop buttons
        const startBtn = document.getElementById('auto-start-btn');
        const stopBtn = document.getElementById('auto-stop-btn');
        
        if (startBtn) {
            startBtn.addEventListener('click', () => this.startTrading());
        }
        
        if (stopBtn) {
            stopBtn.addEventListener('click', () => this.stopTrading());
        }

        // Config save
        const saveConfigBtn = document.getElementById('save-auto-config');
        if (saveConfigBtn) {
            saveConfigBtn.addEventListener('click', () => this.saveConfig());
        }

        // Square off
        const squareOffBtn = document.getElementById('square-off-all');
        if (squareOffBtn) {
            squareOffBtn.addEventListener('click', () => this.squareOffAll());
        }

        // Groww connect
        const growwConnectBtn = document.getElementById('connect-groww-btn');
        if (growwConnectBtn) {
            growwConnectBtn.addEventListener('click', () => this.connectGroww());
        }

        // Dhan connect
        const dhanConnectBtn = document.getElementById('connect-dhan-btn');
        if (dhanConnectBtn) {
            dhanConnectBtn.addEventListener('click', () => this.connectDhan());
        }
    }

    async startTrading() {
        this.showToast('Starting auto trading...', 'info');

        if (this.isBackendConnected) {
            try {
                const response = await fetch(`${this.backendUrl}/api/start`, { method: 'POST' });
                const result = await response.json();
                
                if (result.success) {
                    this.isRunning = true;
                    this.showToast('Auto trading started!', 'success');
                } else {
                    this.showToast(`Failed to start: ${result.message}`, 'error');
                }
            } catch (e) {
                this.showToast(`Backend error: ${e.message}`, 'error');
            }
        } else {
            // Local engine
            if (this.localEngine) {
                try {
                    await this.localEngine.start();
                    this.isRunning = true;
                    this.showToast('Paper trading started (local)', 'success');
                } catch (e) {
                    this.showToast(`Failed to start: ${e.message}`, 'error');
                }
            } else {
                this.showToast('Trading engine not loaded', 'error');
            }
        }

        this.updateUI();
    }

    async stopTrading() {
        this.showToast('Stopping auto trading...', 'info');

        if (this.isBackendConnected) {
            try {
                const response = await fetch(`${this.backendUrl}/api/stop`, { method: 'POST' });
                const result = await response.json();
                
                if (result.success) {
                    this.isRunning = false;
                    this.showToast('Auto trading stopped', 'success');
                }
            } catch (e) {
                this.showToast(`Backend error: ${e.message}`, 'error');
            }
        } else {
            if (this.localEngine) {
                await this.localEngine.stop();
                this.isRunning = false;
                this.showToast('Paper trading stopped', 'success');
            }
        }

        this.updateUI();
    }

    async squareOffAll() {
        if (!confirm('Square off all positions? This will close all open trades.')) return;

        if (this.isBackendConnected) {
            try {
                const response = await fetch(`${this.backendUrl}/api/square-off`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({})
                });
                const result = await response.json();
                this.showToast('All positions squared off', 'success');
                this.updatePositions();
            } catch (e) {
                this.showToast(`Square off failed: ${e.message}`, 'error');
            }
        } else {
            if (this.localEngine && this.localEngine.broker) {
                await this.localEngine.broker.squareOffAll();
                this.showToast('All paper positions squared off', 'success');
            }
        }
    }

    async connectGroww() {
        const modal = document.getElementById('modal');
        const modalTitle = document.getElementById('modal-title');
        const modalBody = document.getElementById('modal-body');
        
        if (!modal || !modalTitle || !modalBody) return;

        modalTitle.textContent = '🔗 Connect Groww Account - Real Auto Trading';
        modalBody.innerHTML = `
            <div class="groww-connect-modal">
                <div class="alert alert-warning">
                    <strong>⚠️ Groww has NO official API</strong><br>
                    We use browser automation to link your Groww account. This works but requires daily login with OTP.
                    For best experience, we recommend Dhan (free official API).
                </div>

                <h3>Option 1: Playwright Automation (Recommended for Groww)</h3>
                <p>This opens a browser, you login manually once, session is saved for auto trading.</p>
                <div class="code-block">
                    <code>
                    cd backend/node<br>
                    npm install<br>
                    npx playwright install chromium<br>
                    npm run groww-login<br>
                    # Login in opened browser, press ENTER<br>
                    npm start
                    </code>
                </div>

                <h3>Option 2: API Token Method</h3>
                <p>Extract token from browser DevTools:</p>
                <ol>
                    <li>Login to <a href="https://groww.in" target="_blank">groww.in</a> in Chrome</li>
                    <li>Press F12 → Application tab → Local Storage → https://groww.in</li>
                    <li>Copy <code>groww_jwt</code> value</li>
                    <li>Paste below and save to .env</li>
                </ol>

                <div class="form-group">
                    <label>Groww JWT Token (keep secret!)</label>
                    <input type="password" id="groww-token-input" placeholder="Paste your groww_jwt token here" style="width: 100%; padding: 10px; margin: 5px 0;">
                    <button class="btn btn-secondary" onclick="document.getElementById('groww-token-input').type = document.getElementById('groww-token-input').type === 'password' ? 'text' : 'password'">👁️ Show/Hide</button>
                </div>

                <div class="form-group">
                    <label>Trading Mode</label>
                    <select id="groww-mode-select" style="width: 100%; padding: 10px;">
                        <option value="PAPER">PAPER - No real money (test first)</option>
                        <option value="LIVE">LIVE - Real money (real orders on Groww)</option>
                    </select>
                </div>

                <div class="alert alert-info">
                    <strong>💡 Recommendation:</strong><br>
                    1. Start with PAPER mode to test strategy<br>
                    2. Then switch to LIVE with small capital (₹5k-10k)<br>
                    3. Monitor first few trades manually<br>
                    4. For production, use DhanHQ (free, official, stable)
                </div>

                <button class="btn btn-primary" onclick="window.autoTradingUI.saveGrowwConfig()" style="width: 100%; margin-top: 15px;">
                    💾 Save Groww Config & Connect
                </button>

                <h3 style="margin-top: 30px;">Why Dhan is Better for Auto Trading?</h3>
                <table style="width: 100%; border-collapse: collapse; margin: 10px 0;">
                    <tr style="background: #f5f5f5;"><th style="padding: 8px; border: 1px solid #ddd;">Feature</th><th style="padding: 8px; border: 1px solid #ddd;">Groww</th><th style="padding: 8px; border: 1px solid #ddd;">DhanHQ</th></tr>
                    <tr><td style="padding: 8px; border: 1px solid #ddd;">Official API</td><td style="padding: 8px; border: 1px solid #ddd;">❌ No</td><td style="padding: 8px; border: 1px solid #ddd;">✅ Yes, Free</td></tr>
                    <tr><td style="padding: 8px; border: 1px solid #ddd;">Stability</td><td style="padding: 8px; border: 1px solid #ddd;">⚠️ Fragile, breaks on UI change</td><td style="padding: 8px; border: 1px solid #ddd;">✅ Stable</td></tr>
                    <tr><td style="padding: 8px; border: 1px solid #ddd;">OTP Required</td><td style="padding: 8px; border: 1px solid #ddd;">Daily OTP needed</td><td style="padding: 8px; border: 1px solid #ddd;">Token valid for long</td></tr>
                    <tr><td style="padding: 8px; border: 1px solid #ddd;">SEBI Compliant</td><td style="padding: 8px; border: 1px solid #ddd;">⚠️ Grey area</td><td style="padding: 8px; border: 1px solid #ddd;">✅ Fully compliant</td></tr>
                </table>
            </div>
        `;

        modal.classList.add('active');
    }

    async connectDhan() {
        const modal = document.getElementById('modal');
        const modalTitle = document.getElementById('modal-title');
        const modalBody = document.getElementById('modal-body');
        
        if (!modal || !modalTitle || !modalBody) return;

        modalTitle.textContent = '🔗 Connect Dhan Account - Free Official API';
        modalBody.innerHTML = `
            <div class="dhan-connect-modal">
                <div class="alert alert-success">
                    <strong>✅ DhanHQ is Recommended for Auto Trading</strong><br>
                    Free, official, stable, SEBI compliant. Same stocks as Groww.
                </div>

                <h3>Step 1: Open Dhan Account (Free, 5 mins)</h3>
                <p>Go to <a href="https://dhan.co" target="_blank">https://dhan.co</a> and open account if you don't have one.</p>

                <h3>Step 2: Get API Credentials</h3>
                <ol>
                    <li>Login to Dhan → My Profile → DhanHQ Trading APIs</li>
                    <li>Click "Generate Token" or "Create New Token"</li>
                    <li>Copy Client ID and Access Token</li>
                </ol>

                <div class="form-group">
                    <label>Dhan Client ID</label>
                    <input type="text" id="dhan-client-id" placeholder="Your Dhan Client ID" style="width: 100%; padding: 10px; margin: 5px 0;">
                </div>

                <div class="form-group">
                    <label>Dhan Access Token</label>
                    <input type="password" id="dhan-access-token" placeholder="Your Dhan Access Token" style="width: 100%; padding: 10px; margin: 5px 0;">
                    <button class="btn btn-secondary" onclick="document.getElementById('dhan-access-token').type = document.getElementById('dhan-access-token').type === 'password' ? 'text' : 'password'">👁️ Show/Hide</button>
                </div>

                <div class="form-group">
                    <label>Trading Mode</label>
                    <select id="dhan-mode-select" style="width: 100%; padding: 10px;">
                        <option value="PAPER">PAPER - Test without real money</option>
                        <option value="LIVE">LIVE - Real trading with real money</option>
                    </select>
                </div>

                <button class="btn btn-primary" onclick="window.autoTradingUI.saveDhanConfig()" style="width: 100%; margin-top: 15px;">
                    💾 Save & Connect Dhan
                </button>

                <div class="alert alert-info" style="margin-top: 20px;">
                    <strong>📚 Dhan API Docs:</strong> <a href="https://dhanhq.co/docs/v2/" target="_blank">https://dhanhq.co/docs/v2/</a><br>
                    <strong>Free Tier:</strong> Unlimited orders, no monthly fee<br>
                    <strong>After connecting:</strong> Backend will auto-connect and you can start trading
                </div>
            </div>
        `;

        modal.classList.add('active');
    }

    saveGrowwConfig() {
        const token = document.getElementById('groww-token-input')?.value;
        const mode = document.getElementById('groww-mode-select')?.value || 'PAPER';

        if (!token) {
            this.showToast('Please enter Groww token or use Playwright method', 'warning');
            return;
        }

        // Save to localStorage for frontend
        localStorage.setItem('groww_token', token);
        localStorage.setItem('trading_mode', mode);
        localStorage.setItem('broker', 'GROWW');

        this.showToast('Groww config saved! Now setup backend: cd backend/node && set GROWW_TOKEN in .env', 'success');
        
        // Close modal
        document.getElementById('modal')?.classList.remove('active');
        
        // Show instructions
        this.showToast('For real Groww trading, you MUST run backend/node server', 'info');
    }

    saveDhanConfig() {
        const clientId = document.getElementById('dhan-client-id')?.value;
        const accessToken = document.getElementById('dhan-access-token')?.value;
        const mode = document.getElementById('dhan-mode-select')?.value || 'PAPER';

        if (!clientId || !accessToken) {
            this.showToast('Please enter both Client ID and Access Token', 'error');
            return;
        }

        localStorage.setItem('dhan_client_id', clientId);
        localStorage.setItem('dhan_access_token', accessToken);
        localStorage.setItem('trading_mode', mode);
        localStorage.setItem('broker', 'DHAN');

        this.showToast('Dhan config saved! Setup backend with these credentials', 'success');
        document.getElementById('modal')?.classList.remove('active');
    }

    saveConfig() {
        const capital = parseFloat(document.getElementById('auto-capital')?.value) || 100000;
        const risk = parseFloat(document.getElementById('auto-risk')?.value) || 1;
        const maxPositions = parseInt(document.getElementById('auto-max-positions')?.value) || 3;
        const strategy = document.getElementById('auto-strategy')?.value || 'COMBINED';
        const symbolsInput = document.getElementById('auto-symbols')?.value || 'RELIANCE,TCS,INFY,HDFCBANK,ICICIBANK';
        const symbols = symbolsInput.split(',').map(s => s.trim().toUpperCase()).filter(Boolean);

        this.config = {
            ...this.getDefaultConfig(),
            capital,
            riskPerTrade: risk,
            maxPositions,
            activeStrategies: [strategy],
            customSymbols: symbols
        };

        localStorage.setItem('autoTradingConfig', JSON.stringify(this.config));

        if (this.isBackendConnected) {
            fetch(`${this.backendUrl}/api/config`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(this.config)
            }).then(() => {
                this.showToast('Config saved to backend', 'success');
            });
        } else {
            // Update local engine
            if (this.localEngine) {
                this.localEngine.config = this.config;
            }
            this.showToast('Config saved locally', 'success');
        }

        this.updateUI();
    }

    loadConfig() {
        const saved = localStorage.getItem('autoTradingConfig');
        if (saved) {
            try {
                this.config = JSON.parse(saved);
                
                // Update UI fields
                const capitalEl = document.getElementById('auto-capital');
                const riskEl = document.getElementById('auto-risk');
                const maxPosEl = document.getElementById('auto-max-positions');
                const strategyEl = document.getElementById('auto-strategy');
                const symbolsEl = document.getElementById('auto-symbols');
                
                if (capitalEl) capitalEl.value = this.config.capital;
                if (riskEl) riskEl.value = this.config.riskPerTrade;
                if (maxPosEl) maxPosEl.value = this.config.maxPositions;
                if (strategyEl) strategyEl.value = this.config.activeStrategies[0];
                if (symbolsEl) symbolsEl.value = this.config.customSymbols.join(',');
            } catch (e) {
                console.error('Failed to load config:', e);
            }
        }
    }

    addLog(logEntry) {
        this.logs.push(logEntry);
        if (this.logs.length > 100) this.logs.shift();

        const logsContainer = document.getElementById('auto-logs');
        if (logsContainer) {
            const logEl = document.createElement('div');
            logEl.className = `log-entry log-${logEntry.level.toLowerCase()}`;
            logEl.innerHTML = `
                <span class="log-time">${new Date(logEntry.timestamp).toLocaleTimeString()}</span>
                <span class="log-level">${logEntry.level}</span>
                <span class="log-message">${logEntry.message}</span>
            `;
            logsContainer.prepend(logEl);
            
            // Keep only 50 visible
            while (logsContainer.children.length > 50) {
                logsContainer.removeChild(logsContainer.lastChild);
            }
        }
    }

    addTrade(trade) {
        this.trades.push(trade);
        
        const tradesContainer = document.getElementById('auto-trades');
        if (tradesContainer) {
            const tradeEl = document.createElement('div');
            tradeEl.className = 'trade-entry';
            
            if (trade.type === 'ORDER_PLACED') {
                tradeEl.innerHTML = `
                    <div class="trade-header">
                        <span class="trade-symbol">${trade.symbol}</span>
                        <span class="trade-side ${trade.signal?.signal?.toLowerCase() || 'buy'}">${trade.signal?.signal || trade.side || 'BUY'}</span>
                        <span class="trade-time">${new Date(trade.timestamp).toLocaleTimeString()}</span>
                    </div>
                    <div class="trade-details">
                        Qty: ${trade.quantity} @ ₹${trade.signal?.entry?.toFixed(2) || 'MARKET'} | 
                        SL: ₹${trade.signal?.stopLoss?.toFixed(2)} | 
                        Target: ₹${trade.signal?.target?.toFixed(2)} |
                        Conf: ${trade.signal?.confidence || 0}%
                    </div>
                `;
            } else if (trade.type === 'ORDER_EXITED') {
                const pnlClass = trade.pnl >= 0 ? 'positive' : 'negative';
                tradeEl.innerHTML = `
                    <div class="trade-header">
                        <span class="trade-symbol">${trade.symbol}</span>
                        <span class="trade-pnl ${pnlClass}">₹${trade.pnl.toFixed(2)}</span>
                        <span class="trade-time">${new Date(trade.timestamp).toLocaleTimeString()}</span>
                    </div>
                    <div class="trade-details">
                        Entry: ₹${trade.entry.toFixed(2)} → Exit: ₹${trade.exit.toFixed(2)} | 
                        Qty: ${trade.quantity} | 
                        Reason: ${trade.reason}
                    </div>
                `;
            }
            
            tradesContainer.prepend(tradeEl);
        }

        this.updateStats();
    }

    async updatePositions() {
        const positionsContainer = document.getElementById('auto-positions');
        if (!positionsContainer) return;

        try {
            let positions = [];
            
            if (this.isBackendConnected) {
                const response = await fetch(`${this.backendUrl}/api/positions`);
                positions = await response.json();
            } else if (this.localEngine && this.localEngine.broker) {
                positions = await this.localEngine.broker.getPositions();
            }

            this.positions = positions;

            if (positions.length === 0) {
                positionsContainer.innerHTML = '<div class="empty-state">No open positions</div>';
                return;
            }

            positionsContainer.innerHTML = positions.map(pos => `
                <div class="position-card">
                    <div class="position-header">
                        <span class="position-symbol">${pos.symbol}</span>
                        <span class="position-qty">${pos.quantity > 0 ? '+' : ''}${pos.quantity}</span>
                    </div>
                    <div class="position-details">
                        <div>Avg: ₹${pos.avgPrice?.toFixed(2) || 0}</div>
                        <div>LTP: ₹${pos.ltp?.toFixed(2) || 0}</div>
                        <div class="position-pnl ${(pos.pnl || 0) >= 0 ? 'positive' : 'negative'}">
                            P&L: ₹${(pos.pnl || 0).toFixed(2)}
                        </div>
                    </div>
                    <button class="btn btn-small btn-danger" onclick="window.autoTradingUI.squareOffSymbol('${pos.symbol}')">Square Off</button>
                </div>
            `).join('');

        } catch (e) {
            console.error('Failed to update positions:', e);
        }
    }

    async squareOffSymbol(symbol) {
        if (!confirm(`Square off ${symbol}?`)) return;

        if (this.isBackendConnected) {
            try {
                await fetch(`${this.backendUrl}/api/square-off`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ symbol })
                });
                this.showToast(`${symbol} squared off`, 'success');
            } catch (e) {
                this.showToast(`Failed: ${e.message}`, 'error');
            }
        } else {
            if (this.localEngine && this.localEngine.activeOrders.has(symbol)) {
                const orderInfo = this.localEngine.activeOrders.get(symbol);
                const ltp = await this.localEngine.broker.getLTP(symbol);
                await this.localEngine.exitPosition(symbol, ltp, 'Manual square off');
                this.showToast(`${symbol} squared off (paper)`, 'success');
            }
        }
    }

    updateStats() {
        const totalPnl = this.trades
            .filter(t => t.type === 'ORDER_EXITED')
            .reduce((sum, t) => sum + (t.pnl || 0), 0);
        
        const winningTrades = this.trades.filter(t => t.type === 'ORDER_EXITED' && t.pnl > 0).length;
        const losingTrades = this.trades.filter(t => t.type === 'ORDER_EXITED' && t.pnl < 0).length;
        const totalTrades = winningTrades + losingTrades;
        const winRate = totalTrades > 0 ? (winningTrades / totalTrades * 100).toFixed(1) : 0;

        const totalPnlEl = document.getElementById('auto-total-pnl');
        const winRateEl = document.getElementById('auto-win-rate');
        const tradesCountEl = document.getElementById('auto-trades-count');
        const openPositionsEl = document.getElementById('auto-open-positions');

        if (totalPnlEl) {
            totalPnlEl.textContent = `₹${totalPnl.toFixed(2)}`;
            totalPnlEl.className = `stat-value ${totalPnl >= 0 ? 'positive' : 'negative'}`;
        }
        if (winRateEl) winRateEl.textContent = `${winRate}%`;
        if (tradesCountEl) tradesCountEl.textContent = totalTrades;
        if (openPositionsEl) openPositionsEl.textContent = this.positions.length;
    }

    updateUI() {
        const statusEl = document.getElementById('auto-status');
        const startBtn = document.getElementById('auto-start-btn');
        const stopBtn = document.getElementById('auto-stop-btn');
        const backendStatusEl = document.getElementById('backend-status');

        if (statusEl) {
            statusEl.textContent = this.isRunning ? '🟢 RUNNING' : '🔴 STOPPED';
            statusEl.className = `auto-status ${this.isRunning ? 'running' : 'stopped'}`;
        }

        if (startBtn) startBtn.disabled = this.isRunning;
        if (stopBtn) stopBtn.disabled = !this.isRunning;

        if (backendStatusEl) {
            if (this.isBackendConnected) {
                backendStatusEl.innerHTML = '🟢 Backend Connected (Real Trading Ready)';
                backendStatusEl.className = 'backend-status connected';
            } else {
                backendStatusEl.innerHTML = '🟡 Local Paper Mode (No backend - install backend for real Groww trading)';
                backendStatusEl.className = 'backend-status local';
            }
        }

        this.updatePositions();
        this.updateStats();
    }

    showToast(message, type = 'info') {
        // Use existing showToast if available
        if (typeof window.showToast === 'function') {
            window.showToast(message, type);
        } else {
            console.log(`[Toast][${type}] ${message}`);
            // Fallback toast
            const toast = document.getElementById('toast');
            if (toast) {
                toast.textContent = message;
                toast.className = `toast ${type} show`;
                setTimeout(() => toast.classList.remove('show'), 4000);
            }
        }
    }
}

// Initialize when DOM ready
if (typeof window !== 'undefined') {
    window.autoTradingUI = new AutoTradingUI();
    
    // Auto-init when auto-trading section is shown
    const originalShowSection = window.showSection;
    if (originalShowSection) {
        window.showSection = function(sectionId) {
            originalShowSection(sectionId);
            if (sectionId === 'auto-trading' && window.autoTradingUI) {
                setTimeout(() => window.autoTradingUI.init(), 500);
            }
        };
    }

    // Also init on load if auto-trading section exists
    document.addEventListener('DOMContentLoaded', () => {
        if (document.getElementById('auto-trading')) {
            // Don't auto-init, wait for user to click section
            console.log('[AutoTradingUI] Ready - click Auto Trading section to start');
        }
    });
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = AutoTradingUI;
}
