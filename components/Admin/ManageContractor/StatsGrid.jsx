"use client";

export default function StatsGrid({ contractors }) {
  const thisMonthCount = contractors.filter((c) => {
    const created = new Date(c.createdAt);
    const now = new Date();
    return (
      created.getMonth() === now.getMonth() &&
      created.getFullYear() === now.getFullYear()
    );
  }).length;

  const activeCount = contractors.filter((c) => c.isApproved).length;
  const inactiveCount = contractors.filter((c) => !c.isApproved).length;

  return (
    <>
      {/* Mobile Stats Grid */}
      <div className='md:hidden grid grid-cols-2 gap-3 mb-6'>
        <div className='bg-white border border-gray-200 rounded-lg p-3'>
          <p className='text-xs text-gray-600'>Total</p>
          <p className='text-xl font-bold text-gray-900'>
            {contractors.length}
          </p>
        </div>
        <div className='bg-white border border-gray-200 rounded-lg p-3'>
          <p className='text-xs text-gray-600'>This Month</p>
          <p className='text-xl font-bold text-blue-600'>{thisMonthCount}</p>
        </div>
        <div className='bg-white border border-gray-200 rounded-lg p-3'>
          <p className='text-xs text-gray-600'>Active</p>
          <p className='text-xl font-bold text-green-600'>{activeCount}</p>
        </div>
        <div className='bg-white border border-gray-200 rounded-lg p-3'>
          <p className='text-xs text-gray-600'>Inactive</p>
          <p className='text-xl font-bold text-red-600'>{inactiveCount}</p>
        </div>
      </div>

      {/* Desktop Stats Grid */}
      <div className='hidden md:grid grid-cols-4 gap-4 mb-6'>
        <div className='bg-white border border-gray-200 rounded-lg p-4'>
          <p className='text-sm text-gray-600'>Total Contractors</p>
          <p className='text-2xl font-bold text-gray-900'>
            {contractors.length}
          </p>
        </div>
        <div className='bg-white border border-gray-200 rounded-lg p-4'>
          <p className='text-sm text-gray-600'>This Month</p>
          <p className='text-2xl font-bold text-blue-600'>{thisMonthCount}</p>
        </div>
        <div className='bg-white border border-gray-200 rounded-lg p-4'>
          <p className='text-sm text-gray-600'>Active</p>
          <p className='text-2xl font-bold text-green-600'>{activeCount}</p>
        </div>
        <div className='bg-white border border-gray-200 rounded-lg p-4'>
          <p className='text-sm text-gray-600'>Inactive</p>
          <p className='text-2xl font-bold text-red-600'>{inactiveCount}</p>
        </div>
      </div>
    </>
  );
}
