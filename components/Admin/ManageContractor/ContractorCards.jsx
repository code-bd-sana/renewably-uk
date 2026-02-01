"use client";

import {
  Eye,
  Download,
  MoreVertical,
  PauseCircle,
  PlayCircle,
  Trash2,
  FileText,
} from "lucide-react";
import { useRouter } from "next/navigation";

export default function ContractorCards({
  contractors,
  openContractorModal,
  downloadHandler,
  handleDelete,
  openSuspendModal,
  formatDate,
  showActionMenu,
  handleOpenActionMenu,
  setShowActionMenu,
}) {
  const router = useRouter();

  const getProductNames = (productIds = []) => {
    if (!productIds || productIds.length === 0) {
      return "None";
    }

    const productNames = productIds.map((id) => {
      switch (id.toString()) {
        case "1":
          return "External Wall Insulation";
        case "2":
          return "Cavity Wall Insulation";
        case "3":
          return "Loft Insulation";
        case "4":
          return "Room in Roof Insulation";
        case "5":
          return "Park Home Insulation";
        case "6":
          return "Flat Roof Insulation";
        case "7":
          return "Underfloor Insulation";
        case "8":
          return "Internal Wall Insulation";
        case "9":
          return "External Wall Insulation (Solid Wall)";
        case "10":
          return "Hybrid Wall Insulation";
        default:
          return `Product ${id}`;
      }
    });

    return productNames.join(", ");
  };

  return (
    <div className='md:hidden space-y-4 mb-6'>
      {contractors.length === 0 ? (
        <div className='text-center py-12 text-gray-500'>
          No contractors found
        </div>
      ) : (
        contractors.map((contractor) => (
          <div
            key={contractor.id}
            className='bg-white border border-gray-200 rounded-lg p-4'>
            <div className='flex justify-between items-start mb-3'>
              <div>
                <h3 className='font-medium text-gray-900'>
                  <button
                    onClick={() =>
                      router.push(`/admin/manage-contractors/${contractor.id}`)
                    }
                    className='text-blue-600 hover:text-blue-800 hover:underline transition-colors'>
                    {contractor.name}
                  </button>
                </h3>

                <p className='text-sm text-gray-600'>
                  {contractor.companyName || "N/A"}
                </p>
              </div>
              <span
                className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                  contractor.isApproved
                    ? contractor.isSuspended
                      ? "bg-yellow-100 text-yellow-700"
                      : "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }`}>
                {!contractor.isApproved
                  ? "Not Approved"
                  : contractor.isSuspended
                    ? "Suspended"
                    : "Active"}
              </span>
            </div>

            <div className='space-y-2 text-sm text-gray-600 mb-4'>
              <div className='flex items-center'>
                <span className='w-24 font-medium'>Email:</span>
                <span className='truncate'>{contractor.email}</span>
              </div>
              <div className='flex items-center'>
                <span className='w-24 font-medium'>Phone:</span>
                <span>{contractor.phoneNumber || "N/A"}</span>
              </div>
              <div className='flex items-center'>
                <span className='w-24 font-medium'>Total Certificates:</span>
                <span>{contractor.certificateCount || 0}</span>
              </div>
              <div className='flex items-center'>
                <span className='w-24 font-medium'>Registered:</span>
                <span>{formatDate(contractor.createdAt)}</span>
              </div>
            </div>
            <div className='flex items-center mt-2'>
              <span className='w-24 font-medium text-sm text-gray-600'>
                Approved Measures:
              </span>
              <div className='flex-1'>
                <div className='flex flex-wrap gap-1'>
                  {contractor.allowedProducts?.length > 0 ? (
                    contractor.allowedProducts.slice(0, 3).map((productId) => {
                      const productName = getProductNames([productId]);
                      return (
                        <span
                          key={productId}
                          className='inline-block px-2 py-0.5 text-xs font-medium bg-green-50 text-green-800 rounded-full truncate max-w-25'
                          title={productName}>
                          {productName.length > 15
                            ? productName.substring(0, 15) + "..."
                            : productName}
                        </span>
                      );
                    })
                  ) : (
                    <span className='text-gray-500 text-sm italic'>None</span>
                  )}
                  {contractor.allowedProducts?.length > 3 && (
                    <span className='text-xs text-gray-500'>
                      +{contractor.allowedProducts.length - 3} more
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className='flex flex-wrap gap-1.5 mt-2'>
              <span className='text-xs font-medium text-gray-600'>Roles:</span>
              {contractor.roles?.length > 0 ? (
                contractor.roles.map((role) => (
                  <span
                    key={role}
                    className='px-2 py-0.5 bg-blue-50 text-blue-700 text-xs rounded-full'>
                    {role.replace(/_/g, " ")}
                  </span>
                ))
              ) : (
                <span className='text-xs text-gray-500'>None</span>
              )}
            </div>
            <div className='flex justify-between border-t border-gray-100 pt-3 action-dropdown-container'>
              <button
                onClick={() => openContractorModal(contractor)}
                className='text-blue-600 hover:text-blue-800 transition-colors p-2'
                title='View Details'>
                <Eye className='w-5 h-5' />
              </button>
              <button
                onClick={() => downloadHandler(contractor.id)}
                className='text-green-600 hover:text-green-800 transition-colors p-2'
                title='Download Data'>
                <Download className='w-5 h-5' />
              </button>

              {/* Mobile Dropdown */}
              <div className='relative'>
                <button
                  onClick={(e) => handleOpenActionMenu(contractor.id, e)}
                  className='text-gray-600 hover:text-gray-800 transition-colors p-2'
                  title='More Actions'>
                  <MoreVertical className='w-5 h-5' />
                </button>

                {showActionMenu === contractor.id && (
                  <div className='absolute right-0 top-full mt-1 w-48 bg-white rounded-lg border border-gray-200 z-50 shadow-xl'>
                    <div className='py-1'>
                      {contractor.isApproved && !contractor.isSuspended && (
                        <button
                          onClick={() =>
                            openSuspendModal(contractor, "suspend")
                          }
                          className='w-full text-left px-4 py-2 text-sm text-yellow-700 hover:bg-yellow-50 flex items-center gap-2'>
                          <PauseCircle className='w-4 h-4' />
                          Suspend User
                        </button>
                      )}

                      {contractor.isSuspended && (
                        <button
                          onClick={() =>
                            openSuspendModal(contractor, "unsuspend")
                          }
                          className='w-full text-left px-4 py-2 text-sm text-green-700 hover:bg-green-50 flex items-center gap-2'>
                          <PlayCircle className='w-4 h-4' />
                          Unsuspend User
                        </button>
                      )}

                      <div className='border-t border-gray-200 my-1'></div>

                      <button
                        onClick={() => {
                          setShowActionMenu(null);
                          handleDelete(contractor.id);
                        }}
                        className='w-full text-left px-4 py-2 text-sm text-red-700 hover:bg-red-50 flex items-center gap-2'>
                        <Trash2 className='w-4 h-4' />
                        Delete Contractor
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
