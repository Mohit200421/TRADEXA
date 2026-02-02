import { useEffect, useState } from "react";
import socket from "../socket";
import API from "../api/axios";

interface Message {
  _id: string;
  user: string;
  avatar: string;
  type: "text" | "trade";
  text?: string;
  time: string;
}

interface Props {
  communityId: string;
  channelId: string;
  channelName: string;
}

export default function CommunityChat({
  communityId,
  channelId,
  channelName,
}: Props) {
  const [messages, setMessages] = useState<Message[]>([]);

  /* =====================
     JOIN CHANNEL + LOAD MSGS
  ===================== */
  useEffect(() => {
    if (!channelId) return;

    socket.emit("join-channel", channelId);

    API.get(`/community/messages/${channelId}`)
      .then(res => setMessages(res.data))
      .catch(() => setMessages([]));

    return () => {
      socket.off("new-message");
    };
  }, [channelId]);

  /* =====================
     SOCKET LISTENER
  ===================== */
  useEffect(() => {
    socket.on("new-message", msg => {
      if (msg.channelId === channelId) {
        setMessages(prev => [...prev, msg]);
      }
    });

    return () => {
      socket.off("new-message");
    };
  }, [channelId]);

  return (
    <div className="flex-1 flex flex-col">
      {/* HEADER */}
      <div className="h-14 border-b border-border flex items-center px-4">
        <h2 className="font-semibold text-lg">#{channelName}</h2>
      </div>

      {/* MESSAGES */}
      <div className="flex-1 overflow-y-auto p-4">
        {messages.length === 0 && (
          <p className="text-sm text-text-secondary">
            No messages yet. Be the first to start the conversation 👋
          </p>
        )}

        {messages.map(m => (
          <div key={m._id} className="mb-3">
            <p className="text-sm">
              <strong>{m.user}</strong>: {m.text}
            </p>
            <span className="text-xs text-text-secondary">{m.time}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
