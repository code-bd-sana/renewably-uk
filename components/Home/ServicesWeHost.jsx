import React from 'react';

const ServicesWeHost = () => {
  const services = [
    {
      id: "insurance-backed-guarantees",
      title: "Insurance Backed Guarantees",
      desc: "Hosted Insurance Backed Guarantee's via our FCA and TrustMark approved partners Bluecrop Services",
      img: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800&q=80",
    },
    {
      id: "data-protection",
      title: "Data Protection",
      desc: "ICO Compliant Data and Document storage using our UK based data centre",
      img: "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800&q=80",
    },
    {
      id: "project-funding",
      title: "Project Funding",
      desc: "Access to renewable energy funding for your project submissions via our network",
      img: "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=800&q=80",
    },
    {
      id: "support-guidance",
      title: "Support and Guidance",
      desc: "Providing you with up to date information on the renewable energy sector",
      img: "https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=800&q=80",
    },
  ];

  return (
    <section className="w-full bg-[#0F47A8] py-24" id="services">
      <div className="max-w-[1200px] mx-auto px-4">
        {/* Heading */}
        <div className="text-center mb-12">
          <h2 className="text-white text-2xl sm:text-3xl font-semibold mb-2">
            Services we host
          </h2>
          <p className="text-white/80 text-sm">
            We host multiple compliant renewable energy sector services under one account
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((item) => (
            <div
              key={item.id}
              id={item.id}
              className="
                group
                relative
                w-full
                h-[265px]
                rounded-2xl
                overflow-hidden
                transition-all
                duration-700
                ease-out
                hover:scale-105
                hover:shadow-2xl
                hover:shadow-black/40
                cursor-pointer
              "
              style={{ willChange: 'transform' }}
            >
              {/* Image */}
              <div className="absolute inset-0">
                <img
                  src={item.img}
                  alt={item.title}
                  className="w-full h-full object-cover transition-transform duration-1000 ease-out group-hover:scale-110"
                />
              </div>

              {/* Gradient Overlay */}
              <div
                className="
                  absolute inset-0
                  bg-gradient-to-t
                  from-black/85
                  via-black/40
                  to-transparent
                  transition-all
                  duration-700
                  group-hover:from-black/95
                  group-hover:via-black/60
                "
              />

              {/* Text Content */}
              <div className="absolute inset-0 flex flex-col justify-end p-5 transition-all duration-700 group-hover:p-6">
                {/* Title - Fixed width to prevent jumping */}
                <h3 className="text-white text-base font-semibold leading-tight mb-2 transition-all duration-700 group-hover:mb-3">
                  {item.title}
                </h3>

                {/* Description */}
                <div className="overflow-hidden transition-all duration-700 ease-out max-h-0 group-hover:max-h-32">
                  <p className="text-white/90 text-xs leading-relaxed opacity-0 transform translate-y-2 transition-all duration-700 ease-out group-hover:opacity-100 group-hover:translate-y-0">
                    {item.desc}
                  </p>
                </div>
              </div>

              {/* Subtle border on hover */}
              <div className="absolute inset-0 rounded-2xl border-2 border-white/0 transition-all duration-700 pointer-events-none group-hover:border-white/20" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServicesWeHost;