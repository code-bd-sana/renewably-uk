import Image from "next/image";
import Link from "next/link";
import { newsBlogs } from "@/data/newsBlogs";
import { ArrowLeft } from "lucide-react";

export default function NewsDetails({ id }) {
  const selectedId = Number(id);
  const newsOrBlog = newsBlogs.find((item) => item.id === selectedId);

  if (!newsOrBlog) {
    return (
      <div className='mx-24 py-24 px-4 text-[#475569]'>News not found.</div>
    );
  }

  return (
    <section className='w-full py-32'>
      <div className='md:mx-25 px-6'>
        {/* Breadcrumb Navigation */}
        <nav className='flex items-center gap-2 text-sm text-[#64748B] mb-6 rounded-lg py-2.5 w-full'>
          <Link href='/' className='hover:text-[#2563EB] transition-colors'>
            Home
          </Link>
          <span className='text-[#94A3B8]'>›</span>
          <Link href='/news' className='hover:text-[#2563EB] transition-colors'>
            News
          </Link>
          <span className='text-[#94A3B8]'>›</span>
          <span className='text-[#0F172A] font-medium '>
            {newsOrBlog.title}
          </span>
        </nav>

        {/* Main Card */}
        <div className='bg-white rounded-2xl overflow-hidden mt-3'>
          {/* Title */}
          <div className=''>
            <h1 className='text-[32px] font-bold text-[#0F172A] leading-snug'>
              {newsOrBlog.title}
            </h1>
          </div>

          {/* Hero Image */}
          <div
            className={`relative w-full md:w-375 mx-auto mt-4 mb-6 md:m-7 rounded-2xl overflow-hidden ${
              newsOrBlog.imageFit === "contain"
                ? "h-64 sm:h-96 md:h-120"
                : "h-56 sm:h-96 md:h-200"
            }`}>
            <Image
              src={newsOrBlog.image}
              alt={newsOrBlog.title}
              fill
              className={
                newsOrBlog.imageClass ||
                (newsOrBlog.imageFit === "contain"
                  ? "object-contain"
                  : "object-cover object-center md:object-[center_20%]")
              }
              priority
            />
          </div>

          {/* Meta + Body */}
          <div className='pt-5 pb-8 flex flex-col gap-5'>
            {/* Category + Date row */}
            <div className='flex items-center gap-3'>
              <span className='text-[11px] font-medium bg-[#EAF2FF] text-[#2563EB] px-3 py-1 rounded-full'>
                {newsOrBlog.category}
              </span>
              <span className='text-[12px] text-[#6B7280]'>
                {newsOrBlog.date}
              </span>
            </div>

            {/* Content */}
            <div className='space-y-4'>
              {newsOrBlog.sections && newsOrBlog.sections.length > 0 ? (
                newsOrBlog.sections.map((section) => (
                  <div key={section.heading}>
                    {section.heading && (
                      <h4 className='text-[15px] font-semibold text-[#0F172A] mb-2'>
                        {section.heading}
                      </h4>
                    )}
                    {section.paragraphs?.map((p) => (
                      <p
                        key={p}
                        className='text-[13.5px] leading-[1.75] text-[#475569] mb-2'>
                        {p}
                      </p>
                    ))}
                    {section.bullets?.length > 0 && (
                      <ul className='list-disc pl-5 space-y-2 text-[13.5px] leading-[1.75] text-[#475569]'>
                        {section.bullets.map((b) => (
                          <li key={b}>{b}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))
              ) : (
                <>
                  {[1, 2, 3, 4].map((_, i) => (
                    <p
                      key={i}
                      className='text-[13.5px] leading-[1.75] text-[#475569]'>
                      {newsOrBlog.excerpt}
                    </p>
                  ))}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
