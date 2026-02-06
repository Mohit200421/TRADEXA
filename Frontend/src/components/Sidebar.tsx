import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Briefcase,
  BookOpen,
  BarChart3,
  TrendingUp,
  Users,
  Wrench,
  Menu,
  X,
  Home,
  TrendingDown,
} from "lucide-react";
import { useState, useEffect } from "react";

interface SidebarProps {
  collapsed?: boolean;
  setCollapsed?: (v: boolean) => void;
}

const desktopMenuItems = [
  { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  { label: "Journal", path: "/trades", icon: Briefcase },
  { label: "Market", path: "/market", icon: TrendingUp },
  { label: "Community", path: "/community", icon: Users },
  { label: "Tools", path: "/tools", icon: Wrench },
];

const mobileMenuItems = [
  { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  { label: "Journal", path: "/trades", icon: Briefcase },
  { label: "Market", path: "/market", icon: TrendingUp },
  { label: "Community", path: "/community", icon: Users },
  { label: "Tools", path: "/tools", icon: Wrench },
];

export default function Sidebar({ collapsed = false, setCollapsed }: SidebarProps) {
  const [isMobile, setIsMobile] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

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
        className={`fixed left-0 top-0 h-screen bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800
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
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            {collapsed ? 
              <Menu className="w-4 h-4 text-gray-600 dark:text-gray-400" /> : 
              <X className="w-4 h-4 text-gray-600 dark:text-gray-400" />
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
                     ? "bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 text-blue-600 dark:text-blue-400 border-l-4 border-blue-500"
                     : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                 }`
              }
            >
              <Icon className={`w-5 h-5 ${collapsed ? '' : 'group-hover:scale-110 transition-transform'}`} />
              {!collapsed && <span className="font-medium text-sm">{label}</span>}
              {collapsed && (
                <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 dark:bg-gray-700 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
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
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">John Trader</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">Pro Account</p>
              </div>
            )}
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-full flex items-center justify-center">
              <span className="text-xs font-semibold text-white">JT</span>
            </div>
          </div>
        </div>
      </aside>
    );
  }

  // Mobile Bottom Navigation
  return (
    <>
      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 z-50 md:hidden">
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

      {/* Mobile Floating Menu Button for Expanded Menu */}
      <button
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        className="fixed bottom-20 right-4 w-14 h-14 bg-gradient-to-br from-blue-600 to-cyan-500 text-white rounded-full shadow-lg flex items-center justify-center z-50 md:hidden"
      >
        {mobileMenuOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <Menu className="w-6 h-6" />
        )}
      </button>

      {/* Mobile Expanded Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden" onClick={() => setMobileMenuOpen(false)}>
          <div className="absolute bottom-24 right-4 bg-white dark:bg-gray-900 rounded-xl shadow-2xl p-4 min-w-48 border border-gray-200 dark:border-gray-800">
            <div className="flex items-center gap-3 mb-4 pb-3 border-b border-gray-100 dark:border-gray-800">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 dark:text-white">TRADEXA</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">Trading Analytics</p>
              </div>
            </div>
            
            <div className="space-y-2">
              {desktopMenuItems.map(({ label, path, icon: Icon }) => {
                const isActive = location.pathname === path;
                return (
                  <NavLink
                    key={path}
                    to={path}
                    className={`
                      flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors
                      ${isActive 
                        ? 'bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 text-blue-600 dark:text-blue-400' 
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                      }
                    `}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{label}</span>
                  </NavLink>
                );
              })}
            </div>

            {/* User Info */}
            <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-full flex items-center justify-center">
                  <span className="text-xs font-semibold text-white">JT</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">John Trader</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Pro Account</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add padding to main content to avoid bottom nav overlap */}
      <style>{`
        .mobile-content-padding {
          padding-bottom: 70px;
        }
      `}</style>
    </>
  );
}