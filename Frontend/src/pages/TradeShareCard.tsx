import { format } from "date-fns";

interface TradeData {
  pnl: number;
  type: 'BUY' | 'SELL' | 'LONG' | 'SHORT';
  lotSize: number | string;
  symbol: string;
  entryPrice: number | string;
  exitPrice: number | string;
  entryDate?: string;
  exitDate?: string;
  profitPercentage?: number;
}

interface TradeShareCardProps {
  trade: TradeData;
  username?: string;
  platform?: string;
}

const TradeShareCard = ({ 
  trade, 
  username = "Trader", 
  platform = "Tradexa" 
}: TradeShareCardProps) => {
  const isProfit = trade.pnl >= 0;
  const formattedPnl = typeof trade.pnl === 'number' 
    ? trade.pnl.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    : trade.pnl;
  
  const formatPrice = (price: number | string) => {
    if (typeof price === 'number') {
      return price.toFixed(5);
    }
    return price;
  };

  const currentDate = format(new Date(), "MMMM dd, yyyy").toUpperCase();

  return (
    <div
      id="shareCard"
      style={{
        width: "1080px",
        height: "1080px",
        background: "#0a0c14",
        color: "#e5e7eb",
        padding: "80px",
        display: "flex",
        flexDirection: "column",
        position: "relative",
        fontFamily: "'Times New Roman', serif",
      }}
    >
      {/* Decorative border */}
      <div style={{
        position: "absolute",
        top: "40px",
        left: "40px",
        right: "40px",
        bottom: "40px",
        border: "2px solid rgba(212, 175, 55, 0.3)",
        borderRadius: "20px",
        pointerEvents: "none",
      }} />

      {/* Top decorative lines */}
      <div style={{
        position: "absolute",
        top: "60px",
        left: "60px",
        right: "60px",
        height: "1px",
        background: "linear-gradient(90deg, transparent, rgba(212, 175, 55, 0.5), transparent)",
      }} />
      
      <div style={{
        position: "absolute",
        bottom: "60px",
        left: "60px",
        right: "60px",
        height: "1px",
        background: "linear-gradient(90deg, transparent, rgba(212, 175, 55, 0.5), transparent)",
      }} />

      {/* Header with platform name */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "40px",
        position: "relative",
        zIndex: 1,
      }}>
        <div style={{
          fontSize: "28px",
          fontWeight: "bold",
          color: "#d4af37",
          letterSpacing: "2px",
        }}>
          {platform}
        </div>
        
        <div style={{
          fontSize: "20px",
          color: "#9ca3af",
          letterSpacing: "1px",
        }}>
          DATE: {currentDate}
        </div>
      </div>

      {/* Main Content */}
      <div style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        position: "relative",
        zIndex: 1,
      }}>
        
        {/* Certificate Title */}
        <div style={{
          fontSize: "24px",
          color: "#d4af37",
          letterSpacing: "8px",
          marginBottom: "20px",
          fontWeight: "300",
        }}>
          REWARD CERTIFICATE
        </div>

        {/* Decorative line with star */}
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "20px",
          marginBottom: "40px",
          width: "100%",
          maxWidth: "600px",
        }}>
          <div style={{
            flex: 1,
            height: "2px",
            background: "linear-gradient(90deg, transparent, #d4af37, transparent)",
          }} />
          <span style={{ color: "#d4af37", fontSize: "24px" }}>✦</span>
          <div style={{
            flex: 1,
            height: "2px",
            background: "linear-gradient(90deg, transparent, #d4af37, transparent)",
          }} />
        </div>

        {/* Presented to */}
        <div style={{
          fontSize: "24px",
          color: "#9ca3af",
          marginBottom: "20px",
          textTransform: "uppercase",
          letterSpacing: "2px",
        }}>
          PROUDLY PRESENTED TO
        </div>

        {/* Username */}
        <div style={{
          fontSize: "72px",
          fontWeight: "bold",
          color: "#ffffff",
          marginBottom: "40px",
          textTransform: "uppercase",
          textShadow: "0 0 20px rgba(212, 175, 55, 0.3)",
          borderBottom: "2px solid rgba(212, 175, 55, 0.3)",
          paddingBottom: "20px",
        }}>
          @{username}
        </div>

        {/* Award Type */}
        <div style={{
          fontSize: "32px",
          color: "#d4af37",
          marginBottom: "20px",
          letterSpacing: "4px",
          fontWeight: "300",
        }}>
          PROFIT SHARE
        </div>

        {/* PnL Amount */}
        <div style={{
          fontSize: "120px",
          fontWeight: "bold",
          color: isProfit ? "#d4af37" : "#ef4444",
          marginBottom: "20px",
          lineHeight: 1,
          textShadow: isProfit ? "0 0 40px rgba(212, 175, 55, 0.3)" : "0 0 40px rgba(239, 68, 68, 0.3)",
        }}>
          ${formattedPnl}
        </div>

        {/* Trade Details */}
        <div style={{
          display: "flex",
          gap: "60px",
          marginTop: "40px",
          padding: "30px 60px",
          background: "rgba(212, 175, 55, 0.05)",
          borderRadius: "4px",
          border: "1px solid rgba(212, 175, 55, 0.2)",
        }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: "18px", color: "#9ca3af", marginBottom: "8px" }}>
              SYMBOL
            </div>
            <div style={{ fontSize: "28px", fontWeight: "bold", color: "#d4af37" }}>
              {trade.symbol}
            </div>
          </div>
          
          <div style={{ 
            width: "1px", 
            background: "rgba(212, 175, 55, 0.3)",
          }} />
          
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: "18px", color: "#9ca3af", marginBottom: "8px" }}>
              TYPE
            </div>
            <div style={{ 
              fontSize: "28px", 
              fontWeight: "bold",
              color: trade.type === 'BUY' || trade.type === 'LONG' ? "#22c55e" : "#ef4444",
            }}>
              {trade.type}
            </div>
          </div>
          
          <div style={{ 
            width: "1px", 
            background: "rgba(212, 175, 55, 0.3)",
          }} />
          
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: "18px", color: "#9ca3af", marginBottom: "8px" }}>
              LOT SIZE
            </div>
            <div style={{ fontSize: "28px", fontWeight: "bold", color: "#d4af37" }}>
              {trade.lotSize}
            </div>
          </div>
        </div>

        {/* Entry/Exit Details */}
        <div style={{
          display: "flex",
          gap: "40px",
          marginTop: "30px",
        }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: "16px", color: "#9ca3af", marginBottom: "4px" }}>
              ENTRY PRICE
            </div>
            <div style={{ fontSize: "24px", fontWeight: "500", color: "#ffffff" }}>
              ${formatPrice(trade.entryPrice)}
            </div>
          </div>
          
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: "16px", color: "#9ca3af", marginBottom: "4px" }}>
              EXIT PRICE
            </div>
            <div style={{ fontSize: "24px", fontWeight: "500", color: "#ffffff" }}>
              ${formatPrice(trade.exitPrice)}
            </div>
          </div>
        </div>

        {/* Percentage if available */}
        {trade.profitPercentage && (
          <div style={{
            marginTop: "20px",
            fontSize: "24px",
            color: isProfit ? "#d4af37" : "#ef4444",
          }}>
            {isProfit ? '+' : ''}{trade.profitPercentage}% RETURN
          </div>
        )}
      </div>

      {/* Footer with platform branding */}
      <div style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        marginTop: "auto",
        position: "relative",
        zIndex: 1,
        gap: "20px",
      }}>
        {/* Decorative elements */}
        <div style={{
          width: "40px",
          height: "1px",
          background: "linear-gradient(90deg, transparent, #d4af37, transparent)",
        }} />
        
        <div style={{
          fontSize: "18px",
          color: "#9ca3af",
          letterSpacing: "2px",
        }}>
          VERIFIED TRADE
        </div>
        
        <div style={{
          width: "40px",
          height: "1px",
          background: "linear-gradient(90deg, transparent, #d4af37, transparent)",
        }} />
      </div>

      {/* Small platform identifier at bottom */}
      <div style={{
        position: "absolute",
        bottom: "30px",
        right: "60px",
        fontSize: "14px",
        color: "rgba(212, 175, 55, 0.3)",
        letterSpacing: "1px",
      }}>
        {platform} • {currentDate}
      </div>
    </div>
  );
};

export default TradeShareCard;