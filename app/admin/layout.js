"use client";

import {
  FileText,
  Home,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  Users,
  X,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const router = useRouter();

  const menuItems = [
    { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
    {
      name: "Manage Contractors",
      href: "/admin/manage-contractors",
      icon: Users,
    },
    { name: "Insurance Product List", href: "/admin/products", icon: Package },
    {
      name: "Certificate Templates",
      href: "/admin/certificate-templates",
      icon: FileText,
    },
  ];

  const handleLogoutClick = () => {
    setShowLogoutModal(true);
  };

  const handleLogoutConfirm = async () => {
    setIsLoggingOut(true);

    try {
      const res = await fetch("/api/auth/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });
      const data = await res.json();

      if (data.success) {
        setShowLogoutModal(false);
        // Redirect to home page
        window.location.href = "/";
      } else {
        console.error("Logout failed:", data);
        setShowLogoutModal(false);
        window.location.href = "/";
      }
    } catch (error) {
      console.error("Logout error:", error);
      setShowLogoutModal(false);
      window.location.href = "/";
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handleLogoutCancel = () => {
    setShowLogoutModal(false);
  };

  return (
    <div className='min-h-screen bg-gray-50'>
      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className='fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4'>
          <div className='bg-white rounded-lg shadow-xl max-w-md w-full p-6'>
            <h3 className='text-lg font-semibold text-gray-900 mb-4'>
              Confirm Logout
            </h3>
            <p className='text-gray-600 mb-6'>
              Are you sure you want to logout?
            </p>
            <div className='flex gap-3 justify-end'>
              <button
                onClick={handleLogoutCancel}
                disabled={isLoggingOut}
                className='px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 text-sm font-medium disabled:opacity-50'>
                Cancel
              </button>
              <button
                onClick={handleLogoutConfirm}
                disabled={isLoggingOut}
                className='px-4 py-2 bg-[#0F47A8] text-white rounded hover:bg-[#0b3172] text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed'>
                {isLoggingOut ? "Logging out..." : "Yes, Logout"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Menu Button */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className='md:hidden fixed top-4 left-4 z-50 p-2 bg-blue-700 rounded-md text-white'>
        {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className='md:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40'
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className='flex'>
        {/* Sidebar */}
        <aside
          className={`
            ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
            md:translate-x-0
            fixed top-0 left-0
            w-64 min-w-64 h-screen bg-[#E2E8F0] border-r border-gray-200
            z-40 transition-transform duration-300
            overflow-y-auto 
            md:sticky md:top-0 md:h-screen
            flex flex-col
          `}>
          {/* Logo */}
          <div
            className='p-4 border-b-2 border-[#E2E8F0] cursor-pointer'
            onClick={() => router.push("/")}>
            <Image
              src='/FullLogo_Transparent_NoBuffer-3.png'
              height={250}
              width={250}
              alt='Renewably UK'
              className='h-auto w-auto'
              onError={(e) => {
                const target = e.target;
                target.style.display = "none";
                const nextSibling = target.nextSibling;
                if (nextSibling && nextSibling.style) {
                  nextSibling.style.display = "flex";
                }
              }}
            />
          </div>

          {/* Navigation Menu */}
          <nav className='p-4 flex-1'>
            <ul className='space-y-2'>
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
                            ? "bg-[#0F47A8] text-white"
                            : "text-[#0F47A8] hover:bg-gray-50"
                        }
                      `}>
                      <Icon size={20} />
                      <span>{item.name}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Footer with Logout */}
          <div className='p-4 border-t border-gray-200 mt-auto'>
            <div className='flex items-center justify-between'>
              <Link
                href='/'
                onClick={() => setSidebarOpen(false)}
                className='flex items-center gap-2 text-gray-600 hover:text-gray-900'>
                <Home size={18} />
                <span className='text-sm'>Main Site</span>
              </Link>

              <button
                onClick={handleLogoutClick}
                className='flex items-center gap-2 text-red-600 hover:text-red-800'>
                <LogOut size={18} />
                <span className='text-sm'>Logout</span>
              </button>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className='flex-1 '>
          <div className='mx-auto '>{children}</div>
        </main>
      </div>
    </div>
  );
}
