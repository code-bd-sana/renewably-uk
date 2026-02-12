import Image from "next/image";

const HomeBanner = () => {
  return (
    <section className='w-full'>
      <div className='mx-auto px-4'>
        <div className='relative h-[680px] rounded-[24px] overflow-hidden'>
          {/* Background image */}
          <Image
            src='/Home/HeroBanner.jpg'
            alt='Renewable energy installation'
            fill
            priority
            className='object-cover'
          />

          {/* VERY SUBTLE LEFT BLUR (FIGMA-LIKE) */}
          <div className='absolute inset-0 pointer-events-none'>
            {/* Blur layer (very light) */}
            <div
              className='
                absolute left-0 top-0 h-full w-[50%]
                backdrop-blur-[2px]
              '
            />

            {/* Soft fade (not dark) */}
            <div
              className='
                absolute left-0 top-0 h-full w-[48%]
                bg-gradient-to-r
                from-black/25
                via-black/12
                to-transparent
              '
            />
          </div>

          {/* Content */}
          <div className='relative z-10 h-full flex items-start'>
            <div
              className='
     pt-[240px]
      pl-6 sm:pl-10 lg:pl-[72px]
      max-w-full sm:max-w-[720px] lg:max-w-[980px]
    '>
              <h1
                className='
    text-white
    font-semibold
    leading-[1.15]
    mb-5 sm:mb-6
    text-[32px]
    sm:text-[42px]
    lg:text-[56px]
    max-w-[800px]
  '>
                Bringing a Greener Future to
                <br />
                the United Kingdom One Service at a Time
              </h1>

              <p
                className='
        text-white/90
        leading-[1.7]
        text-[14px]
        sm:text-[15px]
        lg:text-[16px]
        max-w-full sm:max-w-[420px] lg:max-w-[520px]
      '>
                The UK’s first one-stop solution for managing your renewable
                energy company all in one place.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HomeBanner;
