"use client";

import logo from "@/public/shared/logo.png";
import {
  ChevronDown,
  FileText,
  FolderOpen,
  LayoutDashboard,
  LogOut,
  Menu,
  Settings,
  Ticket,
  Upload,
  User,
  X,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

function DashboardLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userData, setUserData] = useState(null);
  const router = useRouter();
  const pathname = usePathname();
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const menuItems = [
    {
      icon: LayoutDashboard,
      label: "Dashboard",
      active: true,
      href: "/dashboard",
    },
    {
      icon: FileText,
      label: "Create Insurance Backed Guarantee",
      href: "/create-insurance",
    },
    {
      icon: FolderOpen,
      label: "My Insurance Backed Guarantee Certificates",
      href: "/certificates",
    },
    { icon: Upload, label: "Submission", href: "/submission" },
    { icon: FolderOpen, label: "Documents", href: "/documents" },
    { icon: Ticket, label: "Tickets", href: "/tickets" },
  ];

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch("/api/auth/me", {
          credentials: "include",
        });

        if (!response.ok) {
          router.push("/login");
          return;
        }

        const data = await response.json();

        if (!data.isAuthenticated || data.user.role === "admin") {
          // If admin, redirect to admin dashboard
          if (data.user.role === "admin") {
            router.push("/admin");
          } else {
            router.push("/login");
          }
          return;
        }

        setUserData(data.user);
      } catch (error) {
        router.push("/login");
      }
    };
    fetchUserData();
  }, [router]);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
      router.push("/login");
      router.refresh();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  if (!userData) {
    return (
      <div className='min-h-screen bg-gray-50 flex items-center justify-center'>
        <div className='text-center'>
          <div className='w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4'></div>
          <p className='text-gray-600'>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gray-50'>
      {/* Sidebar Overlay for Mobile */}
      {sidebarOpen && (
        <div
          className='fixed inset-0  z-40 lg:hidden '
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed bg-[#EAF1FD] top-0 left-0 h-full  w-64 transform transition-transform duration-300 ease-in-out z-50 shadow-lg ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0`}>
        {/* Close button for mobile */}
        <button
          onClick={() => setSidebarOpen(false)}
          className='absolute top-4 right-4 lg:hidden p-2 hover:bg-gray-100 rounded-lg'>
          <X size={20} />
        </button>

        {/* Logo */}
        <div
          onClick={() => {
            router.push("/");
          }}
          className='p-4 border-b-2 border-[#E2E8F0] cursor-pointer'>
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

        {/* Menu Items */}
        <nav className='py-4'>
          {menuItems.map((item, index) => (
            <Link
              key={index}
              href={item.href}
              onClick={() => setSidebarOpen(false)}
              className={`w-full  flex items-center gap-3 px-4 py-3 text-sm transition-colors ${
                pathname === item.href
                  ? "bg-[#0F47A8] text-white"
                  : "text-[#0F47A8] hover:bg-gray-100"
              }`}>
              <item.icon size={18} />
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className='absolute bottom-4 left-4 flex items-center gap-2 text-red-500 text-sm hover:text-red-600'>
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </aside>

      {/* Main Content Area */}
      <div className='lg:ml-64 min-h-screen'>
        {/* Header */}
        <header className='bg-white shadow-sm sticky top-0 z-30'>
          <div className='flex items-center justify-between px-4 py-3'>
            <div className='flex items-center gap-3'>
              <button
                onClick={() => setSidebarOpen(true)}
                className='lg:hidden p-2 hover:bg-gray-100 rounded-lg'>
                <Menu size={24} />
              </button>
              <h1 className='text-lg font-normal'>
                Welcome Back, {userData.name} 👋
              </h1>
            </div>

            {/* Profile Dropdown */}
            <div className='flex items-center gap-4 relative'>
              <div className='text-sm text-gray-600 hidden sm:block'>
                {userData.companyName}
              </div>
              <div className='relative group'>
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className='flex items-center gap-2 hover:bg-gray-50 rounded-lg p-2 transition-colors'>
                  <div className='w-10 h-10 rounded-full bg-blue-100 overflow-hidden flex items-center justify-center'>
                    <span className='text-blue-600 font-semibold'>
                      {userData.name.charAt(0)}
                    </span>
                  </div>
                  <ChevronDown
                    size={16}
                    className={`transition-transform ${
                      isProfileOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {/* Dropdown Menu */}
                {isProfileOpen && (
                  <div className='absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50'>
                    <div className='px-4 py-3 border-b border-gray-100'>
                      <p className='text-sm font-medium text-gray-900'>
                        {userData.name}
                      </p>
                      <p className='text-xs text-gray-500 mt-1'>
                        {userData.companyName}
                      </p>
                      <p className='text-xs text-gray-500'>{userData.email}</p>
                    </div>
                    <div className='py-1'>
                      <button
                        onClick={() => {
                          router.push("/profile");
                          setIsProfileOpen(false);
                        }}
                        className='w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-blue-600 flex items-center gap-2'>
                        <User size={16} />
                        Profile
                      </button>

                      <div className='border-t border-gray-100 my-1'></div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        {children}
      </div>
    </div>
  );
}

export default DashboardLayout;
