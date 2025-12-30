"use client";

import {
  ShieldCheck,
  FileLock,
  ClipboardList,
  Briefcase,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";

export default function FundedProjectsSupport() {
  return (
    <section className="w-full bg-white">
      {/* TOP – Compliance First */}
      <div className="py-[80px]">
        <div className="max-w-[1100px] mx-auto px-4 text-center">
          <h2 className="text-[22px] font-semibold text-[#0F172A] mb-[20px]">
            Compliance-First Platform
          </h2>

          <div className="mx-auto max-w-[680px] rounded-[12px] bg-[#EEF4FF] px-[28px] py-[20px]">
            <p className="text-[13px] leading-[1.6] text-[#475569]">
              <span className="font-bold"> Renewably UK’s</span> services are
              built to align with industry and scheme requirements, helping
              contractors remain compliant while delivering high-quality
              installations.
            </p>
          </div>
        </div>
      </div>

      {/* BLUE SECTION */}
      <div className="bg-[#0F47A8] py-[80px]">
        <div className="max-w-[1200px] mx-auto px-4">
          {/* Heading */}
          <div className="text-center mb-[48px]">
            <h3 className="text-[22px] font-semibold text-white">
              How We Support Funded Projects
            </h3>
          </div>

          {/* Cards */}
          <div
            className="
            grid
            grid-cols-1
            sm:grid-cols-2
            lg:grid-cols-4
            gap-[24px]
          "
          >
            {[
              {
                title: "Service & Automated submission to funding partners",
                desc: "Photovoltaic panels and solar heating systems",
                icon: ShieldCheck,
                bg: "bg-[#EAFBF1]",
                iconBg: "bg-[#22C55E]",
              },
              {
                title: "Secure Certificate and Customer Data Storage",
                desc: "Centralised, encrypted document management",
                icon: FileLock,
                bg: "bg-[#EEF4FF]",
                iconBg: "bg-[#3B82F6]",
              },
              {
                title: "Easy Audit Reporting",
                desc: "Streamlined compliance documentation",
                icon: ClipboardList,
                bg: "bg-[#F1EBFF]",
                iconBg: "bg-[#8B5CF6]",
              },
              {
                title: "Reduced Admin Workload",
                desc: "Automated processes save time and resources",
                icon: Briefcase,
                bg: "bg-[#FFF7ED]",
                iconBg: "bg-[#F97316]",
              },
            ].map((item, i) => {
              const Icon = item.icon;
              return (
                <div
                  key={i}
                  className="
                    bg-white
                    rounded-[14px]
                    p-[24px]
                    h-[190px]
                    flex
                    flex-col
                  "
                >
                  <div
                    className={`
                      w-[40px]
                      h-[40px]
                      rounded-[10px]
                      ${item.iconBg}
                      flex
                      items-center
                      justify-center
                      mb-[16px]
                    `}
                  >
                    <Icon size={20} className="text-white" />
                  </div>

                  <h4 className="text-[14px] font-semibold text-[#0F172A] leading-[1.4] mb-[6px]">
                    {item.title}
                  </h4>

                  <p className="text-[12px] leading-[1.6] text-[#6B7280]">
                    {item.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* BUILT FOR GROWTH */}
      <div className="py-[72px]">
        <div className="max-w-[900px] mx-auto px-4 text-center">
          <div className="mx-auto max-w-[760px] rounded-[14px] bg-[#EEF4FF] px-[28px] py-[22px] mb-[40px] flex items-start gap-[14px] justify-center">
            <div className="w-[36px] h-[36px] rounded-[10px] bg-[#0F47A8] flex items-center justify-center">
              <TrendingUp size={18} className="text-white" />
            </div>

            <p className="text-[13px] leading-[1.6] text-[#475569] text-left">
              <span className="font-semibold text-[#0F172A] block mb-[4px]">
                Built for Growth
              </span>
              As funding schemes evolve, our platform scales with your
              business—supporting new measures, increased volume, and compliance
              changes without disruption.
            </p>
          </div>

          {/* CTA */}
          <p className="text-[13px] text-[#0F172A] mb-[14px]">
            Ready to Support Your Funded Projects?
          </p>

          <Link
          href={"/contact"}
            className="
              h-[36px]
              px-[18px]
              rounded-[8px]
              bg-[#0F47A8]
              text-white
              text-[13px]
              font-medium
              p-2
            "
          >
            Speak to Our Team
          </Link>
        </div>
      </div>
    </section>
  );
}
