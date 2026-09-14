# 🤖 REAL Auto Trading with Groww Account - Complete Guide

> **Yes, it's possible!** This guide shows you how to link your Groww account and have bot auto-analyze market, place orders, and auto-exit.

---

## 🎯 What You Asked For

> "I will link my grow account and it is analysis everything and place the order and then exit as per research"

**We built it!** Here's what the bot does:

```
09:15 AM - Market opens
09:16 AM - Bot scans your stocks (RELIANCE, TCS, INFY...)
09:16 AM - Runs 5 strategies: RSI, EMA Crossover, Breakout, Supertrend, VWAP
09:17 AM - Finds: RELIANCE breaks ₹2525 with 78% confidence, volume 1.5x
09:17 AM - Risk check: Capital ₹1L, Risk 1% = ₹1000, SL ₹2500 (₹25 risk)
09:17 AM - Calculates: Qty = 1000/25 = 40 shares
09:17 AM - Places order: BUY 40 RELIANCE @ ₹2525 on YOUR Groww account
09:17 AM - Monitors: Checks LTP every 5 seconds
10:30 AM - Target hit: ₹2575 (1.5R) → Sells 50%
11:00 AM - Target hit: ₹2600 (3R) → Sells remaining
11:00 AM - P&L: +₹3000, logs trade, scans for next opportunity
15:15 PM - Auto squares off all open positions
```

---

## ⚠️ Groww Reality Check

**Groww does NOT have official public trading API** like Zerodha or Dhan.

| Broker | Official API | Free? | Auto Trading |
|--------|--------------|-------|--------------|
| **Groww** | ❌ No | - | Via browser automation (works but needs daily OTP) |
| **DhanHQ** | ✅ Yes | Free, unlimited | ✅ Best for auto trading |
| **Zerodha** | ✅ Yes | Paid ₹2000/mo | ✅ Good |
| **Angel One** | ✅ Yes | Free | ✅ Good |

### So how to automate Groww?

We built **2 methods for Groww**:

#### Method 1: Playwright Browser Automation (Works with your existing Groww account)
- Opens real Chrome browser
- You login manually with OTP (once per day)
- Session saved to `groww-session.json`
- Bot uses saved session to place orders via automating Groww website clicks
- **Pros:** Works with your existing Groww balance
- **Cons:** Needs OTP daily, fragile if Groww changes UI

#### Method 2: DhanHQ (Recommended for serious auto trading)
- Open Dhan account (free, 5 mins, same stocks as Groww)
- Get free API token from Dhan website
- Bot uses official API - stable, no OTP daily, SEBI compliant
- **Pros:** Free, stable, official, token lasts long
- **Cons:** Need to transfer some capital to Dhan (but you can keep Groww for investments)

**We recommend: Keep Groww for long-term investments, use Dhan for auto trading.**

---

## 🚀 Quick Start - 3 Options

### Option A: Instant Paper Trading (No account linking, test now)

Works immediately in browser, no backend needed.

1. Open dashboard:
```bash
cd Indian-Stock-Market-Dashboard
python -m http.server 8000
# Open http://localhost:8000
```

2. Click **🤖 Auto Trading** in sidebar (NEW)

3. Configure:
- Capital: ₹100000
- Risk: 1%
- Strategy: COMBINED (best)
- Stocks: RELIANCE,TCS,INFY...

4. Click **▶️ Start Bot**

Bot will paper trade using mock broker. No real money. Perfect for testing.

### Option B: Real Trading with Groww (Your Groww Account)

Link your actual Groww account for real orders.

**Step 1: Setup backend**
```bash
cd backend/node
npm install
npx playwright install chromium
```

**Step 2: Login to Groww (first time only)**
```bash
npm run groww-login
# Browser opens → Login to Groww with phone + OTP → Wait for dashboard → Press ENTER in terminal
# Session saved to groww-session.json
```

**Step 3: Configure .env**
```bash
cp .env.example .env
# Edit .env:
BROKER=GROWW
MODE=PAPER  # Test first with PAPER, then LIVE
GROWW_METHOD=PLAYWRIGHT
GROWW_SESSION_FILE=./groww-session.json
```

**Step 4: Start backend**
```bash
npm start
# Server runs on http://localhost:3001
# Dashboard auto-connects and shows "Backend Connected"
```

**Step 5: Start trading in dashboard**
- Go to http://localhost:8000 → Auto Trading
- Should show "🟢 Backend Connected (Real Trading Ready)"
- Configure and click Start Bot
- In PAPER mode: Bot simulates but doesn't place real orders
- In LIVE mode: Bot places REAL orders on your Groww account!

### Option C: Real Trading with Dhan (Recommended, Free API)

Most stable for real auto trading.

**Step 1: Get Dhan API credentials (5 mins)**
1. Open Dhan account: https://dhan.co (free)
2. Login → My Profile → DhanHQ Trading APIs → Generate Token
3. Copy Client ID and Access Token

**Step 2: Setup backend**
```bash
cd backend/node
npm install
cp .env.example .env
# Edit .env:
BROKER=DHAN
MODE=PAPER  # Test first
DHAN_CLIENT_ID=your_client_id
DHAN_ACCESS_TOKEN=your_token
npm start
```

**Step 3: Start trading**
Same as Groww - dashboard will show backend connected, start bot.

---

## 🛡️ Safety Features (Built-in)

We built strong risk management so you don't lose big:

- **1% risk per trade**: On ₹1L capital, max loss ₹1000 per trade
- **2% daily loss limit**: If you lose ₹2000 in a day, bot auto-stops
- **Max 3 positions**: Avoids overtrading
- **Max 10 trades/day**: Quality over quantity
- **Risk-Reward 1:2 minimum**: Only takes trades where profit potential is 2x loss
- **Auto square off 3:15 PM**: Closes all positions before market close
- **Trailing SL 0.5%**: Locks profit as price moves in your favor
- **No new trades after 2:30 PM**: Avoids last minute volatility
- **Consecutive loss halt**: If 3 losses in a row, bot stops (prevents revenge trading)

---

## 📊 Strategies Explained

Bot runs these 5 strategies and combines them:

| Strategy | Logic | When it Works |
|----------|-------|---------------|
| **RSI Reversal** | RSI <30 = Oversold = Buy, RSI >70 = Overbought = Sell | Range-bound markets |
| **EMA Crossover** | 9 EMA crosses above 21 EMA = Uptrend = Buy | Trending markets |
| **Breakout** | Price breaks 20-day high + volume spike = Buy | High momentum days |
| **Supertrend** | Price above Supertrend = Buy | Intraday trend following |
| **VWAP + RSI** | Price > VWAP + RSI 50-70 = Institutional buying = Buy | Follows big players |
| **COMBINED** | All 5 vote, if 3+ say BUY = Strong BUY | Best overall, recommended |

You can select one or COMBINED (all vote) in dashboard.

---

## 🔧 Configuration Guide

In dashboard → Auto Trading → Configuration:

- **Capital**: Your total trading capital (e.g., ₹100000)
- **Risk Per Trade**: % of capital you risk per trade (1% recommended)
  - Example: ₹1L capital, 1% risk = ₹1000 max loss per trade
  - If SL is ₹25 away, qty = 1000/25 = 40 shares
- **Max Positions**: How many stocks at once (3 recommended for beginners)
- **Strategy**: Which strategy to use (COMBINED recommended)
- **Stocks**: Which stocks to scan (comma separated, e.g., RELIANCE,TCS,INFY)

---

## 📱 Dashboard Walkthrough

When you click **🤖 Auto Trading** section:

1. **Top**: Backend status (🟢 Connected = Real trading ready, 🟡 Local = Paper only)
2. **Bot Status**: RUNNING/STOPPED + Start/Stop/Square Off buttons
3. **Stats**: Total P&L, Win Rate, Total Trades, Open Positions
4. **Link Broker**: Cards to link Groww or Dhan
5. **Configure**: Capital, risk, strategy, stocks
6. **Open Positions**: Live positions with LTP and P&L, Square Off button per position
7. **Trades History**: All trades with entry, exit, P&L, reason
8. **Live Logs**: Real-time bot logs (scanning, signals, orders)
9. **Backend Setup Guide**: Instructions for real Groww trading

---

## 🎯 Example Trade Flow (Real Groww)

```
09:15:00 - Bot started, scanning 10 stocks
09:15:30 - Scanning... RELIANCE ₹2520, TCS ₹3850, INFY ₹1450...
09:16:00 - RELIANCE: RSI 62, 9EMA ₹2510 > 21EMA ₹2500, Volume 1.5x avg, Price near 20-day high ₹2510
09:16:00 - Combined signal: BUY 78% confidence - "Breakout above 20-day high + volume spike + uptrend"
09:16:00 - Risk check: OK (Daily P&L ₹0, 0 positions, 0 trades today)
09:16:00 - Position size: Entry ₹2525, SL ₹2500 (₹25 risk), Risk ₹1000 → Qty 40
09:16:00 - Placing order: BUY 40 RELIANCE @ ₹2525 on Groww...
09:16:05 - Order placed: Order ID GROWW_12345, status PLACED
09:16:05 - Monitoring: Entry ₹2525, SL ₹2500, Target ₹2575 (1.5R), ₹2600 (3R), Trailing SL 0.5%
09:30:00 - RELIANCE LTP ₹2540, P&L +₹600, trailing SL updated to ₹2527 (locks ₹2 profit)
10:00:00 - RELIANCE LTP ₹2575, Target 1 hit! P&L +₹2000
10:00:05 - Selling 20 shares @ ₹2575 (50% profit booking), remaining 20 with SL at cost
10:45:00 - RELIANCE LTP ₹2600, Target 2 hit! Selling remaining 20 @ ₹2600, P&L +₹1500
10:45:00 - Trade closed: Total P&L +₹3500, Daily P&L +₹3500
10:45:00 - Scanning for next opportunity...
15:15:00 - Auto square off time, closing all open positions
15:30:00 - Market closed, bot stopped, daily report: 1 trade, +₹3500, 100% win rate
```

---

## ⚠️ Important Disclaimers

1. **This is educational, not SEBI registered advice**
2. **Trading involves risk of loss** - You can lose money
3. **Groww automation via browser is grey area** - Use at own risk, personal use only
4. **For commercial algo, use official broker API (Dhan/Zerodha)**
5. **Always paper trade for 2-4 weeks before live**
6. **Start LIVE with small capital (₹5k-10k)**
7. **Keep logs for audit** - SEBI may require if you scale
8. **Bot needs laptop on 9:15-3:30** - For 24/7, deploy to VPS (AWS/DigitalOcean)

---

## 🆘 Troubleshooting

**Q: Can I fully automate Groww without OTP daily?**
A: No. Groww requires OTP every login for security. Playwright saves session but expires daily. That's why Dhan is better - token lasts longer.

**Q: Will Groww block my account?**
A: If you use low frequency (1 request/30s) and personal use, unlikely. But if you spam 100 requests/sec, possible. Use official API brokers for production.

**Q: Bot not placing real orders on Groww?**
A: Check:
1. Did you run `npm run groww-login` and login?
2. Is `groww-session.json` created?
3. Is .env BROKER=GROWW and MODE=LIVE?
4. Is backend running (npm start)?
5. Dashboard shows "Backend Connected"?

**Q: Do I need to keep laptop on?**
A: Yes for local setup. For VPS: Deploy backend to AWS/DigitalOcean, run 24/7.

**Q: Minimum capital?**
A: Paper: ₹0. Live: ₹10k-₹50k recommended.

**Q: Can I use for F&O?**
A: Current bot is for equity intraday. F&O needs different order types (we can add).

---

## 📚 Next Steps

1. **Test paper trading** for 1 week in dashboard (no backend needed)
2. **Read DhanHQ docs**: https://dhanhq.co/docs/v2/
3. **Start with 1 stock, 1 strategy, small qty**
4. **Add more after consistent profit in paper mode**
5. **Consider VPS for reliability**

---

## 🎉 You're Ready!

You now have:
- ✅ Real auto trading engine that scans, analyzes, buys, exits
- ✅ Groww linking via Playwright (real orders on your Groww)
- ✅ DhanHQ support (free, official, recommended)
- ✅ 5 strategies + combined voting
- ✅ Full risk management
- ✅ Live dashboard with logs, P&L, positions
- ✅ Paper trading to test safely

**Start with paper trading today, then link Groww/Dhan for real auto trading!**

---

**Made for Indian retail traders - Trade safe! 📈**
