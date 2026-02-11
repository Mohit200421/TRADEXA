import { useAuth } from "../contexts/AuthContext";
import { useProfile } from "../contexts/ProfileContext";
import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Briefcase,
  Wrench,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
} from "lucide-react";
import { useState, useEffect } from "react";

interface SidebarProps {
  collapsed?: boolean;
  setCollapsed?: (v: boolean) => void;
}

const desktopMenuItems = [
  { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  { label: "Journal", path: "/trades", icon: Briefcase },
  { label: "Tools", path: "/tools", icon: Wrench },
];

const mobileMenuItems = [
  { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  { label: "Journal", path: "/trades", icon: Briefcase },
  { label: "Tools", path: "/tools", icon: Wrench },
];

export default function Sidebar({ collapsed = false, setCollapsed }: SidebarProps) {
  const [isMobile, setIsMobile] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  
  // Hooks must be called inside the component
  const { user } = useAuth();
  const { profile } = useProfile();

  const fullName =
    profile?.fullName ||
    user?.name ||
    "Trader";

  const accountType =
    profile?.subscriptionPlan ||
    "Pro Account";

  const initials = fullName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  // Move avatarUrl inside the component where profile and user are available
  const avatarUrl = profile?.avatar?.url || user?.avatar;

  // Check if mobile on mount and resize
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    if (isMobile) {
      setMobileMenuOpen(false);
    }
  }, [location.pathname, isMobile]);

  // Desktop Sidebar
  if (!isMobile) {
    return (
      <aside
        className={`fixed left-0 top-0 h-screen bg-white dark:bg-black border-r border-gray-200 dark:border-gray-800
          transition-all duration-300 ease-in-out z-40
          ${collapsed ? "w-20" : "w-64"}
        `}
      >
        {/* Logo Section */}
        <div className="flex items-center justify-between px-4 py-5 border-b border-gray-100 dark:border-gray-800">
          {!collapsed && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-bold text-gray-900 dark:text-white">
                TRADEXA
              </span>
            </div>
          )}
          {collapsed && (
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-lg flex items-center justify-center mx-auto">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
          )}
          <button 
            onClick={() => setCollapsed?.(!collapsed)}
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors group"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? 
              <ChevronRight className="w-4 h-4 text-gray-600 dark:text-gray-300 group-hover:text-blue-500 transition-colors" /> : 
              <ChevronLeft className="w-4 h-4 text-gray-600 dark:text-gray-300 group-hover:text-blue-500 transition-colors" />
            }
          </button>
        </div>

        {/* Menu Items */}
        <nav className="px-3 space-y-1 mt-6">
          {desktopMenuItems.map(({ label, path, icon: Icon }) => (
            <NavLink
              key={path}
              to={path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 group
                 ${collapsed ? 'justify-center' : ''}
                 ${
                   isActive
                     ? "bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-gray-900 dark:to-gray-900 text-blue-600 dark:text-blue-400 border-l-4 border-blue-500"
                     : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-900"
                 }`
              }
            >
              <Icon className={`w-5 h-5 ${collapsed ? '' : 'group-hover:scale-110 transition-transform'}`} />
              {!collapsed && <span className="font-medium text-sm">{label}</span>}
              {collapsed && (
                <div className="absolute left-full ml-2 px-2 py-1 bg-black dark:bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  {label}
                </div>
              )}
            </NavLink>
          ))}
        </nav>

        {/* User Section at Bottom */}
        <div className={`absolute bottom-0 left-0 right-0 p-4 border-t border-gray-100 dark:border-gray-800 ${collapsed ? 'px-2' : 'px-4'}`}>
          <div className={`flex items-center ${collapsed ? 'justify-center' : 'gap-3'}`}>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {fullName}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {accountType}
                </p>
              </div>
            )}

            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt="avatar"
                className="w-8 h-8 rounded-full object-cover"
              />
            ) : (
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-full flex items-center justify-center">
                <span className="text-xs font-semibold text-white">
                  {initials}
                </span>
              </div>
            )}
          </div>
        </div>
      </aside>
    );
  }

  // Mobile Bottom Navigation Only
  return (
    <>
      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-black border-t border-gray-200 dark:border-gray-800 z-50 md:hidden">
        <div className="flex items-center justify-around px-2 py-3">
          {mobileMenuItems.map(({ label, path, icon: Icon }) => {
            const isActive = location.pathname === path || 
                           (path === '/dashboard' && location.pathname === '/') ||
                           location.pathname.startsWith(path + '/');
            
            return (
              <NavLink
                key={path}
                to={path}
                className="flex flex-col items-center"
              >
                <div className={`
                  p-2 rounded-lg transition-all duration-200
                  ${isActive 
                    ? 'bg-gradient-to-br from-blue-500 to-cyan-500 text-white' 
                    : 'text-gray-500 dark:text-gray-400'
                  }
                `}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className={`text-xs mt-1 transition-colors ${
                  isActive 
                    ? 'text-blue-600 dark:text-blue-400 font-medium' 
                    : 'text-gray-500 dark:text-gray-500'
                }`}>
                  {label}
                </span>
              </NavLink>
            );
          })}
        </div>
      </nav>

      {/* Add padding to main content to avoid bottom nav overlap */}
      <style>{`
        .mobile-content-padding {
          padding-bottom: 70px;
        }
      `}</style>
    </>
  );
}