import { useEffect, useRef, useState } from "react";
import {
  Hash,
  Send,
  Users,
  TrendingUp,
  TrendingDown,
  Plus,
} from "lucide-react";
import socket from "../socket";
import API from "../api/axios";

/* =====================
   TYPES
===================== */
interface Message {
  _id?: string;
  channel: string;
  type: "text" | "trade";
  user: string;
  avatar: string;
  time: string;
  text?: string;
  symbol?: string;
  side?: "LONG" | "SHORT";
  entry?: string;
  sl?: string;
  tp?: string;
}

/* =====================
   DATA
===================== */
const CHANNELS = [
  "general",
  "forex",
  "xauusd",
  "btc-usdt",
  "trade-ideas",
  "psychology",
];

const MEMBERS = [
  { name: "Mohit", role: "Admin" },
  { name: "TraderAlex", role: "Trader" },
  { name: "FXPro", role: "Trader" },
];

export default function Community() {
  const username = "Mohit";

  const [activeChannel, setActiveChannel] = useState("general");
  const [messages, setMessages] = useState<Message[]>([]);

  const [mode, setMode] = useState<"text" | "trade">("text");
  const [text, setText] = useState("");

  const bottomRef = useRef<HTMLDivElement | null>(null);

  const [trade, setTrade] = useState({
    symbol: "",
    side: "LONG" as "LONG" | "SHORT",
    entry: "",
    sl: "",
    tp: "",
  });

  const timeNow = () =>
    new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

  /* =====================
     LOAD MESSAGES + JOIN
  ===================== */
  useEffect(() => {
    const loadMessages = async () => {
      try {
        const res = await API.get(
          `/community/messages/${activeChannel}`
        );
        setMessages(res.data || []);
      } catch {
        setMessages([]);
      }
    };

    loadMessages();
    socket.emit("join-channel", activeChannel);

    return () => {
      socket.off("new-message");
    };
  }, [activeChannel]);

  /* =====================
     SOCKET LISTENER
  ===================== */
  useEffect(() => {
    const handler = (msg: Message) => {
      if (msg.channel === activeChannel) {
        setMessages(prev => [...prev, msg]);
      }
    };

    socket.on("new-message", handler);

    return () => {
      socket.off("new-message", handler);
    };
  }, [activeChannel]);

  /* =====================
     AUTO SCROLL
  ===================== */
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  /* =====================
     SEND MESSAGE
  ===================== */
  const sendMessage = () => {
    if (mode === "text" && !text.trim()) return;
    if (mode === "trade" && (!trade.symbol || !trade.entry)) return;

    const payload: Message =
      mode === "text"
        ? {
            channel: activeChannel,
            type: "text",
            user: username,
            avatar: "/avatar.jpg",
            time: timeNow(),
            text,
          }
        : {
            channel: activeChannel,
            type: "trade",
            user: username,
            avatar: "/avatar.jpg",
            time: timeNow(),
            ...trade,
          };

    socket.emit("send-message", payload);

    setText("");
    setTrade({
      symbol: "",
      side: "LONG",
      entry: "",
      sl: "",
      tp: "",
    });
    setMode("text");
  };

  return (
    <div className="flex h-[calc(100vh-64px)] bg-bg">
      {/* CHANNELS */}
      <aside className="w-64 border-r border-border bg-surface p-3">
        <h3 className="text-sm font-semibold mb-3 text-text-secondary">
          CHANNELS
        </h3>

        {CHANNELS.map(ch => (
          <button
            key={ch}
            onClick={() => setActiveChannel(ch)}
            className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm
              ${
                activeChannel === ch
                  ? "bg-primary/15 text-primary"
                  : "hover:bg-border-light"
              }`}
          >
            <Hash size={16} />
            {ch}
          </button>
        ))}
      </aside>

      {/* CHAT */}
      <main className="flex-1 flex flex-col">
        <div className="h-14 border-b border-border flex items-center px-4">
          <Hash size={18} className="mr-2" />
          <h2 className="font-semibold">#{activeChannel}</h2>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 && (
            <p className="text-sm text-text-secondary">
              No messages yet. Be the first to start 👋
            </p>
          )}

          {messages.map(msg => (
            <div key={msg._id} className="flex gap-3">
              <img
                src={msg.avatar}
                className="w-9 h-9 rounded-full"
              />

              <div className="w-full">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{msg.user}</span>
                  <span className="text-xs text-text-secondary">
                    {msg.time}
                  </span>
                </div>

                {msg.type === "text" && (
                  <p className="text-sm mt-1">{msg.text}</p>
                )}

                {msg.type === "trade" && (
                  <div
                    className={`mt-2 rounded-xl border p-3 text-sm
                      ${
                        msg.side === "LONG"
                          ? "border-blue-500/40 bg-blue-500/5"
                          : "border-red-500/40 bg-red-500/5"
                      }`}
                  >
                    <div className="flex justify-between mb-2">
                      <span className="font-semibold">
                        {msg.symbol}
                      </span>
                      <span
                        className={`flex items-center gap-1 text-xs font-semibold
                          ${
                            msg.side === "LONG"
                              ? "text-blue-600"
                              : "text-red-500"
                          }`}
                      >
                        {msg.side === "LONG" ? (
                          <TrendingUp size={14} />
                        ) : (
                          <TrendingDown size={14} />
                        )}
                        {msg.side}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div>
                        <p className="text-text-secondary">Entry</p>
                        <p>{msg.entry}</p>
                      </div>
                      <div>
                        <p className="text-text-secondary">SL</p>
                        <p>{msg.sl}</p>
                      </div>
                      <div>
                        <p className="text-text-secondary">TP</p>
                        <p>{msg.tp}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}

          <div ref={bottomRef} />
        </div>

        {/* INPUT */}
        <div className="border-t border-border p-3 space-y-2">
          <div className="flex gap-2">
            <button
              onClick={() => setMode("text")}
              className={`px-3 py-1 text-xs rounded-full
                ${
                  mode === "text"
                    ? "bg-primary text-white"
                    : "bg-border-light"
                }`}
            >
              Message
            </button>
            <button
              onClick={() => setMode("trade")}
              className={`px-3 py-1 text-xs rounded-full flex items-center gap-1
                ${
                  mode === "trade"
                    ? "bg-primary text-white"
                    : "bg-border-light"
                }`}
            >
              <Plus size={12} /> Trade Idea
            </button>
          </div>

          {mode === "text" ? (
            <div className="flex items-center gap-2 bg-border-light rounded-lg px-3 py-2">
              <input
                value={text}
                onChange={e => setText(e.target.value)}
                placeholder={`Message #${activeChannel}`}
                className="flex-1 bg-transparent outline-none text-sm"
              />
              <button onClick={sendMessage} className="text-primary">
                <Send size={18} />
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-5 gap-2">
              <input
                placeholder="Symbol"
                value={trade.symbol}
                onChange={e =>
                  setTrade({ ...trade, symbol: e.target.value })
                }
                className="input"
              />
              <select
                value={trade.side}
                onChange={e =>
                  setTrade({
                    ...trade,
                    side: e.target.value as "LONG" | "SHORT",
                  })
                }
                className="input"
              >
                <option>LONG</option>
                <option>SHORT</option>
              </select>
              <input
                placeholder="Entry"
                value={trade.entry}
                onChange={e =>
                  setTrade({ ...trade, entry: e.target.value })
                }
                className="input"
              />
              <input
                placeholder="SL"
                value={trade.sl}
                onChange={e =>
                  setTrade({ ...trade, sl: e.target.value })
                }
                className="input"
              />
              <input
                placeholder="TP"
                value={trade.tp}
                onChange={e =>
                  setTrade({ ...trade, tp: e.target.value })
                }
                className="input"
              />

              <button
                onClick={sendMessage}
                className="col-span-5 btn-primary"
              >
                Post Trade Idea
              </button>
            </div>
          )}
        </div>
      </main>

      {/* MEMBERS */}
      <aside className="w-60 border-l border-border bg-surface p-3">
        <div className="flex items-center gap-2 mb-3">
          <Users size={16} />
          <h3 className="text-sm font-semibold">Members</h3>
        </div>

        {MEMBERS.map(m => (
          <div
            key={m.name}
            className="flex items-center justify-between text-sm mb-1"
          >
            <span>{m.name}</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-border-light">
              {m.role}
            </span>
          </div>
        ))}
      </aside>
    </div>
  );
}
