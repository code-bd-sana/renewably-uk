"use client";

import { Eye, FileText, Loader2, X } from "lucide-react";
import Link from "next/link";
import ProductAssignmentSection from "@/components/Admin/ProductAssignmentSection";
import { useState } from "react";

export default function ContractorModal({
  showContractorModal,
  selectedContractor,
  documentsLoading,
  getContractorDocuments,
  handleViewDocument,
  closeContractorModal,
  handleDelete,
  selectedProductIds,
  setSelectedProductIds,
  actionLoading,
  handleSaveAllowedProducts,
  prefixInput,
  setPrefixInput,
  savePrefix,
  formatDate,
}) {
  const [localPrefixInput, setLocalPrefixInput] = useState(prefixInput);

  if (!showContractorModal || !selectedContractor) return null;

  return (
    <div className='fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50'>
      <div className='bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto'>
        {/* Modal Header */}
        <div className='flex justify-between items-center p-4 bg-gray-50 border-b border-gray-200'>
          <div className='flex items-center gap-3'>
            <button
              onClick={closeContractorModal}
              className='text-gray-600 hover:text-gray-900 text-2xl p-1'
              title='Back'>
              ≫
            </button>
          </div>
          <div className='flex items-center gap-3'>
            <span
              className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                selectedContractor.isApproved
                  ? selectedContractor.isSuspended
                    ? "bg-yellow-100 text-yellow-700"
                    : "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }`}>
              {!selectedContractor.isApproved
                ? "Not Approved"
                : selectedContractor.isSuspended
                  ? "Suspended"
                  : "Active"}
            </span>
          </div>
        </div>

        {/* Modal Content */}
        <div className='p-6'>
          {/* Details Grid */}
          <div className='space-y-4'>
            <div className='space-y-4'>
              <div className='flex justify-between items-start py-3 border-b border-gray-100'>
                <div className='text-sm font-medium text-gray-700'>
                  Create Account Date
                </div>
                <div className='text-sm text-gray-900 text-right'>
                  {formatDate(selectedContractor.createdAt)}
                </div>
              </div>

              <div className='flex justify-between items-start py-3 border-b border-gray-100'>
                <div className='text-sm font-medium text-gray-700'>
                  Contractor Name
                </div>
                <div className='text-sm text-gray-900 text-right'>
                  <Link
                    href={`/admin/manage-contractors/${selectedContractor.id}`}
                    className='text-blue-600 hover:text-blue-800 hover:underline transition-colors'
                    target='_blank'>
                    {selectedContractor.name || "N/A"}
                  </Link>
                </div>
              </div>

              <div className='flex justify-between items-start py-3 border-b border-gray-100'>
                <div className='text-sm font-medium text-gray-700'>
                  Company Name
                </div>
                <div className='text-sm text-gray-900 text-right'>
                  {selectedContractor.companyName || "N/A"}
                </div>
              </div>

              <div className='flex justify-between items-start py-3 border-b border-gray-100'>
                <div className='text-sm font-medium text-gray-700'>
                  Company Address
                </div>
                <div className='text-sm text-gray-900 text-right'>
                  {selectedContractor.address || "N/A"}
                </div>
              </div>

              <div className='flex justify-between items-start py-3 border-b border-gray-100'>
                <div className='text-sm font-medium text-gray-700'>
                  Phone Number
                </div>
                <div className='text-sm text-gray-900 text-right'>
                  {selectedContractor.phone || "N/A"}
                </div>
              </div>

              <div className='flex justify-between items-start py-3 border-b border-gray-100'>
                <div className='text-sm font-medium text-gray-700'>
                  Email Address
                </div>
                <div className='text-sm text-gray-900 text-right'>
                  <a
                    href={`mailto:${selectedContractor.email}`}
                    className='text-blue-600 hover:text-blue-800 hover:underline'>
                    {selectedContractor.email}
                  </a>
                </div>
              </div>

              <div className='flex justify-between items-start py-3 border-b border-gray-100'>
                <div className='text-sm font-medium text-gray-700'>
                  Total Certificate
                </div>
                <div className='text-sm text-gray-900 text-right'>
                  {selectedContractor.certificateCount || 0}
                </div>
              </div>

              <div className='flex justify-between items-start py-3'>
                <div className='text-sm font-medium text-gray-700'>
                  Documents
                </div>
                <div className='text-sm text-gray-900 text-right'>
                  <div className='space-y-1'>
                    {getContractorDocuments(selectedContractor.id).map(
                      (doc, index) => (
                        <div
                          key={index}
                          className='flex items-center justify-end gap-1'>
                          <a
                            href={`/api/admin/documents/${doc.id}`}
                            target='_blank'
                            rel='noopener noreferrer'
                            className='text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1'>
                            <FileText className='w-3 h-3' />
                            <span>files:{doc.id}</span>
                          </a>
                        </div>
                      ),
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Product selection option */}
            {selectedContractor?.isApproved && (
              <ProductAssignmentSection
                selectedProductIds={selectedProductIds}
                setSelectedProductIds={setSelectedProductIds}
              />
            )}

            <div className='mt-6 pt-4 border-t border-gray-200'>
              <div className='flex justify-end gap-3'>
                <button
                  onClick={() => {
                    setSelectedProductIds([]);
                  }}
                  className='px-5 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition'>
                  Cancel
                </button>

                <button
                  onClick={handleSaveAllowedProducts}
                  disabled={actionLoading}
                  className={`px-6 py-2.5 rounded-lg font-medium flex items-center gap-2 transition ${
                    actionLoading
                      ? "bg-gray-400 cursor-wait"
                      : "bg-blue-600 hover:bg-blue-700 text-white"
                  }`}>
                  {actionLoading ? (
                    <>
                      <Loader2 className='w-5 h-5 animate-spin' />
                      Saving...
                    </>
                  ) : (
                    "Save Allowed Products"
                  )}
                </button>
              </div>
            </div>

            {/* PREFIX SETTING SECTION */}
            <div className='pt-6 border-t border-gray-100'>
              <h3 className='text-lg font-semibold text-gray-900 mb-4'>
                Certificate Prefix Settings
              </h3>

              <div className='bg-gray-50 p-5 rounded-lg border border-gray-200'>
                <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6'>
                  <div className='flex-1'>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                      Policy Number Prefix (for future certificates)
                    </label>
                    <input
                      type='text'
                      value={
                        localPrefixInput ||
                        selectedContractor?.policyNoPrefix ||
                        ""
                      }
                      onChange={(e) => {
                        const value = e.target.value.toUpperCase();
                        setLocalPrefixInput(value);
                        setPrefixInput(value);
                      }}
                      placeholder='e.g. GFT'
                      disabled={selectedContractor?.isPrefixLocked}
                      maxLength={10}
                      className={`w-full px-4 py-3 border rounded-lg text-lg font-medium uppercase tracking-wide focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        selectedContractor?.isPrefixLocked
                          ? "bg-gray-100 cursor-not-allowed"
                          : ""
                      }`}
                    />
                    <p className='mt-2 text-xs text-gray-500'>
                      3–10 uppercase letters (A–Z). Cannot be changed after
                      first certificate.
                    </p>
                  </div>

                  <button
                    onClick={async () => {
                      if (!localPrefixInput || localPrefixInput.length < 3) {
                        alert("Prefix must be at least 3 uppercase letters");
                        return;
                      }

                      if (
                        window.confirm(
                          `Set prefix to ${localPrefixInput.toUpperCase()}?`,
                        )
                      ) {
                        try {
                          const res = await fetch(
                            "/api/admin/contractor/prefix",
                            {
                              method: "POST",
                              headers: {
                                "Content-Type": "application/json",
                              },
                              body: JSON.stringify({
                                contractorId: selectedContractor.id,
                                prefix: localPrefixInput,
                              }),
                            },
                          );

                          const data = await res.json();

                          if (data.success) {
                            alert(`Prefix set to ${data.prefix}`);
                            setLocalPrefixInput("");
                          } else {
                            alert(data.error || "Failed to set prefix");
                          }
                        } catch (err) {
                          alert("Error saving prefix");
                        }
                      }
                    }}
                    disabled={
                      !localPrefixInput ||
                      localPrefixInput.length < 3 ||
                      localPrefixInput === selectedContractor?.policyNoPrefix ||
                      selectedContractor?.isPrefixLocked
                    }
                    className='px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors whitespace-nowrap'>
                    {selectedContractor?.policyNoPrefix
                      ? "Update Prefix"
                      : "Set Prefix"}
                  </button>
                </div>

                {/* Preview */}
                {localPrefixInput && localPrefixInput.length >= 3 && (
                  <div className='mt-4 p-4 bg-blue-50 border border-blue-100 rounded-lg'>
                    <p className='text-sm font-medium text-blue-800 mb-2'>
                      Preview of next certificates:
                    </p>
                    {[1, 2, 3].map((offset) => (
                      <div
                        key={offset}
                        className='flex items-center gap-3 mb-1'>
                        <div className='w-2 h-2 bg-blue-500 rounded-full'></div>
                        <code className='bg-white px-3 py-1 rounded border font-mono'>
                          {localPrefixInput.toUpperCase()}
                          {(
                            (selectedContractor?.lastCertificateSequence || 0) +
                            offset
                          )
                            .toString()
                            .padStart(5, "0")}
                        </code>
                      </div>
                    ))}
                  </div>
                )}

                {selectedContractor?.isPrefixLocked && (
                  <p className='mt-4 text-sm text-amber-700 bg-amber-50 p-3 rounded-lg'>
                    This prefix is locked because the contractor has already
                    issued at least one certificate.
                  </p>
                )}
              </div>
            </div>

            {/* Documents Section */}
            <div className='pt-4 border-t border-gray-100'>
              <div className='flex justify-between items-start mb-3'>
                <div>
                  <h4 className='text-sm font-medium text-gray-700'>
                    Documents
                  </h4>
                  <p className='text-xs text-gray-500 mt-1'>
                    Contractor uploaded documents
                  </p>
                </div>
                {documentsLoading && (
                  <Loader2 className='w-4 h-4 animate-spin text-blue-600' />
                )}
              </div>

              {documentsLoading ? (
                <div className='text-center py-4'>
                  <Loader2 className='w-6 h-6 animate-spin text-gray-400 mx-auto' />
                  <p className='text-sm text-gray-500 mt-2'>
                    Loading documents...
                  </p>
                </div>
              ) : (
                <div className='space-y-2'>
                  {getContractorDocuments(selectedContractor.id).length > 0 ? (
                    getContractorDocuments(selectedContractor.id).map(
                      (doc, index) => (
                        <div
                          key={doc._id || index}
                          className='flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200'>
                          <div className='flex-1'>
                            <div className='flex items-center gap-2 mb-1'>
                              <FileText className='w-4 h-4 text-gray-500' />
                              <span className='text-sm font-medium text-gray-700'>
                                {doc.title || `Document ${index + 1}`}
                              </span>
                            </div>
                            <div className='text-xs text-gray-500'>
                              <span className='inline-block px-2 py-0.5 bg-gray-100 rounded mr-2'>
                                {doc.category || "Other"}
                              </span>
                              {doc.description && (
                                <span className='truncate'>
                                  {doc.description}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className='flex items-center gap-2 ml-4'>
                            <button
                              onClick={() => handleViewDocument(doc)}
                              className='p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors'
                              title='View Document'>
                              <Eye className='w-4 h-4' />
                            </button>
                          </div>
                        </div>
                      ),
                    )
                  ) : (
                    <div className='text-center py-6'>
                      <FileText className='w-12 h-12 text-gray-300 mx-auto mb-2' />
                      <p className='text-sm text-gray-500'>
                        No documents found
                      </p>
                      <p className='text-xs text-gray-400 mt-1'>
                        This contractor has not uploaded any documents yet
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className='flex justify-between items-center mt-8 pt-6 border-t border-gray-200'>
            <button
              onClick={() => {
                closeContractorModal();
                handleDelete(selectedContractor.id);
              }}
              className='px-4 py-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors text-sm font-medium'>
              Delete Contractor
            </button>
            <button
              onClick={closeContractorModal}
              className='px-4 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors text-sm font-medium'>
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
