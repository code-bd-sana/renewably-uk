"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";

const navItems = [
  { label: "Insurance", href: "/insurance" },
  { label: "Funding", href: "/funding" },
  { label: "Accreditation", href: "/accreditation" },
  { label: "News", href: "/news" },
  { label: "Contact us", href: "/contact" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const pathname = usePathname();
  const router = useRouter();

  // Check auth status on component mount
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const response = await fetch("/api/auth/me", {
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        setIsLoggedIn(data.isAuthenticated);
        // Store user data including role
        if (data.user) {
          setUserData(data.user);
        }
      } else {
        setIsLoggedIn(false);
        setUserData(null);
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      setIsLoggedIn(false);
      setUserData(null);
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    // Listen for logout event from ActivityTracker
    const handleUserLoggedOut = () => {
      console.log("Received logout event from ActivityTracker");
      setIsLoggedIn(false);
      setUserData(null);
    };

    window.addEventListener("user-logged-out", handleUserLoggedOut);

    // Cleanup
    return () => {
      window.removeEventListener("user-logged-out", handleUserLoggedOut);
    };
  }, []);
  const handleLogout = async () => {
    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });

      if (response.ok) {
        setIsLoggedIn(false);
        setUserData(null); // Clear user data
        setOpen(false);
        router.push("/");
        router.refresh();
      }
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  if (isLoading) {
    return (
      <header className="relative z-50 mx-5 mt-4">
        <div className="bg-transparent pt-6">
          <div className="max-w-450 mx-auto px-4">
            <div className="flex items-center h-18 px-6 bg-white rounded-[18px] shadow-[0_10px_30px_rgba(0,0,0,0.08)]">
              <div className="h-10 w-25 bg-gray-200 rounded animate-pulse"></div>
            </div>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="relative z-50 mx-5 mt-4">
      <div className="bg-transparent pt-6">
        <div className="max-w-450 mx-auto px-4">
          {/* MAIN BAR */}
          <div
            className="
              flex items-center
              h-20
              p-3
              md:px-6
              
              bg-white
              rounded-[18px]
              shadow-[0_10px_30px_rgba(0,0,0,0.08)]
            "
          >
            {/* LOGO */}
            <Link href="/" className="flex items-center py-2">
              <Image
                src="/FullLogo_Transparent.png"
                alt="Renewably UK"
                width={130}
                height={130}
                priority
              />
            </Link>

            {/* DESKTOP NAV */}
            <nav className="hidden md:flex items-center gap-8 ml-16">
              {navItems.map((item) => {
                const isActive = pathname === item.href;

                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    className={`
                      text-[14px]
                      ${
                        isActive
                          ? "font-semibold text-[#0F172A]"
                          : "font-medium text-[#6B7280] hover:text-[#0F172A]"
                      }
                    `}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            {/* DESKTOP ACTIONS */}
            <div className="ml-auto hidden md:flex items-center gap-4">
              {isLoggedIn ? (
                <>
                  <Link
                    href={userData?.role === "admin" ? "/admin" : "/dashboard"}
                    className={`
        h-10
        px-5
        flex items-center
        rounded-[10px]
        text-[14px]
        font-medium
        ${
          pathname === (userData?.role === "admin" ? "/admin" : "/dashboard")
            ? "bg-[#0F172A] text-white"
            : "bg-gray-100 text-[#0F172A] hover:bg-gray-200"
        }
      `}
                  >
                    {userData?.role === "admin"
                      ? "Admin Dashboard"
                      : "Dashboard"}
                  </Link>

                  <button
                    onClick={handleLogout}
                    className="
        h-10
        px-5
        flex items-center
        rounded-[10px]
        bg-[#EF4444]
        text-white
        text-[14px]
        font-medium
        hover:bg-[#DC2626]
        transition-colors
      "
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className={`text-[14px] ${
                      pathname === "/login"
                        ? "font-semibold text-[#0F172A]"
                        : "font-medium text-[#0F172A] hover:text-[#0F47A8]"
                    }`}
                  >
                    Login
                  </Link>

                  <Link
                    href="/signup"
                    className="
                      h-10
                      px-5
                      flex items-center
                      rounded-[10px]
                      bg-[#0F47A8]
                      text-white
                      text-[14px]
                      font-medium
                      hover:bg-[#0D3E95]
                      transition-colors
                    "
                  >
                    Sign up
                  </Link>
                </>
              )}
            </div>

            {/* MOBILE TOGGLE */}
            <button
              onClick={() => setOpen(!open)}
              className="ml-auto md:hidden text-[#0F172A]"
              aria-label="Toggle menu"
            >
              {open ? <X size={26} /> : <Menu size={26} />}
            </button>
          </div>

          {/* MOBILE MENU */}
          {open && (
            <div
              className="
                mt-3
                bg-white
                rounded-[18px]
                shadow-[0_10px_30px_rgba(0,0,0,0.08)]
                px-6
                py-6
                md:hidden
              "
            >
              <nav className="flex flex-col gap-5">
                {navItems.map((item) => {
                  const isActive = pathname === item.href;

                  return (
                    <Link
                      key={item.label}
                      href={item.href}
                      onClick={() => setOpen(false)}
                      className={`text-[15px] ${
                        isActive
                          ? "font-semibold text-[#0F172A]"
                          : "font-medium text-[#0F172A] hover:text-[#0F47A8]"
                      }`}
                    >
                      {item.label}
                    </Link>
                  );
                })}

                <div className="pt-4 border-t flex flex-col gap-3">
                  {isLoggedIn ? (
                    <>
                      <Link
                        href="/dashboard"
                        onClick={() => setOpen(false)}
                        className={`
                          h-11
                          flex items-center justify-center
                          rounded-[10px]
                          text-[14px]
                          font-medium
                          ${
                            pathname === "/dashboard"
                              ? "bg-[#0F172A] text-white"
                              : "bg-gray-100 text-[#0F172A]"
                          }
                        `}
                      >
                        Dashboard
                      </Link>

                      <button
                        onClick={() => {
                          setOpen(false);
                          handleLogout();
                        }}
                        className="
                          h-11
                          flex items-center justify-center
                          rounded-[10px]
                          bg-[#EF4444]
                          text-white
                          text-[14px]
                          font-medium
                          hover:bg-[#DC2626]
                          transition-colors
                        "
                      >
                        Logout
                      </button>
                    </>
                  ) : (
                    <>
                      <Link
                        href="/login"
                        onClick={() => setOpen(false)}
                        className={`text-[14px] text-center ${
                          pathname === "/login"
                            ? "font-semibold text-[#0F172A]"
                            : "font-medium text-[#0F172A] hover:text-[#0F47A8]"
                        }`}
                      >
                        Login
                      </Link>

                      <Link
                        href="/signup"
                        onClick={() => setOpen(false)}
                        className="
                          h-11
                          flex items-center justify-center
                          rounded-[10px]
                          bg-[#0F47A8]
                          text-white
                          text-[14px]
                          font-medium
                          hover:bg-[#0D3E95]
                          transition-colors
                        "
                      >
                        Sign up
                      </Link>
                    </>
                  )}
                </div>
              </nav>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
