// Risk Manager - Protects capital, calculates position sizing

// For Node.js compatibility
let ConfigDefaults; // renamed: avoid top-level clash with config.js (const AutoTradingConfig)
if (typeof module !== 'undefined' && module.exports) {
    try {
        ConfigDefaults = require('./config.js');
    } catch (e) {
        ConfigDefaults = {};
    }
}

class RiskManager {
    constructor(config) {
        this.config = config;
        this.dailyPnl = 0;
        this.tradesToday = 0;
        this.consecutiveLosses = 0;
        this.maxConsecutiveLosses = config.maxConsecutiveLosses || 3;
        this.dailyLossLimit = (config.capital * config.maxDailyLoss) / 100;
        this.isHalted = false;
        this.haltReason = null;
        this.positions = new Map();
    }

    // Calculate position size based on risk
    calculatePositionSize(entry, stopLoss, capital) {
        const riskAmount = (capital * this.config.riskPerTrade) / 100;
        const riskPerShare = Math.abs(entry - stopLoss);
        
        if (riskPerShare <= 0) {
            console.warn('[RiskManager] Invalid risk per share, using 1% of price');
            return Math.floor((capital * 0.1) / entry); // 10% of capital
        }

        let quantity = Math.floor(riskAmount / riskPerShare);
        
        // Cap by max allocation (25% of capital per trade)
        const maxAllocation = capital * 0.25;
        const maxQtyByAllocation = Math.floor(maxAllocation / entry);
        quantity = Math.min(quantity, maxQtyByAllocation);
        
        // At least 1 share
        quantity = Math.max(1, quantity);
        
        return quantity;
    }

    // Check if we can take new trade
    canTakeTrade(signal, stock) {
        // Check if halted
        if (this.isHalted) {
            return { allowed: false, reason: `Trading halted: ${this.haltReason}` };
        }

        // Check max positions
        if (this.positions.size >= this.config.maxPositions) {
            return { allowed: false, reason: `Max positions (${this.config.maxPositions}) reached` };
        }

        // Check max trades per day
        if (this.tradesToday >= this.config.maxTradesPerDay) {
            return { allowed: false, reason: `Max trades per day (${this.config.maxTradesPerDay}) reached` };
        }

        // Check daily loss limit
        if (this.dailyPnl <= -this.dailyLossLimit) {
            this.isHalted = true;
            this.haltReason = `Daily loss limit hit: ₹${this.dailyPnl.toFixed(2)} <= -₹${this.dailyLossLimit}`;
            return { allowed: false, reason: this.haltReason };
        }

        // Check consecutive losses
        if (this.consecutiveLosses >= this.maxConsecutiveLosses) {
            this.isHalted = true;
            this.haltReason = `${this.consecutiveLosses} consecutive losses`;
            return { allowed: false, reason: this.haltReason };
        }

        // Check if already have position in this stock
        if (this.positions.has(stock.symbol)) {
            return { allowed: false, reason: `Already have position in ${stock.symbol}` };
        }

        // Check risk-reward
        const risk = Math.abs(signal.entry - signal.stopLoss);
        const reward = Math.abs(signal.target - signal.entry);
        const riskReward = reward / risk;

        if (riskReward < this.config.minRiskReward) {
            return { allowed: false, reason: `Risk-Reward ${riskReward.toFixed(2)} < minimum ${this.config.minRiskReward}` };
        }

        // Check confidence
        if (signal.confidence < 60) {
            return { allowed: false, reason: `Low confidence ${signal.confidence}% < 60%` };
        }

        // Check time - no new trades after cutoff
        const now = new Date();
        const istTime = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
        const hours = istTime.getHours();
        const minutes = istTime.getMinutes();
        const currentMinutes = hours * 60 + minutes;
        
        const cutoffParts = this.config.noNewTradesAfter.split(':');
        const cutoffMinutes = parseInt(cutoffParts[0]) * 60 + parseInt(cutoffParts[1]);
        
        if (currentMinutes >= cutoffMinutes) {
            return { allowed: false, reason: `No new trades after ${this.config.noNewTradesAfter} IST` };
        }

        return { allowed: true, reason: 'OK' };
    }

    // Register new position
    addPosition(symbol, position) {
        this.positions.set(symbol, position);
        this.tradesToday++;
    }

    // Remove position and update PnL
    removePosition(symbol, pnl) {
        this.positions.delete(symbol);
        this.dailyPnl += pnl;
        
        if (pnl < 0) {
            this.consecutiveLosses++;
        } else {
            this.consecutiveLosses = 0;
        }

        console.log(`[RiskManager] Position closed: ${symbol}, PnL: ₹${pnl.toFixed(2)}, Daily PnL: ₹${this.dailyPnl.toFixed(2)}`);
    }

    // Update daily PnL from unrealized
    updateUnrealizedPnl(positions) {
        // This is for monitoring, not for halting (only realized counts for halt)
        let unrealized = 0;
        positions.forEach(pos => {
            unrealized += pos.pnl || 0;
        });
        return this.dailyPnl + unrealized;
    }

    // Check if should square off (time based)
    shouldSquareOff() {
        const now = new Date();
        const istTime = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
        const hours = istTime.getHours();
        const minutes = istTime.getMinutes();
        const currentMinutes = hours * 60 + minutes;
        
        const squareOffParts = this.config.autoSquareOff.split(':');
        const squareOffMinutes = parseInt(squareOffParts[0]) * 60 + parseInt(squareOffParts[1]);
        
        return currentMinutes >= squareOffMinutes;
    }

    // Check if market is open
    isMarketOpen() {
        const now = new Date();
        // Use IST
        const istTime = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
        const day = istTime.getDay(); // 0 = Sunday, 6 = Saturday
        const hours = istTime.getHours();
        const minutes = istTime.getMinutes();
        const currentMinutes = hours * 60 + minutes;

        // Weekend
        if (day === 0 || day === 6) return false;

        const startParts = this.config.marketStart.split(':');
        const startMinutes = parseInt(startParts[0]) * 60 + parseInt(startParts[1]);
        
        const endParts = this.config.marketEnd.split(':');
        const endMinutes = parseInt(endParts[0]) * 60 + parseInt(endParts[1]);

        return currentMinutes >= startMinutes && currentMinutes <= endMinutes;
    }

    // Reset daily (call at start of new day)
    resetDaily() {
        this.dailyPnl = 0;
        this.tradesToday = 0;
        this.consecutiveLosses = 0;
        this.isHalted = false;
        this.haltReason = null;
        this.positions.clear();
        console.log('[RiskManager] Daily reset done');
    }

    // Get status
    getStatus() {
        return {
            dailyPnl: this.dailyPnl,
            tradesToday: this.tradesToday,
            consecutiveLosses: this.consecutiveLosses,
            isHalted: this.isHalted,
            haltReason: this.haltReason,
            openPositions: this.positions.size,
            dailyLossLimit: this.dailyLossLimit,
            remainingLoss: this.dailyLossLimit + this.dailyPnl, // negative means buffer left
            canTrade: !this.isHalted && this.tradesToday < this.config.maxTradesPerDay
        };
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = RiskManager;
}
if (typeof window !== 'undefined') {
    window.RiskManager = RiskManager;
}
