import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import API from "../api/axios";
import Chat from "../components/CommunityChat";

interface Channel {
  _id: string;
  name: string;
}

export default function CommunityPage() {
  const { communityId } = useParams();
  const [channels, setChannels] = useState<Channel[]>([]);
  const [activeChannel, setActiveChannel] = useState<Channel | null>(null);

  useEffect(() => {
    if (!communityId) return;

    API.get(`/community/${communityId}/channels`).then(res => {
      setChannels(res.data);
      setActiveChannel(res.data[0]); // default channel
    });
  }, [communityId]);

  return (
    <div className="flex h-[calc(100vh-64px)]">
      {/* CHANNEL LIST */}
      <aside className="w-64 border-r border-border bg-surface p-3">
        <h3 className="text-sm font-semibold mb-3">Channels</h3>

        {channels.map(c => (
          <button
            key={c._id}
            onClick={() => setActiveChannel(c)}
            className={`w-full text-left px-3 py-2 rounded-lg text-sm
              ${
                activeChannel?._id === c._id
                  ? "bg-primary/20 text-primary"
                  : "hover:bg-border-light"
              }`}
          >
            # {c.name}
          </button>
        ))}
      </aside>

      {/* CHAT */}
      {activeChannel && (
        <Chat
          communityId={communityId!}
          channelId={activeChannel._id}
          channelName={activeChannel.name}
        />
      )}
    </div>
  );
}
