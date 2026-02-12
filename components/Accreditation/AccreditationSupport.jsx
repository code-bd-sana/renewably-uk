"use client";

import {
  ShieldCheck,
  FileText,
  Search,
  Users,
  Shield,
  TrendingUp,
  Award,
} from "lucide-react";

export default function ComplianceAccreditation() {
  return (
    <section className='w-full bg-white py-[120px]'>
      <div className='max-w-[1500px] mx-auto px-4'>
        {/* ================= TOP ================= */}
        <div className='text-center mb-[72px]'>
          <h2 className='text-[24px] font-semibold text-[#0F172A] mb-[16px]'>
            Compliance-First Platform
          </h2>

          <div className='mx-auto max-w-[760px] rounded-[12px] bg-[#EEF4FF] px-[32px] py-[20px]'>
            <p className='text-[14px] leading-[1.7] text-[#475569]'>
              At Renewably UK, our services are built to align with and uphold
              eco requirements. We’re here to help contractors like you obtain
              accreditation so that you can deliver high-quality installations
              and products to your customers, confident in the knowledge that
              you are a champion of industry standards.{" "}
            </p>
          </div>
        </div>

        {/* ================= WHAT WE SUPPORT ================= */}
        <div className='mb-[96px]'>
          <h3 className='text-center text-[20px] font-semibold text-[#0F172A] mb-[40px]'>
            What We Support
          </h3>

          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-[24px]'>
            {[
              {
                title: "Insurance-Backed Guarantees",
                text: "IBG certificates for all installations",
                icon: ShieldCheck,
                bg: "bg-[#EAF2FF]",
                color: "text-[#2563EB]",
              },
              {
                title: "Certificate Traceability",
                text: "Full audit trail for every document",
                icon: FileText,
                bg: "bg-[#FEF3C7]",
                color: "text-[#D97706]",
              },
              {
                title: "Secure Audit Trails",
                text: "Timestamped records for full transparency",
                icon: Search,
                bg: "bg-[#F1EBFF]",
                color: "text-[#7C3AED]",
              },
              {
                title: "Installer Accountability",
                text: "Clear responsibility tracking",
                icon: Users,
                bg: "bg-[#EAFBF1]",
                color: "text-[#16A34A]",
              },
              {
                title: "Data Protection",
                text: "Secure data handling aligned with GDPR",
                icon: Shield,
                bg: "bg-[#FFE4E6]",
                color: "text-[#DC2626]",
              },
              {
                title: "Industry Standards",
                text: "Aligned with UK regulations",
                icon: TrendingUp,
                bg: "bg-[#FFF7ED]",
                color: "text-[#EA580C]",
              },
            ].map((item, i) => {
              const Icon = item.icon;
              return (
                <div
                  key={i}
                  className='
                    bg-white
                    border
                    border-[#EEF2F7]
                    rounded-[14px]
                    px-[24px]
                    py-[22px]
                    h-[148px]
                    flex
                    flex-col
                  '>
                  <div
                    className={`w-[36px] h-[36px] rounded-[10px] ${item.bg} flex items-center justify-center mb-[16px]`}>
                    <Icon size={18} className={item.color} />
                  </div>

                  <h4 className='text-[15px] font-semibold text-[#0F172A] mb-[6px] leading-[1.45]'>
                    {item.title}
                  </h4>

                  <p className='text-[14px] leading-[1.65] text-[#6B7280]'>
                    {item.text}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* ================= WHY ACCREDITATION MATTERS ================= */}
        <div>
          <h3 className='text-center text-[20px] font-semibold text-[#0F172A] mb-10'>
            Why Accreditation Matters
          </h3>

          <div className='grid grid-cols-1 sm:grid-cols-2 gap-6'>
            {[
              {
                title: "Builds Homeowner Confidence",
                text: "Eco renewable schemes across the UK mandate insurance-backed guarantees for customer protection.",
              },
              {
                title: "Reduces Audit Risk",
                text: "Maintain accurate and up-to-date documentation for audits and inspections.",
              },
              {
                title: "Supports Professional Credibility",
                text: "Become the standard for trusted and compliant eco installation providers.",
              },
              {
                title: "Protects Long-Term Reputation",
                text: "Safeguard your business with proper documentation.",
              },
            ].map((item, i) => (
              <div
                key={i}
                className='
                  bg-[#EEF4FF]
                  rounded-[14px]
                  px-[22px]
                  py-[20px]
                  flex
                  items-start
                  gap-[14px]
                '>
                <div className='w-[34px] h-[34px] rounded-[10px] bg-[#DCE7FF] flex items-center justify-center'>
                  <Award size={16} className='text-[#2563EB]' />
                </div>

                <div>
                  <h4 className='text-[15px] font-semibold text-[#0F172A] mb-[4px]'>
                    {item.title}
                  </h4>
                  <p className='text-[14px] leading-[1.65] text-[#6B7280] max-w-[520px]'>
                    {item.text}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
