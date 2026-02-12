"use client";

import { motion } from "framer-motion";

const steps = [
  {
    id: 1,
    title: "Account Setup",
    text: "Register your business details, and upload your onboarding documents, for review. The Renewably UK onboarding team and Partners will approve your application within 24–48 hours.",
  },
  {
    id: 2,
    title: "Account Access",
    text: "Login to your portal account and access your approved services: Insurance Backed Guarantees (supplied by Bluecrop Services) ICO compliant Data and Document Repository, Renewably funding, and much more.",
  },
  {
    id: 3,
    title: "Manage Account",
    text: "Authenticate and Submit your project via your portal. Instantly generate TrustMark approved Bluecrop Services IBG’s with automated ‘email to the customer’ feature. Store your data using the inbuilt ICO/Data Protection compliant features.",
  },
  {
    id: 4,
    title: "Compliance & Protection",
    text: "Your Renewably UK portal is fully compliant and protected with HTTPS (TLS/SSL) with AES-256 ciphers ensuring your customer data is secure.",
  },
];

export default function OnboardWithRenewably() {
  return (
    <section className='w-full bg-white py-[120px]'>
      <div className='max-w-[1200px] mx-auto px-4'>
        {/* Heading (UNCHANGED) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className='text-center mb-20'>
          <h2 className='text-[28px] font-semibold text-[#0F172A] mb-3'>
            Onboard With Renewably UK
          </h2>
          <p className='text-[14px] text-[#6B7280] max-w-155 mx-auto leading-[1.6]'>
            Your one-stop solution for all renewable energy industry needs.
            Onboard today and feel safe in the knowledge that you will be
            protected and compliant in line with eco regulations.
          </p>
        </motion.div>

        {/* ================= DESKTOP (LG+) ================= */}
        <div className='relative hidden xl:grid grid-cols-[1fr_80px_1fr] gap-y-16'>
          {/* Vertical dotted line */}
          <div className='absolute left-1/2 top-0 -translate-x-1/2 h-full border-l-2 border-dashed border-[#0F47A8]/60' />

          {steps.map((step, i) => (
            <div key={step.id} className='contents'>
              {/* Left Title */}
              <motion.div
                initial={{ opacity: 0, x: -40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className='flex items-center justify-end pr-6'>
                <h3 className='text-[32px] font-semibold mr-30 text-[#0F47A8] w-[260px] leading-tight'>
                  {step.title}
                </h3>
              </motion.div>

              {/* Center Number */}
              <div className='flex items-center justify-center'>
                <div className='w-[32px] h-[32px] rounded-full bg-[#0F47A8] text-white text-[14px] font-semibold flex items-center justify-center z-10'>
                  {step.id}
                </div>
              </div>

              {/* Right Card */}
              <motion.div
                initial={{ opacity: 0, x: 40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.15 }}
                className='
                  w-[498px]
                  h-[148px]
                  rounded-[8px]
                  border
                  border-[#0F47A8]
                  bg-gradient-to-r
                  from-[#F5F9FF]
                  to-[#DCEBFF]
                  p-[32px]
                  ml-10
                  flex items-center
                '>
                <p className='text-[13px] leading-[1.6] text-[#1E3A8A]'>
                  {step.text}
                </p>
              </motion.div>
            </div>
          ))}
        </div>

        {/* ================= MOBILE & TABLET ================= */}
        <div className='xl:hidden flex flex-col gap-10'>
          {steps.map((step, i) => (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className='flex flex-col gap-4'>
              {/* Number + Title */}
              <div className='flex items-center gap-3'>
                <div className='w-[28px] h-[28px] rounded-full bg-[#0F47A8] text-white text-[13px] font-semibold flex items-center justify-center'>
                  {step.id}
                </div>
                <h3 className='text-[20px] font-semibold text-[#0F47A8]'>
                  {step.title}
                </h3>
              </div>

              {/* Card */}
              <div
                className='
                  w-full
                  rounded-[8px]
                  border
                  border-[#0F47A8]
                  bg-gradient-to-r
                  from-[#F5F9FF]
                  to-[#DCEBFF]
                  p-[24px]
                '>
                <p className='text-[14px] leading-[1.6] text-[#1E3A8A]'>
                  {step.text}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
