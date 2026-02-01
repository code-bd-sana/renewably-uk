"use client";

import {
  CheckCircle,
  Eye,
  RefreshCw,
  XCircle,
  Download as DownloadIcon,
} from "lucide-react";
import Image from "next/image";
import { Loader2 } from "lucide-react";

export default function PendingRequestsTable({
  pendingRequests,
  requestsLoading,
  handleRefreshRequests,
  handleViewRequest,
  handleApproveRequest,
  handleRejectRequest,
  handleDownloadSingle,
  downloading,
}) {
  return (
    <div className='bg-white rounded-lg shadow-sm border border-gray-100'>
      <div className='px-4 md:px-6 py-3 md:py-4 border-b border-gray-200 flex flex-col md:flex-row md:items-center justify-between gap-3'>
        <div>
          <h2 className='text-lg md:text-xl font-semibold text-gray-900'>
            Pending Policy Requests ({pendingRequests.length})
          </h2>
          <p className='text-xs md:text-sm text-gray-500 mt-1'>
            Edit and cancellation requests
          </p>
        </div>
        <div className='flex justify-center'>
          <Image
            src='/bluedrop.png'
            height='200'
            width='200'
            alt='Renewably UK'
            className=''
            onError={(e) => {
              e.target.style.display = "none";
              e.target.nextSibling.style.display = "flex";
            }}
          />
          <button
            onClick={handleRefreshRequests}
            disabled={requestsLoading}
            className='flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 disabled:opacity-50 self-end md:self-auto'>
            <RefreshCw
              className={`w-4 h-4 ${requestsLoading ? "animate-spin" : ""}`}
            />
            <span className='hidden md:inline'>Refresh</span>
          </button>
        </div>
      </div>

      {requestsLoading ? (
        <div className='p-8 md:p-12 text-center'>
          <div className='inline-block animate-spin rounded-full h-6 w-6 md:h-8 md:w-8 border-b-2 border-blue-600'></div>
          <p className='text-gray-500 mt-2 text-sm md:text-base'>
            Loading requests...
          </p>
        </div>
      ) : pendingRequests.length === 0 ? (
        <div className='p-8 md:p-12 text-center text-gray-500'>
          No pending requests
        </div>
      ) : (
        <div className='overflow-x-auto'>
          {/* Mobile Card View */}
          <div className='md:hidden divide-y divide-gray-200'>
            {pendingRequests.map((request) => (
              <div key={request.id} className='p-4'>
                <div className='flex justify-between items-start mb-3'>
                  <div>
                    <h3 className='font-medium text-gray-900'>
                      {request.policyNumber}
                    </h3>
                    <p className='text-sm text-gray-600'>
                      {request.policyHolderName}
                    </p>
                  </div>
                  <span
                    className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      request.requestType === "edit"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-red-100 text-red-800"
                    }`}>
                    {request.requestType === "edit" ? "Edit" : "Cancel"}
                  </span>
                </div>
                <div className='mb-3'>
                  <p className='text-sm text-gray-900'>
                    {request.contractor?.name || "Unknown"}
                  </p>
                  <p className='text-xs text-gray-500'>
                    {request.contractor?.companyName || "No company"}
                  </p>
                  <p className='text-xs text-gray-500'>
                    {request.contractor?.email}
                  </p>
                </div>
                <div className='flex justify-between items-center'>
                  <span className='text-xs text-gray-500'>
                    {new Date(request.requestedAt).toLocaleDateString("en-GB")}
                  </span>
                  <div className='flex gap-1'>
                    <button
                      onClick={() => handleViewRequest(request.id)}
                      className='p-2 text-gray-600 hover:bg-gray-100 rounded'
                      title='View'>
                      <Eye className='w-4 h-4' />
                    </button>
                    <button
                      onClick={() => handleApproveRequest(request.id)}
                      className='p-2 text-green-600 hover:bg-green-50 rounded'
                      title='Approve'>
                      <CheckCircle className='w-4 h-4' />
                    </button>
                    <button
                      onClick={() => handleRejectRequest(request.id)}
                      className='p-2 text-red-600 hover:bg-red-50 rounded'
                      title='Reject'>
                      <XCircle className='w-4 h-4' />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Pending Table View */}
          <table className='hidden md:table w-full'>
            <thead className='bg-gray-50 border-b border-gray-200 '>
              <tr>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider'>
                  Contractor
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider'>
                  Policy Number
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider'>
                  Policy Holder Name
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider'>
                  Policy Holder Address
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider'>
                  Request Type
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider'>
                  Requested At
                </th>
                <th className='px-6 py-3 text-center mx-auto text-xs font-medium text-gray-600 uppercase tracking-wider'>
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className='bg-white divide-y divide-gray-200'>
              {pendingRequests.map((request) => (
                <tr key={request.id} className='hover:bg-gray-50'>
                  {/* Contractor */}
                  <td className='px-6 py-4 whitespace-nowrap'>
                    <div className='text-sm text-gray-900'>
                      {request.contractor?.name || "Unknown"}
                    </div>
                    <div className='text-xs text-gray-500'>
                      {request.contractor?.companyName || "No company"}
                    </div>
                    <div className='text-xs text-gray-500'>
                      {request.contractor?.email}
                    </div>
                  </td>

                  {/* Policy Number */}
                  <td className='px-6 py-4 whitespace-nowrap'>
                    <div className='text-sm font-medium text-gray-900'>
                      {request.policyNumber}
                    </div>
                  </td>

                  {/* Policy Holder Name */}
                  <td className='px-6 py-4 whitespace-nowrap'>
                    <div className='text-sm text-gray-900'>
                      {request.policyHolderName}
                    </div>
                  </td>

                  {/* Policy Holder Address */}
                  <td className='px-6 py-4 whitespace-nowrap'>
                    <div className='text-sm text-gray-900'>
                      {request.policyHolderAddress}
                    </div>
                  </td>

                  {/* Request Type */}
                  <td className='px-6 py-4 whitespace-nowrap'>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        request.requestType === "edit"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-red-100 text-red-800"
                      }`}>
                      {request.requestType === "edit" ? "Edit" : "Cancel"}
                    </span>
                    {request.reason && (
                      <div className='text-xs text-gray-500 mt-1 max-w-xs'>
                        Reason: {request.reason}
                      </div>
                    )}
                  </td>

                  {/* Requested At (DD/MM/YYYY - HH:MM) */}
                  <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                    {request.formattedRequestedAt ||
                      new Date(request.requestedAt).toLocaleString("en-GB", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                  </td>

                  {/* Actions */}
                  <td className='px-6 py-4 whitespace-nowrap text-sm'>
                    <div className='flex gap-2 items-center justify-center'>
                      <button
                        onClick={() => handleViewRequest(request.id)}
                        className='px-3 py-1.5 text-gray-700 hover:bg-gray-200 rounded text-sm cursor-pointer'
                        title='View Details'>
                        View
                      </button>
                      <button
                        onClick={() => handleDownloadSingle(request.id)}
                        className='px-3 py-1.5 text-blue-600 hover:bg-blue-100 rounded text-sm cursor-pointer'
                        title='Download Certificate'
                        disabled={downloading}>
                        {downloading ? (
                          <Loader2 className='w-4 h-4 animate-spin' />
                        ) : (
                          <DownloadIcon />
                        )}
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
