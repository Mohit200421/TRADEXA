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
  Globe,
  Menu,
} from "lucide-react";

import { useAuth } from "../contexts/AuthContext";
import { useProfile } from "../contexts/ProfileContext";
import defaultAvatar from "../assets/default-avatar.svg";

interface TopbarProps {
  collapsed: boolean;
  onToggleSidebar?: () => void;
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
  "/tools/profit-calculator": "Profit Calculator",
  "/tools/position-size": "Position Size Calculator",
  "/tools/forex-sessions": "Forex Market Hours",
  "/profile": "Profile",
};

/* =========================
   TIME ZONES
========================= */
const TIME_ZONES = [
  { label: "UTC +5:30 Kolkata", value: Intl.DateTimeFormat().resolvedOptions().timeZone },
  { label: "UTC", value: "UTC" },
  { label: "New York", value: "America/New_York" },
  { label: "London", value: "Europe/London" },
  { label: "Dubai", value: "Asia/Dubai" },
  { label: "Mumbai (IST)", value: "Asia/Kolkata" },
  { label: "Tokyo", value: "Asia/Tokyo" },
  { label: "Sydney", value: "Australia/Sydney" },
];

export default function Topbar({ collapsed, onToggleSidebar }: TopbarProps) {
  const { logout, user } = useAuth();
  const { profile } = useProfile();

  const navigate = useNavigate();
  const location = useLocation();

  const [time, setTime] = useState<Date>(new Date());
  const [timezone, setTimezone] = useState<string>(
    Intl.DateTimeFormat().resolvedOptions().timeZone
  );

  const [profileOpen, setProfileOpen] = useState(false);
  const [tzOpen, setTzOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);

  const [dark, setDark] = useState(
    document.documentElement.classList.contains("dark")
  );

  const dropdownRef = useRef<HTMLDivElement>(null);
  const tzRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);

  const getPageTitle = () => {
    const currentPath = location.pathname;
  
    // Sort routes by length (longest first)
    const sortedRoutes = Object.keys(PAGE_TITLES).sort(
      (a, b) => b.length - a.length
    );
  
    const matchedRoute = sortedRoutes.find((route) =>
      currentPath.startsWith(route)
    );
  
    return matchedRoute ? PAGE_TITLES[matchedRoute] : "Dashboard";
  };
  
  const pageTitle = getPageTitle();
  
  

  /* Clock */
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formattedTimeWithSeconds = new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    timeZone: timezone,
  }).format(time);

  /* Close dropdowns on outside click */
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node))
        setProfileOpen(false);

      if (tzRef.current && !tzRef.current.contains(e.target as Node))
        setTzOpen(false);

      if (notificationRef.current && !notificationRef.current.contains(e.target as Node))
        setNotificationOpen(false);
    };

    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  /* Theme toggle */
  const toggleTheme = () => {
    const root = document.documentElement;
    root.classList.toggle("dark");
    setDark(root.classList.contains("dark"));
  };

  const handleLogout = async () => {
    await logout();
    navigate("/", { replace: true });
  };

  const avatarUrl =
    profile?.avatar?.url || user?.avatar || defaultAvatar;

  return (
    <header
      className={`fixed top-0 right-0 h-14 bg-white dark:bg-black border-b border-gray-200 dark:border-gray-800
        flex items-center justify-between px-4 z-40
        transition-all duration-300
        ${collapsed ? "left-0 md:left-20" : "left-0 md:left-64"}
        w-full md:w-auto md:right-0
      `}
    >
      {/* LEFT SECTION - Mobile optimized */}
      <div className="flex items-center gap-3">
        {/* Mobile Hamburger Menu */}
        {onToggleSidebar && (
          <button
            onClick={onToggleSidebar}
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors md:hidden"
            aria-label="Toggle sidebar"
          >
            <Menu className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </button>
        )}

        {/* Mobile App Logo & Title */}
        <div className="flex items-center gap-2 md:hidden">
          <div className="w-7 h-7 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">T</span>
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent leading-tight">
              TRADEXA
            </span>
            <h1 className="text-sm font-semibold text-gray-900 dark:text-white leading-tight">
              {pageTitle}
            </h1>
          </div>
        </div>

        {/* Desktop Page Title */}
        <div className="hidden md:block">
          <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
            {pageTitle}
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {time.toLocaleDateString(undefined, {
              weekday: "short",
              month: "short",
              day: "numeric",
            })}
          </p>
        </div>
      </div>

      {/* RIGHT SECTION - Compact for mobile */}
      <div className="flex items-center gap-2 md:gap-4">
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors"
          aria-label="Toggle theme"
        >
          {dark ? (
            <Sun className="w-5 h-5 text-yellow-500" />
          ) : (
            <Moon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          )}
        </button>

        {/* Desktop Timezone */}
        <div className="hidden md:block relative" ref={tzRef}>
          <button
            onClick={() => setTzOpen(!tzOpen)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-800 text-sm hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
          >
            <Clock className="w-4 h-4 text-gray-500 dark:text-gray-400" />
            <span className="text-gray-700 dark:text-gray-300">{formattedTimeWithSeconds}</span>
            <Globe className="w-3 h-3 text-gray-400" />
          </button>

          {tzOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-xl shadow-lg py-2 z-50">
              <div className="px-3 py-2 mb-1 border-b border-gray-100 dark:border-gray-800">
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Select Timezone</p>
              </div>
              {TIME_ZONES.map((tz) => (
                <button
                  key={tz.value}
                  onClick={() => {
                    setTimezone(tz.value);
                    setTzOpen(false);
                  }}
                  className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-900 ${
                    timezone === tz.value
                      ? "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-gray-900"
                      : "text-gray-700 dark:text-gray-300"
                  }`}
                >
                  {tz.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Notifications */}
        <div className="relative" ref={notificationRef}>
          <button
            onClick={() => setNotificationOpen(!notificationOpen)}
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors relative"
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
              3
            </span>
          </button>

          {notificationOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-xl shadow-xl z-50 overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                  Notifications
                </h3>
              </div>

              <div className="max-h-72 overflow-y-auto divide-y divide-gray-100 dark:divide-gray-800">
                <NotificationItem
                  title="Trade Closed"
                  message="EURUSD hit Take Profit 🎯"
                  time="2 min ago"
                />
                <NotificationItem
                  title="Risk Alert"
                  message="You exceeded daily risk limit."
                  time="10 min ago"
                />
                <NotificationItem
                  title="Market Update"
                  message="Gold volatility increased."
                  time="1 hr ago"
                />
              </div>

              <div className="px-4 py-3 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-black">
                <button className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium w-full text-center">
                  View all notifications
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Profile */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className="p-0.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-900"
            aria-label="Profile menu"
          >
            <div className="flex items-center gap-2">
              <img
                src={avatarUrl}
                alt="User avatar"
                className="w-7 h-7 md:w-8 md:h-8 rounded-full object-cover border-2 border-transparent hover:border-blue-500 transition-colors"
              />
              <ChevronDown className="hidden md:block w-4 h-4 text-gray-400 dark:text-gray-300" />
            </div>
          </button>

          {profileOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-xl shadow-xl overflow-hidden z-50">
              <div className="p-4 border-b border-gray-100 dark:border-gray-800">
                <div className="flex items-center gap-3">
                  <img
                    src={avatarUrl}
                    alt="User avatar"
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div className="min-w-0">
                    <p className="font-semibold text-gray-900 dark:text-white truncate">
                      {profile?.fullName || user?.name || "Trader"}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {user?.email}
                    </p>
                  </div>
                </div>
              </div>

              <div className="py-2">
                <MenuItem icon={User} label="My Profile" onClick={() => navigate("/profile")} />
                <MenuItem icon={Settings} label="Settings" onClick={() => navigate("/settings")} />
                <MenuItem icon={CreditCard} label="Subscription" onClick={() => navigate("/subscription")} />
                <MenuItem icon={HelpCircle} label="Help & Support" onClick={() => navigate("/help")} />
                <div className="h-px bg-gray-100 dark:bg-gray-800 my-2"></div>
                <MenuItem icon={LogOut} label="Sign Out" danger onClick={handleLogout} />
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

/* =========================
   COMPONENTS
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
      className={`w-full flex items-center gap-3 px-4 py-3 text-sm transition-colors ${
        danger
          ? "text-red-600 hover:bg-red-50 dark:hover:bg-gray-900"
          : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-900"
      }`}
    >
      <Icon className="w-4 h-4" />
      {label}
    </button>
  );
}

function NotificationItem({
  title,
  message,
  time,
}: {
  title: string;
  message: string;
  time: string;
}) {
  return (
    <div className="px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors cursor-pointer">
      <div className="flex items-start gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
              {title}
            </p>
            <span className="shrink-0 text-[11px] text-gray-500 dark:text-gray-400">{time}</span>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
            {message}
          </p>
        </div>
      </div>
    </div>
  );
}