const TrustedCoverage = () => {
  return (
    <section className="w-full bg-white py-[96px]">
      <div className="max-w-[1200px] mx-auto px-4 text-center">

        {/* Heading */}
        <h2 className="text-[24px] sm:text-[26px] lg:text-[28px] leading-[1.25] font-semibold text-[#0F172A] mb-4">
          Trusted Coverage for Renewable
          <br />
          Installations
        </h2>

        {/* Description */}
        <p className="mx-auto max-w-[720px] text-[13px] sm:text-[14px] leading-[1.7] text-[#6B7280] mb-12">
          At Renewably UK, we host and provide fully compliant services for
          contractors, installers, and energy service providers. Our platform
          makes it simple to generate Insurance Backed Guarantees through our
          FCA approved trusted partner, manage installations, and stay compliant
          with UK Government regulations – all in one place.
        </p>

        {/* Cards */}
        <div
          className="
            grid
            grid-cols-1
            sm:grid-cols-2
            lg:grid-cols-3
            gap-[20px]
            justify-items-center
          "
        >
          {[
            "Hosting TrustMark approved services for the renewable energy sector, all in one place.",
            "24hr access to a Hosted Insurance Backed Guarantee facility with instant IBG generation",
            "Supports 50+ renewable energy measure categories across multiple schemes",
          ].map((text, index) => (
            <div
              key={index}
              className="
                w-full
                max-w-[384px]
                h-[120px]
                rounded-[16px]
                border
                border-[#E5EDFF]
                bg-gradient-to-r
                from-[#F5F8FF]
                to-[#DBEAFE]
                p-[32px]
                text-left
                flex items-center
              "
            >
              <p className="text-[13px] leading-[1.6] text-[#1D4ED8] font-medium">
                {text}
              </p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default TrustedCoverage;
