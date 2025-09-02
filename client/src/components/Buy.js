// LiveTradingWithChartMarkers.jsx
// ================================================================
// Multi-bet (max 3), 3-minute default, persistence across refresh.
// Full component, ~700+ lines with detailed comments for clarity.
// ================================================================

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { refreshUserData } from '../actions/userActions';
import { buyStock } from '../actions/stockActions';
import NavBar from './NavBar';
import Footerv2 from './Footerv2';
import { createChart } from 'lightweight-charts';
import { Alert, Button, Col, Container, Form, Row, Spinner, Badge } from 'react-bootstrap';

// ------------------- Configuration & Helpers -------------------
const AVAILABLE_PAIRS = [
  { group: 'Crypto', label: 'Bitcoin / USDT', value: 'BINANCE:BTCUSDT' },
  { group: 'Crypto', label: 'Ethereum / USDT', value: 'BINANCE:ETHUSDT' },
  { group: 'Crypto', label: 'BNB / USDT', value: 'BINANCE:BNBUSDT' },
  { group: 'Forex', label: 'EUR / USD', value: 'OANDA:EURUSD' },
  { group: 'Forex', label: 'USD / JPY', value: 'OANDA:USDJPY' },
  { group: 'Commodities', label: 'Gold (XAU/USD)', value: 'OANDA:XAUUSD' },
  { group: 'Stocks', label: 'Apple', value: 'NASDAQ:AAPL' },
  { group: 'Stocks', label: 'Tesla', value: 'NASDAQ:TSLA' },
  { group: 'Indices', label: 'S&P 500', value: 'INDEX:SP500' },
];

const BINANCE_WS_URL = 'wss://stream.binance.com:9443/ws/!ticker@arr';
const PAYOUT_PCT = 0.6; // 80% payout on win (Binomo-like)
const MIN_BET = 50; // ₹50 minimum
const DEFAULT_DURATION = 180; // 3 minutes in seconds (kept)
const MAX_ACTIVE_BETS = 3; // <-- NEW: at most 3 live bets at once
const STORAGE_KEY_ACTIVE = 'liveTrade_activeBets_v1';
const STORAGE_KEY_MARKERS = 'liveTrade_markers_v1';
const STORAGE_KEY_SELECTED = 'liveTrade_selectedPair_v1';

// Button presets
const BET_DURATIONS = [
  { label: '1 min', value: 60 },
  { label: '3 min', value: 3 * 60 }, // quick access for 3-minute default
  { label: '5 min', value: 5 * 60 },
  { label: '10 min', value: 10 * 60 },
  { label: '15 min', value: 15 * 60 },
  { label: '30 min', value: 30 * 60 },
  { label: '1 hr', value: 60 * 60 },
  { label: '2 hr', value: 2 * 60 * 60 },
  // { label: '3 hr', value: 3 * 60 * 60 },
  // { label: '4 hr', value: 4 * 60 * 60 },
  // { label: '5 hr', value: 5 * 60 * 60 },
];

const nowSec = () => Math.floor(Date.now() / 1000);

const uuid = () =>
  'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    // eslint-disable-next-line no-mixed-operators
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });

const normalizePair = (pair = '') => {
  if (!pair) return { provider: null, symbol: null };
  const parts = pair.split(':');
  if (parts.length !== 2) return { provider: null, symbol: null };
  return { provider: parts[0], symbol: parts[1] };
};

const toBinanceSymbol = (s = '') => s.replace('/', '').toUpperCase();
const safeNumber = (x) => (typeof x === 'number' && isFinite(x) ? x : null);
const fmtNum = (v, digits = 2) => (safeNumber(v) !== null ? Number(v).toFixed(digits) : '-');
const fmtINR = (v) => {
  const n = Number(v);
  if (!isFinite(n)) return '₹-';
  return n.toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 });
};

const clamp = (n, lo, hi) => Math.min(hi, Math.max(lo, n));

// ------------------- Price Feed Manager (singleton) -------------------
class PriceFeedManager {
  constructor() {
    this.binancePrices = new Map();
    this.subscribers = new Map(); // key -> Set(cb)
    this.ws = null;
    this.reconnectAttempt = 0;
    this.connect();
  }

  connect() {
    try {
      if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) return;
      this.ws = new WebSocket(BINANCE_WS_URL);

      this.ws.onopen = () => {
        this.reconnectAttempt = 0;
        console.info('Binance WS open');
      };

      this.ws.onmessage = (ev) => {
        try {
          const data = JSON.parse(ev.data);
          if (!Array.isArray(data)) return;
          for (const t of data) {
            if (t && t.s && t.c) {
              const sym = t.s.toUpperCase();
              const price = parseFloat(t.c);
              if (isFinite(price)) {
                this.binancePrices.set(sym, price);
                const key = `BINANCE:${sym}`;
                this.broadcast(key, price);
              }
            }
          }
        } catch (err) {
          console.error('WS parse error', err);
        }
      };

      this.ws.onclose = () => {
        this.reconnectAttempt += 1;
        const delay = Math.min(30000, 500 * Math.pow(2, this.reconnectAttempt));
        console.warn('WS closed, reconnect in', delay);
        setTimeout(() => this.connect(), delay);
      };

      this.ws.onerror = (err) => console.warn('WS err', err);
    } catch (err) {
      console.error('WS connect err', err);
    }
  }

  subscribe(key, cb) {
    if (!this.subscribers.has(key)) this.subscribers.set(key, new Set());
    this.subscribers.get(key).add(cb);

    // immediate emit if we have price
    const { provider, symbol } = normalizePair(key);
    if (provider === 'BINANCE') {
      const p = this.binancePrices.get(toBinanceSymbol(symbol));
      if (p !== undefined) cb({ price: p });
    }

    return () => {
      const s = this.subscribers.get(key);
      if (s) {
        s.delete(cb);
        if (s.size === 0) this.subscribers.delete(key);
      }
    };
  }

  broadcast(key, price) {
    const s = this.subscribers.get(key);
    if (s) s.forEach((cb) => { try { cb({ price }); } catch (e) { console.error(e); } });
  }
}

const priceFeed = new PriceFeedManager();

// ------------------- Chart Helper (Lightweight) -------------------
const useLightweightChart = (containerRef) => {
  const chartRef = useRef(null);
  const seriesRef = useRef(null);
  const markersRef = useRef([]);

  useEffect(() => {
    if (!containerRef.current) return;

    chartRef.current = createChart(containerRef.current, {
      width: containerRef.current.clientWidth,
      height: 520,
      layout: { background: { color: '#0f0f0f' }, textColor: '#d1d4dc' },
      grid: { vertLines: { color: 'rgba(255,255,255,0.03)' }, horzLines: { color: 'rgba(255,255,255,0.03)' } },
      timeScale: { timeVisible: true, secondsVisible: true },
    });

    seriesRef.current = chartRef.current.addCandlestickSeries({
      upColor: '#0f0', downColor: '#f33', borderDownColor: '#f33', borderUpColor: '#0f0', wickDownColor: '#f33', wickUpColor: '#0f0'
    });

    const handleResize = () => { if (chartRef.current) chartRef.current.resize(containerRef.current.clientWidth, 520); };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      try { chartRef.current.remove(); } catch (e) {}
      chartRef.current = null;
      seriesRef.current = null;
    };
  }, [containerRef]);

  const setCandles = useCallback((candles) => {
    if (seriesRef.current) seriesRef.current.setData(candles);
  }, []);

  const updateLast = useCallback((bar) => {
    if (seriesRef.current) seriesRef.current.update(bar);
  }, []);

  const addMarker = useCallback((marker) => {
    markersRef.current.push(marker);
    if (seriesRef.current) seriesRef.current.setMarkers([...markersRef.current]);
  }, []);

  const clearMarkers = useCallback(() => {
    markersRef.current = [];
    if (seriesRef.current) seriesRef.current.setMarkers([]);
  }, []);

  const setMarkers = useCallback((markers) => {
    markersRef.current = [...markers];
    if (seriesRef.current) seriesRef.current.setMarkers([...markersRef.current]);
  }, []);

  const getMarkers = useCallback(() => [...markersRef.current], []);

  return { setCandles, updateLast, addMarker, clearMarkers, setMarkers, getMarkers, chartRef, seriesRef };
};

// ------------------- Local Storage Helpers -------------------
const storage = {
  loadActiveBets() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_ACTIVE);
      if (!raw) return [];
      const arr = JSON.parse(raw);
      if (!Array.isArray(arr)) return [];
      return arr.map((b) => ({
        ...b,
        // ensure fields exist
        id: b.id || uuid(),
        startedAt: Number(b.startedAt) || nowSec(),
        duration: Number(b.duration) || DEFAULT_DURATION,
        amount: Number(b.amount) || 0,
        entryPrice: Number(b.entryPrice) || 0,
      }));
    } catch {
      return [];
    }
  },
  saveActiveBets(bets) {
    try {
      localStorage.setItem(STORAGE_KEY_ACTIVE, JSON.stringify(bets || []));
    } catch {}
  },
  loadMarkers() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_MARKERS);
      if (!raw) return [];
      const arr = JSON.parse(raw);
      if (!Array.isArray(arr)) return [];
      return arr;
    } catch {
      return [];
    }
  },
  saveMarkers(markers) {
    try {
      localStorage.setItem(STORAGE_KEY_MARKERS, JSON.stringify(markers || []));
    } catch {}
  },
  loadSelectedPair(fallback) {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_SELECTED);
      if (!raw) return fallback;
      return raw;
    } catch {
      return fallback;
    }
  },
  saveSelectedPair(v) {
    try { localStorage.setItem(STORAGE_KEY_SELECTED, v); } catch {}
  }
};

// ------------------- Main Component -------------------
const LiveTradingWithChartMarkers = ({ auth, refreshUserData, buyStock }) => {
  // Persist/restore selected asset
  const initialSelected = useMemo(() => storage.loadSelectedPair(AVAILABLE_PAIRS[0].value), []);
  const [selectedValue, setSelectedValue] = useState(initialSelected);

  const [livePrice, setLivePrice] = useState(null);
  const [connecting, setConnecting] = useState(true);

  // bet form (defaults: min amount & 3 min duration)
  const [betAmount, setBetAmount] = useState(MIN_BET);
  const [betDuration, setBetDuration] = useState(DEFAULT_DURATION); // seconds
  const [stopLossEnabled, setStopLossEnabled] = useState(false);
  const [stopLossAmount, setStopLossAmount] = useState(0);
  const [strikePrice, setStrikePrice] = useState('');

  // Multiple active bets (max 3)
  const [activeBets, setActiveBets] = useState(() => storage.loadActiveBets());
  const timersRef = useRef(new Map()); // betId -> setInterval id

  // history
  const [betHistory, setBetHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  // waiting-for-strike (one at a time like original)
  const [waitingForStrike, setWaitingForStrike] = useState(false);
  const hasTriggeredRef = useRef(false);
  const strikeUnsubRef = useRef(null);
  const strikeDirectionRef = useRef(null);

  // chart
  const chartContainerRef = useRef();
  const { setCandles, updateLast, addMarker, clearMarkers, getMarkers, setMarkers } = useLightweightChart(chartContainerRef);
  const candlesRef = useRef([]); // local candles builder

  // last live price ref
  const livePriceRef = useRef(null);
  useEffect(() => { livePriceRef.current = livePrice; }, [livePrice]);

  // Persist selectedValue
  useEffect(() => { storage.saveSelectedPair(selectedValue); }, [selectedValue]);

  // Subscribe to live price feed for selected asset and build 1-minute candles live
  useEffect(() => {
    setConnecting(true);

    const handleTick = ({ price }) => {
      if (!isFinite(price)) return;
      setLivePrice(price);
      setConnecting(false);

      try {
        const now = nowSec();
        const minute = Math.floor(now / 60) * 60; // epoch seconds aligned to minute
        const last = candlesRef.current[candlesRef.current.length - 1];

        if (!last || last.time < minute) {
          // start a new minute-bar
          const newBar = { time: minute, open: price, high: price, low: price, close: price };
          candlesRef.current = [...candlesRef.current, newBar];
          setCandles(candlesRef.current);
        } else {
          // update current bar
          const updated = { ...last };
          updated.high = Math.max(updated.high, price);
          updated.low = Math.min(updated.low, price);
          updated.close = price;
          candlesRef.current[candlesRef.current.length - 1] = updated;
          updateLast(updated);
        }
      } catch (e) {
        console.error('Candle update error', e);
      }
    };

    const unsub = priceFeed.subscribe(selectedValue, handleTick);
    return () => { try { unsub(); } catch (e) {} };
  }, [selectedValue, setCandles, updateLast]);

  // Fetch historical candles on symbol change (1m) and seed candlesRef
  useEffect(() => {
    const loadHistoryCandles = async () => {
      try {
        const { provider, symbol } = normalizePair(selectedValue);
        if (provider === 'BINANCE') {
          const binSym = toBinanceSymbol(symbol);
          const url = `https://api.binance.com/api/v3/klines?symbol=${binSym}&interval=1m&limit=500`;
          const r = await fetch(url);
          if (!r.ok) throw new Error('klines failed');
          const data = await r.json();
          const candles = data.map((c) => ({
            time: Math.floor(c[0] / 1000),
            open: parseFloat(c[1]),
            high: parseFloat(c[2]),
            low: parseFloat(c[3]),
            close: parseFloat(c[4])
          }));
          candlesRef.current = candles;
          setCandles(candles);
          if (candles.length) setLivePrice(candles[candles.length - 1].close);
        } else {
          // Synthetic candle generator for non-Binance pairs (visual only)
          const now = nowSec();
          const candles = Array.from({ length: 200 }).map((_, i) => {
            const t = now - (200 - i) * 60;
            const price = 100 + Math.sin(i / 10) * 2 + i * 0.01;
            return { time: t, open: price * 0.995, high: price * 1.005, low: price * 0.99, close: price };
          });
          candlesRef.current = candles;
          setCandles(candles);
          setLivePrice(candles[candles.length - 1].close);
        }
      } catch (err) {
        console.error('Failed to load candles', err);
      }
    };
    loadHistoryCandles();
  }, [selectedValue, setCandles]);

  // Load today's bet history (robust)
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetch('/api/stocks/find', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: auth.user?._id || auth.user?.id })
        });
        const json = await res.json();
        const arr = Array.isArray(json) ? json : (Array.isArray(json?.data) ? json.data : []);

        const normalizeRecord = (d) => {
          const rawDate = d.date ? new Date(d.date) : new Date();
          const entryPrice = parseFloat(d.price) || parseFloat(d.entryPrice) || 0;
          const resultPrice = d.data?.resultPrice ? parseFloat(d.data.resultPrice) : (isFinite(d.resultPrice) ? Number(d.resultPrice) : null);
          const direction = d.data?.direction || d.direction || '-';
          const outcome = d.data?.outcome || d.outcome || '-';
          const amount = isFinite(d.value) ? Number(d.value) : (isFinite(d.amount) ? Number(d.amount) : 0);
          const pnl = isFinite(d.data?.pnl) ? Number(d.data.pnl) : (isFinite(d.pnl) ? Number(d.pnl) : 0);
          return {
            id: d._id || d.id,
            time: rawDate.toLocaleString(),
            direction,
            result: outcome === 'stopped' ? 'Stopped (Loss)' : outcome,
            entryPrice,
            resultPrice,
            amount,
            pair: d.ticker || d.pair || selectedValue,
            rawDate,
            pnl
          };
        };

        const today = new Date(); today.setHours(0,0,0,0);
        const items = arr.map(normalizeRecord).filter(b => b.rawDate >= today).sort((a,b)=>b.rawDate - a.rawDate);
        if (mounted) setBetHistory(items);
      } catch (e) {
        console.error(e);
        if (mounted) setBetHistory([]);
      } finally { if (mounted) setLoadingHistory(false); }
    })();
    return () => { mounted = false; };
  }, [auth.user?._id, auth.user?.id, selectedValue]);

  // Persist activeBets whenever they change
  useEffect(() => { storage.saveActiveBets(activeBets); }, [activeBets]);

  // Persist chart markers whenever they change (pull via getMarkers)
  const persistMarkers = useCallback(() => {
    try {
      const markers = getMarkers();
      storage.saveMarkers(markers);
    } catch {}
  }, [getMarkers]);

  // On mount: restore markers from storage
  useEffect(() => {
    const m = storage.loadMarkers();
    if (Array.isArray(m) && m.length) {
      setMarkers(m);
    }
  }, [setMarkers]);

  // Utility: compute P/L for binary-style payout
  const computePnL = (bet, exitPrice, outcome) => {
    if (!bet) return 0;
    if (outcome === 'won') return Number((bet.amount * PAYOUT_PCT).toFixed(2));
    // stopped or lost -> lose full stake
    return Number((-bet.amount).toFixed(2));
  };

  // Utility: Add entry/exit markers (with persistence)
  const addEntryMarker = useCallback((bet) => {
    try {
      addMarker({
        time: bet.startedAt || nowSec(),
        position: bet.direction === 'up' ? 'belowBar' : 'aboveBar',
        color: bet.direction === 'up' ? '#4caf50' : '#f44336',
        shape: bet.direction === 'up' ? 'arrowUp' : 'arrowDown',
        text: `Entry ${fmtNum(bet.entryPrice)}`
      });
      persistMarkers();
    } catch (e) { console.error(e); }
  }, [addMarker, persistMarkers]);

  const addExitMarker = useCallback((bet, exitPrice) => {
    try {
      addMarker({
        time: nowSec(),
        position: bet.direction === 'up' ? 'aboveBar' : 'belowBar',
        color: '#2196f3',
        shape: 'arrowDown',
        text: `Exit ${fmtNum(exitPrice)}`
      });
      persistMarkers();
    } catch (e) { console.error(e); }
  }, [addMarker, persistMarkers]);

  // Timers: create/remove
  const clearTimerFor = useCallback((betId) => {
    const map = timersRef.current;
    const t = map.get(betId);
    if (t) {
      clearInterval(t);
      map.delete(betId);
    }
  }, []);

  const clearAllTimers = useCallback(() => {
    const map = timersRef.current;
    for (const t of map.values()) clearInterval(t);
    map.clear();
  }, []);

  // finalizeBet: exit marker, save, refresh, & remove from activeBets
  const finalizeBet = useCallback(async (outcome, exitPrice, bet) => {
    try { addExitMarker(bet, exitPrice); } catch (e) { console.error(e); }

    const pnl = computePnL(bet, exitPrice, outcome);
    const payload = {
      value: bet.amount,
      price: bet.entryPrice,
      quantity: 1,
      ticker: selectedValue,
      data: { resultPrice: exitPrice, direction: bet.direction, outcome, pnl }
    };

    try {
      await buyStock(payload);
      const rec = {
        time: new Date().toLocaleString(),
        direction: bet.direction,
        result: outcome === 'stopped' ? 'Stopped (Loss)' : outcome,
        entryPrice: bet.entryPrice,
        resultPrice: exitPrice,
        amount: bet.amount,
        pair: selectedValue,
        pnl
      };
      setBetHistory((p) => [rec, ...p]);
      console.log('Bet saved', rec);
    } catch (err) {
      console.error('Error saving bet', err);
    } finally {
      setActiveBets((prev) => prev.filter((b) => b.id !== bet.id));
      clearTimerFor(bet.id);
      try { await refreshUserData(); } catch (e) {}
    }
  }, [addExitMarker, buyStock, refreshUserData, selectedValue, clearTimerFor]);

  // Timer tick logic for a specific bet
  const startTimerForBet = useCallback((bet) => {
    // defensive: clear if exists
    clearTimerFor(bet.id);

    const tick = async () => {
      const current = livePriceRef.current ?? livePrice;
      if (!isFinite(current)) return;

      // retrieve latest bet snapshot (duration, startedAt might be persisted)
      let latestBet = bet;
      setActiveBets((prev) => {
        const found = prev.find((b) => b.id === bet.id);
        if (found) latestBet = found;
        return prev;
      });

      const elapsed = nowSec() - (latestBet.startedAt || nowSec());
      const remaining = clamp((latestBet.duration || DEFAULT_DURATION) - elapsed, -999999, 999999);

      // Stop-loss check
      if (latestBet.stopLossEnabled && latestBet.stopLossAmount > 0) {
        const priceMovement = latestBet.direction === 'up'
          ? (latestBet.entryPrice - current)
          : (current - latestBet.entryPrice);
        if (priceMovement >= latestBet.stopLossAmount) {
          // stop immediately
          await finalizeBet('stopped', current, latestBet);
          return;
        }
      }

      // Finalize if timer done
      if (remaining <= 0) {
        const didWin = (latestBet.direction === 'up' && current > latestBet.entryPrice)
                    || (latestBet.direction === 'down' && current < latestBet.entryPrice);
        await finalizeBet(didWin ? 'won' : 'lost', current, latestBet);
      }
      // else continue ticking
    };

    const id = setInterval(tick, 1000);
    timersRef.current.set(bet.id, id);
  }, [clearTimerFor, finalizeBet, livePrice]);

  // beginBet: starts countdown and places entry marker; push into activeBets
  const beginBet = useCallback((bet) => {
    const startedAt = nowSec();
    const betWithMeta = { ...bet, startedAt, id: bet.id || uuid() };

    // add to state
    setActiveBets((prev) => {
      const next = [...prev, betWithMeta].slice(0, MAX_ACTIVE_BETS); // enforce cap
      return next;
    });

    // Entry marker
    try { addEntryMarker({ ...betWithMeta }); } catch (e) { console.error(e); }

    // Timer for this bet
    startTimerForBet(betWithMeta);
  }, [addEntryMarker, startTimerForBet]);

  // Calculate live P/L estimate for each active bet
  const activeBetsWithLive = useMemo(() => {
    const lp = livePrice;
    return activeBets.map((b) => {
      const est =
        isFinite(lp) && b
          ? (( (lp > b.entryPrice && b.direction === 'up') || (lp < b.entryPrice && b.direction === 'down') )
              ? (b.amount * PAYOUT_PCT) : -b.amount)
          : 0;
      const elapsed = nowSec() - (b.startedAt || nowSec());
      const remaining = clamp((b.duration || DEFAULT_DURATION) - elapsed, 0, 999999);
      return { ...b, estPnL: est, timeLeft: remaining };
    });
  }, [activeBets, livePrice]);

  // Restore any persisted active bets on mount and (re)start timers, add markers
  useEffect(() => {
    // On first mount only
    const saved = storage.loadActiveBets();
    if (saved.length) {
      // Filter bets that belong to current selectedValue only (to avoid cross-asset issues)
      const filtered = saved.filter((b) => b.pair === selectedValue || !b.pair);
      const normalized = filtered.map((b) => ({
        ...b,
        pair: b.pair || selectedValue,
        id: b.id || uuid(),
        startedAt: Number(b.startedAt) || nowSec(),
        duration: Number(b.duration) || DEFAULT_DURATION
      }));
      setActiveBets(normalized);

      // Add entry markers & timers
      normalized.forEach((b) => {
        // Add back entry markers (so the user sees them after refresh)
        addEntryMarker(b);

        const elapsed = nowSec() - b.startedAt;
        const remaining = (b.duration || DEFAULT_DURATION) - elapsed;

        if (remaining > 0) {
          startTimerForBet(b);
        } else {
          // timer elapsed while we were away; finalize based on last price tick when it arrives
          // We'll finalize on next price tick via startTimerForBet logic, but we can quick finalize now:
          const current = livePriceRef.current ?? livePrice;
          if (isFinite(current)) {
            const didWin = (b.direction === 'up' && current > b.entryPrice)
                        || (b.direction === 'down' && current < b.entryPrice);
            finalizeBet(didWin ? 'won' : 'lost', current, b);
          } else {
            // If price unknown, we keep bet in list and timer will close when a tick arrives.
            startTimerForBet(b);
          }
        }
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // mount once

  // Strike handling: clear subscription utility
  const clearStrikeSubscription = useCallback(() => {
    if (strikeUnsubRef.current) {
      try { strikeUnsubRef.current(); } catch (e) {}
      strikeUnsubRef.current = null;
    }
  }, []);

  // When selectedValue or strikePrice changes, cancel any pending strike
  useEffect(() => {
    if (waitingForStrike) {
      clearStrikeSubscription();
      hasTriggeredRef.current = false;
      setWaitingForStrike(false);
      strikeDirectionRef.current = null;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedValue, strikePrice]);

  // startBet: immediate or strike-based start
const startBet = useCallback(async (direction) => {
  if (activeBets.length >= MAX_ACTIVE_BETS) return alert(`Max ${MAX_ACTIVE_BETS} active bets reached`);
  const balance = Number(auth.user?.balance || 0);
  if (!betAmount || betAmount <= 0) return alert('Amount must be > 0');
  if (betAmount < MIN_BET) return alert(`Minimum trade is ₹${MIN_BET}`);
  const totalLocked = activeBets.reduce((sum, b) => sum + (Number(b.amount) || 0), 0);
  if (betAmount > (balance - totalLocked)) return alert('Insufficient available balance (consider active locked bets)');

  // Fix: Trim and validate strike price input properly
  const trimmedStrike = strikePrice.trim();
  const strike = (trimmedStrike === '' || isNaN(Number(trimmedStrike))) ? null : Number(trimmedStrike);

  const commonBetFields = {
    id: uuid(),
    direction,
    amount: betAmount,
    duration: betDuration || DEFAULT_DURATION,
    strike: strike !== null && isFinite(strike) ? strike : null,
    stopLossEnabled,
    stopLossAmount,
    pair: selectedValue
  };

  if (strike !== null && isFinite(strike)) {
    // Strike-based pending trigger (one at a time)
    clearStrikeSubscription();
    hasTriggeredRef.current = false;
    setWaitingForStrike(true);
    strikeDirectionRef.current = direction;
    const key = selectedValue;
    const unsub = priceFeed.subscribe(key, ({ price }) => {
      if (!isFinite(price)) return;
      if (hasTriggeredRef.current) return;
      const crossed =
        (direction === 'up' && price >= strike) ||
        (direction === 'down' && price <= strike);
      if (crossed) {
        hasTriggeredRef.current = true;
        try { unsub(); } catch (e) {}
        strikeUnsubRef.current = null;
        setWaitingForStrike(false);
        strikeDirectionRef.current = null;
        const bet = { ...commonBetFields, entryPrice: price };
        beginBet(bet);
      }
    });
    strikeUnsubRef.current = unsub;
    return;
  }

  // immediate start (no strike)
  const current = livePriceRef.current ?? livePrice;
  if (!isFinite(current)) return alert('Current price unavailable');
  const bet = { ...commonBetFields, entryPrice: current };
  beginBet(bet);
}, [
  activeBets.length,
  auth.user,
  betAmount,
  betDuration,
  beginBet,
  clearStrikeSubscription,
  livePrice,
  selectedValue,
  stopLossAmount,
  stopLossEnabled,
  strikePrice
]);

  // Cancel pending strike (user-driven)
  const cancelPending = useCallback(() => {
    clearStrikeSubscription();
    hasTriggeredRef.current = false;
    setWaitingForStrike(false);
    strikeDirectionRef.current = null;
  }, [clearStrikeSubscription]);

  // cleanup on unmount: clear timers & strike subscription, persist markers
  useEffect(() => {
    return () => {
      clearAllTimers();
      clearStrikeSubscription();
      persistMarkers();
    };
  }, [clearAllTimers, clearStrikeSubscription, persistMarkers]);

  // UI render helpers
  const canStartNewBet = activeBets.length < MAX_ACTIVE_BETS && !waitingForStrike;

  const ActiveBetCard = ({ bet }) => {
    const lp = livePrice;
    const diff = isFinite(lp) ? (lp - bet.entryPrice) : null;
    const inProfit = isFinite(diff)
      ? ((bet.direction === 'up' && diff > 0) || (bet.direction === 'down' && diff < 0))
      : false;

    const estPnL = bet.estPnL ?? 0;
    const estColor = estPnL > 0 ? '#0f0' : (estPnL < 0 ? '#f33' : '#ccc');

    const barPct = useMemo(() => {
      const elapsed = nowSec() - (bet.startedAt || nowSec());
      const total = bet.duration || DEFAULT_DURATION;
      const pct = clamp((elapsed / Math.max(1, total)) * 100, 0, 100);
      return pct;
    }, [bet.startedAt, bet.duration, livePrice]); // tick ties re-render; progress moves visually

    return (
      <div
        key={bet.id}
        style={{
          marginTop: 12,
          padding: 12,
          borderRadius: 10,
          background: '#111',
          border: '1px solid #222'
        }}
      >
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <div>
            <div style={{ color:'#aaa', fontSize:12 }}>Active Bet</div>
            <div style={{ fontWeight:700 }}>
              {selectedValue} • {bet.direction.toUpperCase()}
            </div>
          </div>
          <div style={{ textAlign:'right' }}>
            <div style={{ fontWeight:700, fontSize: 18 }}>{fmtNum(livePrice)}</div>
            <div style={{ color: inProfit ? '#0f0' : '#f33', fontWeight:700 }}>
              {isFinite(diff) ? `${diff >= 0 ? '+' : ''}${fmtNum(diff)}` : '-'}
            </div>
            <div style={{ marginTop: 4 }}>
              P/L (est): <b style={{ color: estColor }}>{fmtINR(estPnL)}</b>
            </div>
          </div>
        </div>

        <div style={{ marginTop: 8, fontSize:13, color:'#bbb' }}>
          Entry: <b>{fmtNum(bet.entryPrice)}</b> • Amount: <b>{fmtINR(bet.amount)}</b> • Time left: <b>{bet.timeLeft ?? 0}s</b>
        </div>

        <div style={{ height: 8, background:'#1b1b1b', borderRadius: 6, overflow:'hidden', marginTop: 8 }}>
          <div style={{ height:'100%', width: `${barPct}%`, background:'#ffc107' }} />
        </div>

        {bet.stopLossEnabled && (
          <div style={{ marginTop: 6, fontSize:12, color:'#aaa' }}>
            Stop Loss: {fmtNum(bet.stopLossAmount)} (abs)
          </div>
        )}
      </div>
    );
  };

  const renderHistoryItem = (h, idx) => {
    const pnlColor = h.pnl > 0 ? '#0f0' : (h.pnl < 0 ? '#f33' : '#aaa');
    const priceMove = (isFinite(h.resultPrice) ? (h.resultPrice - h.entryPrice) : 0);
    const priceMovePct = isFinite(h.entryPrice) && h.entryPrice !== 0 ? (priceMove / h.entryPrice) * 100 : 0;
    return (
      <div key={h.id || idx} style={{ padding: 8, marginBottom: 6, borderRadius: 6, background: '#141414' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <strong>{h.pair}</strong>
          <span style={{ color: '#aaa' }}>{h.time}</span>
        </div>
        <div>Dir: <b>{h.direction?.toUpperCase()}</b> • Amount: <b>{fmtINR(h.amount)}</b></div>
        <div>Entry: {fmtNum(h.entryPrice)} → Exit: {isFinite(h.resultPrice) ? fmtNum(h.resultPrice) : '-'}</div>
        <div>Δ Price: {fmtNum(priceMove)} ({fmtNum(priceMovePct, 2)}%)</div>
        <div>Result: <b style={{ color: pnlColor }}>{h.result}</b></div>
      </div>
    );
  };

  // --- JSX ---
  return (
    <div style={{ minHeight: '100vh', background: '#0f0f0f', color: '#fff' }}>
      <NavBar />
      <Container fluid className='py-4 mobile-padding-top'>
        <Row>
          {/* LEFT: Trading Panel */}
          <Col md={4}>
            <div style={{ padding: 16, borderRadius: 10, background: 'linear-gradient(180deg,#171717,#0f0f0f)', border: '1px solid #ffc107' }}>
              <h4 style={{ color: '#ffc107', textAlign: 'center' }}>📈 Trading Panel</h4>

              <div style={{ marginTop: 8, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <div>
                  <div style={{ color: '#ccc' }}>Balance</div>
                  <div style={{ color: '#28a745', fontWeight: 700 }}>{fmtINR(Number(auth.user?.balance || 0))}</div>
                </div>
                <Badge bg="secondary" text="light" style={{ background:'#333' }}>
                  Active: {activeBets.length}/{MAX_ACTIVE_BETS}
                </Badge>
              </div>

              <Form.Group className='mt-3'>
                <Form.Label style={{ color: '#ccc' }}>Asset</Form.Label>
                <Form.Control
                  as='select'
                  value={selectedValue}
                  onChange={(e) => setSelectedValue(e.target.value)}
                  disabled={activeBets.length > 0 || waitingForStrike}
                >
                  {Array.from(new Set(AVAILABLE_PAIRS.map(p => p.group))).map(g => (
                    <optgroup key={g} label={g}>
                      {AVAILABLE_PAIRS.filter(p => p.group === g).map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                    </optgroup>
                  ))}
                </Form.Control>
                {activeBets.length > 0 && (
                  <div style={{ color:'#999', fontSize:12, marginTop:4 }}>
                    Asset switching is disabled while trades are live.
                  </div>
                )}
              </Form.Group>

              <div style={{ marginTop: 12 }}>
                Current Price: <strong>{fmtNum(livePrice)}</strong> {connecting && <Spinner size='sm' animation='border' />}
              </div>

              <Form.Group className='mt-3'>
                <Form.Label>Amount (min ₹50)</Form.Label>
                <Form.Control
                  type='number'
                  min={MIN_BET}
                  value={betAmount}
                  onChange={(e) => setBetAmount(Math.max(0, parseFloat(e.target.value) || 0))}
                  disabled={waitingForStrike}
                />
              </Form.Group>

              <Form.Group className='mt-3'>
                <Form.Label>Duration</Form.Label>
                <Form.Control
                  as='select'
                  value={betDuration}
                  onChange={(e) => setBetDuration(parseInt(e.target.value) || DEFAULT_DURATION)}
                  disabled={waitingForStrike}
                >
                  {BET_DURATIONS.map(d => (
                    <option key={d.value} value={d.value}>{d.label}</option>
                  ))}
                </Form.Control>
                <div className='mt-2' style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {BET_DURATIONS.map(d => (
                    <Button
                      key={d.value}
                      size='sm'
                      variant='outline-secondary'
                      disabled={waitingForStrike}
                      onClick={() => setBetDuration(d.value)}
                    >
                      {d.label}
                    </Button>
                  ))}
                </div>
                <div style={{ color:'#999', fontSize:12, marginTop:6 }}>
                  Default is <b>3 minutes</b>. You can change it here or with quick buttons.
                </div>
              </Form.Group>

              <Form.Group className='mt-3'>
                <Form.Label>Strike / Trigger Price (optional)</Form.Label>
                <Form.Control
                  value={strikePrice}
                  onChange={(e) => setStrikePrice(e.target.value)}
                  placeholder='Leave empty to start immediately'
                  disabled={waitingForStrike}
                />
              </Form.Group>

              <Form.Group className='mt-3'>
                <Form.Check
                  label='Enable Stop Loss'
                  checked={stopLossEnabled}
                  onChange={(e) => setStopLossEnabled(e.target.checked)}
                  disabled={waitingForStrike}
                />
              </Form.Group>

              {stopLossEnabled && (
                <Form.Group className='mt-2'>
                  <Form.Label>Stop Loss Amount (absolute)</Form.Label>
                  <Form.Control
                    type='number'
                    min='0'
                    value={stopLossAmount}
                    onChange={(e) => setStopLossAmount(parseFloat(e.target.value) || 0)}
                    disabled={waitingForStrike}
                  />
                </Form.Group>
              )}

              <Row className='mt-3'>
                <Col>
                  <Button
                    variant='outline-success'
                    onClick={() => startBet('up')}
                    disabled={!canStartNewBet}
                    style={{ width: '100%' }}
                  >
                    Buy
                  </Button>
                </Col>
                <Col>
                  <Button
                    variant='outline-danger'
                    onClick={() => startBet('down')}
                    disabled={!canStartNewBet}
                    style={{ width: '100%' }}
                  >
                    Sell
                  </Button>
                </Col>
              </Row>

              {!canStartNewBet && (
                <Alert variant='warning' className='mt-3' style={{ padding: '8px 12px' }}>
                  {waitingForStrike
                    ? 'Waiting for strike trigger. Cancel it to place other trades.'
                    : `You already have ${MAX_ACTIVE_BETS} active trades.`}
                </Alert>
              )}

              {waitingForStrike && (
                <div style={{ marginTop: 12 }}>
                  <Alert variant='warning' className='mb-2' style={{ padding: '8px 12px' }}>
                    Waiting for price to reach strike <strong>{strikePrice}</strong> for
                    {' '}<b>{strikeDirectionRef.current?.toUpperCase?.() || '-'}</b>. You can edit asset/strike to cancel or press Cancel.
                  </Alert>
                  <Button variant='outline-light' onClick={cancelPending} style={{ width: '100%' }}>Cancel Pending Strike</Button>
                </div>
              )}

              {/* Active Bets (stacked) */}
              {activeBetsWithLive.length > 0 && (
                <div style={{ marginTop: 12, padding: 10, borderRadius: 8, background: '#111' }}>
                  <div style={{ fontSize: 14, color: '#ccc' }}>Active Bets</div>
                  <div style={{ fontSize:12, color:'#888' }}>
                    Each bet shows its own countdown & estimated P/L.
                  </div>
                  {activeBetsWithLive.map((b) => <ActiveBetCard key={b.id} bet={b} />)}
                </div>
              )}

              <div style={{ marginTop: 12 }}>
                <h6 style={{ color: '#ccc' }}>Bet History (Today)</h6>
                <div style={{ maxHeight: 300, overflowY: 'auto' }}>
                  {loadingHistory ? (
                    <div style={{ color: '#888' }}><Spinner size='sm' animation='border' /> Loading...</div>
                  ) : (
                    betHistory.length === 0 ? (
                      <div style={{ color: '#888' }}>No bets yet</div>
                    ) : (
                      betHistory.map(renderHistoryItem)
                    )
                  )}
                </div>
              </div>
            </div>
          </Col>

          {/* RIGHT: Chart & controls */}
          <Col md={8}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {/* Optional top-right quick status */}
              {activeBetsWithLive.length > 0 && (
                <div style={{ padding: 10 }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                    <div>
                      <div style={{ color: '#ccc' }}>Live Trades</div>
                      <div style={{ fontWeight:700 }}>{selectedValue}</div>
                    </div>
                    <div style={{ textAlign: 'right', fontSize: 12, color:'#aaa' }}>
                      {activeBetsWithLive.map((b, i) => {
                        const lp = livePrice;
                        const diff = isFinite(lp) ? (lp - b.entryPrice) : null;
                        const inProfit = isFinite(diff)
                          ? ((b.direction === 'up' && diff > 0) || (b.direction === 'down' && diff < 0))
                          : false;
                        return (
                          <div key={b.id} style={{ marginBottom: 4 }}>
                            Bet {i+1}: <b>{b.direction.toUpperCase()}</b> •
                            Entry {fmtNum(b.entryPrice)} • Left {b.timeLeft}s •{' '}
                            <span style={{ color: inProfit ? '#0f0' : '#f33' }}>
                              {isFinite(diff) ? `${diff >= 0 ? '+' : ''}${fmtNum(diff)}` : '-'}
                            </span> • P/L:{' '}
                            <b style={{ color: b.estPnL > 0 ? '#0f0' : (b.estPnL < 0 ? '#f33' : '#ccc') }}>
                              {fmtINR(b.estPnL)}
                            </b>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              <div ref={chartContainerRef} style={{ height: 520, borderRadius: 8, overflow: 'hidden' }} />

              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <div style={{ color:'#888' }}>
                  Chart powered by lightweight-charts; markers show entry & exit. Candles update live (1m aggregation).
                </div>
                <div style={{ display:'flex', gap:8 }}>
                  <Button
                    variant='secondary'
                    onClick={() => { priceFeed.connect(); setConnecting(true); }}
                  >
                    Reconnect Feed
                  </Button>
                  <Button
                    variant='outline-light'
                    onClick={() => { clearMarkers(); storage.saveMarkers([]); }}
                  >
                    Clear Markers
                  </Button>
                </div>
              </div>
            </div>
          </Col>
        </Row>
      </Container>
      <Footerv2 />
    </div>
  );
};

LiveTradingWithChartMarkers.propTypes = {
  auth: PropTypes.object.isRequired,
  refreshUserData: PropTypes.func.isRequired,
  buyStock: PropTypes.func.isRequired
};

const mapStateToProps = (state) => ({ auth: state.auth, user: state.user });
export default connect(mapStateToProps, { refreshUserData, buyStock })(LiveTradingWithChartMarkers);


