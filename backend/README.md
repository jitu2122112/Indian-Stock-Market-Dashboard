# Backend for Real Auto Trading

This backend enables **REAL auto trading with your Groww account** and Dhan/Zerodha.

## Quick Start

### Option 1: Node.js Backend (Recommended - Supports Groww + Dhan)

```bash
cd backend/node
npm install
npx playwright install chromium
cp .env.example .env
# Edit .env
npm start
# Server at http://localhost:3001
# Dashboard at http://localhost:8000 will auto-connect
```

### Option 2: Python Backend (Supports Dhan + Mock)

```bash
cd backend/python
pip install -r requirements.txt
python app.py
# Server at http://localhost:8001
```

## Groww Real Trading Setup

Groww has no official API, so we use browser automation.

**First time:**
```bash
cd backend/node
npm run groww-login
# Browser opens → Login to Groww with OTP → Press ENTER
# Session saved to groww-session.json
```

**Then:**
```bash
# .env:
BROKER=GROWW
MODE=PAPER  # Test first
GROWW_METHOD=PLAYWRIGHT
npm start
```

In dashboard → Auto Trading → Should show "Backend Connected" → Start Bot

For LIVE real money:
```
MODE=LIVE in .env
```

## Dhan Setup (Free, Official, Recommended)

1. Get API credentials from https://dhan.co → My Profile → DhanHQ Trading APIs
2. .env:
```
BROKER=DHAN
DHAN_CLIENT_ID=your_id
DHAN_ACCESS_TOKEN=your_token
MODE=PAPER then LIVE
```
3. npm start

## API Endpoints

- GET /api/health - Check backend
- GET /api/status - Engine status
- POST /api/start - Start trading
- POST /api/stop - Stop trading
- GET /api/positions - Open positions
- GET /api/funds - Available funds
- POST /api/analyze/:symbol - Analyze stock
- WebSocket /ws - Live updates

## Safety

- Always test PAPER mode first
- Start LIVE with small capital (₹5k-10k)
- Bot auto stops on 2% daily loss
- Auto square off at 3:15 PM
