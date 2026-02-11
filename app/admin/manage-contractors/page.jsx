"use client";

import ContractorCards from "@/components/Admin/ManageContractor/ContractorCards";
import ContractorModal from "@/components/Admin/ManageContractor/ContractorModal";
import ContractorTable from "@/components/Admin/ManageContractor/ContractorTable";
import HeaderSection from "@/components/Admin/ManageContractor/HeaderSection";
import Pagination from "@/components/Admin/ManageContractor/Pagination";
import ProductEditModal from "@/components/Admin/ManageContractor/ProductEditModal";
import RolesModal from "@/components/Admin/ManageContractor/RolesModal";
import StatsGrid from "@/components/Admin/ManageContractor/StatsGrid";
import SuspendModal from "@/components/Admin/ManageContractor/SuspendModal";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";

// Import components

export default function ManageContractorsPage() {
  const router = useRouter();
  const [contractors, setContractors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [documentsLoading, setDocumentsLoading] = useState(false);
  const [contractorDocuments, setContractorDocuments] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [selectedContractor, setSelectedContractor] = useState(null);
  const [showContractorModal, setShowContractorModal] = useState(false);
  const [loader2, setLoader2] = useState(false);

  // Action menu states
  const [showActionMenu, setShowActionMenu] = useState(null);
  const [suspendReason, setSuspendReason] = useState("");
  const [showSuspendModal, setShowSuspendModal] = useState(false);
  const [selectedContractorForAction, setSelectedContractorForAction] =
    useState(null);
  const [actionType, setActionType] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [prefixInput, setPrefixInput] = useState("");
  const [savingPrefix, setSavingPrefix] = useState(false);

  // Roles modal states
  const [showRolesModal, setShowRolesModal] = useState(false);
  const [editingContractor, setEditingContractor] = useState(null);

  // Product Edit Modal
  const [products, setProducts] = useState([]);
  const [showProductEditModal, setShowProductEditModal] = useState(false);
  const [
    selectedContractorForProductEdit,
    setSelectedContractorForProductEdit,
  ] = useState(null);

  // Product assignment
  const [selectedProductIds, setSelectedProductIds] = useState([]);

  const itemsPerPage = 10;

  // Fetch contractors
  const fetchContractors = useCallback(async () => {
    try {
      console.log("Fetching contractors...");
      const res = await fetch("/api/admin/contractor");
      const data = await res.json();
      // console.log("Fetched contractors:", data.users);

      if (data.success) {
        setContractors(data.users);
      }
    } catch (error) {
      console.error("Error fetching contractors:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch documents for a specific contractor
  const fetchContractorDocuments = async (contractorId) => {
    try {
      setDocumentsLoading(true);
      const res = await fetch(`/api/document?userId=${contractorId}`);
      const data = await res.json();

      if (data.success) {
        setContractorDocuments((prev) => ({
          ...prev,
          [contractorId]: data.documents || [],
        }));
        return data.documents || [];
      }
      return [];
    } catch (error) {
      console.error("Error fetching documents:", error);
      return [];
    } finally {
      setDocumentsLoading(false);
    }
  };

  useEffect(() => {
    fetchContractors();
  }, [fetchContractors]);

  // to fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch("/api/admin/products");
        const data = await res.json();
        if (data.success) {
          setProducts(data.products || []);
        }
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };

    fetchProducts();
  }, []);

  // Save prefix
  const savePrefix = async (contractorId, prefix) => {
    try {
      setSavingPrefix(true);

      const res = await fetch("/api/admin/contractor/prefix", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contractorId, prefix }),
      });

      const data = await res.json();

      if (data.success) {
        alert(`Prefix set to ${prefix}`);
        await fetchContractors();

        if (selectedContractor?.id === contractorId) {
          setSelectedContractor((prev) => ({
            ...prev,
            policyNoPrefix: prefix,
            isPrefixLocked: false,
          }));
        }

        setPrefixInput("");
      } else {
        alert(data.error || "Failed to set prefix");
      }
    } catch (error) {
      console.error("Save prefix error:", error);
      alert("Failed to save prefix");
    } finally {
      setSavingPrefix(false);
    }
  };

  // To open the product edit modal
  const openProductEditModal = (contractor) => {
    setSelectedContractorForProductEdit(contractor);
    setShowProductEditModal(true);
  };

  //To close the product edit modal
  const closeProductEditModal = () => {
    setShowProductEditModal(false);
    setSelectedContractorForProductEdit(null);
  };
  // Save allowed products
  const handleSaveAllowedProducts = async () => {
    if (!selectedContractor?.id) {
      toast.error("No contractor selected");
      return;
    }

    try {
      setActionLoading(true);

      const res = await fetch(
        `/api/admin/contractor/${selectedContractor.id}/products`,
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

        setSelectedContractor((prev) => ({
          ...prev,
          allowedProducts: selectedProductIds,
        }));

        fetchContractors();
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

  // Open contractor modal
  const openContractorModal = async (contractor) => {
    setSelectedContractor(contractor);
    setShowContractorModal(true);

    try {
      const res = await fetch(`/api/admin/contractor/${contractor.id}`);
      const data = await res.json();

      if (data.success && data.contractor) {
        const fresh = data.contractor;
        setSelectedContractor(fresh);

        const existingIds = (fresh.allowedProducts || []).map((id) =>
          id.toString(),
        );
        console.log("Existing allowed products from DB:", existingIds);
        setSelectedProductIds(existingIds);
      }

      if (!contractorDocuments[contractor.id]) {
        await fetchContractorDocuments(contractor.id);
      }

      // Fetch certificates
      const certsRes = await fetch(
        `/api/admin/certificates?contractorId=${contractor.id}`,
      );

      if (certsRes.ok) {
        const certsData = await certsRes.json();
        if (certsData.success) {
          const certificateCount = certsData.certificates?.length || 0;
          const lastCertificateDate =
            certsData.certificates?.length > 0
              ? certsData.certificates.sort(
                  (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
                )[0].createdAt
              : null;

          setSelectedContractor((prev) => ({
            ...prev,
            certificateCount: certificateCount,
            lastCertificateDate: lastCertificateDate,
          }));
        }
      }

      // Fetch pending requests
      try {
        const requestsRes = await fetch(
          `/api/admin/contractor?type=requests&contractorId=${contractor.id}&status=pending`,
        );
        if (requestsRes.ok) {
          const requestsData = await requestsRes.json();

          if (requestsData.success) {
            const pendingCount = requestsData.requests?.length || 0;
            setSelectedContractor((prev) => ({
              ...prev,
              pendingRequests: pendingCount,
            }));
          }
        }
      } catch (error) {
        console.error("Error fetching pending requests:", error);
      }
    } catch (error) {
      console.error("Error in openContractorModal:", error);
    }
  };

  // Close contractor modal
  const closeContractorModal = () => {
    setShowContractorModal(false);
    setSelectedContractor(null);
  };

  // Get documents for a contractor
  const getContractorDocuments = (contractorId) => {
    return contractorDocuments[contractorId] || [];
  };

  // View document in new tab
  const handleViewDocument = (document) => {
    const documentUrl = `${window.location.origin}${document.ducoment}`;
    window.open(documentUrl, "_blank");
  };

  // Filter contractors by search
  const filteredContractors = contractors.filter((contractor) => {
    return (
      searchTerm === "" ||
      contractor.companyName
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      contractor.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contractor.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  // Pagination
  const totalPages = Math.ceil(filteredContractors.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentContractors = filteredContractors.slice(startIndex, endIndex);

  // Download handler
  const downloadHandler = async (contractorId) => {
    setLoader2(true);
    try {
      const contractorRes = await fetch(
        `/api/admin/contractor/${contractorId}`,
      );
      if (!contractorRes.ok) throw new Error("Failed to load contractor");
      const contractorData = await contractorRes.json();
      if (!contractorData.success) throw new Error("Contractor fetch failed");

      const contractor = contractorData.contractor || {
        name: "Unknown",
        companyName: "Unknown",
        email: "N/A",
        phone: "N/A",
        address: "N/A",
      };

      const certsRes = await fetch(
        `/api/admin/certificates?contractorId=${contractorId}&brief=true`,
      );
      if (!certsRes.ok) throw new Error("Failed to load certificates");
      const certsData = await certsRes.json();

      if (!certsData.success || !certsData.certificates?.length) {
        alert("No certificates found for this contractor");
        return;
      }

      const certificateIds = certsData.certificates.map((cert) => {
        const id = cert.id || cert._id;
        return id.split("-")[0];
      });

      // Import downloadPdf function (make sure it's available)
      const { downloadPdf } = await import("@/utils/pdfGenerator");

      for (const certId of certificateIds) {
        try {
          const singleCertRes = await fetch(
            `/api/admin/certificates/${certId}`,
          );
          if (singleCertRes.ok) {
            const singleCertData = await singleCertRes.json();
            if (singleCertData.success && singleCertData.certificate) {
              const completeCertificate = {
                ...singleCertData.certificate,
                policyNo:
                  singleCertData.certificate.policyNo ||
                  singleCertData.certificate.policyNumber,
                policyNumber:
                  singleCertData.certificate.policyNumber ||
                  singleCertData.certificate.policyNo,
                holderName:
                  singleCertData.certificate.holderName ||
                  singleCertData.certificate.policyHolderName,
                rawData: singleCertData.certificate.rawData || {
                  insurance: {
                    contractorName:
                      singleCertData.certificate.contractorName ||
                      contractor.name,
                    contractorAddress: contractor.address || "",
                    policyHolderName:
                      singleCertData.certificate.holderName ||
                      singleCertData.certificate.policyHolderName,
                    email: singleCertData.certificate.email || contractor.email,
                    phone: singleCertData.certificate.phone || contractor.phone,
                    address: singleCertData.certificate.address || "",
                    country: singleCertData.certificate.country || "",
                    postcode: singleCertData.certificate.postcode || "",
                  },
                  product: {
                    productType: singleCertData.certificate.productType,
                    coverOption: "Insurance Backed Guarantee",
                  },
                },
              };

              await downloadPdf(completeCertificate, contractor);
              await new Promise((r) => setTimeout(r, 400));
            }
          }
        } catch (error) {
          console.error(`Error fetching certificate ${certId}:`, error);
        }
      }

      alert(`Successfully downloaded certificates`);
    } catch (error) {
      console.error("Download handler error:", error);
      alert("Error generating certificates: " + error.message);
    } finally {
      setLoader2(false);
    }
  };

  // Handle delete contractor
  const handleDelete = async (contractorId) => {
    const contractorToDelete = contractors.find((c) => c.id === contractorId);

    if (!contractorToDelete) {
      alert("Contractor not found in current list");
      return;
    }

    if (
      !confirm(
        `Are you sure you want to delete ${contractorToDelete.name} (${contractorToDelete.companyName})? This action cannot be undone.`,
      )
    ) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/contractor/${contractorId}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (data.success) {
        setContractors((prev) => prev.filter((c) => c.id !== contractorId));
        alert("Contractor deleted successfully");
      } else {
        alert(`Failed to delete contractor: ${data.error}`);
      }
    } catch (error) {
      console.error("Delete error:", error);
      alert("Failed to delete contractor. Check console for details.");
    }
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  // Action menu handlers
  const closeAllMenus = () => {
    setShowActionMenu(null);
  };

  const handleOpenActionMenu = (contractorId, e) => {
    e.stopPropagation();
    setShowActionMenu(showActionMenu === contractorId ? null : contractorId);
  };

  // Handle suspend/unsuspend action
  const handleSuspendAction = async (
    contractorId,
    shouldSuspend,
    reason = "",
  ) => {
    try {
      setActionLoading(true);

      const res = await fetch(`/api/admin/contractor/${contractorId}/suspend`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          isSuspended: shouldSuspend,
          reason: reason,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || `HTTP error! status: ${res.status}`);
      }

      if (data.success) {
        setContractors((prev) =>
          prev.map((c) =>
            c.id === contractorId
              ? {
                  ...c,
                  isSuspended: data.user.isSuspended,
                  suspensionReason: data.user.suspensionReason,
                  suspendedAt: data.user.suspendedAt,
                }
              : c,
          ),
        );

        if (selectedContractor?.id === contractorId) {
          setSelectedContractor((prev) => ({
            ...prev,
            isSuspended: data.user.isSuspended,
            suspensionReason: data.user.suspensionReason,
            suspendedAt: data.user.suspendedAt,
          }));
        }

        alert(data.message);
      } else {
        alert(`Failed: ${data.error}`);
      }
    } catch (error) {
      console.error("Error updating suspension status:", error);
      alert(`Failed to update user status: ${error.message}`);
    } finally {
      setActionLoading(false);
      setShowSuspendModal(false);
      setSuspendReason("");
      setShowActionMenu(null);
      setSelectedContractorForAction(null);
    }
  };

  // Open suspend modal
  const openSuspendModal = (contractor, type) => {
    setSelectedContractorForAction(contractor);
    setActionType(type);
    setSuspendReason(contractor.suspensionReason || "");
    setShowSuspendModal(true);
    setShowActionMenu(null);
  };

  // Open roles modal
  const openRolesModal = (contractor) => {
    if (!contractor.isApproved) {
      alert(
        "This user is not yet approved. Roles can only be assigned to approved users.",
      );
      return;
    }

    if (contractor.isSuspended) {
      alert(
        "This user is currently suspended. You cannot edit roles until unsuspend them.",
      );
      return;
    }

    setEditingContractor(contractor);
    setShowRolesModal(true);
  };

  // Close roles modal
  const closeRolesModal = () => {
    setShowRolesModal(false);
    setEditingContractor(null);
  };

  // Close click outside handler
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest(".action-dropdown-container")) {
        closeAllMenus();
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  if (loading) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <div className='text-blue-600 text-lg'>Loading contractors...</div>
      </div>
    );
  }

  if (loader2) {
    return (
      <div className='fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center'>
        <div className='bg-white rounded-xl shadow-2xl p-8 max-w-md w-full mx-4'>
          <div className='text-center'>
            <div className='relative w-20 h-20 mx-auto mb-6'>
              <Loader2 className='w-20 h-20 text-blue-600 animate-spin' />
            </div>
            <h3 className='text-xl font-bold text-gray-800 mb-3'>
              Downloading Certificates
            </h3>
            <div className='space-y-4 mb-6'>
              <div className='flex items-center gap-3'>
                <div className='w-2 h-2 bg-blue-600 rounded-full'></div>
                <span className='text-gray-700'>Downloading data...</span>
              </div>
              <div className='flex items-center gap-3'>
                <div className='w-2 h-2 bg-blue-600 rounded-full'></div>
                <span className='text-gray-700'>Processing files...</span>
              </div>
              <div className='flex items-center gap-3'>
                <div className='w-2 h-2 bg-blue-600 rounded-full animate-pulse'></div>
                <span className='text-gray-700'>Scanning for errors...</span>
              </div>
            </div>
            <p className='text-gray-500 text-sm'>
              Please wait while we prepare your certificates. This will take a
              few seconds.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-white p-4 md:p-8'>
      {/* Header Section */}
      <HeaderSection
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
      />

      {/* Stats Grid */}
      <StatsGrid contractors={contractors} />

      {/* Contractor Cards (Mobile) */}
      <ContractorCards
        contractors={currentContractors}
        openContractorModal={openContractorModal}
        downloadHandler={downloadHandler}
        handleDelete={handleDelete}
        openSuspendModal={openSuspendModal}
        formatDate={formatDate}
        showActionMenu={showActionMenu}
        handleOpenActionMenu={handleOpenActionMenu}
        setShowActionMenu={setShowActionMenu}
      />

      {/* Contractor Table (Desktop) */}
      <ContractorTable
        contractors={currentContractors}
        products={products}
        openContractorModal={openContractorModal}
        downloadHandler={downloadHandler}
        handleDelete={handleDelete}
        openSuspendModal={openSuspendModal}
        savePrefix={savePrefix}
        openRolesModal={openRolesModal}
        openProductEditModal={openProductEditModal}
        showActionMenu={showActionMenu}
        handleOpenActionMenu={handleOpenActionMenu}
        formatDate={formatDate}
        setShowActionMenu={setShowActionMenu}
      />

      {/* Pagination */}
      <Pagination
        totalPages={totalPages}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        startIndex={startIndex}
        endIndex={endIndex}
        totalItems={filteredContractors.length}
        itemsPerPage={itemsPerPage}
      />

      {/* Contractor Details Modal */}
      <ContractorModal
        showContractorModal={showContractorModal}
        selectedContractor={selectedContractor}
        documentsLoading={documentsLoading}
        getContractorDocuments={getContractorDocuments}
        handleViewDocument={handleViewDocument}
        closeContractorModal={closeContractorModal}
        handleDelete={handleDelete}
        selectedProductIds={selectedProductIds}
        setSelectedProductIds={setSelectedProductIds}
        actionLoading={actionLoading}
        handleSaveAllowedProducts={handleSaveAllowedProducts}
        prefixInput={prefixInput}
        setPrefixInput={setPrefixInput}
        savePrefix={savePrefix}
        formatDate={formatDate}
      />

      {/* Suspend Modal */}
      <SuspendModal
        showSuspendModal={showSuspendModal}
        selectedContractorForAction={selectedContractorForAction}
        actionType={actionType}
        suspendReason={suspendReason}
        setSuspendReason={setSuspendReason}
        handleSuspendAction={handleSuspendAction}
        setShowSuspendModal={setShowSuspendModal}
        setSelectedContractorForAction={setSelectedContractorForAction}
        actionLoading={actionLoading}
      />

      {/* Roles Modal */}
      <RolesModal
        showRolesModal={showRolesModal}
        editingContractor={editingContractor}
        setEditingContractor={setEditingContractor}
        closeRolesModal={closeRolesModal}
        fetchContractors={fetchContractors}
      />

      {/* Product Edit Modal */}
      <ProductEditModal
        products={products}
        showProductEditModal={showProductEditModal}
        selectedContractorForProductEdit={selectedContractorForProductEdit}
        setSelectedContractorForProductEdit={
          setSelectedContractorForProductEdit
        }
        closeProductEditModal={closeProductEditModal}
        fetchContractors={fetchContractors}
      />
    </div>
  );
}
