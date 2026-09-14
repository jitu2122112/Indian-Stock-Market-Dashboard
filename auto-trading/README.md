# 🤖 Auto-Trading System for Indian Stock Market

> Automatically detect market opportunities, analyze with indicators, place orders, and exit as per target/stop-loss.

## ❓ Is it possible with Groww?

**Short answer: Yes, but not officially with Groww.**

### Groww Reality Check (2026)

| Broker | Official Trading API | Free | Algo Allowed |
|--------|---------------------|------|--------------|
| **Groww** | ❌ No public API | - | Not officially supported |
| **Zerodha (Kite Connect)** | ✅ Yes | Paid ₹2000/mo | Yes |
| **Angel One (SmartAPI)** | ✅ Yes | Free | Yes |
| **DhanHQ** | ✅ Yes | Free | Yes - Best for beginners |
| **Upstox** | ✅ Yes | Free | Yes |
| **Alice Blue** | ✅ Yes | Free | Yes |

**Groww does NOT provide an official public trading API for retail algo trading.** What Groww web/app uses is an internal private API.

### Your 3 Options for Groww

#### Option 1: Browser Automation (Works but Risky) ⚠️
Use Playwright/Selenium to automate Groww website login and order placement.

**Pros:** Works with existing Groww account
**Cons:**
- Breaks when Groww changes UI
- Requires handling OTP/2FA every time
- Against Groww ToS (could get account flagged)
- Needs your machine running 9:15-3:30
- No official support

See: `brokers/groww-broker.js` (educational implementation)

#### Option 2: Unofficial Groww API (Not Recommended) ⚠️
Reverse-engineer the internal API calls from Groww web app.

**Pros:** Faster than browser automation
**Cons:**
- Token expires quickly
- No documentation, breaks often
- Violates ToS
- Security risk

#### Option 3: Use Broker with Official API (RECOMMENDED) ✅
Keep Groww for investments, open Dhan/Angel One for auto-trading. They offer:
- Free API
- Official support
- Stable, documented
- SEBI compliant
- Same stocks, same NSE

**This repo implements Option 3 by default with a mock broker for paper trading.**

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│  Frontend Dashboard (index.html + auto-trading.js)      │
│  - Strategy selector (RSI, EMA, Breakout, Supertrend)  │
│  - Risk config (capital, risk%, target, SL)             │
│  - Paper/Live toggle                                    │
│  - Start/Stop bot, live logs                            │
└──────────────────┬──────────────────────────────────────┘
                   │ REST + WebSocket
┌──────────────────▼──────────────────────────────────────┐
│  Backend Engine (backend/node/server.js OR python)      │
│  ┌─────────────┐ ┌──────────────┐ ┌─────────────────┐  │
│  │Market Data  │→│Strategy Engine│→│Risk Manager     │  │
│  │(LiveData)   │ │(strategies.js)│ │(risk-manager.js)│  │
│  └─────────────┘ └──────────────┘ └─────────────────┘  │
│                              │                          │
│                    ┌─────────▼─────────┐                │
│                    │ Broker Adapter    │                │
│                    │ - Mock (paper)    │                │
│                    │ - DhanHQ (free)   │                │
│                    │ - Zerodha         │                │
│                    │ - Angel One       │                │
│                    │ - Groww (playwright)│              │
│                    └───────────────────┘                │
│                              │                          │
│                    ┌─────────▼─────────┐                │
│                    │ Order Monitor     │                │
│                    │ - Target hit?     │                │
│                    │ - SL hit?         │                │
│                    │ - Trailing SL     │                │
│                    │ - Time exit 3:15  │                │
│                    └───────────────────┘                │
└─────────────────────────────────────────────────────────┘
```

## 🚀 Quick Start - Paper Trading (Safe, No Real Money)

This works immediately, no API keys needed.

1. Open dashboard:
```bash
cd Indian-Stock-Market-Dashboard
python -m http.server 8000
# open http://localhost:8000
```

2. Go to new section: **🤖 Auto Trading** in sidebar

3. Configure:
- Mode: Paper Trading (default)
- Capital: ₹1,00,000
- Risk per trade: 1%
- Strategy: EMA Crossover / RSI / Breakout
- Stocks: RELIANCE, TCS, INFY etc

4. Click **Start Bot**

Bot will:
- Fetch live prices every 30s (via live-data.js)
- Run strategy (e.g., RSI < 30 = Buy signal)
- Calculate quantity based on risk
- Place **virtual order** (mock broker)
- Monitor target/SL
- Auto-exit and log P&L

## 🔌 Connecting Real Broker (DhanHQ Example - Free)

### Step 1: Get Dhan API Credentials
1. Open Dhan account (free): https://dhan.co
2. Go to My Profile → DhanHQ Trading API
3. Generate Access Token + Client ID

### Step 2: Configure Backend
```bash
cd backend/node
npm install
cp .env.example .env
# edit .env:
# BROKER=DHAN
# DHAN_CLIENT_ID=your_client_id
# DHAN_ACCESS_TOKEN=your_token
# MODE=LIVE (or PAPER)

npm start
# Server runs on http://localhost:3001
```

### Step 3: Dashboard Auto-Connects
Frontend will detect backend at localhost:3001 and show "Live Trading Connected"

## 📊 Supported Strategies

| Strategy | Logic | Best For |
|----------|-------|----------|
| **RSI Reversal** | Buy when RSI < 30, Sell when >70 | Range-bound markets |
| **EMA Crossover** | 9 EMA crosses above 21 EMA = Buy | Trending markets |
| **Breakout** | Price breaks above 20-day high + volume spike | High momentum |
| **Supertrend** | Price above Supertrend = Buy | Intraday trend following |
| **VWAP + RSI** | Price > VWAP + RSI 50-70 = Buy | Institutional flow |

You can combine multiple: e.g., Breakout + RSI filter + Volume > 1L

## 🛡️ Risk Management (Built-in)

- **Max risk per trade**: 1% of capital (configurable)
- **Max daily loss**: Auto-stops bot if daily loss > 2% (e.g., ₹2000 on ₹1L)
- **Max positions**: 3 concurrent trades (avoid overtrading)
- **Position sizing**: Auto-calculated: `qty = riskAmount / (entry - SL)`
- **Risk-Reward**: Minimum 1:2 enforced
- **Time exit**: Auto-square off at 3:15 PM IST
- **Trailing SL**: Optional 0.5% trailing

## 📝 Example: Full Auto Trade Flow

```
09:15 - Market opens, bot starts scanning NSE universe
09:32 - RELIANCE: Price ₹2525 breaks above yesterday high ₹2510 + RSI 62 + Volume 1.5x
        → Strategy: BUY signal, confidence 78%
        → Risk manager: Capital ₹1L, Risk 1% = ₹1000, SL = ₹2500 (₹25 risk)
        → Qty = 1000/25 = 40 shares, Money needed = ₹1,01,000
        → Places order via broker API: BUY 40 RELIANCE @ ₹2525
09:32 - Order placed, ID: DHAN12345, monitoring...
10:15 - RELIANCE hits ₹2575 (Target 1 - 1.5R) → Book 50% profit
10:45 - RELIANCE hits ₹2600 (Target 2 - 3R) → Book remaining 50%
        → P&L: +₹3000, Daily P&L: +₹3000
        → Or if SL hit: Sell @ ₹2500, Loss ₹1000, continue scanning

15:15 - Auto square-off all open positions
15:30 - Market closes, bot stops, generates daily report
```

## ⚠️ Legal & SEBI Compliance

1. **Algo trading is allowed** in India via approved broker APIs (SEBI circular)
2. **You must use official broker API**, not screen scraping for live trading
3. **Groww automation via browser is grey area** - use at own risk, keep it personal, not commercial
4. **This is educational** - not SEBI registered advice
5. **Always paper trade first** for 2-4 weeks before live
6. **Keep logs** - SEBI may require audit trail if you scale

## 🔧 Files

- `broker-interface.js` - Abstract broker class
- `brokers/mock-broker.js` - Paper trading (no real money)
- `brokers/dhan-broker.js` - DhanHQ (recommended, free)
- `brokers/zerodha-broker.js` - Zerodha Kite Connect
- `brokers/angel-broker.js` - Angel One SmartAPI
- `brokers/groww-broker.js` - Groww browser automation (educational)
- `strategies.js` - All trading strategies
- `risk-manager.js` - Position sizing, daily loss limits
- `engine.js` - Main loop
- `config.js` - Configuration

Backend:
- `backend/node/server.js` - Node.js execution server
- `backend/python/app.py` - Python FastAPI alternative

Frontend:
- `auto-trading.js` - Dashboard integration
- `auto-trading.css` - Styles

## 🆘 Troubleshooting

**Q: Can I fully automate Groww without manual login?**
A: No, Groww requires OTP every login. Browser automation can semi-automate but you still need to enter OTP. That's why Dhan/Zerodha with API tokens are better - token lasts longer.

**Q: Will my Groww account get blocked?**
A: If you use official API brokers, no. If you scrape Groww aggressively, possible. Use low frequency (1 request/30s) and don't share credentials.

**Q: Do I need to keep laptop on?**
A: Yes for this local setup. For 24/7, deploy backend to VPS (AWS, DigitalOcean) or use broker's hosted algo (Dhan has TradingView webhook).

**Q: Minimum capital?**
A: Paper trading: ₹0. Live: ₹10k-₹50k recommended to handle position sizing.

## 📚 Next Steps

1. Test paper trading for 1 week in dashboard
2. Read DhanHQ API docs: https://dhanhq.co/docs/v2/
3. Start with 1 stock, 1 strategy, small quantity
4. Add more stocks/strategies after consistent profit in paper mode
5. Consider VPS for reliability

---

**Made for Indian retail traders - Start safe with paper trading!**
