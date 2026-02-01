"use client";

import { Calendar, FileText, PoundSterling, Users } from "lucide-react";

export default function StatsCards({ stats, pendingRequests }) {
  const statItems = [
    {
      title: "This Month Policies",
      value: stats.thisMonthCertificates || stats.thisMonthPolicies || 0,
      icon: Calendar,
      color: "#0F47A8",
    },
    {
      title: "This Month Premium Total",
      value: `£${(stats.thisMonthRevenue || 0).toLocaleString("en-GB", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`,
      icon: PoundSterling,
      color: "#0F47A8",
    },
    {
      title: "Total Policies",
      value: stats.totalCertificates || stats.totalPolicies || 0,
      icon: FileText,
      color: "#0F47A8",
    },
    {
      title: "Premium Total",
      value: `£${(stats.totalRevenue || stats.premiumTotal || 0).toLocaleString(
        "en-GB",
        {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        },
      )}`,
      icon: PoundSterling,
      color: "#0F47A8",
    },
    {
      title: "Total Contractors",
      value: stats.totalContractors || 0,
      icon: Users,
      color: "#0F47A8",
    },
    {
      title: "Edit Request Pending",
      value: pendingRequests.length,
      icon: FileText,
      color: "#0F47A8",
    },
  ];

  return (
    <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4 lg:gap-6 mb-6 px-4 md:px-0'>
      {statItems.map((stat, index) => (
        <div
          key={index}
          className='bg-white rounded-lg shadow-sm p-4 md:p-5 lg:p-6 border border-gray-100'>
          <div className='flex items-center justify-between mb-2 md:mb-3'>
            <div className='text-xs md:text-sm text-gray-600 truncate'>
              {stat.title}
            </div>
            <div className='bg-[#EAF1FD] p-1.5 md:p-2 rounded'>
              <stat.icon className='w-4 h-4 md:w-5 md:h-5 text-[#0F47A8]' />
            </div>
          </div>
          <div className='text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 truncate'>
            {stat.value}
          </div>
        </div>
      ))}
    </div>
  );
}
