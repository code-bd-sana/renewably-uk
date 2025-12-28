"use client";

import { LogIn, SquarePen, FileText, Download } from "lucide-react";

const steps = [
  {
    title: "Installer Logs In",
    desc: "Access secure contractor portal",
    icon: LogIn,
  },
  {
    title: "Enter Details",
    desc: "Input installation information",
    icon: SquarePen,
  },
  {
    title: "IBG Generated",
    desc: "Certificate created instantly",
    icon: FileText,
  },
  {
    title: "Download PDF",
    desc: "Ready to submit immediately",
    icon: Download,
  },
];

export default function HowRenewablyDeliversIBGs() {
  return (
    <section className="w-full bg-white py-[96px]">
      <div className="max-w-[1500px] mx-auto px-4">
        {/* Heading */}
        <div className="text-center mb-[40px]">
          <h2 className="text-[28px] font-semibold text-[#0F172A] leading-[1.2]">
            How Renewably UK Delivers IBGs
          </h2>
          <p className="mt-[10px] text-[13px] leading-[1.6] text-[#6B7280]">
            Simple, fast, and compliant certificate generation
          </p>
        </div>

        {/* Cards */}
        <div
          className=" flex justify-center gap-5"
        >
          {steps.map((s, idx) => {
            const Icon = s.icon;
            return (
              <div
                key={idx}
                className="
                  w-[295px]
                  h-[182px]
                  rounded-[16px]
                  bg-gradient-to-r
                  from-[#F5F8FF]
                  to-[#DBEAFE]
                  flex
                  flex-col
                  p-[20px]
                  [padding-left:24px]
                  [padding-right:24px]
                "
              >
                {/* Icon */}
                <div className="w-[32px] h-[32px] rounded-[8px] bg-white flex items-center justify-center">
                  <Icon size={18} className="text-[#0F172A]" />
                </div>

                {/* Content */}
                <div className="mt-[20px]">
                  <h4 className="text-[14px] font-semibold text-[#0F172A] leading-[1.3] mb-[6px]">
                    {s.title}
                  </h4>
                  <p className="text-[12px] leading-[1.5] text-[#6B7280]">
                    {s.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
