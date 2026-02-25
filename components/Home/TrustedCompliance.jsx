import {
  Monitor,
  Zap,
  Database,
  Users,
  CheckCircle,
  TrendingUp,
} from "lucide-react";

const cards = [
  {
    title: "100% Digital Platform",
    text: "No more spreadsheets, macros, or SharePoint folders.",
    icon: Monitor,
    bg: "bg-blue-100",
    color: "text-blue-600",
  },
  {
    title: "Fast Certificate Generation",
    text: "Produce IBGs instantly from your dashboard.",
    icon: Zap,
    bg: "bg-yellow-100",
    color: "text-yellow-600",
  },
  {
    title: "Centralised Data",
    text: "Every installation is securely stored with audit trails.",
    icon: Database,
    bg: "bg-purple-100",
    color: "text-purple-600",
  },
  {
    title: "Trusted by Installers",
    text: "Hundreds of installation companies trust our system daily.",
    icon: Users,
    bg: "bg-green-100",
    color: "text-green-600",
  },
  {
    title: "Always Compliant",
    text: "Aligned with the UK’s Renewable Energy Sector.",
    icon: CheckCircle,
    bg: "bg-red-100",
    color: "text-red-600",
  },
  {
    title: "Scalable Solution",
    text: "Grow your business without administrative bottlenecks.",
    icon: TrendingUp,
    bg: "bg-orange-100",
    color: "text-orange-600",
  },
];

const TrustedCompliance = () => {
  return (
    <section className='w-full bg-[#0F47A8] py-30'>
      <div className='max-w-388 mx-auto px-4'>
        {/* Heading */}
        <div className='text-center mb-16'>
          <h2 className='text-[28px] font-semibold text-white mb-2'>
            Trusted Compliance
          </h2>
          <p className='text-[14px] leading-[1.6] text-white/80 max-w-140 mx-auto'>
            Everything you need to generate insurance-backed guarantees, manage
            data securely, and stay compliant – all in one digital platform.
          </p>
        </div>

        {/* Cards */}
        <div
          className='
            grid
            grid-cols-1
            sm:grid-cols-2
            lg:grid-cols-3
            gap-6
            justify-items-center
          '>
          {cards.map((card, index) => {
            const Icon = card.icon;
            return (
              <div
                key={index}
                className='
                  w-full
                  h-auto
                  lg:h-56
                  bg-white
                  rounded-[14px]
                  border
                  border-[#E5E7EB]
                  p-6
                  shadow-[0_1px_2px_-1px_rgba(0,0,0,0.10),0_1px_3px_0_rgba(0,0,0,0.10)]
                  flex
                  flex-col
                '>
                {/* Icon */}
                <div
                  className={`w-10 h-10 rounded-[10px] ${card.bg} flex items-center justify-center mb-4`}>
                  <Icon size={20} className={card.color} />
                </div>

                {/* Title */}
                <h4 className='text-[21px] font-semibold leading-[1.4] text-[#0F172A] mb-1.5'>
                  {card.title}
                </h4>

                {/* Description */}
                <p className='text-[14px] font-medium leading-[1.6] max-w-65 text-[#6B7280]'>
                  {card.text}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default TrustedCompliance;
