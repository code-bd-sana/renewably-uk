import Image from "next/image";

const ServicesWeHost = () => {
  return (
    <section className="w-full bg-[#0F47A8] py-[96px]">
      <div className="max-w-[1200px] mx-auto px-4">

        {/* Heading */}
        <div className="text-center mb-12">
          <h2 className="text-white text-[24px] sm:text-[26px] lg:text-[28px] font-semibold mb-2">
            Services we host
          </h2>
          <p className="text-white/80 text-[13px] sm:text-[14px]">
            We host multiple compliant renewable energy sector services under
            one account
          </p>
        </div>

        {/* Cards */}
        <div
          className="
            grid
            grid-cols-1
            sm:grid-cols-2
            lg:grid-cols-4
            gap-[24px]
            justify-items-center
          "
        >
          {[
            {
              title: "Insurance Backed\nGuarantees",
              desc: "Hosted Insurance Backed Guarantee’s via our FCA and TrustMark approved partners Bluecrop Services",
              img: "/Home/Services/s1.jpg",
            },
            {
              title: "Data Protection",
              desc: "ICO Compliant Data and Document storage using our UK based data centre",
              img: "/Home/Services/s2.jpg",
            },
            {
              title: "Project Funding",
              desc: "Access to renewable energy funding for your project submissions via our network",
              img: "/Home/Services/s3.jpg",
            },
            {
              title: "Support and Guidance",
              desc: "Providing you with up to date information on the renewable energy sector",
              img: "/Home/Services/s4.jpg",
            },
          ].map((item, index) => (
            <div
              key={index}
              className="
                relative
                w-full
                max-w-[310px]
                h-[240px]
                sm:h-[250px]
                lg:h-[265px]
                rounded-[16px]
                overflow-hidden
              "
            >
              {/* Image */}
              <Image
                src={item.img}
                alt={item.title}
                fill
                className="object-cover"
              />

              {/* Gradient Overlay */}
              <div
                className="
                  absolute inset-0
                  bg-gradient-to-t
                  from-black/80
                  via-black/35
                  to-transparent
                "
              />

              {/* Text */}
              <div className="absolute bottom-0 left-0 p-[20px]">
                <h3 className="text-white text-[15px] lg:text-[16px] font-semibold leading-[1.3] mb-2 whitespace-pre-line">
                  {item.title}
                </h3>
                <p className="text-white/80 text-[12px] lg:text-[13px] leading-[1.5]">
                  {item.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default ServicesWeHost;
