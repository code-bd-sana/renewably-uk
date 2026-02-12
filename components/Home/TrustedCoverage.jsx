const TrustedCoverage = () => {
  return (
    <section className='w-full bg-white py-[96px]'>
      <div className='max-w-[1200px] mx-auto px-4 text-center'>
        {/* Heading */}
        <h2 className='text-[24px] sm:text-[26px] lg:text-[28px] leading-[1.25] font-semibold text-[#0F172A] mb-4'>
          Trusted Coverage for Renewable
          <br />
          Installations
        </h2>

        {/* Description */}
        <p className='mx-auto max-w-[720px] text-[13px] sm:text-[14px] leading-[1.7] text-[#6B7280] mb-12'>
          Here at Renewably UK, we provide a simple and easy-to-use platform
          that allows you to generate Insurance Backed Guarantees through our
          FCA-approved partner, access funding, and manage installations all in
          one place. We also help ensure that all work carried out remains
          compliant with UK Government eco regulations, so you can feel at ease
          knowing your work is compliant and protected.
        </p>

        {/* Cards */}
        <div
          className='
            grid
            grid-cols-1
            sm:grid-cols-2
            lg:grid-cols-3
            gap-[20px]
            justify-items-center
          '>
          {[
            "We are host to a range of Trustmark-approved services for the renewable energy sector and have conveniently situated them on a single, easy-to-use platform.",
            "Create Insurance-Backed Guarantees round the clock with instant results using our hosted Insurance-Backed Guarantee facility.",
            "There are over 50 renewable energy measure categories available on the portal system, all supported by various renewable energy schemes.",
          ].map((text, index) => (
            <div
              key={index}
              className='
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
              '>
              <p className='text-[13px] leading-[1.6] text-[#1D4ED8] font-medium'>
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
