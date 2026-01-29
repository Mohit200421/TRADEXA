/**
 * Instrument-wise PnL Calculator
 * Supports: Forex, XAUUSD, Indices, Crypto
 */

const INSTRUMENT_CONFIG = {
  // 🔸 Forex (EURUSD, GBPUSD, etc.)
  FOREX: {
    pipSize: 0.0001,
    pipValuePerLot: 10, // 1 lot = $10 per pip
  },

  // 🔸 Gold
  XAUUSD: {
    pipSize: 0.01,
    pipValuePerLot: 1, // 0.01 lot → $1 per pip
  },

  // 🔸 Indices (example)
  US30: {
    pipSize: 1,
    pipValuePerLot: 1,
  },

  // 🔸 Crypto (BTC, ETH)
  CRYPTO: {
    pipSize: 1,
    pipValuePerLot: 1,
  },
};

function detectInstrument(symbol) {
  if (symbol === "XAUUSD") return INSTRUMENT_CONFIG.XAUUSD;
  if (symbol.endsWith("USD") && symbol.length === 6)
    return INSTRUMENT_CONFIG.FOREX;
  if (["US30", "NAS100", "SPX500"].includes(symbol))
    return INSTRUMENT_CONFIG.US30;

  return INSTRUMENT_CONFIG.CRYPTO;
}

exports.calculatePnL = ({
  symbol,
  side, // BUY | SELL
  entry,
  exit,
  quantity, // lots
}) => {
  const config = detectInstrument(symbol);

  const priceDiff =
    side === "BUY" ? exit - entry : entry - exit;

  const pips = priceDiff / config.pipSize;

  const pnl =
    pips * config.pipValuePerLot * quantity;

  return {
    pips: Number(pips.toFixed(2)),
    pnl: Number(pnl.toFixed(2)),
  };
};
