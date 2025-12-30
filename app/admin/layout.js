"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Package,
  FileText,
  Menu,
  X,
  Home,
  LogOut,
} from "lucide-react";
import Image from "next/image";

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const menuItems = [
    { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
    {
      name: "Manage Contractors",
      href: "/admin/manage-contractors",
      icon: Users,
    },
    { name: "Product List", href: "/admin/products", icon: Package },
    {
      name: "Certificate Templates",
      href: "/admin/certificate-templates",
      icon: FileText,
    },
  ];

  const handleLogout = async () => {
    if (!confirm("Are you sure you want to logout?")) return;

    try {
      const res = await fetch("/api/auth/logout", { method: "POST" });
      const data = await res.json();

      if (data.success) {
        window.location.href = "/";
      }
    } catch (error) {
      console.error("Logout error:", error);
      window.location.href = "/";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Menu Button */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-blue-700 rounded-md text-white"
      >
        {sidebarOpen ? <X size={2} /> : <Menu size={24} />}
      </button>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={`
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0
          fixed top-0 left-0
          w-64 h-screen bg-white border-r border-gray-200
          z-40 transition-transform duration-300
          overflow-y-auto 
    md:sticky md:top-0 md:h-screen
        `}
        >
          <div className="p-4 border-b">
            <Image
              src="/FullLogo_Transparent_NoBuffer-3.png"
              height={250}
              width={250}
              alt="Renewably UK"
              className="h-auto w-auto"
              onError={(e) => {
                e.target.style.display = "none";
                e.target.nextSibling.style.display = "flex";
              }}
            />
          </div>

          <nav className="p-4">
            <ul className="space-y-2">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;

                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={() => setSidebarOpen(false)}
                      className={`
                        flex items-center gap-3 px-3 py-3 rounded-lg
                        ${
                          isActive
                            ? "bg-blue-50 text-blue-700"
                            : "text-gray-700 hover:bg-gray-50"
                        }
                      `}
                    >
                      <Icon size={20} />
                      <span>{item.name}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="absolute bottom-0 left-0 right-0 p-4 border-t">
            <div className="flex items-center justify-between">
              <Link
                href="/"
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
              >
                <Home size={18} />
                <span className="text-sm">Main Site</span>
              </Link>
              <div className="absolute bottom-0 left-0 right-0 p-4 border-t">
                <div className="flex items-center justify-between">
                  <Link
                    href="/"
                    className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
                  >
                    <Home size={18} />
                    <span className="text-sm">Main Site</span>
                  </Link>

                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 text-red-600 hover:text-red-800"
                  >
                    <LogOut size={18} />
                    <span className="text-sm">Logout</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-4 md:p-6">
          <div className=" mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}
