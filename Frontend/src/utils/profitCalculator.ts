/**
 * Universal Trading Profit Calculator
 * Account currency: USD
 * Fully corrected & stable version
 */

export type TradeDirection = "BUY" | "SELL";

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
  XAUUSD: { pipSize: 0.1, contractSize: 100 },   // 1 pip = 0.1
  XAGUSD: { pipSize: 0.01, contractSize: 5000 },

  // ---------- CRYPTO ----------
  BTCUSD: { pipSize: 1, contractSize: 1 },
  ETHUSD: { pipSize: 1, contractSize: 1 },
};

export function calculateProfit({
  symbol,
  type,
  entryPrice,
  exitPrice,
  lotSize,
}: {
  symbol: string;
  type: TradeDirection;
  entryPrice: number;
  exitPrice: number;
  lotSize: number;
}) {
  const instrument = INSTRUMENTS[symbol];

  if (!instrument) {
    throw new Error(`Unsupported symbol: ${symbol}`);
  }

  if (
    isNaN(entryPrice) ||
    isNaN(exitPrice) ||
    isNaN(lotSize) ||
    entryPrice <= 0 ||
    exitPrice <= 0 ||
    lotSize <= 0
  ) {
    throw new Error("Invalid trade values");
  }

  const { pipSize, contractSize } = instrument;

  // ---------------------------------
  // PRICE DIFFERENCE (BASED ON TYPE)
  // ---------------------------------
  const priceDiff =
    type === "BUY"
      ? exitPrice - entryPrice
      : entryPrice - exitPrice;

  // ---------------------------------
  // PIPS (always positive number)
  // ---------------------------------
  const pips = Math.abs(priceDiff / pipSize);

  // ---------------------------------
  // PnL Calculation
  // Formula:
  // price difference × contract size × lot size
  // ---------------------------------
  let pnl = priceDiff * contractSize * lotSize;

  // ---------------------------------
  // Convert non-USD quoted pairs to USD
  // (EURGBP, EURJPY, etc.)
  // ---------------------------------
  if (!symbol.endsWith("USD")) {
    pnl = pnl / exitPrice;
  }

  return {
    symbol,
    type,
    entryPrice,
    exitPrice,
    lotSize,
    pips: Number(pips.toFixed(2)),
    pnl: Number(pnl.toFixed(2)),
  };
}
