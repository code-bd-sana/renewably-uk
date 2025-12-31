"use client";

import { Mail, Phone, MapPin, Clock } from "lucide-react";
import Link from "next/link";

const ContactSection = () => {
  return (
    <section className="w-full bg-white py-[120px]">
      <div className="max-w-[1200px] mx-auto px-4">
        {/* MAIN GRID */}
        <div className="grid grid-cols-1 md:grid-cols-[420px_1fr] gap-[80px] items-center">
          {/* LEFT INFO CARDS */}
          <div className="flex flex-col gap-[16px]">
            {/* Email */}
            <div className="flex items-start gap-[16px] bg-[#EAF2FF] rounded-[12px] p-[20px]">
              <div className="w-[40px] h-[40px] rounded-[10px] bg-[#C7DBFF] flex items-center justify-center">
                <Mail size={18} className="text-[#2563EB]" />
              </div>
              <div>
                <p className="text-[14px] font-semibold text-[#0F172A]">
                  Email
                </p>
                <Link
                  href="mailto:support@renewablyuk.com"
                  className="text-[13px] text-[#2563EB] hover:underline"
                >
                  support@renewablyuk.com
                </Link>
                <p className="text-[12px] text-[#6B7280] mt-[2px]">
                  We respond within 24 hours
                </p>
              </div>
            </div>

            {/* Phone */}
            <div className="flex items-start gap-[16px] bg-[#EAFBF1] rounded-[12px] p-[20px]">
              <div className="w-[40px] h-[40px] rounded-[10px] bg-[#BBF7D0] flex items-center justify-center">
                <Phone size={18} className="text-[#16A34A]" />
              </div>
              <div>
                <p className="text-[14px] font-semibold text-[#0F172A]">
                  Phone
                </p>
                <p className="text-[13px] text-[#16A34A]">0800 123 4567</p>
                <p className="text-[12px] text-[#6B7280] mt-[2px]">
                  Mon–Fri, 9am–5pm GMT
                </p>
              </div>
            </div>

            {/* Office */}
            <div className="flex items-start gap-[16px] bg-[#F1EBFF] rounded-[12px] p-[20px]">
              <div className="w-[40px] h-[40px] rounded-[10px] bg-[#DDD6FE] flex items-center justify-center">
                <MapPin size={18} className="text-[#7C3AED]" />
              </div>
              <div>
                <p className="text-[14px] font-semibold text-[#0F172A]">
                  Office Location
                </p>
                <p className="text-[13px] text-[#6B7280]">
                  123 Green Energy Way
                </p>
                <p className="text-[12px] text-[#6B7280] mt-[2px]">
                  London, UK SW1A 1AA
                </p>
              </div>
            </div>

            {/* Hours */}
            <div className="flex items-start gap-[16px] bg-[#FFF7ED] rounded-[12px] p-[20px]">
              <div className="w-[40px] h-[40px] rounded-[10px] bg-[#FED7AA] flex items-center justify-center">
                <Clock size={18} className="text-[#EA580C]" />
              </div>
              <div>
                <p className="text-[14px] font-semibold text-[#0F172A]">
                  Business Hours
                </p>
                <p className="text-[13px] text-[#6B7280]">
                  Monday – Friday: 9:00 AM – 5:00 PM
                </p>
                <p className="text-[12px] text-[#6B7280] mt-[2px]">
                  Saturday – Sunday: Closed
                </p>
              </div>
            </div>
          </div>

          {/* RIGHT FORM */}
          <div className="bg-white border border-[#E5E7EB] rounded-[12px] p-[32px] w-full max-w-[420px] mx-auto">
            <h3 className="text-[18px] font-semibold text-[#0F172A] mb-[24px]">
              Send Us a Message
            </h3>

            <form className="flex flex-col gap-[16px]">
              {[
                { label: "Full Name *", placeholder: "Enter your full name" },
                {
                  label: "Company Name *",
                  placeholder: "Enter your company name",
                },
                {
                  label: "Email Address *",
                  placeholder: "Enter your email address",
                },
              ].map((field) => (
                <div key={field.label}>
                  <label className="block text-[13px] font-medium text-[#0F172A] mb-[6px]">
                    {field.label}
                  </label>
                  <input
                    type="text"
                    placeholder={field.placeholder}
                    className="w-full h-[44px] px-[14px] rounded-[8px] border border-[#E5E7EB] text-[14px] outline-none focus:border-[#0F47A8]"
                  />
                </div>
              ))}

              <div>
                <label className="block text-[13px] font-medium text-[#0F172A] mb-[6px]">
                  Message *
                </label>
                <textarea
                  rows={4}
                  placeholder="Enter your message"
                  className="w-full px-[14px] py-[10px] rounded-[8px] border border-[#E5E7EB] text-[14px] outline-none focus:border-[#0F47A8]"
                />
              </div>

              <button
                type="submit"
                className="h-[44px] mt-[8px] rounded-[8px] bg-[#0F47A8] text-white text-[14px] font-medium hover:bg-[#0C3E96] transition"
              >
                Send Message
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
