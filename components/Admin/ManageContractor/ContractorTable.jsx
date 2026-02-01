"use client";

import {
  Eye,
  Download,
  MoreVertical,
  PauseCircle,
  PlayCircle,
  Trash2,
  Edit2,
  Loader2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

export default function ContractorTable({
  contractors,
  products,
  openContractorModal,
  downloadHandler,
  handleDelete,
  openSuspendModal,
  savePrefix,
  openRolesModal,
  showActionMenu,
  handleOpenActionMenu,
  formatDate,
  setShowActionMenu,
  openProductEditModal,
}) {
  const router = useRouter();
  const [detailedData, setDetailedData] = useState({});
  const [loading, setLoading] = useState({});

  // Fetch detailed data (allowedProducts, roles, etc.)
  useEffect(() => {
    const fetchDetails = async () => {
      const updates = {};
      for (const contractor of contractors) {
        const id = contractor.id;
        if (!detailedData[id]) {
          setLoading((prev) => ({ ...prev, [id]: true }));
          try {
            const res = await fetch(`/api/admin/contractor/${id}`);
            const data = await res.json();
            if (data.success && data.contractor) {
              updates[id] = data.contractor;
            }
          } catch (error) {
            console.error(`Error fetching details for ${id}:`, error);
          } finally {
            setLoading((prev) => ({ ...prev, [id]: false }));
          }
        }
      }
      if (Object.keys(updates).length > 0) {
        setDetailedData((prev) => ({ ...prev, ...updates }));
      }
    };

    if (contractors?.length > 0) {
      fetchDetails();
    }
  }, [contractors, detailedData]);

  // Merge logic: protect prefix from being overwritten
  const getMergedContractor = (contractor) => {
    const detail = detailedData[contractor.id] || {};
    return {
      ...contractor, // list data first (has prefix)
      ...detail, // detail data for other fields
      // Protect prefix fields — always prefer list value if available
      policyNoPrefix: contractor.policyNoPrefix ?? detail.policyNoPrefix,
      isPrefixLocked: contractor.isPrefixLocked ?? detail.isPrefixLocked,
    };
  };

  // Product name lookup
  const getProductName = (id) => {
    if (!id || !products?.length) return `Product ${id || "?"}`;
    const idStr = String(id);
    const product = products.find((p) => String(p._id) === idStr);
    return product?.Measures || product?.name || `Product ${idStr.slice(-6)}`;
  };

  const getProductShortName = (id) => {
    const name = getProductName(id);
    const abbreviations = {
      "External Wall Insulation": "EWI",
      "Cavity Wall Insulation": "Cavity",
      "Loft Insulation": "Loft",
      "Room in Roof Insulation": "Room Roof",
      "Park Home Insulation": "Park Home",
      "Flat Roof Insulation": "Flat Roof",
      "Underfloor Insulation": "Underfloor",
      "Internal Wall Insulation": "IWI",
      "External Wall Insulation (Solid Wall)": "EWI Solid",
      "Hybrid Wall Insulation": "Hybrid",
    };
    return (
      abbreviations[name] ||
      (name.length > 10 ? name.substring(0, 10) + "..." : name)
    );
  };

  const getProductNames = (productIds = []) => {
    if (!productIds?.length) return "None";
    const ids = Array.isArray(productIds) ? productIds : [productIds];
    const names = ids.map(getProductName).filter(Boolean);
    return names.length ? names.join(", ") : "None";
  };

  const getDisplayProducts = (productIds = []) => {
    if (!productIds?.length) {
      return { display: [], count: 0, hasMore: false, fullList: [] };
    }
    const ids = Array.isArray(productIds) ? productIds : [productIds];
    const firstThree = ids.slice(0, 3);
    const shortNames = firstThree.map(getProductShortName);
    const fullNames = ids.map(getProductName);
    return {
      display: shortNames,
      count: fullNames.length,
      hasMore: fullNames.length > 3,
      fullList: fullNames,
    };
  };

  const truncateText = (text, maxLength = 40) => {
    if (!text || text === "None") return "None";
    return text.length <= maxLength
      ? text
      : text.substring(0, maxLength) + "...";
  };

  if (!products) {
    return (
      <div className='hidden md:block bg-white border border-gray-200 rounded-lg p-8 text-center'>
        <Loader2 className='w-8 h-8 animate-spin text-blue-600 mx-auto mb-4' />
        <p className='text-gray-600'>Loading products data...</p>
      </div>
    );
  }

  return (
    <div className='hidden md:block bg-white border border-gray-200 rounded-lg overflow-hidden'>
      <div className='overflow-x-auto'>
        <table className='w-full'>
          <thead className='bg-gray-50 border-b border-gray-200'>
            <tr>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider'>
                Prefix
              </th>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider'>
                Contractor Name
              </th>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider'>
                Company Name
              </th>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider'>
                Email Address
              </th>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider'>
                Phone Number
              </th>
              <th className='px-6 py-3 text-center text-xs font-medium text-gray-600 uppercase tracking-wider'>
                Status
              </th>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider'>
                User Type
              </th>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider'>
                Approved Measures
              </th>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider'>
                Registered Date
              </th>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider'>
                Total Certificates
              </th>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider'>
                Actions
              </th>
            </tr>
          </thead>
          <tbody className='bg-white divide-y divide-gray-100'>
            {contractors.length === 0 ? (
              <tr>
                <td
                  colSpan='11'
                  className='px-6 py-12 text-center text-gray-500'>
                  No contractors found
                </td>
              </tr>
            ) : (
              contractors.map((contractor) => {
                const merged = getMergedContractor(contractor);
                const productsInfo = getDisplayProducts(
                  merged.allowedProducts || [],
                );
                const isLoading = loading[contractor.id];

                return (
                  <tr
                    key={contractor.id}
                    className='hover:bg-gray-50 transition-colors'>
                    {/* Prefix - protected */}
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-600'>
                      {merged.policyNoPrefix ? (
                        <div className='flex items-center gap-2'>
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              merged.isPrefixLocked
                                ? "bg-green-100 text-green-800"
                                : "bg-blue-100 text-blue-800"
                            }`}>
                            {merged.policyNoPrefix}
                          </span>
                          {!merged.isPrefixLocked && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                const newPrefix = prompt(
                                  `Update prefix (current: ${merged.policyNoPrefix}):`,
                                  merged.policyNoPrefix,
                                );
                                if (newPrefix) {
                                  const upper = newPrefix.trim().toUpperCase();
                                  if (/^[A-Z]{3,10}$/.test(upper)) {
                                    savePrefix(contractor.id, upper);
                                  } else {
                                    alert(
                                      "Invalid prefix — 3–10 uppercase letters only",
                                    );
                                  }
                                }
                              }}
                              className='text-blue-700 hover:text-blue-800 text-xs'>
                              Edit
                            </button>
                          )}
                        </div>
                      ) : (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            const newPrefix = prompt(
                              `Set prefix for ${merged.name} (3-10 uppercase letters):`,
                            );
                            if (newPrefix) {
                              const upper = newPrefix.trim().toUpperCase();
                              if (/^[A-Z]{3,10}$/.test(upper)) {
                                savePrefix(contractor.id, upper);
                              } else {
                                alert(
                                  "Prefix must be 3–10 uppercase letters (A-Z)",
                                );
                              }
                            }
                          }}
                          className='text-blue-700 hover:text-blue-800 text-xs underline'>
                          Set Prefix
                        </button>
                      )}
                    </td>

                    <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900'>
                      <button
                        onClick={() =>
                          router.push(
                            `/admin/manage-contractors/${contractor.id}`,
                          )
                        }
                        className='text-blue-700 hover:text-blue-800 hover:underline transition-colors'>
                        {merged.name}
                      </button>
                    </td>

                    <td className='px-6 py-4 text-sm text-gray-600'>
                      {merged.companyName || "N/A"}
                    </td>

                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-600'>
                      {merged.email}
                    </td>

                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-600'>
                      {merged.phoneNumber || "N/A"}
                    </td>

                    <td className='px-6 py-4 whitespace-nowrap text-center'>
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                          merged.isApproved
                            ? merged.isSuspended
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}>
                        {!merged.isApproved
                          ? "Not Approved"
                          : merged.isSuspended
                            ? "Suspended"
                            : "Active"}
                      </span>
                    </td>

                    <td className='px-6 py-4 whitespace-nowrap'>
                      <div className='flex items-center gap-x-1 group'>
                        <div className='flex flex-wrap gap-1.5'>
                          {merged.roles?.length > 0 ? (
                            merged.roles.map((role) => (
                              <span
                                key={role}
                                className='inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-800 capitalize'>
                                {role.replace(/_/g, " ")}
                              </span>
                            ))
                          ) : (
                            <span className='text-gray-500 text-sm italic'>
                              None
                            </span>
                          )}
                        </div>
                        {!merged.isSuspended && merged.isApproved ? (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              openRolesModal(merged);
                            }}
                            className='opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-gray-100'
                            title='Edit roles'>
                            <Edit2 size={16} className='text-gray-500' />
                          </button>
                        ) : (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              alert(
                                merged.isSuspended
                                  ? "This user is currently suspended. You cannot edit roles until unsuspended."
                                  : "This user is not yet approved. Roles can only be assigned to approved users.",
                              );
                            }}
                            className='opacity-50 cursor-not-allowed p-1 rounded'
                            title={
                              merged.isSuspended
                                ? "Suspended - cannot edit"
                                : "Not approved - cannot edit"
                            }>
                            <Edit2 size={16} className='text-gray-400' />
                          </button>
                        )}
                      </div>
                    </td>

                    <td className='px-6 py-4 whitespace-nowrap'>
                      <div className='flex items-center gap-x-1 group'>
                        {isLoading ? (
                          <div className='flex items-center gap-2'>
                            <Loader2 className='w-3 h-3 animate-spin text-gray-400' />
                            <span className='text-xs text-gray-500'>
                              Loading...
                            </span>
                          </div>
                        ) : (
                          <>
                            <div className='max-w-xs'>
                              <div className='flex flex-col gap-1'>
                                <div className='flex flex-wrap gap-1'>
                                  {productsInfo.count > 0 ? (
                                    <>
                                      {productsInfo.display.map(
                                        (product, index) => (
                                          <span
                                            key={index}
                                            className='inline-block px-2 py-1 text-xs font-medium bg-green-50 text-green-800 rounded-full'
                                            title={
                                              productsInfo.fullList[index]
                                            }>
                                            {product}
                                          </span>
                                        ),
                                      )}
                                      {productsInfo.hasMore && (
                                        <span className='inline-block px-2 py-1 text-xs font-medium bg-green-100 text-green-700 rounded-full'>
                                          +{productsInfo.count - 3} more
                                        </span>
                                      )}
                                    </>
                                  ) : (
                                    <span className='text-gray-500 text-sm italic'>
                                      None
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>

                            {!merged.isSuspended && merged.isApproved ? (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openProductEditModal(merged);
                                }}
                                className='opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-gray-100 ml-1'
                                title='Edit approved measures'>
                                <Edit2 size={14} className='text-gray-500' />
                              </button>
                            ) : (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  alert(
                                    merged.isSuspended
                                      ? "This user is currently suspended. You cannot edit measures until unsuspend."
                                      : "This user is not yet approved. Measures can only be assigned to approved users.",
                                  );
                                }}
                                className='opacity-50 cursor-not-allowed p-1 rounded ml-1'
                                title={
                                  merged.isSuspended
                                    ? "Suspended - cannot edit"
                                    : "Not approved - cannot edit"
                                }>
                                <Edit2 size={14} className='text-gray-400' />
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </td>

                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                      {formatDate(merged.createdAt)}
                    </td>

                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                      {merged.certificateCount || 0}
                    </td>

                    <td className='px-6 py-4 whitespace-nowrap'>
                      <div className='flex items-center justify-center gap-2 action-dropdown-container'>
                        <button
                          onClick={() => openContractorModal(merged)}
                          className='text-blue-700 hover:text-blue-800 transition-colors p-1'
                          title='View Details'>
                          <Eye className='w-5 h-5' />
                        </button>

                        <button
                          onClick={() => downloadHandler(contractor.id)}
                          className='text-gray-600 hover:text-gray-800 transition-colors p-1'
                          title='Download Data'>
                          <Download className='w-5 h-5' />
                        </button>

                        <div className='relative'>
                          <button
                            onClick={(e) =>
                              handleOpenActionMenu(contractor.id, e)
                            }
                            className='text-gray-600 hover:text-gray-800 transition-colors p-1'
                            title='More Actions'>
                            <MoreVertical className='w-5 h-5' />
                          </button>

                          {showActionMenu === contractor.id && (
                            <div className='absolute right-0 top-full mt-1 w-48 bg-white rounded-lg border border-gray-200 z-50 shadow-xl'>
                              <div className='py-1'>
                                {merged.isApproved && !merged.isSuspended && (
                                  <button
                                    onClick={() =>
                                      openSuspendModal(merged, "suspend")
                                    }
                                    className='w-full text-left px-4 py-2 text-sm text-yellow-700 hover:bg-yellow-50 flex items-center gap-2'>
                                    <PauseCircle className='w-4 h-4' />
                                    Suspend User
                                  </button>
                                )}
                                {merged.isSuspended && (
                                  <button
                                    onClick={() =>
                                      openSuspendModal(merged, "unsuspend")
                                    }
                                    className='w-full text-left px-4 py-2 text-sm text-green-700 hover:bg-green-50 flex items-center gap-2'>
                                    <PlayCircle className='w-4 h-4' />
                                    Unsuspend User
                                  </button>
                                )}
                                <div className='border-t border-gray-200 my-1' />
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
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
