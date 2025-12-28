import { Sun, Zap, Flame, Home, BatteryCharging, PlugZap } from "lucide-react";

const measures = [
  {
    title: "Solar PV & Solar Thermal",
    desc: "Photovoltaic panels and solar\nheating systems",
    icon: Sun,
    chipBg: "bg-[#FEF3C7]", // soft yellow
    iconColor: "text-[#F59E0B]",
  },
  {
    title: "Heat Pumps",
    desc: "Air source and ground source heat pump\ninstallations",
    icon: Zap,
    chipBg: "bg-[#DBEAFE]", // soft blue
    iconColor: "text-[#0284C7]",
  },
  {
    title: "Boilers and Heating Controls",
    desc: "Modern heating systems and boiler\ninstallations",
    icon: Flame,
    chipBg: "bg-[#FCE7F3]", // soft pink
    iconColor: "text-[#EF4444]",
  },
  {
    title: "Insulation Measures",
    desc: "Loft, Flat Roof, Cavity Wall, Internal\nWall Insulation",
    icon: Home,
    chipBg: "bg-[#F3E8FF]", // soft purple
    iconColor: "text-[#7C3AED]",
  },
  {
    title: "Battery Storage",
    desc: "Energy storage systems for\nrenewable power",
    icon: BatteryCharging,
    chipBg: "bg-[#DCFCE7]", // soft green
    iconColor: "text-[#16A34A]",
  },
  {
    title: "EV Charging",
    desc: "Electric vehicle charging point\ninstallations",
    icon: PlugZap,
    chipBg: "bg-[#EDE9FE]", // soft indigo
    iconColor: "text-[#6D28D9]",
  },
];

const MeasuresWeHost = () => {
  return (
    <section className="w-full bg-[#0F47A8] py-[96px]">
      <div className="max-w-[1500px] mx-auto px-4">
        {/* Heading */}
        <div className="text-center mb-[44px]">
          <h2 className="text-white text-[22px] font-semibold leading-[1.2] mb-[6px]">
            Measures We Host
          </h2>
          <p className="text-white/80 text-[12px] leading-[1.5]">
            Comprehensive coverage for renewable energy installations, provided
            by Bluedrop Services.
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-[22px]">
          {measures.map((m, idx) => {
            const Icon = m.icon;
            return (
              <div
                key={idx}
                className="
                  bg-white
                  rounded-[12px]
                  border border-[#E5E7EB]
                  shadow-[0_1px_2px_rgba(0,0,0,0.08)]
                  px-[22px]
                  py-[20px]
                  min-h-[128px]
                "
              >
                {/* Icon chip */}
                <div
                  className={`
                    w-[40px] h-[40px]
                    rounded-[12px]
                    ${m.chipBg}
                    flex items-center justify-center
                    mb-[14px]
                  `}
                >
                  <Icon size={18} className={m.iconColor} />
                </div>

                {/* Title */}
                <h4 className="text-[#0F172A] text-[15px] font-semibold leading-[1.35] mb-[6px]">
                  {m.title}
                </h4>

                {/* Desc */}
                <p className="text-[#6B7280] text-[13px] leading-[1.55] whitespace-pre-line">
                  {m.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default MeasuresWeHost;
