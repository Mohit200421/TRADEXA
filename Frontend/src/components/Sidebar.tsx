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

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: (v: boolean) => void;
}

const menuItems = [
  { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  { label: "Journal", path: "/trades", icon: Briefcase },
 // { label: "Performance", path: "/performance", icon: BarChart3 },
  { label: "Market", path: "/market", icon: TrendingUp },
 // { label: "Replay", path: "/replay", icon: TrendingUp },
 // { label: "Learn", path: "/learn", icon: BookOpen },
  { label: "Community", path: "/community", icon: Users },
  { label: "Tools", path: "/tools", icon: Wrench },
];

export default function Sidebar({ collapsed, setCollapsed }: SidebarProps) {
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
            TRADEXA
          </span>
        )}
        <button onClick={() => setCollapsed(!collapsed)}>
          {collapsed ? <ChevronRight /> : <ChevronLeft />}
        </button>
      </div>

      {/* Menu */}
      <nav className="px-3 space-y-1 mt-4">
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
