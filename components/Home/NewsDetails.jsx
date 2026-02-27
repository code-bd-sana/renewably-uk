"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { newsBlogs } from "@/data/newsBlogs";
import {
  ArrowLeft,
  Share2,
  Facebook,
  Twitter,
  Linkedin,
  Link2,
  Check,
  Mail,
} from "lucide-react";

export default function NewsDetails({ id }) {
  const contentRef = useRef(null);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [copied, setCopied] = useState(false);
  const shareMenuRef = useRef(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      contentRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 50);

    return () => clearTimeout(timer);
  }, [id]);

  // Close share menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        shareMenuRef.current &&
        !shareMenuRef.current.contains(event.target)
      ) {
        setShowShareMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Find by subId (string)
  const newsOrBlog = newsBlogs.find((item) => item.subId === id);

  if (!newsOrBlog) {
    return (
      <div className='mx-24 py-24 px-4 text-[#475569]'>News not found.</div>
    );
  }

  const shareUrl = typeof window !== "undefined" ? window.location.href : "";
  const shareTitle = newsOrBlog.title;
  const shareText = `Check out this article: ${shareTitle}`;

  const shareLinks = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
    twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareTitle)}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
    mail: `mailto:?subject=${encodeURIComponent(shareTitle)}&body=${encodeURIComponent(shareText + "\n\n" + shareUrl)}`,
  };

  const handleShare = (platform) => {
    if (platform === "copy") {
      navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } else {
      window.open(shareLinks[platform], "_blank", "noopener,noreferrer");
    }
    setShowShareMenu(false);
  };

  // For native share if available (mobile)
  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: shareUrl,
        });
      } catch (error) {
        console.log("Error sharing:", error);
      }
    } else {
      setShowShareMenu(!showShareMenu);
    }
  };

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
          {/* Title and Share Button */}
          <div className='flex justify-between items-start gap-4'>
            <h1 className='text-[32px] font-bold text-[#0F172A] leading-snug flex-1'>
              {newsOrBlog.title}
            </h1>

            {/* Share Button with Menu */}
            <div className='relative' ref={shareMenuRef}>
              <button
                onClick={handleNativeShare}
                className='flex items-center gap-2 px-4 py-2 bg-[#F1F5F9] hover:bg-[#E2E8F0] rounded-lg transition-colors text-[#475569] hover:text-[#0F172A] mt-1'>
                <Share2 size={18} />
                <span className='text-sm font-medium cursor-pointer'>
                  Share
                </span>
              </button>

              {/* Share Menu Dropdown */}
              {showShareMenu && (
                <div className='absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-[#E2E8F0] overflow-hidden z-50'>
                  <div className='p-2'>
                    <button
                      onClick={() => handleShare("facebook")}
                      className='flex items-center gap-3 w-full px-3 py-2.5 hover:bg-[#F8FAFC] rounded-lg transition-colors text-left'>
                      <Facebook size={18} className='text-[#1877F2]' />
                      <span className='text-sm text-[#0F172A]'>Facebook</span>
                    </button>

                    <button
                      onClick={() => handleShare("twitter")}
                      className='flex items-center gap-3 w-full px-3 py-2.5 hover:bg-[#F8FAFC] rounded-lg transition-colors text-left'>
                      <Twitter size={18} className='text-[#1DA1F2]' />
                      <span className='text-sm text-[#0F172A]'>Twitter</span>
                    </button>

                    <button
                      onClick={() => handleShare("linkedin")}
                      className='flex items-center gap-3 w-full px-3 py-2.5 hover:bg-[#F8FAFC] rounded-lg transition-colors text-left'>
                      <Linkedin size={18} className='text-[#0A66C2]' />
                      <span className='text-sm text-[#0F172A]'>LinkedIn</span>
                    </button>

                    <button
                      onClick={() => handleShare("mail")}
                      className='flex items-center gap-3 w-full px-3 py-2.5 hover:bg-[#F8FAFC] rounded-lg transition-colors text-left'>
                      <Mail size={18} className='text-[#64748B]' />
                      <span className='text-sm text-[#0F172A]'>Email</span>
                    </button>

                    <div className='h-px bg-[#E2E8F0] my-1'></div>

                    <button
                      onClick={() => handleShare("copy")}
                      className='flex items-center gap-3 w-full px-3 py-2.5 hover:bg-[#F8FAFC] rounded-lg transition-colors text-left'>
                      {copied ? (
                        <>
                          <Check size={18} className='text-green-600' />
                          <span className='text-sm text-green-600'>
                            Copied!
                          </span>
                        </>
                      ) : (
                        <>
                          <Link2 size={18} className='text-[#64748B]' />
                          <span className='text-sm text-[#0F172A]'>
                            Copy link
                          </span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Hero Image */}
          <div
            className={`relative w-full md:w-375 mx-auto mt-4 mb-6 md:m-7 rounded-2xl overflow-hidden ${
              newsOrBlog.imageFit === "contain"
                ? "h-64 sm:h-96 md:h-140"
                : "h-56 sm:h-96 md:h-220"
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
          <div ref={contentRef} className='pt-5 pb-8 flex flex-col gap-5'>
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
