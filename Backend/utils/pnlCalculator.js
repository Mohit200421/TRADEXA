/**
 * Universal Trading PnL Calculator
 * Supports: Forex, Metals, Crypto
 * Account currency: USD
 */

const INSTRUMENTS = {
  // ---------- FOREX ----------
  EURUSD: { pipSize: 0.0001, contractSize: 100000 },
  GBPUSD: { pipSize: 0.0001, contractSize: 100000 },
  AUDUSD: { pipSize: 0.0001, contractSize: 100000 },
  NZDUSD: { pipSize: 0.0001, contractSize: 100000 },
  EURGBP: { pipSize: 0.0001, contractSize: 100000 },
  USDCAD: { pipSize: 0.0001, contractSize: 100000 },
  USDCHF: { pipSize: 0.0001, contractSize: 100000 },

  USDJPY: { pipSize: 0.01, contractSize: 100000 },
  EURJPY: { pipSize: 0.01, contractSize: 100000 },
  GBPJPY: { pipSize: 0.01, contractSize: 100000 },

  // ---------- METALS ----------
  XAUUSD: { pipSize: 0.01, contractSize: 100 },   // Gold
  XAGUSD: { pipSize: 0.01, contractSize: 5000 },  // Silver

  // ---------- CRYPTO ----------
  BTCUSD: { pipSize: 1, contractSize: 1 },
  ETHUSD: { pipSize: 1, contractSize: 1 },
};

function calculatePnL({
  symbol,
  type,        // BUY / SELL or LONG / SHORT
  entryPrice,
  exitPrice,
  lotSize,     // 0.01, 0.1, 1
}) {
  const instrument = INSTRUMENTS[symbol];

  if (!instrument) {
    throw new Error(`Unsupported symbol: ${symbol}`);
  }

  const { pipSize, contractSize } = instrument;

  // --------------------
  // PRICE DIFFERENCE
  // --------------------
  const priceDiff =
    type === "BUY" || type === "LONG"
      ? exitPrice - entryPrice
      : entryPrice - exitPrice;

  // --------------------
  // PIPS
  // --------------------
  const pips = priceDiff / pipSize;

  // --------------------
  // PIP VALUE (USD)
  // --------------------
  let pipValue;

  // USD quoted instruments
  if (symbol.endsWith("USD")) {
    pipValue = pipSize * contractSize * lotSize;
  }
  // USD base pairs (USDJPY etc)
  else if (symbol.startsWith("USD")) {
    pipValue = (pipSize * contractSize * lotSize) / exitPrice;
  }
  // Cross pairs (EURJPY etc) – approximate USD conversion
  else {
    pipValue = (pipSize * contractSize * lotSize) / exitPrice;
  }

  // --------------------
  // PNL
  // --------------------
  const pnl = pips * pipValue;

  return {
    symbol,
    type,
    entryPrice,
    exitPrice,
    lotSize,
    pips: Number(pips.toFixed(2)),
    pipValue: Number(pipValue.toFixed(4)),
    pnl: Number(pnl.toFixed(2)),
  };
}

module.exports = { calculatePnL };
