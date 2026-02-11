import { Outlet } from "react-router-dom";
import { useState } from "react";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";

export default function DashboardLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black">
      <Sidebar 
        collapsed={collapsed} 
        setCollapsed={setCollapsed}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
      />

      <div className="md:ml-64 transition-all duration-300">
        <Topbar 
          collapsed={collapsed} 
          onToggleSidebar={() => setMobileMenuOpen(true)} 
        />

        <main className="pt-16 md:pt-20 px-4 md:px-6 pb-24 md:pb-6 mobile-content-padding">
          <Outlet />
        </main>
      </div>
    </div>
  );
}