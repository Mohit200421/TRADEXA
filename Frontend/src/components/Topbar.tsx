import { useNavigate, useLocation } from "react-router-dom";
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
  Clock,
  LucideIcon,
} from "lucide-react";

import { useAuth } from "../contexts/AuthContext";
import { useProfile } from "../contexts/ProfileContext";
import defaultAvatar from "../assets/default-avatar.svg";

interface TopbarProps {
  collapsed: boolean;
}

/* =========================
   ROUTE → PAGE TITLE MAP
========================= */
const PAGE_TITLES: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/trades": "Trades",
  "/journal": "Journal",
  "/performance": "Performance",
  "/market": "Market",
  "/community": "Community",
  "/tools": "Tools",
  "/profile": "Profile",
};

/* =========================
   TIME ZONES
========================= */
const TIME_ZONES = [
  { label: "UTC +5:30 Kolkata ", value: Intl.DateTimeFormat().resolvedOptions().timeZone },
  { label: "UTC", value: "UTC" },
  { label: "New York", value: "America/New_York" },
  { label: "London", value: "Europe/London" },
  { label: "Dubai", value: "Asia/Dubai" },
  { label: "Mumbai (IST)", value: "Asia/Kolkata" },
  { label: "Tokyo", value: "Asia/Tokyo" },
  { label: "Sydney", value: "Australia/Sydney" },
];

export default function Topbar({ collapsed }: TopbarProps) {
  const { logout, user } = useAuth();
  const { profile } = useProfile();

  const navigate = useNavigate();
  const location = useLocation();

  const [time, setTime] = useState<Date>(new Date());
  const [timezone, setTimezone] = useState<string>(
    Intl.DateTimeFormat().resolvedOptions().timeZone
  );

  const [open, setOpen] = useState(false);
  const [tzOpen, setTzOpen] = useState(false);

  const [dark, setDark] = useState(
    document.documentElement.classList.contains("dark")
  );

  const dropdownRef = useRef<HTMLDivElement>(null);
  const tzRef = useRef<HTMLDivElement>(null);

  /* =========================
     PAGE TITLE
  ========================= */
  const pageTitle = PAGE_TITLES[location.pathname] || "Dashboard";

  /* =========================
     CLOCK (TIMEZONE AWARE)
  ========================= */
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formattedTime = new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    timeZone: timezone, // ✅ correct state variable
  }).format(time);
  

  /* =========================
     CLOSE DROPDOWNS
  ========================= */
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
      if (tzRef.current && !tzRef.current.contains(e.target as Node)) {
        setTzOpen(false);
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
  };

  /* =========================
     LOGOUT
  ========================= */
  const handleLogout = async () => {
    await logout();
    navigate("/", { replace: true });
  };

  const avatarUrl =
    profile?.avatar?.url || user?.avatar || defaultAvatar;

  const activeTimezoneLabel =
    TIME_ZONES.find((t) => t.value === timezone)?.label || timezone;

  return (
    <header
      className={`fixed top-0 right-0 h-16 bg-surface border-b border-border
        flex items-center justify-between px-6 z-50
        transition-all duration-300
        ${collapsed ? "left-20" : "left-64"}
      `}
    >
      {/* LEFT */}
      <div>
        <h1 className="text-lg font-semibold">{pageTitle}</h1>
        <p className="text-xs text-text-secondary">
          {time.toLocaleDateString(undefined, {
            weekday: "short",
            month: "short",
            day: "numeric",
          })}
        </p>
      </div>

      {/* RIGHT */}
      <div className="flex items-center gap-4">
        {/* Theme */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg hover:bg-border-light"
        >
          {dark ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {/* CLOCK + TIMEZONE */}
        <div className="relative" ref={tzRef}>
          <button
            onClick={() => setTzOpen((p) => !p)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border text-sm font-medium hover:bg-border-light"
          >
            <Clock size={16} />
            <span>{formattedTime}</span>
            <span className="text-xs text-text-secondary">
              ({activeTimezoneLabel})
            </span>
          </button>

          {tzOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-surface border border-border rounded-xl shadow-lg p-1 text-sm">
              {TIME_ZONES.map((tz) => (
                <button
                  key={tz.value}
                  onClick={() => {
                    setTimezone(tz.value);
                    setTzOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-lg hover:bg-border-light ${
                    timezone === tz.value
                      ? "bg-border-light font-medium"
                      : ""
                  }`}
                >
                  {tz.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Notification */}
        <button className="p-2 rounded-lg hover:bg-border-light">
          <Bell size={18} />
        </button>

        {/* Profile */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setOpen((prev) => !prev)}
            className="flex items-center gap-2 p-1.5 rounded-full hover:bg-border-light"
          >
            <img
              src={avatarUrl}
              alt="User avatar"
              className="w-8 h-8 rounded-full object-cover"
            />
            <ChevronDown size={16} />
          </button>

          {open && (
            <div className="absolute right-0 mt-2 w-64 bg-surface border border-border rounded-xl shadow-lg overflow-hidden">
              {/* USER */}
              <div className="p-4 border-b border-border">
                <p className="font-medium">
                  {profile?.fullName || user?.name}
                </p>
                <p className="text-xs text-text-secondary">
                  {user?.email}
                </p>
              </div>

              {/* MENU */}
              <div className="p-2 space-y-1 text-sm">
                <MenuItem
                  icon={User}
                  label="My Profile"
                  onClick={() => navigate("/profile")}
                />
                <MenuItem icon={Settings} label="Settings" />
                <MenuItem icon={CreditCard} label="Subscription" />
                <MenuItem icon={HelpCircle} label="Help & Support" />
                <hr className="my-1 border-border" />
                <MenuItem
                  icon={LogOut}
                  label="Sign Out"
                  danger
                  onClick={handleLogout}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

/* =========================
   MENU ITEM
========================= */
function MenuItem({
  icon: Icon,
  label,
  danger,
  onClick,
}: {
  icon: LucideIcon;
  label: string;
  danger?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
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
