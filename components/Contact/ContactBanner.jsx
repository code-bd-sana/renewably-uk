import Image from "next/image";

const ContactBanner = () => {
  return (
    <section className='w-full -mt-19'>
      <div className='mx-auto px-4'>
        <div className='relative h-170 rounded-3xl overflow-hidden'>
          {/* Background image */}
          <Image
            src='/Contact/banner.jpg'
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
                bg-linear-to-r
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
     pt-60
      pl-6 sm:pl-10 lg:pl-18
      max-w-full sm:max-w-180 lg:max-w-245
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
    max-w-245
  '>
                Get in Touch
              </h1>

              <p
                className='
        text-white/90
        leading-[1.7]
        text-[14px]
        sm:text-[15px]
        lg:text-[16px]
        max-w-full sm:max-w-105 lg:max-w-130
      '>
                Our team is here to support your renewable energy business.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactBanner;
