// Trading Strategies - Real Technical Analysis
// Each strategy returns: { signal: 'BUY'|'SELL'|'HOLD', confidence: 0-100, reasons: [], entry, stopLoss, target }

class TradingStrategies {

    // Helper: RSI calculation
    static calculateRSI(prices, period = 14) {
        if (prices.length < period + 1) return 50;
        
        let gains = 0, losses = 0;
        for (let i = 1; i <= period; i++) {
            const change = prices[i] - prices[i-1];
            if (change > 0) gains += change;
            else losses += Math.abs(change);
        }
        
        let avgGain = gains / period;
        let avgLoss = losses / period;
        
        for (let i = period + 1; i < prices.length; i++) {
            const change = prices[i] - prices[i-1];
            if (change > 0) {
                avgGain = (avgGain * (period - 1) + change) / period;
                avgLoss = (avgLoss * (period - 1)) / period;
            } else {
                avgGain = (avgGain * (period - 1)) / period;
                avgLoss = (avgLoss * (period - 1) + Math.abs(change)) / period;
            }
        }
        
        if (avgLoss === 0) return 100;
        const rs = avgGain / avgLoss;
        return 100 - (100 / (1 + rs));
    }

    // Helper: EMA calculation
    static calculateEMA(prices, period) {
        if (prices.length < period) return prices[prices.length - 1] || 0;
        
        const k = 2 / (period + 1);
        let ema = prices.slice(0, period).reduce((a, b) => a + b, 0) / period;
        
        for (let i = period; i < prices.length; i++) {
            ema = prices[i] * k + ema * (1 - k);
        }
        return ema;
    }

    // Helper: SMA
    static calculateSMA(prices, period) {
        if (prices.length < period) return null;
        const slice = prices.slice(-period);
        return slice.reduce((a, b) => a + b, 0) / period;
    }

    // Helper: ATR for stop loss
    static calculateATR(candles, period = 14) {
        if (candles.length < period + 1) return candles[0]?.close * 0.01 || 10;
        
        const trs = [];
        for (let i = 1; i < candles.length; i++) {
            const high = candles[i].high;
            const low = candles[i].low;
            const prevClose = candles[i-1].close;
            const tr = Math.max(
                high - low,
                Math.abs(high - prevClose),
                Math.abs(low - prevClose)
            );
            trs.push(tr);
        }
        
        const atr = trs.slice(-period).reduce((a, b) => a + b, 0) / period;
        return atr;
    }

    // Helper: Supertrend
    static calculateSupertrend(candles, period = 10, multiplier = 3) {
        if (candles.length < period) return { supertrend: candles[candles.length-1]?.close || 0, direction: 'BUY' };
        
        const atr = this.calculateATR(candles, period);
        const last = candles[candles.length - 1];
        const hl2 = (last.high + last.low) / 2;
        
        const upperBand = hl2 + multiplier * atr;
        const lowerBand = hl2 - multiplier * atr;
        
        // Simplified supertrend logic
        const direction = last.close > hl2 ? 'BUY' : 'SELL';
        const supertrend = direction === 'BUY' ? lowerBand : upperBand;
        
        return { supertrend, direction, upperBand, lowerBand };
    }

    // Strategy 1: RSI Reversal - Buy oversold, Sell overbought
    static rsiReversal(stock, candles, config = {}) {
        const prices = candles.map(c => c.close);
        const rsi = this.calculateRSI(prices, 14);
        const currentPrice = stock.price || prices[prices.length - 1];
        const atr = this.calculateATR(candles, 14);
        
        let signal = 'HOLD';
        let confidence = 50;
        let reasons = [];

        if (rsi < 30) {
            signal = 'BUY';
            confidence = Math.min(90, 70 + (30 - rsi));
            reasons.push(`RSI oversold at ${rsi.toFixed(1)} (<30)`);
            reasons.push('Potential bullish reversal');
        } else if (rsi > 70) {
            signal = 'SELL';
            confidence = Math.min(90, 70 + (rsi - 70));
            reasons.push(`RSI overbought at ${rsi.toFixed(1)} (>70)`);
            reasons.push('Potential bearish reversal');
        } else if (rsi < 40) {
            signal = 'BUY';
            confidence = 55 + (40 - rsi);
            reasons.push(`RSI approaching oversold: ${rsi.toFixed(1)}`);
        } else if (rsi > 60) {
            signal = 'SELL';
            confidence = 55 + (rsi - 60);
            reasons.push(`RSI approaching overbought: ${rsi.toFixed(1)}`);
        } else {
            reasons.push(`RSI neutral at ${rsi.toFixed(1)}`);
        }

        // Volume confirmation
        const avgVolume = candles.slice(-20).reduce((sum, c) => sum + c.volume, 0) / 20;
        const currentVolume = candles[candles.length - 1]?.volume || 0;
        if (currentVolume > avgVolume * 1.5) {
            confidence += 5;
            reasons.push(`High volume: ${(currentVolume/1000).toFixed(0)}K vs avg ${(avgVolume/1000).toFixed(0)}K`);
        }

        const stopLoss = signal === 'BUY' ? currentPrice - atr * 1.5 : currentPrice + atr * 1.5;
        const target = signal === 'BUY' ? currentPrice + atr * 3 : currentPrice - atr * 3;

        return {
            strategy: 'RSI_REVERSAL',
            signal,
            confidence: Math.round(confidence),
            rsi,
            entry: currentPrice,
            stopLoss,
            target,
            reasons,
            atr
        };
    }

    // Strategy 2: EMA Crossover - Trend following
    static emaCrossover(stock, candles, config = {}) {
        const prices = candles.map(c => c.close);
        const ema9 = this.calculateEMA(prices, 9);
        const ema21 = this.calculateEMA(prices, 21);
        const ema50 = this.calculateEMA(prices, 50);
        const currentPrice = stock.price || prices[prices.length - 1];
        const prevPrices = prices.slice(-3);
        const prevEma9 = this.calculateEMA(prevPrices.slice(0, -1), 9);
        const prevEma21 = this.calculateEMA(prevPrices.slice(0, -1), 21);
        const atr = this.calculateATR(candles, 14);

        let signal = 'HOLD';
        let confidence = 50;
        let reasons = [];

        // Crossover detection
        const wasBelow = prevEma9 < prevEma21;
        const isAbove = ema9 > ema21;

        if (wasBelow && isAbove && currentPrice > ema50) {
            signal = 'BUY';
            confidence = 75;
            reasons.push(`9 EMA (${ema9.toFixed(2)}) crossed above 21 EMA (${ema21.toFixed(2)})`);
            reasons.push(`Price above 50 EMA (${ema50.toFixed(2)}) - strong uptrend`);
        } else if (!wasBelow && !isAbove && currentPrice < ema50) {
            signal = 'SELL';
            confidence = 75;
            reasons.push(`9 EMA (${ema9.toFixed(2)}) crossed below 21 EMA (${ema21.toFixed(2)})`);
            reasons.push(`Price below 50 EMA (${ema50.toFixed(2)}) - strong downtrend`);
        } else if (ema9 > ema21 && currentPrice > ema9) {
            signal = 'BUY';
            confidence = 60;
            reasons.push(`Uptrend: 9 EMA > 21 EMA, price above 9 EMA`);
        } else if (ema9 < ema21 && currentPrice < ema9) {
            signal = 'SELL';
            confidence = 60;
            reasons.push(`Downtrend: 9 EMA < 21 EMA, price below 9 EMA`);
        } else {
            reasons.push(`No clear crossover: 9EMA ${ema9.toFixed(2)}, 21EMA ${ema21.toFixed(2)}`);
        }

        // Trend strength
        const emaDiff = Math.abs(ema9 - ema21) / currentPrice * 100;
        if (emaDiff > 1) {
            confidence += 10;
            reasons.push(`Strong trend: EMA diff ${emaDiff.toFixed(2)}%`);
        }

        const stopLoss = signal === 'BUY' ? Math.min(ema21, currentPrice - atr * 1.5) : Math.max(ema21, currentPrice + atr * 1.5);
        const target = signal === 'BUY' ? currentPrice + atr * 3 : currentPrice - atr * 3;

        return {
            strategy: 'EMA_CROSSOVER',
            signal,
            confidence: Math.round(confidence),
            ema9, ema21, ema50,
            entry: currentPrice,
            stopLoss,
            target,
            reasons,
            atr
        };
    }

    // Strategy 3: Breakout - Price breaks resistance with volume
    static breakout(stock, candles, config = {}) {
        const currentPrice = stock.price || candles[candles.length - 1]?.close;
        const atr = this.calculateATR(candles, 14);
        
        // Find 20-day high/low
        const last20 = candles.slice(-20);
        const high20 = Math.max(...last20.map(c => c.high));
        const low20 = Math.min(...last20.map(c => c.low));
        
        const avgVolume = last20.reduce((sum, c) => sum + c.volume, 0) / last20.length;
        const currentVolume = candles[candles.length - 1]?.volume || 0;
        const volumeSpike = currentVolume / avgVolume;

        let signal = 'HOLD';
        let confidence = 50;
        let reasons = [];

        if (currentPrice > high20 * 0.998 && volumeSpike > 1.5) { // Near breakout with volume
            signal = 'BUY';
            confidence = 70 + Math.min(20, volumeSpike * 5);
            reasons.push(`Breakout above 20-day high ₹${high20.toFixed(2)}`);
            reasons.push(`Volume spike ${volumeSpike.toFixed(1)}x (₹${currentPrice} > ₹${high20.toFixed(2)})`);
        } else if (currentPrice < low20 * 1.002 && volumeSpike > 1.5) {
            signal = 'SELL';
            confidence = 70 + Math.min(20, volumeSpike * 5);
            reasons.push(`Breakdown below 20-day low ₹${low20.toFixed(2)}`);
            reasons.push(`Volume spike ${volumeSpike.toFixed(1)}x`);
        } else if (currentPrice > high20 * 0.99) {
            signal = 'BUY';
            confidence = 60;
            reasons.push(`Approaching 20-day high ₹${high20.toFixed(2)} - potential breakout`);
        } else if (currentPrice < low20 * 1.01) {
            signal = 'SELL';
            confidence = 60;
            reasons.push(`Approaching 20-day low ₹${low20.toFixed(2)} - potential breakdown`);
        } else {
            reasons.push(`Range: ₹${low20.toFixed(2)} - ₹${high20.toFixed(2)}, Current: ₹${currentPrice}`);
        }

        if (volumeSpike < 1) {
            confidence -= 10;
            reasons.push(`Low volume ${volumeSpike.toFixed(1)}x - weak breakout`);
        }

        const stopLoss = signal === 'BUY' ? currentPrice - atr * 1.5 : currentPrice + atr * 1.5;
        const target = signal === 'BUY' ? currentPrice + (currentPrice - low20) * 0.5 : currentPrice - (high20 - currentPrice) * 0.5;

        return {
            strategy: 'BREAKOUT',
            signal,
            confidence: Math.round(Math.max(30, Math.min(90, confidence))),
            high20, low20, volumeSpike,
            entry: currentPrice,
            stopLoss,
            target,
            reasons,
            atr
        };
    }

    // Strategy 4: Supertrend
    static supertrendStrategy(stock, candles, config = {}) {
        const currentPrice = stock.price || candles[candles.length - 1]?.close;
        const st = this.calculateSupertrend(candles, 10, 3);
        const atr = this.calculateATR(candles, 14);
        const prices = candles.map(c => c.close);
        const rsi = this.calculateRSI(prices, 14);

        let signal = 'HOLD';
        let confidence = 50;
        let reasons = [];

        if (st.direction === 'BUY' && currentPrice > st.supertrend && rsi > 40 && rsi < 70) {
            signal = 'BUY';
            confidence = 70;
            reasons.push(`Supertrend BUY: Price ₹${currentPrice} > Supertrend ₹${st.supertrend.toFixed(2)}`);
            reasons.push(`RSI healthy at ${rsi.toFixed(1)}`);
        } else if (st.direction === 'SELL' && currentPrice < st.supertrend && rsi < 60 && rsi > 30) {
            signal = 'SELL';
            confidence = 70;
            reasons.push(`Supertrend SELL: Price ₹${currentPrice} < Supertrend ₹${st.supertrend.toFixed(2)}`);
            reasons.push(`RSI healthy at ${rsi.toFixed(1)}`);
        } else {
            reasons.push(`Supertrend ${st.direction}: Price ₹${currentPrice} vs ST ₹${st.supertrend.toFixed(2)}, RSI ${rsi.toFixed(1)}`);
        }

        const stopLoss = st.supertrend;
        const target = signal === 'BUY' ? currentPrice + atr * 3 : currentPrice - atr * 3;

        return {
            strategy: 'SUPERTREND',
            signal,
            confidence: Math.round(confidence),
            supertrend: st.supertrend,
            direction: st.direction,
            rsi,
            entry: currentPrice,
            stopLoss,
            target,
            reasons,
            atr
        };
    }

    // Strategy 5: VWAP + RSI (Institutional)
    static vwapRsiStrategy(stock, candles, config = {}) {
        const currentPrice = stock.price || candles[candles.length - 1]?.close;
        const prices = candles.map(c => c.close);
        const volumes = candles.map(c => c.volume);
        
        // VWAP calculation
        let cumulativePV = 0, cumulativeV = 0;
        for (let i = 0; i < candles.length; i++) {
            const typicalPrice = (candles[i].high + candles[i].low + candles[i].close) / 3;
            cumulativePV += typicalPrice * volumes[i];
            cumulativeV += volumes[i];
        }
        const vwap = cumulativeV > 0 ? cumulativePV / cumulativeV : currentPrice;
        const rsi = this.calculateRSI(prices, 14);
        const atr = this.calculateATR(candles, 14);

        let signal = 'HOLD';
        let confidence = 50;
        let reasons = [];

        if (currentPrice > vwap && rsi > 50 && rsi < 70) {
            signal = 'BUY';
            confidence = 65 + (rsi - 50) / 2;
            reasons.push(`Price ₹${currentPrice} above VWAP ₹${vwap.toFixed(2)} (institutional buying)`);
            reasons.push(`RSI ${rsi.toFixed(1)} - bullish momentum`);
        } else if (currentPrice < vwap && rsi < 50 && rsi > 30) {
            signal = 'SELL';
            confidence = 65 + (50 - rsi) / 2;
            reasons.push(`Price ₹${currentPrice} below VWAP ₹${vwap.toFixed(2)} (institutional selling)`);
            reasons.push(`RSI ${rsi.toFixed(1)} - bearish momentum`);
        } else {
            reasons.push(`Price vs VWAP: ₹${currentPrice} vs ₹${vwap.toFixed(2)}, RSI ${rsi.toFixed(1)}`);
        }

        const stopLoss = signal === 'BUY' ? Math.min(vwap, currentPrice - atr * 1.5) : Math.max(vwap, currentPrice + atr * 1.5);
        const target = signal === 'BUY' ? currentPrice + atr * 2.5 : currentPrice - atr * 2.5;

        return {
            strategy: 'VWAP_RSI',
            signal,
            confidence: Math.round(confidence),
            vwap, rsi,
            entry: currentPrice,
            stopLoss,
            target,
            reasons,
            atr
        };
    }

    // Combined strategy - uses multiple indicators
    static combinedStrategy(stock, candles, config = {}) {
        const results = [
            this.rsiReversal(stock, candles),
            this.emaCrossover(stock, candles),
            this.breakout(stock, candles),
            this.supertrendStrategy(stock, candles)
        ];

        const buyVotes = results.filter(r => r.signal === 'BUY').length;
        const sellVotes = results.filter(r => r.signal === 'SELL').length;
        
        let signal = 'HOLD';
        let confidence = 50;
        let reasons = [];

        if (buyVotes >= 3) {
            signal = 'BUY';
            confidence = 75 + buyVotes * 5;
            reasons.push(`Strong BUY: ${buyVotes}/4 strategies agree`);
        } else if (sellVotes >= 3) {
            signal = 'SELL';
            confidence = 75 + sellVotes * 5;
            reasons.push(`Strong SELL: ${sellVotes}/4 strategies agree`);
        } else if (buyVotes === 2 && sellVotes === 0) {
            signal = 'BUY';
            confidence = 65;
            reasons.push(`Moderate BUY: ${buyVotes}/4 strategies`);
        } else if (sellVotes === 2 && buyVotes === 0) {
            signal = 'SELL';
            confidence = 65;
            reasons.push(`Moderate SELL: ${sellVotes}/4 strategies`);
        } else {
            reasons.push(`Mixed signals: ${buyVotes} BUY, ${sellVotes} SELL, ${4-buyVotes-sellVotes} HOLD`);
        }

        // Aggregate all reasons
        results.forEach(r => {
            reasons.push(`[${r.strategy}] ${r.signal} (${r.confidence}%): ${r.reasons[0]}`);
        });

        const currentPrice = stock.price || candles[candles.length - 1]?.close;
        const avgATR = results.reduce((sum, r) => sum + (r.atr || 0), 0) / results.length;
        const avgStop = results.filter(r => r.signal === signal).reduce((sum, r) => sum + r.stopLoss, 0) / Math.max(1, results.filter(r => r.signal === signal).length) || currentPrice * 0.99;
        const avgTarget = results.filter(r => r.signal === signal).reduce((sum, r) => sum + r.target, 0) / Math.max(1, results.filter(r => r.signal === signal).length) || currentPrice * 1.02;

        return {
            strategy: 'COMBINED',
            signal,
            confidence: Math.round(Math.min(90, confidence)),
            entry: currentPrice,
            stopLoss: avgStop,
            target: avgTarget,
            reasons,
            details: results,
            atr: avgATR
        };
    }

    // Main entry point
    static analyze(stock, candles, strategyName = 'COMBINED', config = {}) {
        switch (strategyName) {
            case 'RSI_REVERSAL':
                return this.rsiReversal(stock, candles, config);
            case 'EMA_CROSSOVER':
                return this.emaCrossover(stock, candles, config);
            case 'BREAKOUT':
                return this.breakout(stock, candles, config);
            case 'SUPERTREND':
                return this.supertrendStrategy(stock, candles, config);
            case 'VWAP_RSI':
                return this.vwapRsiStrategy(stock, candles, config);
            case 'COMBINED':
            default:
                return this.combinedStrategy(stock, candles, config);
        }
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = TradingStrategies;
}
if (typeof window !== 'undefined') {
    window.TradingStrategies = TradingStrategies;
}
