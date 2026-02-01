"use client";

import { Menu } from "lucide-react";
import Image from "next/image";

export default function HeaderSection({ isMenuOpen, setIsMenuOpen }) {
  return (
    <>
      {/* Mobile Header */}
      <div className='md:hidden bg-[#0F47A8] text-white p-4 sticky top-0 z-10'>
        <div className='flex items-center justify-between'>
          <h1 className='text-xl font-semibold'>Admin Dashboard</h1>
          <button onClick={() => setIsMenuOpen(!isMenuOpen)} className='p-2'>
            <Menu size={24} />
          </button>
        </div>
        {isMenuOpen && (
          <div className='mt-4 bg-blue-700 rounded-lg p-3'>
            <p className='text-sm opacity-90'>Welcome Back, Admin 👋</p>
          </div>
        )}
      </div>

      {/* Desktop Header */}
      <div className='hidden md:block bg-[#0F47A8] text-white p-6 md:p-8 rounded-lg mb-4 md:mb-6 mx-4 md:mx-0'>
        <div className='flex items-center gap-x-4'>
          {/* LOGO */}
          <div>
            <Image
              src='/foot-logo.png'
              alt='Renewably UK'
              width={90}
              height={90}
              priority
              className=' object-contain'
            />
          </div>
          <div>
            <h1 className='text-2xl md:text-3xl font-semibold flex items-center gap-2'>
              Welcome Back, Admin 👋
            </h1>
          </div>
        </div>
      </div>
    </>
  );
}
