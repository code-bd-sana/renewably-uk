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
  {
    id: 2,
    title:
      "From ECO4 to the Warm Homes Plan: What the Transition Means for Installation Companies — and Why the Opportunity Runs to 2050",
    category: "Policy & Funding",
    date: "February 25, 2026",
    excerpt:
      "ECO4 now runs to 31 December 2026 while £1.5 billion of Treasury bridge funding supports the shift into the Warm Homes Plan, signalling long-term retrofit opportunity through to net zero 2050.",
    image: "/News/blog2.png",
    sections: [
      {
        heading: "The Transition Point for the UK Retrofit Market",
        paragraphs: [
          "The UK retrofit market is entering a significant period of structural change.",
          "The UK Government has confirmed that the Energy Company Obligation Phase 4 (ECO4) will now run until 31 December 2026. Alongside this, Energy Secretary Ed Miliband has announced an additional £1.5 billion of Treasury funding to support the move into the new Warm Homes Plan, bringing total planned investment in domestic energy upgrades close to £15 billion.",
          "For installation companies working across insulation, heating, heat pumps and solar, this is more than a policy update. It represents a change in how projects will be funded, how work will be accessed and how delivery will be governed.",
          "But it does not represent the end of opportunity.",
        ],
      },
      {
        heading: "ECO4: Stability in the Short Term",
        paragraphs: [
          "The extension of ECO4 provides regulatory clarity through to the end of 2026. Installers already operating within the scheme can continue to deliver pipeline projects, finalise compliance requirements and complete installations under the existing framework.",
          "It is important, however, to understand the nature of this extension. ECO4 has not been expanded. There are no new supplier targets and no additional levy funding.",
          "The scheme continues to operate under its original funding model, with costs recovered via energy suppliers and oversight maintained by the Department for Energy Security and Net Zero and regulation administered by Ofgem. There will be no ECO5.",
          "The extension is a structured wind-down designed to prevent a sudden cliff edge, not a growth phase. For installers, this means short-term continuity — but the need for forward planning.",
        ],
      },
      {
        heading: "The £1.5 Billion Transition Funding",
        paragraphs: [
          "The additional £1.5 billion announced in Parliament sits outside the ECO4 levy. It does not increase the ECO4 budget and it is not paid to suppliers to extend their obligations.",
          "Instead, it forms part of the Warm Homes Plan and represents new Treasury-funded investment. Its purpose is to support low-income households and maintain sector stability during the transition from a supplier-obligation model to a publicly funded investment model.",
          "Future domestic retrofit funding will transition into the broader Warm Homes Plan. To support this transition, £1.5 billion has been allocated to bridge the gap between ECO4 and the implementation of the Warm Homes Plan.",
          "Announcing the funding commitment, Ed Miliband stated: “This £1.5 billion investment will help families stay warm, cut energy bills and accelerate Britain’s transition to clean energy as part of our mission to deliver Net Zero.”",
          "In practical terms, this funding will run in parallel to the final phase of ECO4. While the levy-funded obligation completes, new public investment begins to scale.",
          "For installation companies, this signals something important: funding is not being withdrawn from the market — it is being restructured.",
          "The route to accessing work is changing.",
        ],
        bullets: [
          "Maintain continuity of support for households, ensuring insulation, heating upgrades and low-carbon installations remain accessible during the transition period",
          "Stabilise and support existing renewable and retrofit installation companies, protecting skilled jobs, delivery capacity and supply chains built under ECO and related programmes",
        ],
      },
      {
        heading: "A Shift from Obligation to Procurement",
        paragraphs: [
          "Under ECO, work was shaped by supplier targets and compliance scoring. Delivery pipelines were largely influenced by utilities and managing agents operating within a regulatory framework.",
          "Under the Warm Homes Plan, delivery is expected to move more decisively into public procurement structures. Local authorities, social housing providers and central government programmes will play a greater role in allocating funding and appointing delivery partners.",
          "Rather than relying solely on obligation-driven pipelines, installation companies will increasingly need to engage with framework agreements, competitive tendering processes and partnership models with councils and housing associations.",
          "The funding remains. The access route evolves.",
        ],
      },
      {
        heading: "Compliance Remains Central",
        paragraphs: [
          "If anything, governance expectations are likely to strengthen.",
          "Publicly funded programmes typically require rigorous audit trails, transparent reporting and strong consumer protection mechanisms. PAS2030 and PAS2035 alignment will remain fundamental, but governance maturity will become equally important.",
          "Under ECO, compliance was tied to scoring and regulatory enforcement. Under Warm Homes, compliance becomes embedded within contract management and grant governance.",
          "The standard of delivery must remain high — regardless of funding structure.",
        ],
      },
      {
        heading: "Cashflow and Commercial Adaptation",
        paragraphs: [
          "Another practical shift for installers will be how revenue flows through the system.",
          "ECO funding operated through supplier scoring and structured payments. Public sector funding may operate differently, often involving milestone payments, staged grant claims and formal invoicing procedures.",
          "Installation companies that prepare for these differences early — strengthening financial planning and contract management processes — will reduce risk as procurement-led delivery expands.",
          "The transition is not just policy-based. It is operational.",
        ],
      },
      {
        heading: "Utilities and the Changing Market",
        paragraphs: [
          "Energy suppliers will now move through a managed wind-down of ECO4. Their focus will shift from meeting obligation targets to closing compliance files and completing installations responsibly.",
          "However, their delivery infrastructure does not disappear. Utilities retain installer networks, operational scale and compliance experience. Under the Warm Homes framework, they may continue to participate as competitive delivery partners rather than obligated funders.",
          "For installation companies, this means existing relationships may remain relevant — but within a different commercial structure.",
          "The model changes. The capability remains.",
        ],
      },
      {
        heading: "The Bigger Driver: Net Zero to 2050",
        paragraphs: [
          "While funding mechanisms evolve, the long-term policy direction is fixed.",
          "The UK is legally committed to achieving net zero greenhouse gas emissions by 2050 under the Climate Change Act 2008. Decarbonising homes is central to that commitment.",
          "Whether programmes operate under ECO, Warm Homes or future iterations, the need for domestic retrofit remains embedded in national policy.",
          "For installation companies, this is the structural opportunity. The sector is not cyclical. It is transitional infrastructure for the next 25 years.",
        ],
        bullets: [
          "Fabric efficiency upgrades",
          "Electrification of heating",
          "Heat pump deployment",
          "Solar generation and storage",
          "Reduction in fossil fuel dependency",
        ],
      },
      {
        heading: "Adaptation Is the Key to Longevity",
        paragraphs: [
          "The transition from ECO to Warm Homes highlights a broader lesson: funding mechanisms evolve, but delivery capability endures.",
          "The installation companies that will thrive to 2050 are not those reliant on a single scheme. They are the businesses that adapt as funding structures change.",
          "The opportunity remains long term. The architecture will continue to evolve. Adaptability is what ensures stability.",
        ],
        bullets: [
          "Strong compliance systems",
          "Governance maturity",
          "Procurement readiness",
          "Skilled workforce investment",
          "Financial resilience",
        ],
      },
      {
        heading: "Renewably UK’s Perspective",
        paragraphs: [
          "At Renewably UK, we see this transition as a maturation of the market.",
          "Domestic retrofit is now firmly positioned as national infrastructure. That requires clarity, compliance excellence and professional delivery partnerships.",
          "The funding model may shift from levy to Treasury. The standards must not.",
          "For installation companies, the message is clear: prepare for the procurement era, invest in governance capability and position for the long-term decarbonisation journey.",
          "2026 is not simply the end of ECO4. It is the beginning of the next phase of structured, nationally funded renewable delivery — on the road to net zero 2050.",
        ],
      },
    ],
  },
  {
    id: 3,
    title:
      "Data Protection, ICO Registration & Data Sovereignty in the Renewable Energy Sector",
    category: "Data Protection & Compliance",
    date: "February 25, 2026",
    excerpt:
      "Installation companies handling household and eligibility data are data controllers under UK GDPR, with clear obligations around ICO registration, safeguards, and evidence-based compliance.",
    image: "/News/blog3.png",
    sections: [
      {
        heading:
          "Why Installation Companies Must Understand Their Legal Responsibilities",
        paragraphs: [
          "The renewable energy and retrofit sector processes significant volumes of personal data every day. Installation companies routinely collect and manage household names, addresses, contact details, income-related eligibility information, vulnerability indicators, EPC data, photographic records and funding documentation.",
          "Yet many organisations underestimate a fundamental legal reality: if you determine how and why customer data is collected and used, you are operating as a data controller under UK GDPR. That status carries defined responsibilities — including registration with the Information Commissioner's Office (ICO), implementation of appropriate safeguards and the ability to evidence compliance if challenged.",
          "This is not administrative formality. It is a regulatory requirement.",
        ],
      },
      {
        heading: "ICO Registration and Accountability",
        paragraphs: [
          "Most installation companies delivering energy efficiency measures are required to register with the ICO and pay the applicable data protection fee. Registration reflects acknowledgement that the organisation processes personal data and accepts responsibility for doing so lawfully.",
          "Being a subcontractor or working under a funding partner does not remove independent obligations. If your company determines what personal information is collected, how it is processed and who it is shared with, you remain accountable.",
          "That accountability extends beyond basic registration. It requires secure storage, appropriate governance procedures, transparent privacy notices and ongoing oversight.",
        ],
      },
      {
        heading: "The Often-Overlooked Risk: International Data Transfers",
        paragraphs: [
          "A growing compliance risk within the installation community concerns where customer data is physically stored.",
          "Many businesses rely on familiar cloud-based tools to manage project documentation. These tools can be configured compliantly, but depending on how they are set up, they may involve international data transfers.",
          "Under UK GDPR, personal data must not be transferred outside the United Kingdom unless lawful safeguards are in place. Those safeguards must be understood, documented and defensible.",
          "The issue is not the use of cloud software itself. The issue is whether the organisation understands where its data is hosted, whether it is replicated internationally, what legal mechanisms support any transfer and whether this has been disclosed transparently to customers.",
          "If these questions cannot be confidently answered, the organisation is exposed to regulatory risk. Responsibility for compliance always sits with the data controller — not the technology provider.",
        ],
      },
      {
        heading: "Real Enforcement: The Green Spark Energy Case",
        paragraphs: [
          "In 2023, the ICO issued a Monetary Penalty Notice against Green Spark Energy Ltd following findings that the company failed to implement appropriate technical and organisational measures to protect personal data.",
          "The regulator concluded that sensitive personal information had been placed at risk due to inadequate security controls. As a result, a financial penalty of £250,000 was imposed for breaches of UK GDPR and the Data Protection Act 2018.",
          "This case serves as a clear reminder that data protection failings can carry significant financial and reputational consequences. Importantly, enforcement often arises not from deliberate misconduct, but from insufficient governance, weak oversight and failure to implement proportionate safeguards.",
          "Under UK GDPR, however, misunderstanding the law does not reduce liability.",
        ],
      },
      {
        heading: "Why Data Sovereignty Is a Commercial Advantage",
        paragraphs: [
          "For installation companies operating in compliance-led environments such as ECO delivery, data sovereignty is no longer just a technical consideration. It is a risk management decision.",
          "Keeping customer data within UK data centres reduces complexity around international transfer safeguards and strengthens audit readiness. It provides clarity around jurisdiction and simplifies the ability to evidence compliance during funding reviews or regulatory scrutiny.",
          "In an increasingly regulated environment, organisations that can clearly demonstrate structured data governance are at a commercial advantage. They are more resilient during audits, more attractive to funding partners and better positioned to maintain consumer trust.",
        ],
      },
      {
        heading: "A Structured, Compliance-Led Solution",
        paragraphs: [
          "The Renewably UK platform has been developed with data protection and UK data sovereignty embedded into its infrastructure.",
          "Customer data processed through the platform is hosted within UK data centres under secure architecture, with defined access controls, encryption standards and structured governance processes. By centralising project documentation, Insurance Backed Guarantee records and compliance data within a UK-hosted system, installation companies reduce unnecessary exposure to international transfer risk and fragmented data storage practices.",
          "More importantly, they gain something critical: evidentiary confidence.",
          "When compliance processes are built into the platform itself, data governance becomes structured rather than improvised. Audit preparation becomes straightforward rather than reactive. Risk becomes managed rather than assumed.",
          "In a sector where regulatory scrutiny continues to increase, choosing a compliance-led platform is not simply about operational efficiency. It is about protecting the business.",
        ],
      },
      {
        heading: "Raising the Standard",
        paragraphs: [
          "The renewable energy sector is evolving. Technical competence alone is no longer sufficient. Governance, consumer protection and responsible data handling now form part of the professional benchmark.",
          "The enforcement action against Green Spark Energy demonstrates that data protection failures carry real consequences. Installation companies that proactively register with the ICO, understand their role as data controllers and adopt structured, UK-hosted systems demonstrate maturity and accountability.",
          "Data protection is not an administrative afterthought. It is a defining characteristic of a professionally run installation business. And increasingly, it is a commercial differentiator.",
        ],
      },
    ],
  },
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
          <div
            className={`relative ${
              featured.imageFit === "contain" ? "h-72" : "h-125"
            }`}>
            <Image
              src={featured.image}
              alt={featured.title}
              fill
              className='object-cover'
              style={{ objectPosition: "center 12%" }}
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
                <div
                  className={`relative ${
                    item.imageFit === "contain" ? "h-48" : "h-72"
                  }`}>
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    className={
                      item.imageFit === "contain"
                        ? "object-cover"
                        : "object-cover"
                    }
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

                  <div className='mt-auto'>
                    <p className='text-[13px] leading-[1.6] text-[#6B7280] mb-3 flex-1'>
                      {ensureEllipsis(item.excerpt)}
                    </p>
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
