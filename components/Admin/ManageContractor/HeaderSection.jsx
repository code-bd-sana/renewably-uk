"use client";

import { Search, Menu, X } from "lucide-react";

export default function HeaderSection({
  searchTerm,
  setSearchTerm,
  isMobileMenuOpen,
  setIsMobileMenuOpen,
}) {
  return (
    <>
      {/* Mobile Header */}
      <div className='md:hidden mb-4'>
        <div className='flex items-center justify-between mb-4'>
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className='p-2'>
            {isMobileMenuOpen ? (
              <X className='w-6 h-6' />
            ) : (
              <Menu className='w-6 h-6' />
            )}
          </button>
          <h1 className='text-xl font-semibold text-gray-900'>Contractors</h1>
          <div className='w-10'></div>
        </div>

        {/* Mobile Search */}
        <div className='relative mb-4'>
          <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5' />
          <input
            type='text'
            placeholder='Search contractors...'
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className='pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full text-base'
          />
        </div>
      </div>

      {/* Desktop Header */}
      <div className='hidden md:flex justify-between items-center mb-8'>
        <div>
          <h1 className='text-2xl font-semibold text-gray-900'>Contractors</h1>
        </div>

        <div className='relative w-96'>
          <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5' />
          <input
            type='text'
            placeholder='Search by name, company, or email...'
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className='pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full text-sm'
          />
        </div>
      </div>
    </>
  );
}
