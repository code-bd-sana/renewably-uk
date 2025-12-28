import { CheckCircle, Shield } from "lucide-react";

const OurCommitment = () => {
  return (
    <section className="w-full bg-white py-[120px]">
      <div className="max-w-[1200px] mx-auto px-4">

        {/* Heading */}
        <div className="text-center mb-[72px]">
          <h2 className="text-[28px] font-semibold text-[#0F172A] mb-3">
            Our Commitment
          </h2>
          <p className="text-[14px] leading-[1.6] text-[#6B7280] max-w-[560px] mx-auto">
            Supporting the Renewable Energy Sectors and the UK&apos;s commitment to Net Zero
          </p>
        </div>

        {/* Content */}
        <div className="grid grid-cols-[1fr_1fr] gap-[96px] items-start">

          {/* LEFT SIDE */}
          <div>
            <h4 className="text-[16px] font-semibold text-[#0F172A] mb-[24px]">
              Designed for Installers, Built for Compliance
            </h4>

            <ul className="flex flex-col gap-[14px]">
              {[
                "Submit projects in seconds",
                "Manage your customer data",
                "Track your submissions",
                "Manage your onboarding",
                "Fully aligned and compliant with Industry Standards",
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-[10px]">
                  <CheckCircle size={18} className="text-[#2563EB] mt-[2px]" />
                  <span className="text-[14px] leading-[1.6] text-[#475569]">
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* RIGHT SIDE */}
          <div>

            {/* Badge */}
            <div className="flex items-center gap-[12px] mb-[28px]">
              <div className="w-[40px] h-[40px] rounded-[10px] bg-[#E0ECFF] flex items-center justify-center">
                <Shield size={20} className="text-[#2563EB]" />
              </div>
              <div>
                <h4 className="text-[15px] font-semibold text-[#0F172A]">
                  Industry Leading
                </h4>
                <p className="text-[13px] text-[#6B7280]">
                  Trusted by hundreds of installers
                </p>
              </div>
            </div>

            {/* Stats */}
            <div className="flex flex-col gap-[14px]">
              {[
                { label: "Certificates Generated", value: "250,000+" },
                { label: "Active Contractors", value: "500+" },
                { label: "Products Covered", value: "50+" },
              ].map((item, i) => (
                <div key={i}>
                  <div className="flex justify-between items-center py-[10px]">
                    <span className="text-[13px] text-[#94A3B8]">
                      {item.label}
                    </span>
                    <span className="text-[13px] font-semibold text-[#2563EB]">
                      {item.value}
                    </span>
                  </div>
                  {i !== 2 && (
                    <div className="w-full h-[1px] bg-[#E5E7EB]" />
                  )}
                </div>
              ))}
            </div>

          </div>
        </div>

      </div>
    </section>
  );
};

export default OurCommitment;
