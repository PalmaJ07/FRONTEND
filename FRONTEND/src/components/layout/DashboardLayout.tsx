import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { Navbar } from "./Navbar";

export function DashboardLayout() {
  return (
    <div className="flex h-screen">
      <aside className="w-64 bg-gray-800 text-white h-screen sticky top-0">
        <Sidebar />
      </aside>
      <div className="flex-1 flex flex-col">
        <Navbar />
        <main className="flex-1 bg-gray-100 p-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
