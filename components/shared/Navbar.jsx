"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X } from "lucide-react";
import { usePathname } from "next/navigation";

const navItems = [
  { label: "Insurance", href: "/insurance" },
  { label: "Funding", href: "/funding" },
  { label: "Accreditation", href: "/accreditation" },
  { label: "News", href: "/news" },
  { label: "Contact us", href: "/contact" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="relative z-[50] mx-5 mt-4">
      <div className="bg-transparent pt-6">
        <div className="max-w-[1800px] mx-auto px-4">
          {/* MAIN BAR */}
          <div
            className="
              flex items-center
              h-[72px]
              px-6
              bg-white
              rounded-[18px]
              shadow-[0_10px_30px_rgba(0,0,0,0.08)]
            "
          >
            {/* LOGO */}
            <Link href="/" className="flex items-center">
              <Image
                src="/FullLogo_Transparent.png"
                alt="Renewably UK"
                width={72}
                height={72}
                priority
              />
            </Link>

            {/* DESKTOP NAV */}
            <nav className="hidden md:flex items-center gap-8 ml-[64px]">
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
              <Link
                href="/login"
                className={`text-[14px] ${
                  pathname === "/login"
                    ? "font-semibold text-[#0F172A]"
                    : "font-medium text-[#0F172A]"
                }`}
              >
                Login
              </Link>

              <Link
                href="/signup"
                className="
                  h-[40px]
                  px-5
                  flex items-center
                  rounded-[10px]
                  bg-[#0F47A8]
                  text-white
                  text-[14px]
                  font-medium
                "
              >
                Sign up
              </Link>
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
                          : "font-medium text-[#0F172A]"
                      }`}
                    >
                      {item.label}
                    </Link>
                  );
                })}

                <div className="pt-4 border-t flex flex-col gap-3">
                  <Link
                    href="/login"
                    onClick={() => setOpen(false)}
                    className={`text-[14px] ${
                      pathname === "/login"
                        ? "font-semibold text-[#0F172A]"
                        : "font-medium text-[#0F172A]"
                    }`}
                  >
                    Login
                  </Link>

                  <Link
                    href="/signup"
                    onClick={() => setOpen(false)}
                    className="
                      h-[44px]
                      flex items-center justify-center
                      rounded-[10px]
                      bg-[#0F47A8]
                      text-white
                      text-[14px]
                      font-medium
                    "
                  >
                    Sign up
                  </Link>
                </div>
              </nav>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
