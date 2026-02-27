"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import { newsBlogs } from "@/data/newsBlogs";

export default function InsightsSection() {
  const router = useRouter();

  const getFirstDetailsPreview = (item) => {
    if (!item?.sections?.length) return "";
    const firstSection = item.sections[0];
    const heading = firstSection?.heading || "";
    const firstParagraph = firstSection?.paragraphs?.[0] || "";
    return [heading, firstParagraph].filter(Boolean).join(" ");
  };

  const ensureEllipsis = (text, isFirstItem, title, detailsPreview) => {
    if (!text) return "";
    if (isFirstItem && title && title.length <= 35) {
      const sourceText = detailsPreview || text;
      return sourceText.length > 280
        ? sourceText.slice(0, 280) + "..."
        : sourceText;
    }
    return text.length > 180 ? text.slice(0, 180) + "..." : text;
  };

  const handleReadMore = (article) => {
    router.push(`/news/${article.subId}`);
  };

  return (
    <section className='w-full bg-[#F8FAFC] py-24'>
      <div className='max-w-400 mx-auto px-4'>
        {/* ===== GRID ===== */}
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'>
          {newsBlogs.map((item, idx) => (
            <div
              key={item.subId}
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
                    item.imageClass ||
                    (item.imageFit === "contain"
                      ? "object-contain"
                      : "object-cover")
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

                <p className='text-[13px] leading-[1.7] text-[#6B7280] mb-3 flex-1'>
                  {ensureEllipsis(
                    item.excerpt,
                    idx === 0,
                    item.title,
                    getFirstDetailsPreview(item),
                  )}
                </p>
                <div className='mt-auto'>
                  <button
                    onClick={() => handleReadMore(item)}
                    className='inline-flex items-center justify-center h-10 px-5 bg-[#0F47A8] text-white text-[12px] font-medium rounded-lg hover:bg-[#0C3E96] transition'>
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
