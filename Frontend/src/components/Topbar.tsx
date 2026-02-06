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
  Menu,
  Search,
  TrendingUp,
  Globe,
} from "lucide-react";

import { useAuth } from "../contexts/AuthContext";
import { useProfile } from "../contexts/ProfileContext";
import defaultAvatar from "../assets/default-avatar.svg";

interface TopbarProps {
  collapsed: boolean;
  onMenuClick?: () => void; // New prop for mobile menu toggle
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

export default function Topbar({ collapsed, onMenuClick }: TopbarProps) {
  const { logout, user } = useAuth();
  const { profile } = useProfile();

  const navigate = useNavigate();
  const location = useLocation();
  const [isMobile, setIsMobile] = useState(false);

  const [time, setTime] = useState<Date>(new Date());
  const [timezone, setTimezone] = useState<string>(
    Intl.DateTimeFormat().resolvedOptions().timeZone
  );

  const [open, setOpen] = useState(false);
  const [tzOpen, setTzOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const [dark, setDark] = useState(
    document.documentElement.classList.contains("dark")
  );

  const dropdownRef = useRef<HTMLDivElement>(null);
  const tzRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  /* =========================
     CHECK MOBILE ON MOUNT
  ========================= */
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

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
    timeZone: timezone,
  }).format(time);

  /* =========================
     CLOSE DROPDOWNS
  ========================= */
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
      if (tzRef.current && !tzRef.current.contains(e.target as Node)) {
        setTzOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchOpen(false);
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
      className={`fixed top-0 right-0 h-16 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800
        flex items-center justify-between px-4 md:px-6 z-40
        transition-all duration-300
        ${isMobile ? 'left-0' : collapsed ? "left-20" : "left-64"}
      `}
    >
      {/* LEFT SECTION */}
      <div className="flex items-center gap-3">
        {/* Mobile Menu Button */}
        {isMobile && (
          <button
            onClick={onMenuClick}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <Menu className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
        )}

        {/* Logo (Mobile) */}
        {isMobile && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-gray-900 dark:text-white text-sm hidden sm:inline">
              TRADEXA
            </span>
          </div>
        )}

        {/* Page Title */}
        <div className={`${isMobile ? 'hidden sm:block' : ''}`}>
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

      {/* RIGHT SECTION */}
      <div className="flex items-center gap-2 md:gap-4">
        {/* Search Button (Mobile) */}
        {isMobile && (
          <div className="relative" ref={searchRef}>
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <Search className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
            
            {searchOpen && (
              <div className="absolute right-0 top-full mt-2 w-72 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-2">
                <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 dark:bg-gray-700 rounded">
                  <Search className="w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search trades, markets, tools..."
                    className="w-full bg-transparent border-none outline-none text-sm text-gray-900 dark:text-white placeholder-gray-400"
                    autoFocus
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
        >
          {dark ? (
            <Sun className="w-5 h-5 text-yellow-500" />
          ) : (
            <Moon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          )}
        </button>

        {/* Timezone & Clock */}
        <div className="relative hidden sm:block" ref={tzRef}>
          <button
            onClick={() => setTzOpen(!tzOpen)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group"
          >
            <Clock className="w-4 h-4 text-gray-500 dark:text-gray-400 group-hover:text-blue-500" />
            <span className="text-gray-700 dark:text-gray-300">{formattedTime}</span>
            <span className="text-xs text-gray-500 dark:text-gray-400 hidden lg:inline">
              ({activeTimezoneLabel})
            </span>
            <Globe className="w-3 h-3 text-gray-400" />
          </button>

          {tzOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg py-2 text-sm z-50">
              <div className="px-3 py-2 border-b border-gray-100 dark:border-gray-700">
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Select Timezone</p>
              </div>
              <div className="max-h-60 overflow-y-auto">
                {TIME_ZONES.map((tz) => (
                  <button
                    key={tz.value}
                    onClick={() => {
                      setTimezone(tz.value);
                      setTzOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center justify-between ${
                      timezone === tz.value
                        ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                        : "text-gray-700 dark:text-gray-300"
                    }`}
                  >
                    <span>{tz.label}</span>
                    {timezone === tz.value && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Notification */}
        <div className="relative">
          <button
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors relative"
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
              3
            </span>
          </button>
        </div>

        {/* Profile Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setOpen(!open)}
            className="flex items-center gap-2 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors group"
          >
            <div className="relative">
              <img
                src={avatarUrl}
                alt="User avatar"
                className="w-8 h-8 rounded-full object-cover border-2 border-transparent group-hover:border-blue-500 transition-colors"
              />
              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full"></div>
            </div>
            <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} />
          </button>

          {open && (
            <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl overflow-hidden z-50">
              {/* User Info */}
              <div className="p-4 border-b border-gray-100 dark:border-gray-700">
                <div className="flex items-center gap-3">
                  <img
                    src={avatarUrl}
                    alt="User avatar"
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {profile?.fullName || user?.name || "Trader"}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {user?.email}
                    </p>
                    <div className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 bg-gradient-to-r from-blue-500 to-cyan-400 text-white text-xs rounded-full">
                      <TrendingUp className="w-3 h-3" />
                      <span>Pro Account</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Menu Items */}
              <div className="py-2 space-y-1">
                <MenuItem
                  icon={User}
                  label="My Profile"
                  onClick={() => {
                    navigate("/profile");
                    setOpen(false);
                  }}
                />
                <MenuItem
                  icon={Settings}
                  label="Settings"
                  onClick={() => {
                    navigate("/settings");
                    setOpen(false);
                  }}
                />
                <MenuItem
                  icon={CreditCard}
                  label="Subscription"
                  onClick={() => {
                    navigate("/subscription");
                    setOpen(false);
                  }}
                />
                <MenuItem
                  icon={HelpCircle}
                  label="Help & Support"
                  onClick={() => {
                    navigate("/help");
                    setOpen(false);
                  }}
                />
                <div className="h-px bg-gray-100 dark:bg-gray-700 my-2"></div>
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
   MENU ITEM COMPONENT
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
      className={`w-full flex items-center gap-3 px-4 py-3 text-sm transition-colors
        ${
          danger
            ? "text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-700 dark:text-red-400"
            : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
        }`}
    >
      <Icon className={`w-4 h-4 ${danger ? '' : 'text-gray-500 dark:text-gray-400'}`} />
      {label}
    </button>
  );
}