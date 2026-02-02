/**
 * Universal Trading Profit Calculator (Frontend)
 * Matches backend pnlCalculator EXACTLY
 * Account currency: USD
 */

export const INSTRUMENTS: Record<
  string,
  { pipSize: number; contractSize: number }
> = {
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
  XAUUSD: { pipSize: 0.01, contractSize: 100 },
  XAGUSD: { pipSize: 0.01, contractSize: 5000 },

  // ---------- CRYPTO ----------
  BTCUSD: { pipSize: 1, contractSize: 1 },
  ETHUSD: { pipSize: 1, contractSize: 1 },
};

export function calculateProfit({
  symbol,
  type, // LONG / SHORT
  entryPrice,
  exitPrice,
  lotSize,
}: {
  symbol: string;
  type: "LONG" | "SHORT";
  entryPrice: number;
  exitPrice: number;
  lotSize: number;
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
    type === "LONG"
      ? exitPrice - entryPrice
      : entryPrice - exitPrice;

  // --------------------
  // PIPS
  // --------------------
  const pips = priceDiff / pipSize;

  // --------------------
  // PIP VALUE (USD)
  // --------------------
  let pipValue: number;

  // USD quoted (EURUSD, XAUUSD, BTCUSD)
  if (symbol.endsWith("USD")) {
    pipValue = pipSize * contractSize * lotSize;
  }
  // USD base (USDJPY)
  else if (symbol.startsWith("USD")) {
    pipValue = (pipSize * contractSize * lotSize) / exitPrice;
  }
  // Cross pairs (EURJPY, GBPJPY)
  else {
    pipValue = (pipSize * contractSize * lotSize) / exitPrice;
  }

  // --------------------
  // PROFIT / LOSS
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
