import { useEffect, useRef, useState } from "react";
import {
  Bell,
  ChevronDown,
  User,
  Settings,
  CreditCard,
  HelpCircle,
  LogOut,
  Sun,
  Moon,
  LucideIcon
} from "lucide-react";

interface TopbarProps {
  collapsed: boolean;
}

export default function Topbar({ collapsed }: TopbarProps) {
  const [time, setTime] = useState<Date>(new Date());
  const [open, setOpen] = useState<boolean>(false);
  const [dark, setDark] = useState<boolean>(
    document.documentElement.classList.contains("dark")
  );

  const dropdownRef = useRef<HTMLDivElement>(null);

  /* =========================
     LIVE CLOCK
  ========================= */
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  /* =========================
     CLOSE DROPDOWN ON OUTSIDE CLICK
  ========================= */
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  /* =========================
     THEME TOGGLE
  ========================= */
  const toggleTheme = () => {
    const root = document.documentElement;
    root.classList.toggle("dark");
    setDark(root.classList.contains("dark"));

    localStorage.setItem(
      "theme",
      root.classList.contains("dark") ? "dark" : "light"
    );
  };

  return (
    <header
      className={`fixed top-0 right-0 h-16 bg-surface border-b border-border
        flex items-center justify-between px-6 z-50
        transition-all duration-300
        ${collapsed ? "left-20" : "left-64"}
      `}
    >
      {/* =========================
         LEFT: PAGE TITLE + DATE
      ========================= */}
      <div>
        <h1 className="text-lg font-semibold">Dashboard</h1>
        <p className="text-xs text-text-secondary">
          {time.toLocaleDateString(undefined, {
            weekday: "short",
            month: "short",
            day: "numeric"
          })}
        </p>
      </div>

      {/* =========================
         RIGHT SIDE ACTIONS
      ========================= */}
      <div className="flex items-center gap-4">
        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg hover:bg-border-light"
          aria-label="Toggle theme"
        >
          {dark ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {/* Clock */}
        <div className="px-3 py-1.5 rounded-lg border border-border text-sm font-medium">
          {time.toLocaleTimeString()}
        </div>

        {/* Notifications */}
        <button className="p-2 rounded-lg hover:bg-border-light">
          <Bell size={18} />
        </button>

        {/* Profile dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setOpen((prev) => !prev)}
            className="flex items-center gap-2 p-1.5 rounded-full hover:bg-border-light"
          >
            <img
              src="/avatar.jpg"
              alt="User avatar"
              className="w-8 h-8 rounded-full object-cover"
            />
            <ChevronDown size={16} />
          </button>

          {open && (
            <div className="absolute right-0 mt-2 w-64 bg-surface border border-border rounded-xl shadow-lg overflow-hidden">
              {/* User info */}
              <div className="p-4 border-b border-border">
                <p className="font-medium">Mohit Badgujar</p>
                <p className="text-xs text-text-secondary">
                  mohitbadgujar04@gmail.com
                </p>
              </div>

              {/* Menu */}
              <div className="p-2 space-y-1 text-sm">
                <MenuItem icon={User} label="My Profile" />
                <MenuItem icon={Settings} label="Settings" />
                <MenuItem icon={CreditCard} label="Subscription" />
                <MenuItem icon={HelpCircle} label="Help & Support" />
                <hr className="my-1 border-border" />
                <MenuItem icon={LogOut} label="Sign Out" danger />
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

/* =========================
   DROPDOWN ITEM
========================= */
function MenuItem({
  icon: Icon,
  label,
  danger
}: {
  icon: LucideIcon;
  label: string;
  danger?: boolean;
}) {
  return (
    <button
      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition
        ${
          danger
            ? "text-red-500 hover:bg-red-500/10"
            : "hover:bg-border-light"
        }`}
    >
      <Icon size={16} />
      {label}
    </button>
  );
}
