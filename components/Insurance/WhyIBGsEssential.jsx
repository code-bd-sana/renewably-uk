import { Check, ShieldCheck, BadgeCheck, AlertTriangle } from "lucide-react";

const items = [
  {
    title: "Required for UK Schemes",
    text: "Many UK renewable schemes mandate IBGs for compliance",
    icon: Check,
    iconBg: "bg-[#C7DBFF]",
    iconColor: "text-[#2563EB]",
  },
  {
    title: "Long-Term Protection",
    text: "Protects homeowners for years after installation",
    icon: ShieldCheck,
    iconBg: "bg-[#BBF7D0]",
    iconColor: "text-[#16A34A]",
  },
  {
    title: "Builds Trust",
    text: "Demonstrates credibility and professionalism",
    icon: BadgeCheck,
    iconBg: "bg-[#DDD6FE]",
    iconColor: "text-[#7C3AED]",
  },
  {
    title: "Reduces Risk",
    text: "Minimizes financial and reputational exposure",
    icon: AlertTriangle,
    iconBg: "bg-[#FED7AA]",
    iconColor: "text-[#EA580C]",
  },
];

const WhyIBGsEssential = () => {
  return (
    <section className="w-full bg-white py-[120px]">
      <div className="max-w-[1500px] mx-auto px-4">

        {/* Heading */}
        <div className="text-center mb-[56px]">
          <h2 className="text-[28px] font-semibold text-[#0F172A] mb-[8px]">
            Why IBGs Are Essential
          </h2>
          <p className="text-[14px] text-[#6B7280]">
            Insurance-backed guarantees are critical for renewable installations
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-[24px]">
          {items.map((item, index) => {
            const Icon = item.icon;
            return (
              <div
                key={index}
                className="
                  bg-gradient-to-r from-[#F5F8FF] to-[#DBEAFE]
                  rounded-[16px]
                  p-[24px]
                  flex
                  flex-col
                  h-full
                "
              >
                {/* Icon */}
                <div
                  className={`
                    w-[40px]
                    h-[40px]
                    rounded-[12px]
                    ${item.iconBg}
                    flex
                    items-center
                    justify-center
                    mb-[16px]
                  `}
                >
                  <Icon size={20} className={item.iconColor} />
                </div>

                {/* Title */}
                <h4 className="text-[15px] font-semibold text-[#0F172A] mb-[6px] leading-[1.4]">
                  {item.title}
                </h4>

                {/* Text */}
                <p className="text-[13px] leading-[1.6] text-[#6B7280]">
                  {item.text}
                </p>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};

export default WhyIBGsEssential;
