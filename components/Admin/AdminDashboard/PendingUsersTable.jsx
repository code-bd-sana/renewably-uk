"use client";

import { CheckCircle, Eye, XCircle } from "lucide-react";

export default function PendingUsersTable({
  pendingUsers,
  handleViewRequest,
  handleApproveUser,
  handleRejectUser,
}) {
  return (
    <div className='bg-white rounded-lg shadow-sm border border-gray-100'>
      <div className='px-4 md:px-6 py-3 md:py-4 border-b border-gray-200'>
        <h2 className='text-lg md:text-xl font-semibold text-gray-900'>
          New Contractor Request ({pendingUsers.length})
        </h2>
      </div>

      {pendingUsers.length === 0 ? (
        <div className='p-8 md:p-12 text-center text-gray-500'>
          No pending approvals
        </div>
      ) : (
        <div className='overflow-x-auto'>
          {/* Mobile Card View */}
          <div className='md:hidden divide-y divide-gray-200'>
            {pendingUsers.map((user) => (
              <div key={user.id || user._id} className='p-4'>
                <div className='flex justify-between items-start mb-2'>
                  <div>
                    <h3 className='font-medium text-gray-900'>
                      {user.companyName}
                    </h3>
                    <p className='text-sm text-gray-600'>{user.name}</p>
                    <p className='text-xs text-gray-500'>{user.email}</p>
                  </div>
                  <span className='text-xs text-gray-500'>
                    {new Date(user.createdAt).toLocaleDateString("en-GB")}
                  </span>
                </div>
                <div className='flex justify-end gap-2 mt-3'>
                  <button
                    onClick={() => handleViewRequest(user.id)}
                    className='p-2 text-gray-600 hover:bg-gray-100 rounded'
                    title='View'>
                    <Eye size={16} />
                  </button>
                  <button
                    onClick={() => handleApproveUser(user.id, user.name)}
                    className='p-2 text-green-600 hover:bg-green-50 rounded'
                    title='Approve'>
                    <CheckCircle size={16} />
                  </button>
                  <button
                    onClick={() => handleRejectUser(user.id, user.name)}
                    className='p-2 text-red-600 hover:bg-red-50 rounded'
                    title='Reject'>
                    <XCircle size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Table View */}
          <table className='hidden md:table w-full'>
            <thead className='bg-gray-50 border-b border-gray-200 text-center'>
              <tr>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider'>
                  Apply Date
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider'>
                  Company Name
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider'>
                  Contractor Name
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider'>
                  Email Address
                </th>
                <th className='px-6 py-3 text-center mx-auto text-xs font-medium text-gray-600 uppercase tracking-wider'>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className='bg-white divide-y divide-gray-200'>
              {pendingUsers.map((user) => (
                <tr key={user.id || user._id} className='hover:bg-gray-50'>
                  <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>
                    {new Date(user.createdAt).toLocaleDateString("en-GB")}
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>
                    {user.companyName}
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>
                    {user.name}
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-600'>
                    {user.email}
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm'>
                    <div className='flex items-center justify-center gap-2'>
                      <button
                        onClick={() => handleViewRequest(user.id)}
                        className='p-2 text-gray-600 hover:bg-gray-100 rounded cursor-pointer'
                        title='View Request Details'>
                        View
                      </button>
                      <button
                        onClick={() => handleApproveUser(user.id, user.name)}
                        className='p-2 text-green-600 hover:bg-green-50 rounded cursor-pointer'
                        title='Approve Request'>
                        Approve
                      </button>
                      <button
                        onClick={() => handleRejectUser(user.id, user.name)}
                        className='p-2 text-red-600 hover:bg-red-50 rounded cursor-pointer'
                        title='Reject Request'>
                        Reject
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
