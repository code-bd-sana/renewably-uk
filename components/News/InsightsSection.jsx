"use client";

import { useState, useRef } from "react";
import Image from "next/image";

const articles = [
  {
    id: 1,
    title: "New IBG Requirements for 2025",
    category: "Compliance Updates",
    date: "December 15, 2024",
    excerpt:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    image: "/News/i1.jpg",
    featured: true,
  },
  {
    id: 2,
    title: "New IBG Requirements for 2025",
    category: "Compliance Updates",
    date: "December 15, 2024",
    excerpt: "Updated guidelines for insurance-backed guarantees.",
    image: "/News/i1.jpg",
  },
  {
    id: 3,
    title: "Heat Pump Installation Growth",
    category: "Compliance Updates",
    date: "December 15, 2024",
    excerpt: "UK sees 40% increase in heat pump installations.",
    image: "/News/i2.png",
  },
  {
    id: 4,
    title: "Platform Update: Enhanced Security",
    category: "Compliance Updates",
    date: "December 15, 2024",
    excerpt: "New security features for Renewably UK users.",
    image: "/News/i3.jpg",
  },
  {
    id: 5,
    title: "Guide: Funding Scheme Compliance",
    category: "Compliance Updates",
    date: "December 15, 2024",
    excerpt: "Step-by-step guide to meeting ECO4 requirements.",
    image: "/News/i4.png",
  },
  {
    id: 6,
    title: "Solar PV Market Report 2024",
    category: "Market & Data",
    date: "December 15, 2024",
    excerpt: "Annual review of solar installation trends.",
    image: "/News/i5.jpg",
  },
  {
    id: 7,
    title: "New Certificate Templates Available",
    category: "Platform Updates",
    date: "December 15, 2024",
    excerpt: "Updated IBG templates for battery storage.",
    image: "/News/i6.png",
  },
];

export default function InsightsSection() {
  const topRef = useRef(null);
  const [featured, setFeatured] = useState(articles.find((a) => a.featured));

  const handleReadMore = (article) => {
    setFeatured(article);
    setTimeout(() => {
      topRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 50);
  };

  return (
    <section className="w-full bg-[#F8FAFC] py-[96px]">
      <div className="max-w-[1600px] mx-auto px-4">
        {/* ===== FEATURED CARD ===== */}
        <div
          ref={topRef}
          className="
            bg-white
            rounded-[16px]
            overflow-hidden
            shadow-[0_8px_24px_rgba(15,23,42,0.08)]
            mb-[48px]
          "
        >
          <div className="relative h-[260px]">
            <Image
              src={featured.image}
              alt={featured.title}
              fill
              className="object-cover"
              priority
            />
          </div>

          <div className="p-[32px]">
            <div className="flex items-center gap-[12px] mb-[12px]">
              <span className="text-[11px] font-medium bg-[#EAF2FF] text-[#2563EB] px-[10px] py-[4px] rounded-full">
                {featured.category}
              </span>
              <span className="text-[12px] text-[#6B7280]">
                {featured.date}
              </span>
            </div>

            <h3 className="text-[22px] font-semibold text-[#0F172A] mb-[12px]">
              {featured.title}
            </h3>

            <p className="text-[14px] leading-[1.7] text-[#475569] max-w-[760px]">
              {featured.excerpt}
            </p>
          </div>
        </div>

        {/* ===== GRID ===== */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-[24px]">
          {articles
            .filter((a) => a.id !== featured.id)
            .map((item) => (
              <div
                key={item.id}
                className="
                  bg-white
                  rounded-[14px]
                  overflow-hidden
                  border
                  border-[#EEF2F7]
                  hover:shadow-[0_6px_20px_rgba(15,23,42,0.08)]
                  transition
                "
              >
                <div className="relative h-[160px]">
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    className="object-cover"
                  />
                </div>

                <div className="p-[20px]">
                  <div className="flex items-center gap-[10px] mb-[8px]">
                    <span className="text-[11px] font-medium bg-[#EAF2FF] text-[#2563EB] px-[8px] py-[3px] rounded-full">
                      {item.category}
                    </span>
                    <span className="text-[11px] text-[#6B7280]">
                      {item.date}
                    </span>
                  </div>

                  <h4 className="text-[15px] font-semibold text-[#0F172A] mb-[6px] leading-[1.45]">
                    {item.title}
                  </h4>

                  <p className="text-[13px] leading-[1.6] text-[#6B7280] mb-[12px]">
                    {item.excerpt}
                  </p>

                  <button
                    onClick={() => handleReadMore(item)}
                    className="
    inline-flex
    items-center
    justify-center
    h-[28px]
    px-[12px]
    bg-[#0F47A8]
    text-white
    text-[12px]
    font-medium
    rounded-[8px]
    hover:bg-[#0C3E96]
    transition
  "
                  >
                    Read more
                  </button>
                </div>
              </div>
            ))}
        </div>
      </div>
    </section>
  );
}
