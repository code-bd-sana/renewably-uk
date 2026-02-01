"use client";

import { useRouter } from "next/navigation";

export default function BarChartSection({ monthlyStats, router }) {
  const maxValue =
    monthlyStats.length > 0
      ? Math.max(...monthlyStats.map((item) => item.value))
      : 200;

  // Improved scaling & nice Y-axis labels
  const niceMax = Math.ceil(maxValue / 1000) * 1000 || 1000; // round up to next 1000, min 1000
  const step = niceMax <= 5000 ? 1000 : niceMax <= 20000 ? 5000 : 10000;
  const yAxisLabels = [];
  for (let i = niceMax; i >= 0; i -= step) {
    yAxisLabels.push(i);
  }
  if (yAxisLabels[yAxisLabels.length - 1] !== 0) yAxisLabels.push(0);

  const handleMonthClick = (monthNumber) => {
    router.push(`/admin/certificates/month/${monthNumber}`);
  };

  return (
    <div className='bg-white rounded-lg shadow-sm p-4 md:p-6 border border-gray-100'>
      <div className='flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 md:mb-6 gap-2'>
        <h3 className='text-base md:text-lg font-semibold text-gray-900'>
          Insurance Policies
        </h3>
        <span className='text-xs md:text-sm text-gray-500'>
          {new Date().getFullYear()}
        </span>
      </div>

      <div className='relative h-64 md:h-80'>
        {/* Y-axis labels - nicer stepped scale */}
        <div className='absolute left-0 top-0 bottom-0 w-12 flex flex-col justify-between text-xs text-gray-500 pr-2'>
          {yAxisLabels.map((label, i) => (
            <div key={i} className='text-right'>
              {label.toLocaleString()}
            </div>
          ))}
        </div>

        {/* Chart area */}
        <div className='ml-16 h-full border-l border-b border-gray-200 pl-4 pb-8'>
          <div className='grid grid-cols-12 md:flex md:flex-row items-end justify-between gap-1 md:gap-3 h-full'>
            {monthlyStats.map((data, index) => {
              const barHeight =
                maxValue > 0 ? (data.value / maxValue) * 100 : 0;
              return (
                <div key={index} className='flex flex-col items-center flex-1'>
                  <button
                    onClick={() => handleMonthClick(data.monthNumber)}
                    className='w-full bg-[#0F47A8] rounded-t transition-all hover:bg-blue-700 group relative cursor-pointer'
                    style={{
                      height: `${barHeight}%`,
                      minHeight: data.value > 0 ? "10px" : "0px",
                    }}
                    title={`${data.month}: ${data.value} policies`}>
                    <div className='absolute bottom-full mb-1 hidden group-hover:block bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap z-50'>
                      {data.value} policies
                    </div>
                  </button>
                  <span className='text-[10px] md:text-xs text-gray-600 mt-2 truncate w-full text-center'>
                    {data.month.slice(0, 3)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
