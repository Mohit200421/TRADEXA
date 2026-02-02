import { useState, useMemo } from "react";
import {
  ArrowLeft,
  Calculator,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { calculateProfit, INSTRUMENTS } from "../utils/profitCalculator";
import toast from "react-hot-toast";

export default function ProfitCalculator() {
  const navigate = useNavigate();

  const [symbol, setSymbol] = useState("XAUUSD");
  const [direction, setDirection] = useState<"BUY" | "SELL">("BUY");
  const [entry, setEntry] = useState("");
  const [exit, setExit] = useState("");
  const [lotSize, setLotSize] = useState("0.1");
  const [balance, setBalance] = useState("10000");

  const result = useMemo(() => {
    if (!entry || !exit || !lotSize) return null;

    try {
      const calc = calculateProfit({
        symbol,
        type: direction,
        entryPrice: Number(entry),
        exitPrice: Number(exit),
        lotSize: Number(lotSize),
      });

      const percent =
        balance && Number(balance)
          ? (calc.pnl / Number(balance)) * 100
          : 0;

      return {
        ...calc,
        percent,
      };
    } catch (err: any) {
      toast.error(err.message);
      return null;
    }
  }, [entry, exit, lotSize, direction, symbol, balance]);

  const isProfit = result && result.pnl >= 0;

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
          <Calculator size={22} />
        </div>
        <div>
          <h1 className="text-2xl font-semibold">Profit Calculator</h1>
          <p className="text-sm text-text-secondary">
            Accurate P&L calculation based on real contract sizes
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* INPUTS */}
        <div className="space-y-4">
          <Card title="Trade Parameters">
            <Field label="Trading Instrument">
              <select
                value={symbol}
                onChange={(e) => setSymbol(e.target.value)}
                className="input"
              >
                {Object.keys(INSTRUMENTS).map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </Field>

            <Field label="Direction">
              <div className="grid grid-cols-2 gap-2">
                {["BUY", "SELL"].map((d) => (
                  <button
                    key={d}
                    onClick={() => setDirection(d as any)}
                    className={`py-2 rounded-lg border text-sm ${
                      direction === d
                        ? "bg-primary/10 border-primary text-primary"
                        : "border-border"
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </Field>

            <Field label="Entry Price">
              <input
                value={entry}
                onChange={(e) => setEntry(e.target.value)}
                className="input"
              />
            </Field>

            <Field label="Exit Price">
              <input
                value={exit}
                onChange={(e) => setExit(e.target.value)}
                className="input"
              />
            </Field>

            <Field label="Lot Size">
              <input
                value={lotSize}
                onChange={(e) => setLotSize(e.target.value)}
                className="input"
              />
            </Field>

            <Field label="Account Balance (optional)">
              <input
                value={balance}
                onChange={(e) => setBalance(e.target.value)}
                className="input"
              />
            </Field>
          </Card>
        </div>

        {/* RESULT */}
        <div className="space-y-4">
          <Card title="Result">
            {!result ? (
              <div className="text-center text-text-secondary py-10">
                Enter trade details to calculate profit
              </div>
            ) : (
              <>
                <div
                  className={`rounded-2xl p-6 text-center ${
                    isProfit
                      ? "bg-blue-500/10 text-blue-500"
                      : "bg-red-500/10 text-red-500"
                  }`}
                >
                  <p className="text-xs uppercase mb-1">
                    Total {isProfit ? "Profit" : "Loss"}
                  </p>
                  <p className="text-4xl font-bold">
                    {result.pnl.toFixed(2)} USD
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-4">
                  <Stat
                    icon={
                      isProfit ? (
                        <TrendingUp size={18} />
                      ) : (
                        <TrendingDown size={18} />
                      )
                    }
                    label="Pips"
                    value={result.pips}
                  />

                  <Stat
                    label="Balance Impact"
                    value={`${result.percent.toFixed(2)}%`}
                  />
                </div>
              </>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}

/* ---------- UI HELPERS ---------- */

function Card({ title, children }: any) {
  return (
    <div className="card p-6 space-y-4">
      <h3 className="text-sm font-semibold text-text-secondary uppercase">
        {title}
      </h3>
      {children}
    </div>
  );
}

function Field({ label, children }: any) {
  return (
    <div>
      <label className="text-xs font-medium">{label}</label>
      <div className="mt-1">{children}</div>
    </div>
  );
}

function Stat({ icon, label, value }: any) {
  return (
    <div className="rounded-xl border border-border p-4 text-center">
      {icon && <div className="mb-1 flex justify-center">{icon}</div>}
      <p className="text-xs text-text-secondary">{label}</p>
      <p className="text-lg font-semibold">{value}</p>
    </div>
  );
}
