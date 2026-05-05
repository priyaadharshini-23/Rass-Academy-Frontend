import { useState } from "react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import { Outlet } from "react-router-dom";

export default function MainLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-gradient-soft">

      {/* MOBILE OVERLAY */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden"
        />
      )}

      {/* SIDEBAR */}
      <div className={`
        fixed z-50 inset-y-0 left-0 transform
        ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
        transition-transform duration-300
        lg:relative lg:translate-x-0
      `}>
        <Sidebar
          collapsed={collapsed}
          setCollapsed={setCollapsed}
          mobileClose={() => setMobileOpen(false)}
        />
      </div>

      {/* MAIN */}
      <div className="flex-1 flex flex-col">

        <Topbar toggleMobile={() => setMobileOpen(true)} />

        <main className="
          flex-1 overflow-y-auto
          px-4 sm:px-6 lg:px-10
          py-4 sm:py-6 lg:py-8
        ">

          <div className="
            glass rounded-3xl p-5 sm:p-6 lg:p-8
            shadow-xl
            hover-lift
          ">
            <Outlet />
          </div>

        </main>

      </div>
    </div>
  );
}