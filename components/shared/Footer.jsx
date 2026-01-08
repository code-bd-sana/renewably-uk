"use client";

import { Mail, MapPin, Phone } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const Footer = () => {
  // Function to handle service click
  const handleServiceClick = (e, id) => {
    e.preventDefault();

    // Update URL hash
    window.history.pushState(null, null, `#${id}`);

    // Dispatch a custom event that ServicesWeHost can listen to
    window.dispatchEvent(
      new CustomEvent("service-scroll", {
        detail: { id },
      })
    );

    // Scroll to the element
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  };

  return (
    <footer className="w-full bg-[#0F47A8] pt-[72px] pb-[32px]">
      <div className="max-w-[1680px] mx-auto px-4">
        {/* TOP GRID */}
        <div
          className="
            grid
            grid-cols-1
            gap-[48px]
            sm:grid-cols-2
            lg:grid-cols-[1.2fr_1fr_1fr_1.2fr]
            lg:gap-[80px]
          "
        >
          {/* BRAND */}
          <div>
            <div className="mb-[20px]">
              <Link href="/">
                <Image
                  src="/foot-logo.png"
                  alt="Renewably UK"
                  width={160}
                  height={40}
                />
              </Link>
            </div>

            <p className="text-[13px] leading-[1.6] text-white/80 max-w-[260px]">
              A portal designed for Installation Companies, Built for Compliance
            </p>
          </div>

          {/* COMPANY */}
          <div>
            <h4 className="text-[14px] font-semibold text-white mb-[16px]">
              Company
            </h4>

            <ul className="flex flex-col gap-[10px] text-[13px] text-white/80">
              <li>
                <Link href="/">Home</Link>
              </li>
              <li>
                <Link href="/insurance">Insurance</Link>
              </li>
              <li>
                <Link href="/funding">Funding</Link>
              </li>
              <li>
                <Link href="/accreditation">Accreditation</Link>
              </li>
              <li>
                <Link href="/news">News</Link>
              </li>
              <li>
                <Link href="/contact">Contact us</Link>
              </li>
            </ul>
          </div>

          {/* SERVICES */}
          <div>
            <h4 className="text-[14px] font-semibold text-white mb-[16px]">
              Services
            </h4>

            <ul className="flex flex-col gap-[10px] text-[13px] text-white/80">
              <li>
                <a
                  href="#insurance-backed-guarantees"
                  onClick={(e) =>
                    handleServiceClick(e, "insurance-backed-guarantees")
                  }
                  className="hover:text-white transition-colors duration-300"
                >
                  Insurance Backed Guarantees
                </a>
              </li>
              <li>
                <a
                  href="#data-protection"
                  onClick={(e) => handleServiceClick(e, "data-protection")}
                  className="hover:text-white transition-colors duration-300"
                >
                  Secure ICO-compliant Document Repository
                </a>
              </li>
              <li>
                <a
                  href="#project-funding"
                  onClick={(e) => handleServiceClick(e, "project-funding")}
                  className="hover:text-white transition-colors duration-300"
                >
                  Renewable Project Funding
                </a>
              </li>
              <li>
                <a
                  href="#support-guidance"
                  onClick={(e) => handleServiceClick(e, "support-guidance")}
                  className="hover:text-white transition-colors duration-300"
                >
                  Support and Guidance
                </a>
              </li>
            </ul>
          </div>

          {/* CONNECT */}
          <div>
            <h4 className="text-[14px] font-semibold text-white mb-[16px]">
              Connect
            </h4>

            <ul className="flex flex-col gap-[12px] text-[13px] text-white/80">
              <li className="flex items-start gap-[10px]">
                <Phone size={14} className="mt-[2px]" />
                <a
                  href="tel:+441615243512"
                  className="hover:text-white transition-colors duration-300"
                >
                  +44 161 524 3512
                </a>
              </li>

              {/* EMAIL LINK */}
              <li className="flex items-start gap-[10px]">
                <Mail size={14} className="mt-[2px]" />
                <a
                  href="mailto:contact@renewably.energy"
                  className="hover:text-white transition-colors duration-300"
                >
                  contact@renewably.energy
                </a>
              </li>

              <li className="flex items-start gap-[10px]">
                <MapPin size={14} className="mt-[2px]" />
                <span className="leading-[1.6]">
                  Lumenaire House, Blythe Gate, Blythe Valley Park, Solihull,
                  West Midlands, United Kingdom, B90 8AH
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* DIVIDER */}
        <div className="w-full h-[1px] bg-white/20 my-[40px]" />

        {/* BOTTOM */}
        <div className="text-center text-[12px] text-white/70">
          © 2025 Renewably UK — Powering Renewables. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
