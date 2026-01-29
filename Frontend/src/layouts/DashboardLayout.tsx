import { Outlet } from "react-router-dom";
import { useState } from "react";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";

export default function DashboardLayout() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />

      <div
        className={`transition-all duration-300 ${
          collapsed ? "ml-20" : "ml-64"
        }`}
      >
        <Topbar collapsed={collapsed} />

        <main className="pt-20 px-4 md:px-6 pb-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
