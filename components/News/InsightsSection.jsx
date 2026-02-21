"use client";

import { useState, useRef } from "react";
import Image from "next/image";

const articles = [
  {
    id: 1,
    title: "A New Chapter for Renewably UK Ltd",
    category: "Company Update",
    date: "February 21, 2026",
    excerpt:
      "We are proud to formally announce the launch of Renewably UK Ltd — the next stage in the evolution of our team, infrastructure, and long-term commitment to the UK energy efficiency sector.",
    fullText: [
      "Welcome to Renewably UK Ltd",
      "A New Chapter. The Same Trusted Team. A Stronger Platform.",
      "We are proud to formally announce the launch of Renewably UK Ltd — the next stage in the evolution of our team, our infrastructure, and our long-term commitment to the UK energy efficiency sector.",
      "While the name has changed, the expertise, leadership, and operational experience behind it remain the same. The team previously operating under Eco4Store Ltd now moves forward as Renewably UK Ltd, building on proven foundations while enhancing our compliance framework, governance structure, and digital platform capability.",
      "This is progression — not reinvention.",
    ],
    image: "/News/i1.jpg",
    featured: true,
  },
  {
    id: 2,
    title: "Why Renewably UK Ltd?",
    category: "Compliance",
    date: "February 21, 2026",
    excerpt:
      "With growing regulatory scrutiny and governance requirements, the sector demands stronger infrastructure and structured oversight. Renewably UK Ltd has been established to meet that demand.",
    fullText: [
      "The UK retrofit and energy efficiency landscape continues to mature. With increasing regulatory scrutiny, technical monitoring, funding governance requirements, and consumer protection expectations, the sector demands stronger infrastructure and more structured oversight.",
      "Renewably UK Ltd has been established to meet that demand.",
      "Our evolution reflects:",
      "We have invested in building a structured ecosystem designed to support professional delivery at scale. A portal designed for Installation Companies, built for compliance.",
    ],
    bullets: [
      "A move towards a compliance-led operating model",
      "Enhanced governance and risk management processes",
      "Strengthened insurance-backed guarantee administration",
      "Improved digital workflows and document control",
      "Greater transparency across project lifecycle management",
    ],
    image: "/News/i2.png",
  },
  {
    id: 3,
    title: "A Compliance-First Platform",
    category: "Platform",
    date: "February 21, 2026",
    excerpt:
      "Our platform at renewably.energy supports onboarding, due diligence, accreditation tracking, IBG issuance, project data management, and controlled document workflows.",
    fullText: [
      "At the core of Renewably UK Ltd is our digital platform: https://renewably.energy",
      "The platform has been developed to support:",
      "Every component has been designed to strengthen quality assurance and maintain alignment with regulatory expectations across the energy efficiency sector.",
    ],
    bullets: [
      "Structured onboarding and due diligence",
      "Accreditation and insurance verification tracking",
      "Insurance Backed Guarantee (IBG) issuance and oversight",
      "Project-level data management",
      "Controlled document submission and review workflows",
      "Administrative governance and audit readiness",
    ],
    image: "/News/i3.jpg",
  },
  {
    id: 4,
    title: "Continuity You Can Rely On",
    category: "Leadership",
    date: "February 21, 2026",
    excerpt:
      "While the name has changed, the experienced team remains the same. This is progression — not reinvention — with stronger structure around proven expertise.",
    fullText: [
      "We recognize that trust is built on relationships and delivery consistency.",
      "The same experienced team you have worked with remains in place. Our knowledge of the UK Government's net zero delivery frameworks, accreditation standards, and compliance requirements continues unchanged.",
      "What has evolved is the structure around that expertise — allowing us to operate with greater clarity, accountability, and resilience.",
    ],
    image: "/News/i4.png",
  },
  {
    id: 5,
    title: "Strengthened Guarantee Oversight",
    category: "Consumer Protection",
    date: "February 21, 2026",
    excerpt:
      "We refined Insurance Backed Guarantee administration to ensure accurate issuance, controlled amendments, clear audit trails, and transparent policy-holder communication.",
    fullText: [
      "A key focus of Renewably UK Ltd is robust Insurance Backed Guarantee administration.",
      "We have refined our processes to ensure:",
      "This reinforces consumer protection while maintaining operational integrity for contractors and partners.",
    ],
    bullets: [
      "Accurate policy issuance",
      "Controlled amendment procedures",
      "Clear audit trails",
      "Transparent communication with policy holders",
      "Underwriting-aligned governance",
    ],
    image: "/News/i5.jpg",
  },
  {
    id: 6,
    title: "Built for Long-Term Sector Stability",
    category: "Sector Growth",
    date: "February 21, 2026",
    excerpt:
      "Our objectives include responsible retrofit delivery, stronger supply-chain compliance, dependable administration, and sustainable growth for partners.",
    fullText: [
      "Renewably UK Ltd has been created with longevity in mind.",
      "Our objectives include:",
      "We believe structured governance, clear accountability, and professional standards are essential to the future of the UK’s energy efficiency industry.",
    ],
    bullets: [
      "Supporting responsible retrofit delivery",
      "Strengthening compliance across the supply chain",
      "Providing dependable administrative infrastructure",
      "Enabling sustainable growth for our partners",
    ],
    image: "/News/i6.png",
  },
  {
    id: 7,
    title: "Looking Ahead",
    category: "Future",
    date: "February 21, 2026",
    excerpt:
      "This transition broadens our services, improves digital efficiency, enhances compliance controls, and provides greater clarity and confidence for stakeholders.",
    fullText: [
      "This transition marks an important step forward. It allows us to:",
      "We look forward to continuing our partnerships under Renewably UK Ltd and welcoming new organizations into the platform.",
      "For further information, please visit: https://renewably.energy",
      "Or contact us at: support@renewably.energy",
      "Renewably UK Ltd",
      "Delivering structured, compliance-led infrastructure for the UK energy efficiency sector.",
    ],
    bullets: [
      "Broaden our service offering",
      "Improve digital efficiency",
      "Enhance compliance controls",
      "Provide greater clarity and confidence to all stakeholders",
    ],
    image: "/News/i1.jpg",
  },
];

export default function InsightsSection() {
  const topRef = useRef(null);
  const [featured, setFeatured] = useState(articles.find((a) => a.featured));
  const [isExpanded, setIsExpanded] = useState(false);

  const handleReadMore = (article) => {
    setFeatured(article);
    setIsExpanded(true);
    setTimeout(() => {
      topRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 50);
  };

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

          <div className='p-6 sm:p-8'>
            <div className='flex flex-wrap items-center gap-3 mb-3'>
              <span className='text-[11px] font-medium bg-[#EAF2FF] text-[#2563EB] px-2.5 py-1 rounded-full'>
                {featured.category}
              </span>
              <span className='text-[12px] text-[#6B7280]'>
                {featured.date}
              </span>
            </div>

            <h3 className='text-[20px] sm:text-[22px] font-semibold text-[#0F172A] mb-3 leading-[1.35]'>
              {featured.title}
            </h3>

            {!isExpanded ? (
              <button
                onClick={() => handleReadMore(featured)}
                className='
    inline-flex
    items-center
    justify-center
    h-8
    px-3.5
    bg-[#0F47A8]
    text-white
    text-[12px]
    font-medium
    rounded-lg
    hover:bg-[#0C3E96]
    transition
  '>
                Read more
              </button>
            ) : (
              <div className='max-w-245 space-y-3'>
                {featured.fullText?.map((paragraph) => (
                  <p
                    key={paragraph}
                    className='text-[14px] sm:text-[15px] leading-[1.8] text-[#475569]'>
                    {paragraph}
                  </p>
                ))}

                {featured.bullets?.length > 0 && (
                  <ul className='list-disc pl-5 space-y-2 text-[14px] sm:text-[15px] leading-[1.8] text-[#475569]'>
                    {featured.bullets.map((bullet) => (
                      <li key={bullet}>{bullet}</li>
                    ))}
                  </ul>
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
                className='
                  bg-white
                  rounded-2xl
                  overflow-hidden
                  border
                  border-[#EEF2F7]
                  hover:shadow-[0_6px_20px_rgba(15,23,42,0.08)]
                  transition
                '>
                <div className='relative h-40'>
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    className='object-cover'
                  />
                </div>

                <div className='p-5'>
                  <div className='flex flex-wrap items-center gap-2.5 mb-2'>
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

                  <p className='text-[13px] leading-[1.6] text-[#6B7280] mb-3'>
                    {item.excerpt}
                  </p>

                  <button
                    onClick={() => handleReadMore(item)}
                    className='
    inline-flex
    items-center
    justify-center
    h-7
    px-3
    bg-[#0F47A8]
    text-white
    text-[12px]
    font-medium
    rounded-lg
    hover:bg-[#0C3E96]
    transition
  '>
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
