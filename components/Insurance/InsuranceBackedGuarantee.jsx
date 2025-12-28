import { ShieldCheck, CheckCircle, Home } from "lucide-react";

const InsuranceBackedGuarantee = () => {
  return (
    <section className="w-full bg-white py-[120px]">
      <div className="max-w-[1500px] mx-auto px-4">

        {/* GRID — unchanged on LG */}
        <div
          className="
            grid
            grid-cols-1
            lg:grid-cols-[1fr_420px]
            gap-[48px]
            lg:gap-[80px]
            items-start
          "
        >
          {/* LEFT CONTENT */}
          <div>
            <h2
              className="
                text-[28px]
                lg:text-[32px]
                font-semibold
                leading-[1.25]
                text-[#0F172A]
                mb-[24px]
              "
            >
              What Is an Insurance Backed
              <br className="hidden sm:block" />
              Guarantee?
            </h2>

            <p
              className="
                text-[14px]
                lg:text-[15px]
                leading-[1.7]
                text-[#6B7280]
                font-medium
                mb-[20px]
                max-w-[720px]
              "
            >
              An Insurance Backed Guarantee (IBG) protects homeowners if a
              renewable energy installer stops trading. If an issue occurs with
              an installation and the original contractor is unavailable, the
              insurance policy ensures repairs or replacements are carried out.
            </p>

            <p
              className="
                text-[13px]
                leading-[1.6]
                font-medium
                text-[#6B7280]
                max-w-[520px]
              "
            >
              Renewably UK hosts Bluedrop Services IBG’s that meet the UK
              Government and Industry scheme requirements.
            </p>
          </div>

          {/* RIGHT CARDS */}
          <div className="flex flex-col gap-[16px]">

            {/* CARD 1 */}
            <div className="flex items-start gap-[16px] bg-[#EAF2FF] rounded-[16px] p-[20px]">
              <div className="w-[44px] h-[44px] rounded-[12px] bg-[#3B6FEA] flex items-center justify-center flex-shrink-0">
                <ShieldCheck size={22} className="text-white" />
              </div>

              <div>
                <h4 className="text-[15px] font-semibold text-[#0F172A] mb-[4px]">
                  Protection Coverage
                </h4>
                <p className="text-[13px] leading-[1.6] text-[#6B7280]">
                  Full financial protection if installer ceases trading
                </p>
              </div>
            </div>

            {/* CARD 2 */}
            <div className="flex items-start gap-[16px] bg-[#EAFBF1] rounded-[16px] p-[20px]">
              <div className="w-[44px] h-[44px] rounded-[12px] bg-[#22C55E] flex items-center justify-center flex-shrink-0">
                <CheckCircle size={22} className="text-white" />
              </div>

              <div>
                <h4 className="text-[15px] font-semibold text-[#0F172A] mb-[4px]">
                  Compliance Assured
                </h4>
                <p className="text-[13px] leading-[1.6] text-[#6B7280]">
                  Meets all UK government scheme requirements
                </p>
              </div>
            </div>

            {/* CARD 3 */}
            <div className="flex items-start gap-[16px] bg-[#F1EBFF] rounded-[16px] p-[20px]">
              <div className="w-[44px] h-[44px] rounded-[12px] bg-[#8B5CF6] flex items-center justify-center flex-shrink-0">
                <Home size={22} className="text-white" />
              </div>

              <div>
                <h4 className="text-[15px] font-semibold text-[#0F172A] mb-[4px]">
                  Homeowner Peace of Mind
                </h4>
                <p className="text-[13px] leading-[1.6] text-[#6B7280]">
                  Long-term protection for renewable investments
                </p>
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
};

export default InsuranceBackedGuarantee;
