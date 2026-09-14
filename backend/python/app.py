# Python FastAPI Auto Trading Backend - Alternative to Node.js
# For those who prefer Python
# Run: pip install -r requirements.txt && python app.py

from fastapi import FastAPI, WebSocket, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from typing import List, Optional, Dict
import asyncio
import json
import os
from datetime import datetime
import logging

# For DhanHQ
try:
    import dhanhq
    DHAN_AVAILABLE = True
except ImportError:
    DHAN_AVAILABLE = False
    print("DhanHQ not installed, run: pip install dhanhq")

app = FastAPI(title="Indian Stock Auto Trading - Python", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Config
class TradingConfig(BaseModel):
    mode: str = "PAPER"  # PAPER or LIVE
    broker: str = "MOCK"
    capital: float = 100000
    risk_per_trade: float = 1.0
    max_daily_loss: float = 2.0
    max_positions: int = 3
    symbols: List[str] = ["RELIANCE", "TCS", "INFY", "HDFCBANK", "ICICIBANK"]
    strategies: List[str] = ["COMBINED"]
    dhan_client_id: Optional[str] = None
    dhan_access_token: Optional[str] = None

config = TradingConfig()

# In-memory state
class TradingState:
    def __init__(self):
        self.is_running = False
        self.logs = []
        self.positions = {}
        self.orders = []
        self.daily_pnl = 0
        self.trades_today = 0
        
    def log(self, message, level="INFO"):
        entry = {
            "timestamp": datetime.now().isoformat(),
            "level": level,
            "message": message
        }
        self.logs.append(entry)
        if len(self.logs) > 500:
            self.logs.pop(0)
        print(f"[{level}] {message}")
        return entry

state = TradingState()

# Mock broker for Python
class MockBrokerPython:
    def __init__(self, config):
        self.config = config
        self.name = "MOCK_PYTHON"
        self.is_connected = False
        self.positions = {}
        
    async def connect(self):
        self.is_connected = True
        return {"success": True, "message": "Connected to Mock Broker (Python)"}
    
    async def get_ltp(self, symbol):
        # Mock LTP - in real, fetch from API
        import random
        return 1000 + random.random() * 2000
    
    async def get_quote(self, symbol):
        ltp = await self.get_ltp(symbol)
        return {
            "symbol": symbol,
            "price": ltp,
            "open": ltp * 0.99,
            "high": ltp * 1.02,
            "low": ltp * 0.98,
            "volume": 500000
        }
    
    async def place_order(self, order):
        order_id = f"MOCK_{len(state.orders) + 1000}"
        order_obj = {
            "orderId": order_id,
            "symbol": order.symbol,
            "side": order.side,
            "quantity": order.quantity,
            "price": order.price,
            "status": "COMPLETE",
            "timestamp": datetime.now().isoformat()
        }
        state.orders.append(order_obj)
        state.log(f"Paper order: {order.side} {order.quantity} {order.symbol} @ {order.price}")
        return order_obj

# Dhan broker for Python
class DhanBrokerPython:
    def __init__(self, config):
        self.config = config
        self.name = "DHAN_PYTHON"
        self.client_id = config.dhan_client_id or os.getenv("DHAN_CLIENT_ID")
        self.access_token = config.dhan_access_token or os.getenv("DHAN_ACCESS_TOKEN")
        self.dhan = None
        
    async def connect(self):
        if not DHAN_AVAILABLE:
            raise Exception("dhanhq package not installed")
        if not self.client_id or not self.access_token:
            raise Exception("Dhan credentials missing")
        
        self.dhan = dhanhq.dhanhq(self.client_id, self.access_token)
        return {"success": True, "message": "Connected to Dhan (Python)"}
    
    async def get_ltp(self, symbol):
        try:
            # Dhan API call
            # This is simplified - check Dhan docs for exact format
            response = self.dhan.get_ltp_data(
                exchange_segment="NSE_EQ",
                securities=[symbol]
            )
            return response.get('data', {}).get(symbol, {}).get('last_price', 0)
        except Exception as e:
            print(f"Dhan LTP error: {e}")
            return 0

broker = MockBrokerPython(config)

# Models
class OrderRequest(BaseModel):
    symbol: str
    side: str  # BUY or SELL
    quantity: int
    price: Optional[float] = 0
    order_type: str = "MARKET"
    product: str = "INTRADAY"

# RSI calculation
def calculate_rsi(prices, period=14):
    if len(prices) < period + 1:
        return 50
    
    gains = 0
    losses = 0
    for i in range(1, period + 1):
        change = prices[i] - prices[i-1]
        if change > 0:
            gains += change
        else:
            losses += abs(change)
    
    avg_gain = gains / period
    avg_loss = losses / period
    
    if avg_loss == 0:
        return 100
    
    rs = avg_gain / avg_loss
    rsi = 100 - (100 / (1 + rs))
    return rsi

# Strategy: RSI Reversal
def analyze_rsi(symbol, candles):
    if len(candles) < 15:
        return {"signal": "HOLD", "confidence": 50, "reason": "Not enough data"}
    
    prices = [c['close'] for c in candles]
    rsi = calculate_rsi(prices)
    current_price = prices[-1]
    
    if rsi < 30:
        return {
            "signal": "BUY",
            "confidence": min(90, 70 + (30 - rsi)),
            "rsi": rsi,
            "entry": current_price,
            "stop_loss": current_price * 0.992,
            "target": current_price * 1.02,
            "reason": f"RSI oversold at {rsi:.1f}"
        }
    elif rsi > 70:
        return {
            "signal": "SELL",
            "confidence": min(90, 70 + (rsi - 70)),
            "rsi": rsi,
            "entry": current_price,
            "stop_loss": current_price * 1.008,
            "target": current_price * 0.98,
            "reason": f"RSI overbought at {rsi:.1f}"
        }
    else:
        return {"signal": "HOLD", "confidence": 50, "rsi": rsi, "reason": f"RSI neutral at {rsi:.1f}"}

# Generate mock candles
def generate_mock_candles(symbol, count=100):
    import random
    candles = []
    price = 1000 + random.random() * 2000
    for i in range(count):
        open_price = price
        change = (random.random() - 0.5) * 20
        price = max(price * 0.95, price + change)
        high = max(open_price, price) + random.random() * 5
        low = min(open_price, price) - random.random() * 5
        close = price
        candles.append({
            "timestamp": datetime.now().isoformat(),
            "open": open_price,
            "high": high,
            "low": low,
            "close": close,
            "volume": 50000 + random.random() * 500000
        })
    return candles

# Trading loop
async def trading_loop():
    while state.is_running:
        try:
            state.log(f"Scanning {len(config.symbols)} symbols...")
            
            for symbol in config.symbols:
                if not state.is_running:
                    break
                    
                try:
                    candles = generate_mock_candles(symbol)
                    analysis = analyze_rsi(symbol, candles)
                    
                    if analysis['signal'] != 'HOLD' and analysis['confidence'] > 65:
                        state.log(f"{symbol}: {analysis['signal']} signal ({analysis['confidence']}%) - {analysis['reason']}")
                        
                        # Check risk
                        if state.trades_today >= 10:
                            state.log("Max trades reached, skipping", "WARN")
                            continue
                        
                        if state.daily_pnl <= -(config.capital * config.max_daily_loss / 100):
                            state.log(f"Daily loss limit hit: {state.daily_pnl}", "ERROR")
                            state.is_running = False
                            break
                        
                        # Calculate qty
                        risk_amount = config.capital * config.risk_per_trade / 100
                        risk_per_share = abs(analysis['entry'] - analysis['stop_loss'])
                        qty = max(1, int(risk_amount / risk_per_share)) if risk_per_share > 0 else 1
                        
                        # Place order
                        order = OrderRequest(
                            symbol=symbol,
                            side=analysis['signal'],
                            quantity=qty,
                            price=analysis['entry'],
                            order_type="MARKET"
                        )
                        
                        result = await broker.place_order(order)
                        state.trades_today += 1
                        state.log(f"Order placed: {symbol} {analysis['signal']} {qty} @ {analysis['entry']}")
                        
                        # Broadcast to websockets
                        await broadcast({
                            "type": "TRADE",
                            "data": {
                                "symbol": symbol,
                                "signal": analysis,
                                "quantity": qty,
                                "order_id": result['orderId']
                            }
                        })
                        
                except Exception as e:
                    state.log(f"Error analyzing {symbol}: {str(e)}", "ERROR")
                
                await asyncio.sleep(0.5)
            
            await asyncio.sleep(30)  # Scan every 30 seconds
            
        except Exception as e:
            state.log(f"Trading loop error: {str(e)}", "ERROR")
            await asyncio.sleep(5)

# WebSocket management
class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def broadcast(self, message: dict):
        for connection in self.active_connections:
            try:
                await connection.send_text(json.dumps(message))
            except:
                pass

manager = ConnectionManager()

async def broadcast(message):
    await manager.broadcast(message)

# API Routes
@app.get("/api/health")
async def health():
    return {
        "status": "OK",
        "timestamp": datetime.now().isoformat(),
        "broker": broker.name,
        "mode": config.mode,
        "running": state.is_running
    }

@app.get("/api/status")
async def get_status():
    return {
        "running": state.is_running,
        "broker": broker.name,
        "mode": config.mode,
        "daily_pnl": state.daily_pnl,
        "trades_today": state.trades_today,
        "positions": state.positions,
        "config": config.dict()
    }

@app.get("/api/config")
async def get_config():
    return config

@app.post("/api/config")
async def update_config(new_config: TradingConfig):
    global config, broker
    config = new_config
    
    # Recreate broker if needed
    if config.broker.upper() == "DHAN" and DHAN_AVAILABLE:
        broker = DhanBrokerPython(config)
    else:
        broker = MockBrokerPython(config)
    
    return {"success": True, "config": config}

@app.post("/api/start")
async def start_trading():
    if state.is_running:
        return {"success": False, "message": "Already running"}
    
    try:
        await broker.connect()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Broker connection failed: {str(e)}")
    
    state.is_running = True
    state.log(f"🚀 Auto trading STARTED in {config.mode} mode with {broker.name}")
    
    # Start trading loop in background
    asyncio.create_task(trading_loop())
    
    await broadcast({"type": "STATUS", "data": {"running": True}})
    
    return {"success": True, "message": "Trading started"}

@app.post("/api/stop")
async def stop_trading():
    state.is_running = False
    state.log("🛑 Auto trading STOPPED")
    await broadcast({"type": "STATUS", "data": {"running": False}})
    return {"success": True, "message": "Trading stopped"}

@app.get("/api/logs")
async def get_logs():
    return state.logs[-100:]  # Last 100 logs

@app.get("/api/positions")
async def get_positions():
    return list(state.positions.values())

@app.post("/api/place-order")
async def place_order(order: OrderRequest):
    try:
        result = await broker.place_order(order)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/analyze/{symbol}")
async def analyze_stock(symbol: str, strategy: str = "RSI"):
    candles = generate_mock_candles(symbol.upper())
    analysis = analyze_rsi(symbol.upper(), candles)
    quote = await broker.get_quote(symbol.upper())
    
    return {
        "symbol": symbol.upper(),
        "quote": quote,
        "analysis": analysis,
        "candles": candles[-20:]
    }

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        # Send initial status
        await websocket.send_text(json.dumps({
            "type": "STATUS",
            "data": {
                "running": state.is_running,
                "broker": broker.name,
                "mode": config.mode
            }
        }))
        
        while True:
            data = await websocket.receive_text()
            try:
                msg = json.loads(data)
                if msg.get("type") == "START":
                    await start_trading()
                elif msg.get("type") == "STOP":
                    await stop_trading()
                elif msg.get("type") == "GET_STATUS":
                    await websocket.send_text(json.dumps({
                        "type": "STATUS",
                        "data": {
                            "running": state.is_running,
                            "daily_pnl": state.daily_pnl,
                            "trades_today": state.trades_today
                        }
                    }))
            except:
                pass
    except:
        manager.disconnect(websocket)

# Serve frontend (if exists)
try:
    app.mount("/", StaticFiles(directory="../../", html=True), name="frontend")
except:
    pass

if __name__ == "__main__":
    import uvicorn
    print("""
🤖 Indian Stock Auto Trading - Python Backend
=============================================
Server: http://localhost:8001
Dashboard: http://localhost:8001/
API Docs: http://localhost:8001/docs
WebSocket: ws://localhost:8001/ws

Modes:
  PAPER = No real money (safe for testing)
  LIVE = Real orders (use with caution)

For DhanHQ (free API):
  1. Get credentials from https://dhan.co
  2. Set env: DHAN_CLIENT_ID and DHAN_ACCESS_TOKEN
  3. Set broker=DHAN in config

For Groww:
  Use Node.js backend with Playwright (more reliable for Groww)
  Python backend supports MOCK and DHAN only
    """)
    uvicorn.run(app, host="0.0.0.0", port=8001)
