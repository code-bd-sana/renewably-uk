"use client";

import React, { useEffect, useState } from "react";

const ServicesWeHost = () => {
  const services = [
    {
      id: "insurance-backed-guarantees",
      title: "Insurance Backed Guarantees",
      desc: "Hosted Insurance Backed Guarantee’s via our FCA and Trustmark approved partners Bluedrop Services (NW) Ltd ",
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
      desc: "Providing you with up-to-date information on the renewable energy sector",
      img: "https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=800&q=80",
    },
  ];

  const [hoveredCard, setHoveredCard] = useState(null);

  // Function to trigger hover effect
  const triggerCardHover = (id) => {
    setHoveredCard(id);

    // Scroll to the element
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }

    // Remove hover after 1.5 seconds
    setTimeout(() => {
      setHoveredCard(null);
    }, 1500);
  };

  // Check URL hash on component mount and when it changes
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.substring(1);
      if (hash && services.some((service) => service.id === hash)) {
        triggerCardHover(hash);
      }
    };

    // Listen for custom scroll events from footer
    const handleServiceScroll = (event) => {
      const { id } = event.detail;
      if (id && services.some((service) => service.id === id)) {
        triggerCardHover(id);
      }
    };

    // Initial check
    handleHashChange();

    // Listen for hash changes
    window.addEventListener("hashchange", handleHashChange);

    // Listen for custom events from footer
    window.addEventListener("service-scroll", handleServiceScroll);

    return () => {
      window.removeEventListener("hashchange", handleHashChange);
      window.removeEventListener("service-scroll", handleServiceScroll);
    };
  }, []);

  return (
    <section className='w-full bg-[#0F47A8] py-24' id='services'>
      <div className='max-w-[1200px] mx-auto px-4'>
        {/* Heading */}
        <div className='text-center mb-12'>
          <h2 className='text-white text-2xl sm:text-3xl font-semibold mb-2'>
            Services we host
          </h2>
          <p className='text-white/80 text-sm'>
            We host various renewable energy sector services that are accessible
            from one account, making navigating your needs easier.
          </p>
        </div>

        {/* Cards */}
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6'>
          {services.map((item) => {
            const isHovered = hoveredCard === item.id;

            return (
              <div
                key={item.id}
                id={item.id}
                className={`
                  group
                  relative
                  w-full
                  h-[265px]
                  rounded-2xl
                  overflow-hidden
                  transition-all
                  duration-700
                  ease-out
                  cursor-pointer
                  ${isHovered ? "scale-105 shadow-2xl shadow-black/40" : ""}
                  hover:scale-105
                  hover:shadow-2xl
                  hover:shadow-black/40
                `}
                style={{ willChange: "transform" }}>
                {/* Image */}
                <div className='absolute inset-0'>
                  <img
                    src={item.img}
                    alt={item.title}
                    className={`
                      w-full h-full object-cover transition-transform duration-1000 ease-out
                      ${isHovered ? "scale-110" : ""}
                      group-hover:scale-110
                    `}
                  />
                </div>

                {/* Gradient Overlay */}
                <div
                  className={`
                    absolute inset-0
                    bg-gradient-to-t
                    from-black/85
                    via-black/40
                    to-transparent
                    transition-all
                    duration-700
                    ${isHovered ? "from-black/95 via-black/60" : ""}
                    group-hover:from-black/95
                    group-hover:via-black/60
                  `}
                />

                {/* Text Content */}
                <div
                  className={`
                  absolute inset-0 flex flex-col justify-end
                  transition-all duration-700
                  ${isHovered ? "p-6" : "p-5"}
                  group-hover:p-6
                `}>
                  {/* Title */}
                  <h3
                    className={`
                    text-white text-base font-semibold leading-tight
                    transition-all duration-700
                    ${isHovered ? "mb-3" : "mb-2"}
                    group-hover:mb-3
                  `}>
                    {item.title}
                  </h3>

                  {/* Description */}
                  <div
                    className={`
                    overflow-hidden transition-all duration-700 ease-out
                    ${isHovered ? "max-h-32" : "max-h-0"}
                    group-hover:max-h-32
                  `}>
                    <p
                      className={`
                      text-white/90 text-xs leading-relaxed
                      transition-all duration-700 ease-out
                      ${isHovered ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"}
                      group-hover:opacity-100
                      group-hover:translate-y-0
                    `}>
                      {item.desc}
                    </p>
                  </div>
                </div>

                {/* Subtle border on hover */}
                <div
                  className={`
                  absolute inset-0 rounded-2xl border-2
                  transition-all duration-700 pointer-events-none
                  ${isHovered ? "border-white/20" : "border-white/0"}
                  group-hover:border-white/20
                `}
                />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default ServicesWeHost;
