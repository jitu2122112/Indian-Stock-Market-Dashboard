# 🇮🇳 Indian Stock Market Live Dashboard

**A Complete Trading Platform for Beginners with Live Data, Intraday Signals, and Expert Guidance**

---

## 🎯 **What This Dashboard Offers**

This is a **complete, production-ready** Indian stock market dashboard designed specifically for **beginners** who want to:

✅ **Track live market data** (NIFTY 50, SENSEX, NIFTY Bank)
✅ **Get intraday trading signals** with entry, target, and stop loss
✅ **Analyze stocks** with technical indicators (RSI, MACD, Moving Averages, Bollinger Bands)
✅ **Screen stocks** based on your criteria (sector, price, volume, RSI, etc.)
✅ **Create a watchlist** to track your favorite stocks
✅ **Learn trading** with comprehensive tutorials and guides
✅ **Manage risk** with proper position sizing and stop loss rules

---

## 🚀 **Quick Start (3 Steps)**

### **Step 1: Open the Dashboard**
1. Go to the `indian-trading-dashboard` folder
2. Double-click `index.html`
3. The dashboard opens in your browser!

**OR use a local server (recommended):**
```bash
cd indian-trading-dashboard
python -m http.server 8000
```
Then open `http://localhost:8000` in your browser.

### **Step 2: Explore the Dashboard**
- **Dashboard**: Live market overview with NIFTY, SENSEX, top gainers/losers
- **Intraday Signals**: Live buy/sell signals with entry, target, stop loss
- **Stock Screener**: Filter stocks based on your criteria
- **Technical Analysis**: Interactive charts with indicators
- **My Watchlist**: Track your favorite stocks
- **Learning Center**: Complete beginner's guide to trading

### **Step 3: Start Learning & Trading**
1. Go to **Learning Center** → Complete the tutorials
2. Check **Intraday Signals** for trading opportunities
3. Use **Stock Screener** to find stocks matching your criteria
4. Add stocks to **My Watchlist** to track them
5. Use **Technical Analysis** to analyze stocks before trading

---

## 📊 **Dashboard Features in Detail**

### **🏠 Live Dashboard**
- **Real-time Market Overview**: NIFTY 50, SENSEX, NIFTY Bank prices with live updates
- **Market Mood Indicator**: Visual representation of bullish/bearish sentiment
- **Top Gainers & Losers**: See which stocks are moving the most
- **Sector Performance**: Bar chart showing which sectors are performing best
- **Market Heatmap**: Visual representation of market strength across sectors
- **FII & DII Activity**: Track foreign and domestic institutional investor flows
- **Market Statistics**: Advances, declines, unchanged stocks

### **⚡ Full-NSE Intraday Scan (static / GitHub Pages)**
- **Two-stage screen**: snapshots the official NSE EQ directory when available, applies the ₹20 and 1,00,000-share liquidity rules, then fetches daily history for the top 15 candidates.
- **Actionable plan display**: the highest-ranked setup shows entry, 1.5R / 3R targets, a max-0.8% or 0.75-ATR stop, confidence, reasons, suggested quantity and money needed. Runners-up and the Top 10 open full plans in the modal.
- **No backend or required key**: Stooq batch CSV is the primary public source; Yahoo Finance through rotating public CORS relays and an optional Twelve Data key are fallbacks. The official NSE list is cached per IST day in localStorage.
- **Resilient labels**: if public data cannot be reached, the UI explicitly switches to a curated 28-stock/demo fallback instead of claiming a full-market scan. Curated prices refresh every 60 seconds; full scans run about six seconds after loading and every 15 minutes during NSE hours.
- **Important**: public quotes can be delayed by roughly 1–15 minutes. This is a rule-based educational screen, **not SEBI-registered investment advice**; verify prices and risk before trading.

### **🎯 Intraday Trading Signals**
- **Live Signals**: Real-time buy/sell signals with:
  - **Entry Price**: Where to buy/sell
  - **Target**: Profit-taking level
  - **Stop Loss**: Loss-limiting level
  - **Risk Level**: Low, Medium, High
  - **Confidence**: Signal strength (0-100%)
  - **Time**: When the signal was generated
- **Signal History**: Track past signals and their performance
- **Performance Metrics**: Win rate, average return, total signals
- **Filters**: Filter signals by type, risk, sector, timeframe

### **🔍 Stock Screener**
- **Search Stocks**: Find stocks by name or symbol
- **Sector Filter**: IT, Banking, Pharma, FMCG, Energy, Auto, Metal, Telecom
- **Market Cap Filter**: Large, Mid, Small cap
- **Price Range**: Filter by price range
- **RSI Range**: Find overbought/oversold stocks
- **Volume Filter**: High, Medium, Low volume stocks
- **Trend Filter**: Bullish or Bearish trends
- **Signal Filter**: Buy, Sell, Strong Buy, Strong Sell
- **Pattern Filter**: Breakout, Pullback, Reversal, Consolidation
- **Quick Screens**: Pre-defined screens for common scenarios
- **Export to CSV**: Download filtered results

### **📈 Technical Analysis**
- **Interactive Charts**: Candlestick, Line, Area charts
- **Multiple Timeframes**: 1D, 5D, 1M, 3M, 6M, 1Y
- **Technical Indicators**:
  - **RSI (Relative Strength Index)**: Overbought/Oversold levels
  - **MACD (Moving Average Convergence Divergence)**: Trend momentum
  - **Moving Averages (50 & 200 DMA)**: Trend direction
  - **Bollinger Bands**: Volatility and overbought/oversold
  - **Volume**: Trading activity
- **Support & Resistance Levels**: Key price levels for each stock
- **Overall Signal**: Combined recommendation (BUY/SELL/HOLD)
- **Trade Recommendation**: Entry, Target, Stop Loss, Risk-Reward, Confidence

### **💼 My Watchlist**
- **Add Stocks**: Add any stock to your watchlist
- **Quick Add**: One-click add for popular stocks
- **Live Prices**: Track real-time prices of your stocks
- **Performance Tracking**: See gainers, losers, unchanged in your watchlist
- **Total Change**: Net profit/loss across all watchlist stocks
- **Price Alerts**: Set alerts for your stocks (coming soon)
- **Export/Import**: Save and load your watchlist

### **📚 Learning Center**
- **Structured Learning Path**: 5-step journey from beginner to advanced
- **Comprehensive Tutorials**:
  1. **Stock Market Basics**: What is the stock market? NSE vs BSE?
  2. **How to Open Demat Account**: Step-by-step guide
  3. **Candlestick Patterns**: Read charts like a pro
  4. **Support & Resistance**: Key price levels
  5. **Technical Indicators**: RSI, MACD, Moving Averages, etc.
  6. **Intraday Trading Guide**: Master day trading
  7. **Risk Management**: Protect your capital
  8. **Advanced Strategies**: Breakout, Pullback, Momentum, etc.
- **Beginner's Checklist**: 8 essential steps before trading with real money
- **Trading Glossary**: 20+ essential trading terms explained
- **FAQ**: Answers to common questions

### **⚙️ Settings**
- **Profile Settings**: Name, experience level, risk tolerance, capital
- **Data Source**: Choose between mock data, NSE API, Twelve Data, Yahoo Finance
- **API Configuration**: Enter your API keys for live data
- **Notifications**: Configure price alerts, signals, market updates
- **Appearance**: Light/Dark mode, chart style, default timeframe
- **Auto-Refresh**: Set refresh interval (30s, 1m, 2m, 5m, or disabled)
- **Data & Privacy**: Export/import watchlist, clear cache, reset settings

---

## 🎓 **Beginner's Roadmap**

### **Week 1: Learn the Basics**
1. ✅ Complete the **Stock Market Basics** tutorial
2. ✅ Learn about **NSE and BSE**
3. ✅ Understand **what a stock is**
4. ✅ Learn **how to open a Demat account**
5. ✅ Explore the **Dashboard** to see live market data

### **Week 2: Technical Analysis**
1. ✅ Complete the **Candlestick Patterns** tutorial
2. ✅ Learn **Support & Resistance**
3. ✅ Understand **Technical Indicators** (RSI, MACD, MA)
4. ✅ Practice analyzing stocks using the **Technical Analysis** section
5. ✅ Learn to identify **trends and patterns**

### **Week 3: Trading Strategies**
1. ✅ Complete the **Intraday Trading Guide** tutorial
2. ✅ Learn **Risk Management** principles
3. ✅ Understand **position sizing** and **stop loss**
4. ✅ Practice with **mock trading** (paper trading)
5. ✅ Learn **Breakout, Pullback, Momentum** strategies

### **Week 4: Practice & Refine**
1. ✅ Use the **Stock Screener** to find potential trades
2. ✅ Follow **Intraday Signals** and understand the logic
3. ✅ Add stocks to **My Watchlist** and track them
4. ✅ Practice **technical analysis** on real stocks
5. ✅ Keep a **trading journal** (note down your trades and learnings)

### **Week 5+: Real Trading**
1. ✅ **Open a Demat account** with a broker (Zerodha, Upstox, etc.)
2. ✅ **Start with small amounts** (₹10,000-₹20,000)
3. ✅ **Use proper risk management** (1% rule, stop loss)
4. ✅ **Stick to your strategy**
5. ✅ **Keep learning and improving**

---

## 📈 **How to Use for Intraday Trading**

### **Morning Routine (9:00 - 9:30 AM)**
1. Open the dashboard and check **Live Dashboard**
2. See which stocks are in **Top Gainers/Losers**
3. Check **Market Mood** and **Sector Performance**
4. Review **Intraday Signals** for potential trades
5. Add promising stocks to **My Watchlist**

### **Trading Session (9:30 AM - 3:00 PM)**
1. Monitor **Intraday Signals** for new opportunities
2. Use **Stock Screener** to find stocks matching your criteria
3. Analyze stocks using **Technical Analysis** before trading
4. Check **Support & Resistance** levels
5. Set **stop loss and target** based on analysis
6. **Never risk more than 1-2% of capital per trade**

### **End of Day (3:00 - 3:30 PM)**
1. Square off all positions before 3:15 PM
2. Review your **trades in the trading journal**
3. Check **Signal History** to see how your signals performed
4. Analyze **what worked and what didn't**
5. **Learn from your mistakes**

---

## 🎯 **Understanding the Intraday Signals**

Each signal provides:

```
Stock: RELIANCE
Signal: BUY
Entry: ₹2,525
Target: ₹2,575
Stop Loss: ₹2,500
Risk: Medium
Confidence: 78%
Time: 10:15 AM
```

### **What This Means:**
- **Entry (₹2,525)**: Buy the stock at this price
- **Target (₹2,575)**: Take profit at this price (Potential profit: ₹50 per share)
- **Stop Loss (₹2,500)**: Sell if price falls to this level (Max loss: ₹25 per share)
- **Risk-Reward Ratio**: 1:2 (Risk ₹25 to make ₹50)
- **Confidence (78%)**: How strong the signal is

### **How to Use the Signal:**
1. **Buy at ₹2,525** (or as close as possible)
2. **Set Stop Loss at ₹2,500** (automatic order)
3. **Set Target at ₹2,575** (automatic order)
4. **If price hits ₹2,575**: Profit of ₹50 per share ✅
5. **If price hits ₹2,500**: Loss of ₹25 per share ❌

### **Position Sizing Example:**
- **Your Capital**: ₹1,00,000
- **Risk per trade (1%)**: ₹1,000
- **Risk per share**: ₹25 (₹2,525 - ₹2,500)
- **Number of shares**: ₹1,000 / ₹25 = **40 shares**
- **Investment**: 40 × ₹2,525 = ₹1,01,000
- **Max Loss**: ₹1,000 (1% of capital)
- **Potential Profit**: 40 × ₹50 = ₹2,000

---

## 🛡️ **Risk Management Rules (MUST FOLLOW)**

### **1. The 1% Rule**
Never risk more than **1% of your capital** on a single trade.

**Example**: ₹1,00,000 capital → Max risk per trade = ₹1,000

### **2. Always Use Stop Loss**
Every trade must have a stop loss. No exceptions!

### **3. Risk-Reward Ratio**
Minimum **1:2** (Risk ₹1 to make ₹2). Aim for **1:3** or higher.

### **4. Position Sizing**
Calculate number of shares based on your risk tolerance.

**Formula**:
```
Number of shares = (Risk amount) / (Entry price - Stop loss price)
```

### **5. Diversification**
Don't put all your money in one stock. Spread across 5-10 stocks.

### **6. Don't Overtrade**
As a beginner, limit to **2-3 trades per day**. Quality > Quantity.

### **7. Follow the Trend**
"The trend is your friend" - Trade in the direction of the trend.

### **8. Cut Losses Early**
If a trade goes against you, exit quickly. Don't hope for a reversal.

### **9. Take Profits**
When your target is hit, take profits. Don't be greedy.

### **10. Keep a Trading Journal**
Note down every trade: Entry, Exit, Profit/Loss, Reason, Learning.

---

## 📊 **Understanding Technical Indicators**

### **RSI (Relative Strength Index)**
- **Range**: 0 to 100
- **Above 70**: Overbought → Potential SELL
- **Below 30**: Oversold → Potential BUY
- **50**: Neutral

### **MACD (Moving Average Convergence Divergence)**
- **MACD > Signal Line**: Bullish
- **MACD < Signal Line**: Bearish
- **MACD > 0**: Bullish momentum
- **MACD < 0**: Bearish momentum

### **Moving Averages (50 & 200 DMA)**
- **Price > 50 DMA**: Short-term bullish
- **Price < 50 DMA**: Short-term bearish
- **Price > 200 DMA**: Long-term bullish
- **Price < 200 DMA**: Long-term bearish
- **Golden Cross**: 50 DMA crosses above 200 DMA → Strong BUY
- **Death Cross**: 50 DMA crosses below 200 DMA → Strong SELL

### **Bollinger Bands**
- **Upper Band**: Overbought → Potential SELL
- **Lower Band**: Oversold → Potential BUY
- **Bands Expanding**: Increasing volatility
- **Bands Contracting**: Decreasing volatility (potential breakout)

---

## 🔧 **Connecting to Live Data**

By default, the dashboard uses **mock data** for demonstration. To connect to **live market data**, you have several options:

### **Option 1: Twelve Data API (Recommended)**
1. Go to [https://twelvedata.com/](https://twelvedata.com/)
2. Sign up for a **free account**
3. Get your **API key**
4. In the dashboard:
   - Go to **Settings** → **Data Source**
   - Select **Twelve Data**
   - Enter your **API key**
   - Click **Test Connection**
   - If successful, the dashboard will use live data

**Free Tier Limits:**
- 800 requests/day
- Real-time and historical data
- Supports Indian stocks (NSE, BSE)

### **Option 2: Yahoo Finance API**
1. In the dashboard:
   - Go to **Settings** → **Data Source**
   - Select **Yahoo Finance**
   - No API key required
   - Click **Test Connection**

**Note**: Yahoo Finance has a 15-minute delay for free data.

### **Option 3: NSE India API**
The dashboard can fetch data directly from NSE's API, but it has:
- 15-20 minute delay for free data
- CORS restrictions (may not work in all browsers)
- No API key required

To use:
- Go to **Settings** → **Data Source**
- Select **NSE India**
- Click **Test Connection**

### **Option 4: Mock Data (Default)**
- Works **without internet**
- Simulates **realistic market data**
- Updates **every 30 seconds**
- Perfect for **learning and practice**

---

## 💻 **Deployment Options**

### **Option 1: Local Use (Recommended for Beginners)**
Just open `index.html` in your browser. No server needed!

### **Option 2: Local Server**
For best performance, run a local server:
```bash
# Python
python -m http.server 8000

# Node.js
npx serve

# PHP
php -S localhost:8000
```

### **Option 3: Deploy Online**
You can deploy this dashboard on any static hosting service:

#### **GitHub Pages (Free)**
1. Create a GitHub repository
2. Upload all files
3. Go to Settings → Pages → Select `main` branch
4. Your dashboard will be live at `https://yourusername.github.io/repo-name/`

#### **Netlify (Free)**
1. Drag and drop the `indian-trading-dashboard` folder to Netlify
2. Your dashboard will be live instantly!

#### **Vercel (Free)**
1. Install Vercel CLI: `npm install -g vercel`
2. Run `vercel` in the folder
3. Follow the prompts

#### **Firebase Hosting (Free)**
1. Install Firebase CLI: `npm install -g firebase-tools`
2. Login: `firebase login`
3. Initialize: `firebase init` (select Hosting)
4. Deploy: `firebase deploy`

---

## 📱 **Mobile & Tablet Support**

The dashboard is **fully responsive** and works on:
- Desktop (Windows, Mac, Linux)
- Tablet (iPad, Android tablets)
- Mobile (iPhone, Android phones)

**For best experience on mobile:**
- Use Chrome or Safari browser
- Rotate to landscape mode for charts
- Pin the dashboard to your home screen

---

## ⚠️ **Important Disclaimers**

### **1. Not Investment Advice**
The information provided in this dashboard is for **educational purposes only**. It is **not investment advice**. Always do your own research and consult with a financial advisor before making any investment decisions.

### **2. Trading Involves Risk**
Trading in the stock market involves **risk of loss**. You can lose some or all of your invested capital. Never trade with money you cannot afford to lose.

### **3. Past Performance ≠ Future Results**
The signals and recommendations are based on **historical data and algorithms**. Past performance is **not indicative of future results**.

### **4. Mock Data for Demonstration**
By default, the dashboard uses **simulated data** for demonstration. While it looks realistic, it's **not real market data**. For real trading, connect to a live data API.

### **5. Use at Your Own Risk**
The creators of this dashboard are **not responsible** for any losses you may incur from using this information for trading.

---

## 🎁 **Bonus Features**

### **1. Paper Trading (Simulated Trading)**
Practice trading with **virtual money** before using real money. Track your performance in the **Signal History** section.

### **2. Trading Journal**
Keep a record of all your trades:
- Stock
- Entry Price
- Exit Price
- Profit/Loss
- Reason for Trade
- Learning from the Trade

### **3. Price Alerts**
Set alerts for your watchlist stocks to get notified when they reach certain price levels.

### **4. Multiple Timeframes**
Analyze stocks across different timeframes (1D, 5D, 1M, 3M, 6M, 1Y) to get a comprehensive view.

### **5. Customizable Dashboard**
Personalize your dashboard with:
- Light or Dark mode
- Different chart styles
- Auto-refresh intervals
- Notification preferences

---

## 📚 **Recommended Learning Resources**

### **Free Resources:**
- [NSE India](https://www.nseindia.com/) - Official NSE website
- [BSE India](https://www.bseindia.com/) - Official BSE website
- [Investopedia](https://www.investopedia.com/) - Financial education
- [TradingView](https://www.tradingview.com/) - Charting platform
- [Zerodha Varsity](https://zerodha.com/varsity/) - Free trading courses

### **Books:**
- **The Intelligent Investor** - Benjamin Graham
- **Technical Analysis of the Financial Markets** - John J. Murphy
- **Trading in the Zone** - Mark Douglas
- **A Beginner's Guide to the Stock Market** - Matthew R. Kratter

### **YouTube Channels:**
- [Zerodha](https://www.youtube.com/c/zerodhaonline)
- [Finology](https://www.youtube.com/c/finology)
- [Asset Yogi](https://www.youtube.com/c/AssetYogi)
- [Pranjal Kamra](https://www.youtube.com/c/PranjalKamra)

---

## 📞 **Need Help?**

### **Troubleshooting:**
1. **Data not loading?**
   - Check your internet connection
   - Try refreshing the page
   - Clear browser cache
   - Try a different browser

2. **Charts not working?**
   - Make sure you have internet connection (Chart.js loads from CDN)
   - Check browser console for errors (F12 → Console)
   - Try disabling ad blockers

3. **Signals not updating?**
   - Check if auto-refresh is enabled in Settings
   - Try manually refreshing
   - Check if you're using mock data or live data

4. **Watchlist not saving?**
   - Make sure your browser allows localStorage
   - Try clearing browser cache
   - Check browser privacy settings

### **Feature Requests:**
If you want any additional features, feel free to suggest:
- Real-time news integration
- More technical indicators
- Advanced screening options
- Backtesting functionality
- Mobile app version

---

## 🚀 **Ready to Start?**

1. **Open the dashboard** (`index.html`)
2. **Complete the tutorials** in Learning Center
3. **Practice with mock data**
4. **Connect to live data** when ready
5. **Start trading with small amounts**
6. **Keep learning and improving**

**Remember: Trading is a skill that takes time to develop. Be patient, stay disciplined, and never stop learning!**

---

**Happy Trading! 📈**

*Made with ❤️ for Indian Stock Market Traders*
