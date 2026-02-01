"use client";

import { X, Loader2 } from "lucide-react";
import ProductAssignmentSection from "@/components/Admin/ProductAssignmentSection";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";

export default function ProductEditModal({
  showProductEditModal,
  selectedContractorForProductEdit,
  setSelectedContractorForProductEdit,
  closeProductEditModal,
  fetchContractors,
}) {
  const [selectedProductIds, setSelectedProductIds] = useState([]);
  const [actionLoading, setActionLoading] = useState(false);
  const [contractorDetails, setContractorDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(true);

  // Fetch fresh contractor data when modal opens
  useEffect(() => {
    const fetchContractorDetails = async () => {
      if (!selectedContractorForProductEdit?.id) return;

      setLoadingDetails(true);
      try {
        const res = await fetch(
          `/api/admin/contractor/${selectedContractorForProductEdit.id}`,
        );
        const data = await res.json();

        if (data.success && data.contractor) {
          const contractor = data.contractor;
          setContractorDetails(contractor);

          // Initialize selected products from fresh data
          const existingIds = (contractor.allowedProducts || []).map((id) =>
            id.toString(),
          );
          setSelectedProductIds(existingIds);
        } else {
          // Fallback to the passed contractor data
          setContractorDetails(selectedContractorForProductEdit);
          const existingIds = (
            selectedContractorForProductEdit.allowedProducts || []
          ).map((id) => id.toString());
          setSelectedProductIds(existingIds);
        }
      } catch (error) {
        console.error("Error fetching contractor details:", error);
        // Fallback to the passed contractor data
        setContractorDetails(selectedContractorForProductEdit);
        const existingIds = (
          selectedContractorForProductEdit.allowedProducts || []
        ).map((id) => id.toString());
        setSelectedProductIds(existingIds);
      } finally {
        setLoadingDetails(false);
      }
    };

    if (showProductEditModal && selectedContractorForProductEdit) {
      fetchContractorDetails();
    }
  }, [showProductEditModal, selectedContractorForProductEdit]);

  const handleSaveAllowedProducts = async () => {
    if (!contractorDetails?.id) {
      toast.error("No contractor selected");
      return;
    }

    try {
      setActionLoading(true);

      const res = await fetch(
        `/api/admin/contractor/${contractorDetails.id}/products`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            allowedProductIds: selectedProductIds,
          }),
        },
      );

      const data = await res.json();

      if (data.success) {
        toast.success("Allowed products updated!");

        // Refresh the contractors list
        await fetchContractors();

        // Close modal
        closeProductEditModal();
      } else {
        toast.error(data.error || "Save failed");
      }
    } catch (err) {
      toast.error("Error saving");
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  // Get product name
  const getProductName = (id) => {
    if (!products || products.length === 0) return `Product ${id}`;
    const product = products.find((p) => p._id === id || p.id === id);
    return product ? product.name : `Product ${id}`;
  };

  if (!showProductEditModal || !selectedContractorForProductEdit) return null;

  return (
    <div className='fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50'>
      <div className='bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto'>
        <div className='flex justify-between items-center p-6 border-b border-gray-200'>
          <div>
            <h3 className='text-xl font-bold text-gray-900'>
              Edit Approved Measures
            </h3>
            <p className='text-sm text-gray-600 mt-1'>
              {contractorDetails?.name || selectedContractorForProductEdit.name}{" "}
              •{" "}
              {contractorDetails?.companyName ||
                selectedContractorForProductEdit.companyName}
            </p>
          </div>
          <button
            onClick={closeProductEditModal}
            className='text-gray-500 hover:text-gray-700'>
            <X size={24} />
          </button>
        </div>

        <div className='p-6'>
          {loadingDetails ? (
            <div className='flex flex-col items-center justify-center py-12'>
              <Loader2 className='w-8 h-8 animate-spin text-blue-600 mb-4' />
              <p className='text-gray-600'>Loading contractor details...</p>
            </div>
          ) : (
            <>
              <div className='mb-6'>
                <p className='text-sm text-gray-700 mb-4'>
                  Select the measures this contractor is approved to issue
                  certificates for:
                </p>

                <ProductAssignmentSection
                  selectedProductIds={selectedProductIds}
                  setSelectedProductIds={setSelectedProductIds}
                />
              </div>

              <div className='mt-6 pt-4 border-t border-gray-200'>
                <div className='flex justify-end gap-3'>
                  <button
                    onClick={() => {
                      // Reset to original selection
                      const originalIds = (
                        contractorDetails?.allowedProducts || []
                      ).map((id) => id.toString());
                      setSelectedProductIds(originalIds);
                    }}
                    className='px-5 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition'>
                    Reset
                  </button>

                  <button
                    onClick={closeProductEditModal}
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
                      "Save Approved Measures"
                    )}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
