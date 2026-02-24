"use client";

import { useState, useRef } from "react";
import Image from "next/image";

const articles = [
  {
    id: 1,
    title: "Welcome to Renewably UK Ltd",
    category: "Company Update",
    date: "February 21, 2026",
    excerpt:
      "We are proud to formally announce the launch of Renewably UK Ltd — the next stage in the evolution of our team, our infrastructure, and our long-term commitment to the UK energy efficiency sector.",
    image: "/News/i1.jpg",
    featured: true,
    sections: [
      {
        heading: "A New Chapter. The Same Trusted Team. A Stronger Platform.",
        paragraphs: [
          "We are proud to formally announce the launch of Renewably UK Ltd — the next stage in the evolution of our team, our infrastructure, and our long-term commitment to the UK energy efficiency sector.",
          "While the name has changed, the expertise, leadership, and operational experience behind it remain the same. The team previously operating under Eco4Store Ltd now moves forward as Renewably UK Ltd, building on proven foundations while enhancing our compliance framework, governance structure, and digital platform capability.",
          "This is progression — not reinvention.",
        ],
      },
      {
        heading: "Why Renewably UK Ltd?",
        paragraphs: [
          "The UK retrofit and energy efficiency landscape continues to mature. With increasing regulatory scrutiny, technical monitoring, funding governance requirements, and consumer protection expectations, the sector demands stronger infrastructure and more structured oversight.",
          "Renewably UK Ltd has been established to meet that demand.",
        ],
        bullets: [
          "A move towards a compliance-led operating model",
          "Enhanced governance and risk management processes",
          "Strengthened insurance-backed guarantee administration",
          "Improved digital workflows and document control",
          "Greater transparency across project lifecycle management",
        ],
      },
      {
        heading: "A Compliance-First Platform",
        paragraphs: [
          "At the core of Renewably UK Ltd is our digital platform: https://renewably.energy",
          "The platform has been developed to support structured onboarding, due diligence, accreditation and insurance verification tracking, IBG issuance and oversight, project-level data management, controlled document submission and review workflows, and administrative governance and audit readiness.",
        ],
        bullets: [
          "Structured onboarding and due diligence",
          "Accreditation and insurance verification tracking",
          "Insurance Backed Guarantee (IBG) issuance and oversight",
          "Project-level data management",
          "Controlled document submission and review workflows",
          "Administrative governance and audit readiness",
        ],
      },
      {
        heading: "Continuity You Can Rely On",
        paragraphs: [
          "We recognise that trust is built on relationships and delivery consistency.",
          "The same experienced team you have worked with remains in place. Our knowledge of the UK Government's net zero delivery frameworks, accreditation standards, and compliance requirements continues unchanged.",
          "What has evolved is the structure around that expertise — allowing us to operate with greater clarity, accountability, and resilience.",
        ],
      },
      {
        heading: "Strengthened Consumer Protection & Guarantee Oversight",
        paragraphs: [
          "A key focus of Renewably UK Ltd is robust Insurance Backed Guarantee administration. We have refined our processes to ensure accurate policy issuance, controlled amendment procedures, clear audit trails and transparent communication with policy holders.",
        ],
        bullets: [
          "Accurate policy issuance",
          "Controlled amendment procedures",
          "Clear audit trails",
          "Transparent communication with policy holders",
          "Underwriting-aligned governance",
        ],
      },
      {
        heading: "Built for Long-Term Sector Stability",
        paragraphs: [
          "Renewably UK Ltd has been created with longevity in mind. Our objectives include supporting responsible retrofit delivery, strengthening compliance across the supply chain, providing dependable administrative infrastructure and enabling sustainable growth for our partners.",
          "We believe structured governance, clear accountability, and professional standards are essential to the future of the UK’s energy efficiency industry.",
        ],
        bullets: [
          "Supporting responsible retrofit delivery",
          "Strengthening compliance across the supply chain",
          "Providing dependable administrative infrastructure",
          "Enabling sustainable growth for our partners",
        ],
      },
      {
        heading: "Looking Ahead",
        paragraphs: [
          "This transition broadens our services, improves digital efficiency, enhances compliance controls, and provides greater clarity and confidence for stakeholders.",
          "We look forward to continuing our partnerships under Renewably UK Ltd and welcoming new organisations into the platform. For further information, please visit: https://renewably.energy or contact us at: support@renewably.energy",
          "Renewably UK Ltd — Delivering structured, compliance-led infrastructure for the UK energy efficiency sector.",
        ],
        bullets: [
          "Broaden our service offering",
          "Improve digital efficiency",
          "Enhance compliance controls",
          "Provide greater clarity and confidence to all stakeholders",
        ],
      },
    ],
  },
  // {
  //   id: 2,
  //   title: "New IBG Requirements for 2025",
  //   category: "Compliance Updates",
  //   date: "December 15, 2024",
  //   excerpt: "Updated guidelines for insurance-backed guarantees.",
  //   image: "/News/i1.jpg",
  // },
  // {
  //   id: 3,
  //   title: "Heat Pump Installation Growth",
  //   category: "Compliance Updates",
  //   date: "December 15, 2024",
  //   excerpt: "UK sees 40% increase in heat pump installations.",
  //   image: "/News/i2.png",
  // },
  // {
  //   id: 4,
  //   title: "Platform Update: Enhanced Security",
  //   category: "Compliance Updates",
  //   date: "December 15, 2024",
  //   excerpt: "New security features for Renewably UK users.",
  //   image: "/News/i3.jpg",
  // },
  // {
  //   id: 5,
  //   title: "Guide: Funding Scheme Compliance",
  //   category: "Compliance Updates",
  //   date: "December 15, 2024",
  //   excerpt: "Step-by-step guide to meeting ECO4 requirements.",
  //   image: "/News/i4.png",
  // },
  // {
  //   id: 6,
  //   title: "Solar PV Market Report 2024",
  //   category: "Market & Data",
  //   date: "December 15, 2024",
  //   excerpt: "Annual review of solar installation trends.",
  //   image: "/News/i5.jpg",
  // },
  // {
  //   id: 7,
  //   title: "New Certificate Templates Available",
  //   category: "Platform Updates",
  //   date: "December 15, 2024",
  //   excerpt: "Updated IBG templates for battery storage.",
  //   image: "/News/i6.png",
  // },
];

export default function InsightsSection() {
  const topRef = useRef(null);
  const [featured, setFeatured] = useState(articles.find((a) => a.featured));
  const [isExpanded, setIsExpanded] = useState(false);

  const ensureEllipsis = (text) => {
    if (!text) return "";
    return /\.\.\.$/.test(text)
      ? text
      : text.trim().endsWith(".")
        ? text.trim() + "..."
        : text + "...";
  };

  const getWordCount = (article) => {
    if (!article) return 0;
    if (article.sections) {
      const joined = article.sections
        .map((s) => (s.paragraphs || []).join(" "))
        .join(" ");
      const words = joined.match(/\b\w+\b/g) || [];
      return words.length;
    }
    const words = (article.excerpt || "").match(/\b\w+\b/g) || [];
    return words.length;
  };

  const featuredWordCount = getWordCount(featured);

  const handleReadMore = (article) => {
    setFeatured(article);
    setIsExpanded(true);
    setTimeout(() => {
      topRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 50);
  };

  const handleCollapse = () => setIsExpanded(false);

  return (
    <section className='w-full bg-[#F8FAFC] py-24'>
      <div className='max-w-400 mx-auto px-4'>
        {/* ===== FEATURED CARD ===== */}
        <div
          ref={topRef}
          className='
            bg-white
            rounded-2xl
            overflow-hidden
            shadow-[0_8px_24px_rgba(15,23,42,0.08)]
            mb-12
          '>
          <div className='relative h-65'>
            <Image
              src={featured.image}
              alt={featured.title}
              fill
              className='object-cover'
              priority
            />
          </div>

          <div className='p-8 flex flex-col'>
            <div className='flex items-center gap-3 mb-3'>
              <span className='text-[11px] font-medium bg-[#EAF2FF] text-[#2563EB] px-2.5 py-1 rounded-full'>
                {featured.category}
              </span>
              <span className='text-[12px] text-[#6B7280]'>
                {featured.date}
              </span>
            </div>

            <h3 className='text-[22px] font-semibold text-[#0F172A] mb-3'>
              {featured.title}
            </h3>

            {!isExpanded ? (
              <div className='flex flex-col'>
                <p className='text-[14px] leading-[1.7] text-[#475569] max-w-190'>
                  {ensureEllipsis(featured.excerpt)}
                </p>

                {featured.sections && (
                  <div className='mt-4 self-start'>
                    <button
                      onClick={() => handleReadMore(featured)}
                      className='inline-flex items-center justify-center h-9 px-4 bg-[#0F47A8] text-white text-[12px] font-medium rounded-lg hover:bg-[#0C3E96] transition'>
                      Read more
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className='space-y-6'>
                {featured.sections && featured.sections.length > 0 ? (
                  featured.sections.map((section) => (
                    <div key={section.heading}>
                      <h4 className='text-[16px] font-semibold text-[#0F172A] mb-2'>
                        {section.heading}
                      </h4>

                      {section.paragraphs?.map((p) => (
                        <p
                          key={p}
                          className='text-[14px] leading-[1.7] text-[#475569] mb-2'>
                          {p}
                        </p>
                      ))}

                      {section.bullets?.length > 0 && (
                        <ul className='list-disc pl-5 space-y-2 text-[14px] leading-[1.7] text-[#475569]'>
                          {section.bullets.map((b) => (
                            <li key={b}>{b}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))
                ) : (
                  <div>
                    <p className='text-[14px] leading-[1.7] text-[#475569]'>
                      {featured.excerpt}
                    </p>
                  </div>
                )}

                {featuredWordCount > 200 && (
                  <div>
                    <button
                      onClick={handleCollapse}
                      className='inline-flex items-center justify-center h-9 px-4 bg-[#E6EEF9] text-[#0F47A8] text-[12px] font-medium rounded-lg hover:bg-[#DCE8FF] transition'>
                      Show less
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ===== GRID ===== */}
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'>
          {articles
            .filter((a) => a.id !== featured.id)
            .map((item) => (
              <div
                key={item.id}
                className='bg-white rounded-[14px] overflow-hidden border border-[#EEF2F7] hover:shadow-[#0F172A14] transition flex flex-col h-full'>
                <div className='relative h-40'>
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    className='object-cover'
                  />
                </div>

                <div className='p-5 flex flex-col flex-1'>
                  <div className='flex items-center gap-2.5 mb-2'>
                    <span className='text-[11px] font-medium bg-[#EAF2FF] text-[#2563EB] px-2 py-0.75 rounded-full'>
                      {item.category}
                    </span>
                    <span className='text-[11px] text-[#6B7280]'>
                      {item.date}
                    </span>
                  </div>

                  <h4 className='text-[15px] font-semibold text-[#0F172A] mb-1.5 leading-[1.45]'>
                    {item.title}
                  </h4>

                  <p className='text-[13px] leading-[1.6] text-[#6B7280] mb-3 flex-1'>
                    {ensureEllipsis(item.excerpt)}
                  </p>

                  <div className='mt-auto'>
                    <button
                      onClick={() => handleReadMore(item)}
                      className='inline-flex items-center justify-center h-7 px-3 bg-[#0F47A8] text-white text-[12px] font-medium rounded-lg hover:bg-[#0C3E96] transition'>
                      Read more
                    </button>
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>
    </section>
  );
}
