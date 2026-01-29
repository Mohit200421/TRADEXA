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
  Crown
} from "lucide-react";

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: (value: boolean) => void;
}

const menuItems = [
  { label: "Dashboard", icon: LayoutDashboard, active: true },
  { label: "Trades", icon: Briefcase },
  { label: "Journal", icon: BookOpen },
  { label: "Analysis", icon: BarChart3 },
  { label: "Market", icon: TrendingUp },
  { label: "Community", icon: Users },
  { label: "Tools", icon: Wrench }
];

export default function Sidebar({ collapsed, setCollapsed }: SidebarProps) {
  return (
    <aside
      className={`fixed left-0 top-0 h-screen bg-surface border-r border-border z-50
        transition-all duration-300
        ${collapsed ? "w-20" : "w-64"}
      `}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4">
        {!collapsed && (
          <div className="font-bold text-xl">
            <span className="text-primary">Trade</span>FXBook
          </div>
        )}

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-lg hover:bg-border-light"
        >
          {collapsed ? <ChevronRight /> : <ChevronLeft />}
        </button>
      </div>

      {/* Menu */}
      <nav className="px-3 space-y-1">
        {menuItems.map((item) => (
          <button
            key={item.label}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm
              ${
                item.active
                  ? "bg-primary/10 text-primary"
                  : "hover:bg-border-light"
              }
            `}
          >
            <item.icon size={18} />
            {!collapsed && item.label}
          </button>
        ))}
      </nav>
    </aside>
  );
}
