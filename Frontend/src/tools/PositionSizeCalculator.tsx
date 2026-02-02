import { useMemo, useState } from "react";
import { ArrowLeft, Calculator, Shield, AlertTriangle } from "lucide-react";
import { useNavigate } from "react-router-dom";

/* =========================
   INSTRUMENT DATA
========================= */

type Instrument = {
  symbol: string;
  pipValue: number; // per standard lot
  pipSize: number;
};

const INSTRUMENTS: Record<string, Instrument[]> = {
  Popular: [
    { symbol: "XAUUSD", pipValue: 10, pipSize: 0.01 },
    { symbol: "BTCUSD", pipValue: 1, pipSize: 1 },
    { symbol: "ETHUSD", pipValue: 1, pipSize: 0.01 },
  ],
  "Forex Majors": [
    { symbol: "EURUSD", pipValue: 10, pipSize: 0.0001 },
    { symbol: "GBPUSD", pipValue: 10, pipSize: 0.0001 },
    { symbol: "USDJPY", pipValue: 9.1, pipSize: 0.01 },
    { symbol: "USDCAD", pipValue: 7.6, pipSize: 0.0001 },
    { symbol: "AUDUSD", pipValue: 10, pipSize: 0.0001 },
    { symbol: "NZDUSD", pipValue: 10, pipSize: 0.0001 },
  ],
  Metals: [{ symbol: "XAGUSD", pipValue: 5, pipSize: 0.01 }],
  Crypto: [
    { symbol: "SOLUSD", pipValue: 1, pipSize: 0.01 },
    { symbol: "XRPUSD", pipValue: 1, pipSize: 0.0001 },
    { symbol: "BNBUSD", pipValue: 1, pipSize: 0.01 },
    { symbol: "ADAUSD", pipValue: 1, pipSize: 0.0001 },
  ],
};

/* =========================
   MAIN COMPONENT
========================= */

export default function PositionSizeCalculator() {
  const navigate = useNavigate();

  const [balance, setBalance] = useState(5000);
  const [riskPercent, setRiskPercent] = useState(1);
  const [stopLoss, setStopLoss] = useState(20);
  const [symbol, setSymbol] = useState("GBPAUD");

  const instrument = useMemo(() => {
    return Object.values(INSTRUMENTS)
      .flat()
      .find((i) => i.symbol === symbol);
  }, [symbol]);

  const riskAmount = useMemo(
    () => (balance * riskPercent) / 100,
    [balance, riskPercent]
  );

  const positionSize = useMemo(() => {
    if (!instrument || stopLoss <= 0) return 0;
    return riskAmount / (stopLoss * instrument.pipValue);
  }, [riskAmount, stopLoss, instrument]);

  const miniLots = positionSize * 10;
  const microLots = positionSize * 100;

  /* ========================= */

  return (
    <div className="space-y-6">
      {/* BACK */}
      <button
        onClick={() => navigate("/tools")}
        className="flex items-center gap-2 text-sm text-text-secondary hover:text-text"
      >
        <ArrowLeft size={16} />
        Back to Tools
      </button>

      {/* HEADER */}
      <div className="flex items-center gap-4">
        <div className="p-3 rounded-xl bg-primary/10 text-primary">
          <Calculator />
        </div>
        <div>
          <h1 className="text-2xl font-semibold">Position Size Calculator</h1>
          <p className="text-sm text-text-secondary">
            Calculate optimal lot size based on risk tolerance
          </p>
        </div>
      </div>

      {/* GRID */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* ================= LEFT ================= */}
        <div className="space-y-6">
          {/* ACCOUNT BALANCE */}
          <Card title="Account Balance">
            <input
              type="number"
              value={balance}
              onChange={(e) => setBalance(Number(e.target.value))}
              className="input"
            />
            <p className="text-xs text-text-secondary mt-2">
              Enter your trading account balance
            </p>
          </Card>

          {/* RISK */}
          <Card title="Risk Percentage">
            <div className="flex items-center justify-between mb-3">
              <span className="text-3xl font-bold">{riskPercent}%</span>
              <span className="text-sm font-medium">
                ${riskAmount.toFixed(2)}
              </span>
            </div>

            <input
              type="range"
              min={0.1}
              max={5}
              step={0.1}
              value={riskPercent}
              onChange={(e) => setRiskPercent(Number(e.target.value))}
              className="w-full"
            />

            <div className="grid grid-cols-5 gap-2 mt-4">
              {[0.5, 1, 2, 3, 5].map((v) => (
                <button
                  key={v}
                  onClick={() => setRiskPercent(v)}
                  className={`px-3 py-2 rounded-lg border text-sm ${
                    riskPercent === v
                      ? "bg-primary/10 border-primary text-primary"
                      : "border-border"
                  }`}
                >
                  {v}%
                </button>
              ))}
            </div>
          </Card>

          {/* STOP LOSS */}
          <Card title="Stop Loss Distance">
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={stopLoss}
                onChange={(e) => setStopLoss(Number(e.target.value))}
                className="input"
              />
              <span className="text-sm">pips</span>
            </div>
            <p className="text-xs text-text-secondary mt-2">
              Distance from entry to stop loss
            </p>
          </Card>

          {/* INSTRUMENT */}
          <Card title="Trading Instrument">
            <select
              value={symbol}
              onChange={(e) => setSymbol(e.target.value)}
              className="input"
            >
              {Object.entries(INSTRUMENTS).map(([group, list]) => (
                <optgroup key={group} label={group}>
                  {list.map((i) => (
                    <option key={i.symbol} value={i.symbol}>
                      {i.symbol}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>

            {instrument && (
              <div className="mt-3 text-xs text-text-secondary">
                Pip Value: ${instrument.pipValue}/lot • Pip Size:{" "}
                {instrument.pipSize}
              </div>
            )}
          </Card>

          {/* ACTIONS */}
          <div className="flex gap-3">
            <button className="btn-primary flex-1">
              Calculate Position Size
            </button>
            <button
              onClick={() => {
                setBalance(5000);
                setRiskPercent(1);
                setStopLoss(20);
              }}
              className="btn-secondary"
            >
              Reset
            </button>
          </div>
        </div>

        {/* ================= RIGHT ================= */}
        <div className="space-y-6">
          {/* RESULT */}
          <div className="card p-6 text-center">
            <p className="text-xs text-text-secondary mb-1">
              Recommended Position Size
            </p>
            <p className="text-5xl font-bold text-primary">
              {positionSize.toFixed(2)}
            </p>
            <p className="text-sm mt-1">Standard Lots</p>
            <p className="text-xs text-text-secondary mt-2">
              Based on {riskPercent}% risk (${riskAmount.toFixed(2)})
            </p>
          </div>

          {/* STATS */}
          <div className="grid grid-cols-2 gap-4">
            <Stat
              icon={<Calculator />}
              label="Mini Lots"
              value={miniLots.toFixed(2)}
              sub="10,000 units"
            />
            <Stat
              icon={<Calculator />}
              label="Micro Lots"
              value={microLots.toFixed(2)}
              sub="1,000 units"
            />
            <Stat
              icon={<Shield />}
              label="Risk Amount"
              value={`$${riskAmount.toFixed(2)}`}
              sub={`${riskPercent}% of balance`}
            />
            <Stat
              icon={<AlertTriangle />}
              label="Loss at Stop"
              value={`$${riskAmount.toFixed(2)}`}
              sub="If SL is hit"
              danger
            />
          </div>

          {/* FORMULA */}
          <Card title="How is this calculated?">
            <p className="text-sm">
              <strong>Formula:</strong>
              <br />
              Position Size = Risk Amount ÷ (Stop Loss × Pip Value)
            </p>
            {instrument && (
              <p className="text-xs mt-3 text-text-secondary">
                = ${riskAmount.toFixed(2)} ÷ ({stopLoss} × $
                {instrument.pipValue}) = {positionSize.toFixed(2)} lots
              </p>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}

/* =========================
   SMALL UI COMPONENTS
========================= */

function Card({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="card p-5">
      <h3 className="text-xs font-semibold uppercase text-text-secondary mb-4">
        {title}
      </h3>
      {children}
    </div>
  );
}

function Stat({
  icon,
  label,
  value,
  sub,
  danger,
}: any) {
  return (
    <div
      className={`rounded-xl border p-4 ${
        danger ? "border-red-500/40" : "border-border"
      }`}
    >
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <p className="text-xs text-text-secondary">{label}</p>
      </div>
      <p
        className={`text-xl font-semibold ${
          danger ? "text-red-500" : ""
        }`}
      >
        {value}
      </p>
      <p className="text-xs text-text-secondary">{sub}</p>
    </div>
  );
}
