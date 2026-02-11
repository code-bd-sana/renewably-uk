"use client";

import { X, FileText } from "lucide-react";
import Image from "next/image";
import CertificateActionsDropdown from "../RequestActionDropdown";
import ProductAssignmentSection from "../ProductAssignmentSection";

export default function RequestModal({
  showRequestModal,
  selectedRequest,
  adminNotes,
  setAdminNotes,
  setShowRequestModal,
  selectedProductIds,
  setSelectedProductIds,
  handleApproveUser,
  handleRejectUser,
  handleApproveRequest,
  handleRejectRequest,
  handleDeleteRequest,
  handleDownloadSingle,
}) {
  if (!showRequestModal || !selectedRequest) return null;
  return (
    <div className='fixed inset-0 bg-black/50 flex items-start md:items-center justify-center p-2 md:p-4 z-50 overflow-y-auto'>
      <div className='bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden my-auto'>
        {/* Header */}
        <div className='p-4 md:p-6 border-b border-gray-200 sticky top-0 bg-white z-10'>
          <Image
            src='/bluedrop.png'
            height={200}
            width={200}
            alt='Renewably UK'
            className='h-auto w-auto my-2'
          />
          <div className='flex items-center justify-between mb-3'>
            <div className='flex-1 min-w-0'>
              <h1 className='text-lg md:text-2xl font-bold text-gray-900 truncate'>
                {selectedRequest.type === "user_request"
                  ? `Contractor Application: ${selectedRequest.name}`
                  : `Policy Request: ${selectedRequest.policyNumber}`}
              </h1>
              <div className='flex gap-x-4 p-2'>
                <p className='text-xs md:text-sm text-gray-600 truncate'>
                  {selectedRequest.type === "user_request"
                    ? `Company: ${selectedRequest.companyName}`
                    : `By: ${selectedRequest.contractor?.name}`}
                </p>
                <p className='text-xs md:text-sm text-gray-600 truncate'>
                  {selectedRequest.type === "user_request"
                    ? `Company Address: ${selectedRequest.companyAddress}`
                    : `By: ${selectedRequest.contractor?.name}`}
                </p>
              </div>
            </div>
            <div className='flex items-center gap-3'>
              <CertificateActionsDropdown
                requestId={selectedRequest.id || selectedRequest._id}
                requestData={selectedRequest}
                onApprove={() => {
                  if (selectedRequest.type === "user_request") {
                    handleApproveUser(selectedRequest.id, selectedRequest.name);
                  } else {
                    handleApproveRequest(selectedRequest.id);
                  }
                  setShowRequestModal(false);
                }}
                onReject={() => {
                  if (selectedRequest.type === "user_request") {
                    handleRejectUser(selectedRequest.id, selectedRequest.name);
                  } else {
                    handleRejectRequest(selectedRequest.id);
                  }
                  setShowRequestModal(false);
                }}
                onDelete={
                  selectedRequest.type === "user_request"
                    ? null
                    : () => handleDeleteRequest(selectedRequest.id)
                }
                onDownload={
                  selectedRequest.type === "user_request"
                    ? null
                    : () => handleDownloadSingle(selectedRequest.id)
                }
                showPending
              />
            </div>

            <button
              onClick={() => setShowRequestModal(false)}
              className='p-1 md:p-2 hover:bg-gray-100 rounded shrink-0'>
              <X size={20} />
            </button>
          </div>

          {/* Badges */}
          <div className='flex flex-wrap gap-2'>
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium ${
                selectedRequest.type === "user_request"
                  ? "bg-purple-100 text-purple-800"
                  : selectedRequest.requestType === "edit"
                    ? "bg-blue-100 text-blue-800"
                    : "bg-red-100 text-red-800"
              }`}>
              {selectedRequest.type === "user_request"
                ? "New Contractor"
                : selectedRequest.requestType === "edit"
                  ? "Edit Request"
                  : "Cancel Request"}
            </span>
            <span className='px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs'>
              Pending Review
            </span>
            <span className='px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs'>
              {new Date(
                selectedRequest.requestedAt || selectedRequest.createdAt,
              ).toLocaleDateString()}
            </span>
          </div>
        </div>

        {/* Content - Different content for user vs policy requests */}
        <div className='p-4 md:p-6 overflow-y-auto max-h-[60vh]'>
          {selectedRequest.type === "user_request" ? (
            /* USER REQUEST CONTENT  */
            <>
              {/* User Details */}
              <div className='mb-6'>
                <h3 className='text-lg font-semibold text-gray-800 mb-4'>
                  Contractor Details
                </h3>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <div>
                    <p className='text-sm text-gray-500'>Full Name</p>
                    <p className='font-medium'>{selectedRequest.name}</p>
                  </div>
                  <div>
                    <p className='text-sm text-gray-500'>Company Name</p>
                    <p className='font-medium'>{selectedRequest.companyName}</p>
                  </div>
                  {/* <div>
                    <p className='text-sm text-gray-500'>Company Address</p>
                    <p className='font-medium'>
                      {selectedRequest.companyAddress}
                    </p>
                  </div> */}
                  <div>
                    <p className='text-sm text-gray-500'>Email Address</p>
                    <p className='font-medium'>{selectedRequest.email}</p>
                  </div>
                  <div>
                    <p className='text-sm text-gray-500'>Phone Number</p>
                    <p className='font-medium'>{selectedRequest.phoneNumber}</p>
                  </div>
                  <div>
                    <p className='text-sm text-gray-500'>Application Date</p>
                    <p className='font-medium'>
                      {new Date(selectedRequest.createdAt).toLocaleDateString(
                        "en-GB",
                      )}
                    </p>
                  </div>
                  <div>
                    <p className='text-sm text-gray-500'>Status</p>
                    <p className='font-medium'>Pending Approval</p>
                  </div>
                </div>
                <div className='py-3'>
                  <p className='text-sm text-gray-500'>Requested Roles</p>
                  <p className='font-medium'>
                    {selectedRequest.requestedRoles.join(", ")}
                  </p>
                </div>
              </div>

              {/* Documents (if any) */}
              {selectedRequest.documents &&
                selectedRequest.documents.length > 0 && (
                  <div className='mb-6'>
                    <h4 className='font-medium text-gray-700 mb-3'>
                      Submitted Documents
                    </h4>
                    <div className='space-y-2'>
                      {selectedRequest.documents.map((doc, index) => (
                        <div
                          key={index}
                          className='flex items-center gap-2 text-sm'>
                          <FileText size={14} className='text-gray-400' />
                          <span>{doc.name}</span>
                          <a
                            href={doc.url}
                            className='text-blue-600 hover:underline ml-2'>
                            View
                          </a>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
            </>
          ) : (
            /* POLICY REQUEST CONTENT - WITH SIDE-BY-SIDE COMPARISON */
            <>
              {/* Reason */}
              <div className='mb-6 p-4 bg-blue-50 rounded-lg border border-blue-100'>
                <h3 className='font-semibold text-gray-800 mb-2 flex items-center gap-2'>
                  <FileText size={16} /> Request Reason:
                </h3>
                <p className='text-gray-800 bg-white p-3 rounded border'>
                  {selectedRequest.reason || "No reason provided"}
                </p>
              </div>

              {/* Side by Side Comparison */}
              <div className='grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6'>
                {/* Original Details */}
                <div className='bg-gray-50 rounded-lg border border-gray-200'>
                  <div className='p-4 border-b border-gray-200 bg-white'>
                    <h3 className='text-lg font-semibold text-gray-900'>
                      Original Details
                    </h3>
                  </div>
                  <div className='p-4'>
                    <div className='space-y-3'>
                      {/* Contractor Information */}
                      <div>
                        <p className='text-sm text-gray-600 mb-1'>Contractor</p>
                        <p className='text-gray-900 font-medium'>
                          {selectedRequest.contractor?.name}
                        </p>
                        <p className='text-sm text-gray-600'>
                          {selectedRequest.contractor?.companyName}
                        </p>
                        <p className='text-sm text-gray-600'>
                          {selectedRequest.contractor?.email}
                        </p>
                      </div>

                      {/* Policy Information */}
                      <div>
                        <p className='text-sm text-gray-600 mb-1'>
                          Policy Number
                        </p>
                        <p className='text-gray-900'>
                          {selectedRequest.policyNumber}
                        </p>
                      </div>

                      <div>
                        <p className='text-sm text-gray-600 mb-1'>
                          Policy Holder Name
                        </p>
                        <p className='text-gray-900'>
                          {selectedRequest.policyHolderName}
                        </p>
                      </div>

                      <div>
                        <p className='text-sm text-gray-600 mb-1'>
                          Policy Holder Address
                        </p>
                        <p className='text-gray-900'>
                          {selectedRequest.policyHolderAddress}
                        </p>
                      </div>

                      <div>
                        <p className='text-sm text-gray-600 mb-1'>
                          Measure (Product Type)
                        </p>
                        <p className='text-gray-900'>
                          {selectedRequest.productType}
                        </p>
                      </div>

                      <div>
                        <p className='text-sm text-gray-600 mb-1'>Country</p>
                        <p className='text-gray-900'>
                          {selectedRequest.country}
                        </p>
                      </div>

                      <div>
                        <p className='text-sm text-gray-600 mb-1'>Postcode</p>
                        <p className='text-gray-900'>
                          {selectedRequest.postcode}
                        </p>
                      </div>

                      <div>
                        <p className='text-sm text-gray-600 mb-1'>Email</p>
                        <p className='text-gray-900'>{selectedRequest.email}</p>
                      </div>

                      <div>
                        <p className='text-sm text-gray-600 mb-1'>Phone</p>
                        <p className='text-gray-900'>{selectedRequest.phone}</p>
                      </div>

                      <div>
                        <p className='text-sm text-gray-600 mb-1'>
                          Contract Value
                        </p>
                        <p className='text-gray-900'>
                          {selectedRequest.contractValue
                            ?.toString()
                            .includes("£")
                            ? selectedRequest.contractValue
                            : `${selectedRequest.contractValue}`}
                        </p>
                      </div>

                      <div>
                        <p className='text-sm text-gray-600 mb-1'>
                          Insurance Coverage
                        </p>
                        <p className='text-gray-900'>
                          {selectedRequest.insuranceCoverage}
                        </p>
                      </div>

                      <div>
                        <p className='text-sm text-gray-600 mb-1'>
                          Inception Date
                        </p>
                        <p className='text-gray-900'>
                          {selectedRequest.inceptionDate}
                        </p>
                      </div>

                      <div>
                        <p className='text-sm text-gray-600 mb-1'>
                          Expiry Date
                        </p>
                        <p className='text-gray-900'>
                          {selectedRequest.expiryDate}
                        </p>
                      </div>

                      <div>
                        <p className='text-sm text-gray-600 mb-1'>
                          Retrofit Assessor
                        </p>
                        <p className='text-gray-900'>
                          {selectedRequest.retrofitAssessor || "Not Assigned"}
                        </p>
                      </div>

                      <div>
                        <p className='text-sm text-gray-600 mb-1'>
                          Retrofit Coordinator
                        </p>
                        <p className='text-gray-900'>
                          {selectedRequest.retrofitCoordinator ||
                            "Not Assigned"}
                        </p>
                      </div>

                      <div>
                        <p className='text-sm text-gray-600 mb-1'>
                          Funding Partner
                        </p>
                        <p className='text-gray-900'>
                          {selectedRequest.fundingPartner || "Not Assigned"}
                        </p>
                      </div>

                      <div>
                        <p className='text-sm text-gray-600 mb-1'>
                          Scheme Provider
                        </p>
                        <p className='text-gray-900'>
                          {selectedRequest.schemeProvider || "Not Assigned"}
                        </p>
                      </div>

                      <div>
                        <p className='text-sm text-gray-600 mb-1'>
                          Requested At
                        </p>
                        <p className='text-gray-900'>
                          {selectedRequest.formattedRequestedAt ||
                            new Date(
                              selectedRequest.requestedAt,
                            ).toLocaleString("en-GB", {
                              day: "2-digit",
                              month: "2-digit",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Edited Details */}
                <div className='bg-gray-50 rounded-lg border border-gray-200'>
                  <div className='p-4 border-b border-gray-200 bg-white'>
                    <h3 className='text-lg font-semibold text-gray-900'>
                      Requested Changes
                    </h3>
                  </div>
                  <div className='p-4'>
                    <div className='space-y-3'>
                      {[
                        {
                          changeKey: "policyHolderName",
                          originalKey: "policyHolderName",
                          label: "Policy Holder Name",
                        },
                        {
                          changeKey: "address",
                          originalKey: "policyHolderAddress",
                          label: "Address",
                        },
                        {
                          changeKey: "country",
                          originalKey: "country",
                          label: "Country",
                        },
                        {
                          changeKey: "postcode",
                          originalKey: "postcode",
                          label: "Postcode",
                        },
                        {
                          changeKey: "email",
                          originalKey: "email",
                          label: "Policyholder Email",
                        },
                        {
                          changeKey: "phone",
                          originalKey: "phone",
                          label: "Policyholder Phone",
                        },
                        {
                          changeKey: "productType",
                          originalKey: "productType",
                          label: "Product Type",
                        },
                        {
                          changeKey: "contractValue",
                          originalKey: "contractValue",
                          label: "Contract Value",
                          format: (val) =>
                            val?.toString().includes("£") ? val : `£ ${val}`,
                        },
                        {
                          changeKey: "inceptionDate",
                          originalKey: "inceptionDate",
                          label: "Inception Date",
                        },
                        {
                          changeKey: "expiryDateCalculated",
                          originalKey: "expiryDate",
                          label: "Expiry Date",
                        },

                        {
                          changeKey: "retrofitAssessor",
                          originalKey: "retrofitAssessor",
                          label: "Retrofit Assessor",
                        },
                        {
                          changeKey: "retrofitCoordinator",
                          originalKey: "retrofitCoordinator",
                          label: "Retrofit Coordinator",
                        },
                        {
                          changeKey: "fundingPartner",
                          originalKey: "fundingPartner",
                          label: "Funding Partner",
                        },
                        {
                          changeKey: "schemeProvider",
                          originalKey: "schemeProvider",
                          label: "Scheme Provider",
                        },
                      ].map(
                        ({
                          changeKey,
                          originalKey,
                          label,
                          format = (v) => v,
                        }) => {
                          const hasChange =
                            selectedRequest.changes?.[changeKey] !== undefined;
                          const displayValue = hasChange
                            ? format(selectedRequest.changes[changeKey])
                            : format(selectedRequest[originalKey] || "N/A");

                          return (
                            <div
                              key={changeKey}
                              className={
                                hasChange
                                  ? "bg-yellow-50 p-3 rounded border border-yellow-200"
                                  : ""
                              }>
                              <p className='text-sm text-gray-600 mb-1'>
                                {label}
                              </p>
                              <div className='flex justify-between items-center'>
                                <p className='text-gray-900'>
                                  {displayValue || "N/A"}
                                </p>
                                {hasChange && (
                                  <span className='text-xs font-medium text-yellow-600 bg-yellow-100 px-2 py-1 rounded'>
                                    CHANGED
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        },
                      )}

                      {/* Static fields that don't change often */}
                      <div>
                        <p className='text-sm text-gray-600 mb-1'>
                          Insurance Coverage
                        </p>
                        <p className='text-gray-900'>
                          {selectedRequest.insuranceCoverage ||
                            "Insurance Backed Guarantee"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contractor Information */}
              <div className='mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200'>
                <h3 className='text-lg font-semibold text-gray-800 mb-4'>
                  Contractor Information
                </h3>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <div>
                    <p className='text-sm text-gray-600 mb-1'>
                      Contractor Name
                    </p>
                    <p className='font-medium'>
                      {selectedRequest.contractor?.name || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className='text-sm text-gray-600 mb-1'>Company Name</p>
                    <p className='font-medium'>
                      {selectedRequest.contractor?.companyName || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className='text-sm text-gray-600 mb-1'>Email</p>
                    <p className='font-medium'>
                      {selectedRequest.contractor?.email || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className='text-sm text-gray-600 mb-1'>
                      Contractor Address
                    </p>
                    <p className='font-medium'>
                      {selectedRequest.changes?.contractorAddress || "N/A"}
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}
          {selectedRequest.type === "user_request" && (
            <ProductAssignmentSection
              selectedProductIds={selectedProductIds}
              setSelectedProductIds={setSelectedProductIds}
            />
          )}

          {/* Admin Notes (Common for both types) */}
          <div className='mb-4'>
            <h3 className='text-lg font-semibold text-gray-800 mb-3'>
              Admin Notes
            </h3>
            <textarea
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
              rows='3'
              placeholder='Add your notes here... (These notes will be visible to the contractor)'
            />
            <p className='text-sm text-gray-500 mt-2'>
              These notes will be sent to the contractor along with your
              decision.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
