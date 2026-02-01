"use client";

import Link from "next/link";
import { Download as DownloadIcon, Eye } from "lucide-react";

export default function TopContractorsTable({
  topContractors,
  downloadContractorCertificates,
}) {
  return (
    <div className='bg-white rounded-lg shadow-sm p-4 md:p-6 border border-gray-100'>
      <div className='flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 md:mb-6 gap-2'>
        <h3 className='text-base md:text-lg font-semibold text-gray-900'>
          Top Contractors
        </h3>
        <Link
          href='/admin/manage-contractors'
          className='text-sm text-blue-600 hover:text-blue-800 hover:underline self-end sm:self-auto'>
          View All →
        </Link>
      </div>
      <div className='overflow-x-auto'>
        {/* Mobile Card View */}
        <div className='md:hidden space-y-3'>
          {topContractors.slice(0, 5).map((contractor, index) => (
            <div key={contractor.userId} className='bg-gray-50 rounded-lg p-3'>
              <div className='flex justify-between items-start mb-2'>
                <div className='flex items-center gap-3'>
                  <span className='text-sm font-medium text-gray-500'>
                    #{index + 1}
                  </span>
                  <div>
                    <h4 className='font-medium text-gray-900'>
                      {contractor.name}
                    </h4>
                    <p className='text-xs text-gray-600'>
                      {contractor.companyName}
                    </p>
                  </div>
                </div>
                <span className='text-sm font-medium text-gray-900'>
                  {contractor.certificates} certs
                </span>
              </div>
              <div className='flex justify-end gap-2'>
                <Link
                  href={`/admin/manage-contractors/${contractor.userId}`}
                  className='p-1.5 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded'
                  title='View'>
                  <Eye className='w-4 h-4' />
                </Link>
                <button
                  onClick={() =>
                    downloadContractorCertificates(
                      contractor.userId,
                      contractor.name,
                    )
                  }
                  className='p-1.5 text-gray-600 hover:text-gray-700 hover:bg-gray-100 rounded'
                  title='Download All Certificates'>
                  <DownloadIcon className='w-4 h-4' />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop Table View */}
        <table className='hidden md:table w-full'>
          <thead className='border-b border-gray-200'>
            <tr>
              <th className='text-left text-xs font-medium text-gray-600 pb-3'>
                #
              </th>
              <th className='text-left text-xs font-medium text-gray-600 pb-3'>
                Contractor Name
              </th>
              <th className='text-left text-xs font-medium text-gray-600 pb-3'>
                Company Name
              </th>
              <th className='text-left text-xs font-medium text-gray-600 pb-3'>
                Total Certificate
              </th>
              <th className='text-left text-xs font-medium text-gray-600 pb-3'>
                Action
              </th>
            </tr>
          </thead>
          <tbody className='divide-y divide-gray-100'>
            {topContractors.map((contractor, index) => (
              <tr key={contractor.userId} className='hover:bg-gray-50'>
                <td className='py-4 text-sm text-gray-500 font-medium'>
                  {index + 1}
                </td>
                <td className='py-4 text-sm text-gray-900'>
                  {contractor.name}
                </td>
                <td className='py-4 text-sm text-gray-900'>
                  {contractor.companyName}
                </td>
                <td className='py-4 text-sm text-gray-900 font-medium'>
                  {contractor.certificates}
                </td>
                <td className='py-4'>
                  <div className='flex items-center gap-3'>
                    <Link
                      href={`/admin/manage-contractors/${contractor.userId}`}
                      className='text-blue-600 hover:text-blue-700 p-1'
                      title='View Contractor'>
                      <Eye className='w-4 h-4' />
                    </Link>
                    <button
                      onClick={() =>
                        downloadContractorCertificates(
                          contractor.userId,
                          contractor.name,
                        )
                      }
                      className='p-1.5 text-gray-600 hover:text-gray-700 hover:bg-gray-100 rounded'
                      title='Download All Certificates'>
                      <DownloadIcon className='w-4 h-4' />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
