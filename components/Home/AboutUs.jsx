import Image from "next/image";

const AboutUs = () => {
  return (
    <section className='w-full bg-white py-[120px]'>
      <div className='max-w-[1200px] mx-auto px-4'>
        {/* Heading */}
        <div className='text-center mb-[96px]'>
          <h2 className='text-[32px] font-semibold text-[#0F172A] mb-3'>
            About Us
          </h2>
          <p className='text-[14px] leading-[1.6] font-medium text-[#6B7280] max-w-163 mx-auto'>
            At Renewably UK, our main aspiration is to provide cleaner energy
            throughout the United Kingdom. To achieve this goal, we are ensuring
            that renewable energy installations remain safe, compliant, and
            fully protected through dependable and efficient services.
          </p>
        </div>

        {/* Content */}
        <div
          className='
            grid
            grid-cols-1
            lg:grid-cols-[1fr_520px]
            gap-[64px]
            lg:gap-[80px]
            items-center
          '>
          {/* LEFT TEXT */}
          <div className='flex flex-col gap-[40px]'>
            {[
              {
                title: "Who We Are",
                text: "We are renewable energy service providers committed to supporting contractors like you with products and services that keep your business safe and compliant. The UK Government’s Net Zero commitment requires complete compliance from installation companies; using our platform, you can ensure that your work is protected and up to standard in line with regulations.",
              },
              {
                title: "What We Do",
                text: "At Renewably UK, we believe that you should have the ability to work with ease; to achieve this, we are ensuring that contractors like you have a place to manage all their renewable energy business needs. That is why we provide and host digital tools that allow you to do just that. Renewably UK is your one-stop solution for guaranteed compliant and secure services.",
              },
              {
                title: "Our Purpose",
                text: "To support, and accelerate, the UK's transition to clean energy. By providing the renewable energy industry and its providers with compliant and secure services.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className='
                  grid
                  grid-cols-1
                  sm:grid-cols-[120px_1fr]
                  gap-[16px]
                  sm:gap-[24px]
                  text-center
                  sm:text-left
                '>
                <h4 className='text-[20px] font-semibold text-[#0F172A]'>
                  {item.title}
                </h4>
                <p className='text-[14px] font-medium leading-[1.6] text-[#6B7280]'>
                  {item.text}
                </p>
              </div>
            ))}
          </div>

          {/* RIGHT IMAGES */}
          <div
            className='
              flex
              flex-col
              sm:flex-row
              justify-center
              gap-[16px]
            '>
            {/* LEFT IMAGE COLUMN */}
            <div className='flex flex-col gap-[16px] w-full sm:w-[252px]'>
              <div className='relative h-[172px] rounded-[12px] overflow-hidden'>
                <Image
                  src='/Home/About/a2.png'
                  alt='Solar planning'
                  fill
                  className='object-cover'
                />
              </div>

              <div className='relative h-[172px] rounded-[12px] overflow-hidden'>
                <Image
                  src='/Home/About/a3.jpg'
                  alt='Solar installation'
                  fill
                  className='object-cover'
                />
              </div>
            </div>

            {/* RIGHT IMAGE COLUMN */}
            <div className='flex flex-col gap-[16px] w-full sm:w-[252px]'>
              <div className='relative h-[360px] rounded-[12px] overflow-hidden'>
                <Image
                  src='/Home/About/a1.png'
                  alt='Solar inspection'
                  fill
                  className='object-cover'
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutUs;
