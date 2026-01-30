import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Briefcase,
  BookOpen,
  BarChart3,
  TrendingUp,
  Users,
  Wrench,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import { useAuth } from "../contexts/AuthContext"; // ✅ ADD

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: (v: boolean) => void;
}

const menuItems = [
  { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  { label: "Trades", path: "/trades", icon: Briefcase },
  { label: "Journal", path: "/journal", icon: BookOpen },
  { label: "Performance", path: "/performance", icon: BarChart3 },
  { label: "Market", path: "/market", icon: TrendingUp },
  { label: "Community", path: "/community", icon: Users },
  { label: "Tools", path: "/tools", icon: Wrench },
];

export default function Sidebar({ collapsed, setCollapsed }: SidebarProps) {
  const { user } = useAuth(); // ✅ REAL USER

  return (
    <aside
      className={`fixed left-0 top-0 h-screen bg-surface border-r border-border
        transition-all duration-300 z-50
        ${collapsed ? "w-20" : "w-64"}
      `}
    >
      {/* Logo */}
      <div className="flex items-center justify-between px-4 py-4">
        {!collapsed && (
          <span className="text-lg font-bold text-primary">
            TradeFX
          </span>
        )}
        <button onClick={() => setCollapsed(!collapsed)}>
          {collapsed ? <ChevronRight /> : <ChevronLeft />}
        </button>
      </div>

      {/* ======================
            USER PROFILE
      ====================== */}
      {!collapsed && user && (
        <div className="mx-3 mb-4 p-3 rounded-xl bg-border-light">
          <div className="flex items-center gap-3">
            <img
              src={user.avatar || "/avatar.jpg"}   // ✅ dynamic avatar
              alt="User"
              className="w-10 h-10 rounded-full object-cover"
            />
            <div className="min-w-0">
              <p className="font-medium truncate">{user.name}</p>
              <p className="text-xs text-text-secondary truncate">
                {user.email}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Menu */}
      <nav className="px-3 space-y-1">
        {menuItems.map(({ label, path, icon: Icon }) => (
          <NavLink
            key={path}
            to={path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition
               ${
                 isActive
                   ? "bg-primary/20 text-primary"
                   : "hover:bg-border-light"
               }`
            }
          >
            <Icon size={18} />
            {!collapsed && <span>{label}</span>}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
