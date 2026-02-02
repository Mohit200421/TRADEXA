import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import { Plus, Users } from "lucide-react";

interface Community {
  _id: string;
  name: string;
  description?: string;
}

export default function CommunityList() {
  const [communities, setCommunities] = useState<Community[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    API.get("/community/my").then(res => setCommunities(res.data));
  }, []);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-semibold">Your Communities</h1>
        <button className="btn-primary flex items-center gap-2">
          <Plus size={16} /> Create Community
        </button>
      </div>

      {communities.length === 0 && (
        <p className="text-text-secondary">
          You haven’t joined any communities yet.
        </p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {communities.map(c => (
          <div
            key={c._id}
            onClick={() => navigate(`/community/${c._id}`)}
            className="cursor-pointer card p-4 hover:ring-2 hover:ring-primary"
          >
            <div className="flex items-center gap-3">
              <Users />
              <div>
                <p className="font-medium">{c.name}</p>
                <p className="text-xs text-text-secondary">
                  {c.description || "No description"}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
