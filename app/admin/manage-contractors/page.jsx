"use client";

import { downloadPdf } from "@/utils/pdfGenerator";
import {
  ChevronLeft,
  ChevronRight,
  Download,
  Eye,
  FileText,
  Loader2,
  Menu,
  Search,
  Trash2,
  X,
  MoreVertical, 
  PauseCircle, 
  PlayCircle, 
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

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
  const [contractor, setContractor] = useState(null);
  const [certificates, setCertificates] = useState(null);
  const [loader2, setLoader2] = useState(false);

  // NEW STATES FOR SUSPEND FUNCTIONALITY
  const [showActionMenu, setShowActionMenu] = useState(null);
  const [suspendReason, setSuspendReason] = useState("");
  const [showSuspendModal, setShowSuspendModal] = useState(false);
  const [selectedContractorForAction, setSelectedContractorForAction] =
    useState(null);
  const [actionType, setActionType] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const itemsPerPage = 10;

  // Fetch contractors
  const fetchContractors = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/contractor");
      const data = await res.json();
      console.log("Fetched contractors data:", data); // Add this line
      console.log("Full response:", data.users);
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

  const fetchData = async (contractorId) => {
    try {
      setLoading(true);

      console.log("Fetching data for contractor ID:", contractorId);

      // Fetch contractor details
      const contractorRes = await fetch(
        `/api/admin/contractor/${contractorId}`
      );

      console.log("Contractor response status:", contractorRes.status);

      if (!contractorRes.ok) {
        throw new Error(`Failed to fetch contractor: ${contractorRes.status}`);
      }

      const contractorText = await contractorRes.text();
      console.log(
        "Contractor response text (first 500 chars):",
        contractorText.substring(0, 500)
      );

      if (!contractorText) {
        throw new Error("Empty response from contractor API");
      }

      const contractorData = JSON.parse(contractorText);

      if (!contractorData.success) {
        throw new Error(
          contractorData.error || "Failed to fetch contractor data"
        );
      }

      setContractor(contractorData.contractor);

      // Fetch certificates for this contractor
      const certsRes = await fetch(
        `/api/admin/certificates?contractorId=${contractorId}`
      );

      console.log("Certificates response status:", certsRes);

      if (!certsRes.ok) {
        throw new Error(`Failed to fetch certificates: ${certsRes.status}`);
      }

      const certsText = await certsRes.text();
      // console.log(
      //   "Certificates response text (first 500 chars):",
      //   certsText.substring(0, 500)
      // );

      if (!certsText) {
        console.warn("Empty response from certificates API, using empty array");
        setCertificates([]);
        return;
      }

      const certsData = JSON.parse(certsText);

      if (certsData.success) {
        setCertificates(certsData.certificates || []);
      } else {
        console.error("Certificates API error:", certsData.error);
        setCertificates([]);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      alert(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContractors();
  }, [fetchContractors]);

  // Open contractor details modal and fetch documents
  const openContractorModal = async (contractor) => {
    setSelectedContractor(contractor);
    setShowContractorModal(true);

    try {
      // Fetch documents for this contractor
      if (!contractorDocuments[contractor.id]) {
        await fetchContractorDocuments(contractor.id);
      }

      // FETCH CERTIFICATES USING THE SAME ENDPOINT AS ContractorCertificatesPage
      console.log("Fetching certificates for contractor ID:", contractor.id);

      const certsRes = await fetch(
        `/api/admin/certificates?contractorId=${contractor.id}`
      );

      if (certsRes.ok) {
        const certsData = await certsRes.json();
        console.log("Certificates data:", certsData);

        if (certsData.success) {
          const certificateCount = certsData.certificates?.length || 0;
          const lastCertificateDate =
            certsData.certificates?.length > 0
              ? certsData.certificates.sort(
                  (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
                )[0].createdAt
              : null;

          console.log("Actual certificate count:", certificateCount);
          console.log("Last certificate date:", lastCertificateDate);

          // Update contractor with REAL data
          setSelectedContractor((prev) => ({
            ...prev,
            certificateCount: certificateCount,
            lastCertificateDate: lastCertificateDate,
          }));
        }
      }

      // FETCH PENDING REQUESTS
      try {
        const requestsRes = await fetch(
          `/api/admin/contractor?type=requests&contractorId=${contractor.id}&status=pending`
        );
        if (requestsRes.ok) {
          const requestsData = await requestsRes.json();

          if (requestsData.success) {
            const pendingCount = requestsData.requests?.length || 0;
            console.log("Pending requests count:", pendingCount);

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

  // Handle document download
  const downloadPdfDocument = async (document) => {
    try {
      // Create full URL for the document
      const documentUrl = `${window.location.origin}${document.ducoment}`;

      // Create a temporary link element
      const link = document.createElement("a");
      link.href = documentUrl;
      link.download = document.title || `document-${document._id}.pdf`;
      link.target = "_blank";

      // Append to body, click and remove
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Error downloading document:", error);
      alert("Failed to download document. Please try again.");
    }
  };

  // View document in new tab
  const handleViewDocument = (document) => {
    const documentUrl = `${window.location.origin}${document.ducoment}`;
    window.open(documentUrl, "_blank");
  };

  // Filter contractors by search
  console.log("contractor", contractors)
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
console.log("sjhdfyuewgytfgsdyfhus", currentContractors)
  // Handle download contractor data - Generate certificate PDF

  // const downloadHandler = async (contractorId) => {
  //   setLoader2(true);
  //   try {
  //     // Fetch contractor details
  //     const contractorRes = await fetch(
  //       `/api/admin/contractor/${contractorId}`
  //     );

  //     if (!contractorRes.ok) {
  //       throw new Error(`Failed to fetch contractor: ${contractorRes.status}`);
  //       setLoader2(false);
  //     }

  //     const contractorData = await contractorRes.json();

  //     if (!contractorData.success) {
  //       throw new Error(
  //         contractorData.error || "Failed to fetch contractor data"
  //       );
  //       setLoader2(false);
  //     }

  //     // Fetch certificates for this contractor
  //     const certsRes = await fetch(
  //       `/api/admin/certificates?contractorId=${contractorId}`
  //     );
  //     setLoader2(false);

  //     if (!certsRes.ok) {
  //       throw new Error(`Failed to fetch certificates: ${certsRes.status}`);
  //       setLoader2(false);
  //     }

  //     const certsData = await certsRes.json();

  //     if (
  //       certsData.success &&
  //       certsData.certificates &&
  //       certsData.certificates.length > 0
  //     ) {
  //       // যদি একটাই certificate থাকে
  //       if (certsData.certificates.length === 1) {
  //         await downloadPdf(certsData.certificates[0], contractor);
  //         setLoader2(false);
  //       }
  //       // যদি একাধিক certificate থাকে
  //       else {
  //         // প্রতিটি certificate এর জন্য একেকটা PDF generate করুন
  //         for (const certificate of certsData.certificates) {
  //           await downloadPdf(certificate, contractor);
  //           // প্রতিটি ডাউনলোডের মধ্যে সামান্য ডিলে (optional)
  //           await new Promise((resolve) => setTimeout(resolve, 500));
  //           setLoader2(false);
  //         }
  //       }
  //     } else {
  //       alert("No certificates found for this contractor");
  //       setLoader2(false);
  //     }
  //   } catch (error) {
  //     console.error("Download error:", error);
  //     alert(`Error: ${error.message}`);
  //     setLoader2(false);
  //   } finally {
  //     setLoader2(false);
  //   }
  // };

  const downloadHandler = async (contractorId) => {
  setLoader2(true);
  try {
    // 1. Get contractor
    const contractorRes = await fetch(`/api/admin/contractor/${contractorId}`);
    if (!contractorRes.ok) throw new Error("Failed to load contractor");
    const contractorData = await contractorRes.json();
    if (!contractorData.success) throw new Error("Contractor fetch failed");

    const contractor = contractorData.contractor;

    // 2. Get certificates
    const certsRes = await fetch(`/api/admin/certificates?contractorId=${contractorId}`);
    if (!certsRes.ok) throw new Error("Failed to load certificates");
    const certsData = await certsRes.json();

    if (!certsData.success || !certsData.certificates?.length) {
      alert("No certificates found for this contractor");
      return;
    }

    // 3. Download one or multiple
    if (certsData.certificates.length === 1) {
      await downloadPdf(certsData.certificates[0], contractor);
    } else {
      for (const cert of certsData.certificates) {
        await downloadPdf(cert, contractor);
        await new Promise(r => setTimeout(r, 400)); // prevent browser blocking
      }
    }
  } catch (error) {
    console.error("Download handler error:", error);
    alert("Error generating certificates: " + error.message);
  } finally {
    setLoader2(false);
  }
};

  const downloadPdfSelected = async () => {
    if (selectedRows.length === 0) {
      alert("Please select certificates to download");
      return;
    }

    try {
      setDownloadingAll(true);
      const selectedCerts = certificates.filter((cert) =>
        selectedRows.includes(cert.id)
      );
      for (const cert of selectedCerts) {
        await downloadPdf(cert.id);
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
    } catch (error) {
      console.error("Download error:", error);
      alert("Failed to download certificates");
    } finally {
      setDownloadingAll(false);
    }
  };

  // downloadPdfSingle
  const downloadPdfSingle = async (certificate) => {
    try {
      setDownloading(true);
      await downloadPdf(certificate.id);
    } catch (error) {
      console.error("Download error:", error);
      alert("Failed to download certificate");
    } finally {
      setDownloading(false);
    }
  };

  // Handle delete contractor
  const handleDelete = async (contractorId) => {
    console.log("DELETE clicked");
    console.log("Contractor ID to delete:", contractorId);
    console.log("Contractor ID type:", typeof contractorId);
    console.log("Contractor ID length:", contractorId?.length);

    // Find the contractor in current state to verify
    const contractorToDelete = contractors.find((c) => c.id === contractorId);
    console.log("Contractor to delete from state:", contractorToDelete);

    if (!contractorToDelete) {
      console.error("Contractor not found in state!");
      alert("Contractor not found in current list");
      return;
    }

    if (
      !confirm(
        `Are you sure you want to delete ${contractorToDelete.name} (${contractorToDelete.companyName})? This action cannot be undone.`
      )
    ) {
      return;
    }

    try {
      console.log(`Calling DELETE /api/admin/contractor/${contractorId}`);

      const res = await fetch(`/api/admin/contractor/${contractorId}`, {
        method: "DELETE",
      });

      console.log("Response status:", res.status);
      console.log(
        "Response headers:",
        Object.fromEntries(res.headers.entries())
      );

      const data = await res.json();
      console.log("Response data:", data);

      if (data.success) {
        console.log("Delete successful, updating state...");
        // Remove contractor from list
        setContractors((prev) => prev.filter((c) => c.id !== contractorId));
        alert("Contractor deleted successfully");
      } else {
        console.error("Delete failed:", data.error);
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

  // ========== SUSPEND FUNCTIONS START ==========

  // Close all dropdown menus
  const closeAllMenus = () => {
    setShowActionMenu(null);
  };

  // Open action menu dropdown
  const handleOpenActionMenu = (contractorId, e) => {
    e.stopPropagation();
    setShowActionMenu(showActionMenu === contractorId ? null : contractorId);
  };

  // Handle suspend/unsuspend action
  const handleSuspendAction = async (
    contractorId,
    shouldSuspend,
    reason = ""
  ) => {
    try {
      setActionLoading(true);

      console.log(
        "Calling suspend API for:",
        contractorId,
        "shouldSuspend:",
        shouldSuspend
      );

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

      console.log("API Response status:", res.status);

      const data = await res.json();
      console.log("API Response data:", data);

      if (!res.ok) {
        throw new Error(data.error || `HTTP error! status: ${res.status}`);
      }

      if (data.success) {
        // Update local state - FIXED: Use the returned data from API
        setContractors((prev) =>
          prev.map((c) =>
            c.id === contractorId
              ? {
                  ...c,
                  isSuspended: data.user.isSuspended,
                  suspensionReason: data.user.suspensionReason,
                  suspendedAt: data.user.suspendedAt,
                }
              : c
          )
        );

        // Update selected contractor if modal is open
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
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-blue-600 text-lg">Loading contractors...</div>
      </div>
    );
  }

  if (loader2) {
    return (
      <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full mx-4">
          <div className="text-center">
            {/* Simple Spinner */}
            <div className="relative w-20 h-20 mx-auto mb-6">
              <Loader2 className="w-20 h-20 text-blue-600 animate-spin" />
            </div>

            {/* Simple Text */}
            <h3 className="text-xl font-bold text-gray-800 mb-3">
              Downloading Certificates
            </h3>

            {/* Simple Progress Steps */}
            <div className="space-y-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                <span className="text-gray-700">Downloading data...</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                <span className="text-gray-700">Processing files...</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
                <span className="text-gray-700">Scanning for errors...</span>
              </div>
            </div>

            {/* Simple Progress Bar */}

            {/* Simple Message */}
            <p className="text-gray-500 text-sm">
              Please wait while we prepare your certificates. This will take a
              few seconds.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Suspend Modal Component
  const SuspendModal = () => {
    // Create a local state for the reason
    const [localReason, setLocalReason] = useState(suspendReason);

    // Update local reason when modal opens
    useEffect(() => {
      setLocalReason(suspendReason);
    }, []);

    const handleReasonChange = (e) => {
      setLocalReason(e.target.value);
    };

    const handleSubmit = () => {
      // Update the main state with the local value
      setSuspendReason(localReason);
      handleSuspendAction(
        selectedContractorForAction.id,
        actionType === "suspend",
        localReason
      );
    };

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
          <div className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div
                className={`p-2 rounded-full ${
                  actionType === "suspend"
                    ? "bg-yellow-100 text-yellow-600"
                    : "bg-green-100 text-green-600"
                }`}
              >
                {actionType === "suspend" ? (
                  <PauseCircle className="w-6 h-6" />
                ) : (
                  <PlayCircle className="w-6 h-6" />
                )}
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {actionType === "suspend" ? "Suspend User" : "Unsuspend User"}
                </h3>
                <p className="text-sm text-gray-600">
                  {selectedContractorForAction?.name} •{" "}
                  {selectedContractorForAction?.companyName}
                </p>
              </div>
            </div>

            <p className="text-gray-600 mb-4">
              {actionType === "suspend"
                ? `User will be blocked from logging in until unsuspended.`
                : `User will regain access to their account immediately.`}
            </p>

            {actionType === "suspend" && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reason for suspension (optional):
                </label>
                <textarea
                  value={localReason}
                  onChange={handleReasonChange}
                  onInput={handleReasonChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none"
                  rows="3"
                  placeholder="Enter reason for suspension..."
                />
                <p className="text-xs text-gray-500 mt-1">
                  This message will be shown to the user when they try to log
                  in.
                </p>
              </div>
            )}

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  setShowSuspendModal(false);
                  setSuspendReason("");
                  setSelectedContractorForAction(null);
                }}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors text-sm font-medium"
                disabled={actionLoading}
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className={`px-4 py-2 rounded-lg transition-colors text-sm font-medium ${
                  actionType === "suspend"
                    ? "bg-yellow-600 hover:bg-yellow-700 text-white"
                    : "bg-green-600 hover:bg-green-700 text-white"
                }`}
                disabled={actionLoading}
              >
                {actionLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                ) : actionType === "suspend" ? (
                  "Suspend User"
                ) : (
                  "Unsuspend User"
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-white p-4 md:p-8">
      {/* Contractor Details Modal */}
      {showContractorModal && selectedContractor && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-4 bg-gray-50 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <button
                  onClick={closeContractorModal}
                  className="text-gray-600 hover:text-gray-900 text-2xl p-1"
                  title="Back"
                >
                  ≫
                </button>
              </div>
              <div className="flex items-center gap-3">
                <span
                  className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                    selectedContractor.isApproved
                      ? selectedContractor.isSuspended
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {!selectedContractor.isApproved
                    ? "Not Approved"
                    : selectedContractor.isSuspended
                    ? "Suspended"
                    : "Active"}
                </span>
                {/* <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    selectedContractor.isApproved
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {selectedContractor.isApproved ? "Active" : "Inactive"}
                </span> */}
                {/* <button
                  onClick={() => downloadPdf(selectedContractor.id)}
                  className="text-gray-600 hover:text-gray-900 p-1"
                  title="Download Data"
                >
                  <Download className="w-5 h-5" />
                </button> */}
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              {/* Details Grid */}
              <div className="space-y-4">
                <div className="space-y-4">
                  <div className="flex justify-between items-start py-3 border-b border-gray-100">
                    <div className="text-sm font-medium text-gray-700">
                      Create Account Date
                    </div>
                    <div className="text-sm text-gray-900 text-right">
                      {formatDate(selectedContractor.createdAt)}
                    </div>
                  </div>

                  <div className="flex justify-between items-start py-3 border-b border-gray-100">
                    <div className="text-sm font-medium text-gray-700">
                      Contractor Name
                    </div>
                    <div className="text-sm text-gray-900 text-right">
                      <Link
                        href={`/admin/manage-contractors/${selectedContractor.id}`}
                        className="text-blue-600 hover:text-blue-800 hover:underline transition-colors"
                        target="_blank"
                      >
                        {selectedContractor.name || "N/A"}
                      </Link>
                    </div>
                  </div>

                  <div className="flex justify-between items-start py-3 border-b border-gray-100">
                    <div className="text-sm font-medium text-gray-700">
                      Company Name
                    </div>
                    <div className="text-sm text-gray-900 text-right">
                      {selectedContractor.companyName || "N/A"}
                    </div>
                  </div>

                  <div className="flex justify-between items-start py-3 border-b border-gray-100">
                    <div className="text-sm font-medium text-gray-700">
                      Company Address
                    </div>
                    <div className="text-sm text-gray-900 text-right">
                      {selectedContractor.address || "N/A"}
                    </div>
                  </div>

                  <div className="flex justify-between items-start py-3 border-b border-gray-100">
                    <div className="text-sm font-medium text-gray-700">
                      Phone Number
                    </div>
                    <div className="text-sm text-gray-900 text-right">
                      {selectedContractor.phone || "N/A"}
                    </div>
                  </div>

                  <div className="flex justify-between items-start py-3 border-b border-gray-100">
                    <div className="text-sm font-medium text-gray-700">
                      Email Address
                    </div>
                    <div className="text-sm text-gray-900 text-right">
                      <a
                        href={`mailto:${selectedContractor.email}`}
                        className="text-blue-600 hover:text-blue-800 hover:underline"
                      >
                        {selectedContractor.email}
                      </a>
                    </div>
                  </div>

                  {/* Additional Stats - Replace with real API data */}
                  <div className="flex justify-between items-start py-3 border-b border-gray-100">
                    <div className="text-sm font-medium text-gray-700">
                      Total Certificate
                    </div>
                    <div className="text-sm text-gray-900 text-right">
                      {selectedContractor.certificateCount || 0}
                    </div>
                  </div>

                  {/* <div className="flex justify-between items-start py-3 border-b border-gray-100">
                    <div className="text-sm font-medium text-gray-700">
                      Pending Edit Request
                    </div>
                    <div className="text-sm text-gray-900 text-right">
                      {selectedContractor.pendingRequests || 0}
                    </div>
                  </div>

                  <div className="flex justify-between items-start py-3 border-b border-gray-100">
                    <div className="text-sm font-medium text-gray-700">
                      Last Certificate Generated
                    </div>
                    <div className="text-sm text-gray-900 text-right">
                      {selectedContractor.lastCertificateDate
                        ? formatDate(selectedContractor.lastCertificateDate)
                        : "N/A"}
                    </div>
                  </div> */}

                  <div className="flex justify-between items-start py-3">
                    <div className="text-sm font-medium text-gray-700">
                      Documents
                    </div>
                    <div className="text-sm text-gray-900 text-right">
                      <div className="space-y-1">
                        {getContractorDocuments(selectedContractor).map(
                          (doc, index) => (
                            <div
                              key={index}
                              className="flex items-center justify-end gap-1"
                            >
                              <a
                                href={`/api/admin/documents/${doc.id}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1"
                              >
                                <FileText className="w-3 h-3" />
                                <span>files:{doc.id}</span>
                              </a>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Documents Section */}
                <div className="pt-4 border-t border-gray-100">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="text-sm font-medium text-gray-700">
                        Documents
                      </h4>
                      <p className="text-xs text-gray-500 mt-1">
                        Contractor uploaded documents
                      </p>
                    </div>
                    {documentsLoading && (
                      <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                    )}
                  </div>

                  {documentsLoading ? (
                    <div className="text-center py-4">
                      <Loader2 className="w-6 h-6 animate-spin text-gray-400 mx-auto" />
                      <p className="text-sm text-gray-500 mt-2">
                        Loading documents...
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {getContractorDocuments(selectedContractor.id).length >
                      0 ? (
                        getContractorDocuments(selectedContractor.id).map(
                          (doc, index) => (
                            <div
                              key={doc._id || index}
                              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
                            >
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <FileText className="w-4 h-4 text-gray-500" />
                                  <span className="text-sm font-medium text-gray-700">
                                    {doc.title || `Document ${index + 1}`}
                                  </span>
                                </div>
                                <div className="text-xs text-gray-500">
                                  <span className="inline-block px-2 py-0.5 bg-gray-100 rounded mr-2">
                                    {doc.category || "Other"}
                                  </span>
                                  {doc.description && (
                                    <span className="truncate">
                                      {doc.description}
                                    </span>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center gap-2 ml-4">
                                <button
                                  onClick={() => handleViewDocument(doc)}
                                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                  title="View Document"
                                >
                                  <Eye className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          )
                        )
                      ) : (
                        <div className="text-center py-6">
                          <FileText className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                          <p className="text-sm text-gray-500">
                            No documents found
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            This contractor has not uploaded any documents yet
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200">
                <button
                  onClick={() => {
                    closeContractorModal();
                    handleDelete(selectedContractor.id);
                  }}
                  className="px-4 py-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors text-sm font-medium"
                >
                  Delete Contractor
                </button>
                <button
                  onClick={closeContractorModal}
                  className="px-4 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors text-sm font-medium"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showSuspendModal && <SuspendModal />}

      {/* Mobile Header */}
      <div className="md:hidden mb-4">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2"
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
          <h1 className="text-xl font-semibold text-gray-900">Contractors</h1>
          <div className="w-10"></div>
        </div>

        {/* Mobile Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search contractors..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full text-base"
          />
        </div>
      </div>

      {/* Desktop Header */}
      <div className="hidden md:flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Contractors</h1>
        </div>

        <div className="relative w-96">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search by name, company, or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full text-sm"
          />
        </div>
      </div>

      {/* Mobile Stats Grid */}
      <div className="md:hidden grid grid-cols-2 gap-3 mb-6">
        <div className="bg-white border border-gray-200 rounded-lg p-3">
          <p className="text-xs text-gray-600">Total</p>
          <p className="text-xl font-bold text-gray-900">
            {contractors.length}
          </p>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-3">
          <p className="text-xs text-gray-600">This Month</p>
          <p className="text-xl font-bold text-blue-600">
            {
              contractors.filter((c) => {
                const created = new Date(c.createdAt);
                const now = new Date();
                return (
                  created.getMonth() === now.getMonth() &&
                  created.getFullYear() === now.getFullYear()
                );
              }).length
            }
          </p>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-3">
          <p className="text-xs text-gray-600">Active</p>
          <p className="text-xl font-bold text-green-600">
            {contractors.filter((c) => c.isApproved).length}
          </p>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-3">
          <p className="text-xs text-gray-600">Inactive</p>
          <p className="text-xl font-bold text-red-600">
            {contractors.filter((c) => !c.isApproved).length}
          </p>
        </div>
      </div>

      {/* Desktop Stats Grid */}
      <div className="hidden md:grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <p className="text-sm text-gray-600">Total Contractors</p>
          <p className="text-2xl font-bold text-gray-900">
            {contractors.length}
          </p>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <p className="text-sm text-gray-600">This Month</p>
          <p className="text-2xl font-bold text-blue-600">
            {
              contractors.filter((c) => {
                const created = new Date(c.createdAt);
                const now = new Date();
                return (
                  created.getMonth() === now.getMonth() &&
                  created.getFullYear() === now.getFullYear()
                );
              }).length
            }
          </p>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <p className="text-sm text-gray-600">Active</p>
          <p className="text-2xl font-bold text-green-600">
            {contractors.filter((c) => c.isApproved).length}
          </p>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <p className="text-sm text-gray-600">Inactive</p>
          <p className="text-2xl font-bold text-red-600">
            {contractors.filter((c) => !c.isApproved).length}
          </p>
        </div>
      </div>

      {/* Mobile Contractor Cards */}
      <div className="md:hidden space-y-4 mb-6">
        {currentContractors.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            No contractors found
          </div>
        ) : (
          currentContractors.map((contractor) => (
            <div
              key={contractor.id}
              className="bg-white border border-gray-200 rounded-lg p-4"
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-medium text-gray-900">
                    <button
                      onClick={() =>
                        router.push(
                          `/admin/manage-contractors/${contractor.id}`
                        )
                      }
                      className="text-blue-600 hover:text-blue-800 hover:underline transition-colors"
                    >
                      {contractor.name}
                    </button>
                  </h3>

                  <p className="text-sm text-gray-600">
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
                  }`}
                >
                  {!contractor.isApproved
                    ? "Not Approved"
                    : contractor.isSuspended
                    ? "Suspended"
                    : "Active"}
                </span>
              </div>

              <div className="space-y-2 text-sm text-gray-600 mb-4">
                <div className="flex items-center">
                  <span className="w-24 font-medium">Email:</span>
                  <span className="truncate">{contractor.email}</span>
                </div>
                <div className="flex items-center">
                  <span className="w-24 font-medium">Phone:</span>
                  <span>{contractor.phoneNumber || "N/A"}</span>
                </div>
                <div className="flex items-center">
                  <span className="w-24 font-medium">Total Certificates:</span>
                  <span>{contractor.certificateCount || 0}</span>
                </div>
                <div className="flex items-center">
                  <span className="w-24 font-medium">Registered:</span>
                  <span>{formatDate(contractor.createdAt)}</span>
                </div>
              </div>

              <div className="flex justify-between border-t border-gray-100 pt-3 action-dropdown-container">
                <button
                  onClick={() => openContractorModal(contractor)}
                  className="text-blue-600 hover:text-blue-800 transition-colors p-2"
                  title="View Details"
                >
                  <Eye className="w-5 h-5" />
                </button>
                <button
                  onClick={() => downloadHandler(contractor.id)}
                  className="text-green-600 hover:text-green-800 transition-colors p-2"
                  title="Download Data"
                >
                  <Download className="w-5 h-5" />
                </button>

                {/* Mobile Dropdown */}
                <div className="relative">
                  <button
                    onClick={(e) => handleOpenActionMenu(contractor.id, e)}
                    className="text-gray-600 hover:text-gray-800 transition-colors p-2"
                    title="More Actions"
                  >
                    <MoreVertical className="w-5 h-5" />
                  </button>

                  {showActionMenu === contractor.id && (
                    <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg border border-gray-200 z-50 shadow-xl">
                      <div className="py-1">
                        {contractor.isApproved && !contractor.isSuspended && (
                          <button
                            onClick={() =>
                              openSuspendModal(contractor, "suspend")
                            }
                            className="w-full text-left px-4 py-2 text-sm text-yellow-700 hover:bg-yellow-50 flex items-center gap-2"
                          >
                            <PauseCircle className="w-4 h-4" />
                            Suspend User
                          </button>
                        )}

                        {contractor.isSuspended && (
                          <button
                            onClick={() =>
                              openSuspendModal(contractor, "unsuspend")
                            }
                            className="w-full text-left px-4 py-2 text-sm text-green-700 hover:bg-green-50 flex items-center gap-2"
                          >
                            <PlayCircle className="w-4 h-4" />
                            Unsuspend User
                          </button>
                        )}

                        <div className="border-t border-gray-200 my-1"></div>

                        <button
                          onClick={() => {
                            setShowActionMenu(null);
                            handleDelete(contractor.id);
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-red-700 hover:bg-red-50 flex items-center gap-2"
                        >
                          <Trash2 className="w-4 h-4" />
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

      {/* Desktop Table */}
      <div className="hidden md:block bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Contractor Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Company Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Email Address
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Phone Number
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Registered Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Total Certificates
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {currentContractors.length === 0 ? (
                <tr>
                  <td
                    colSpan="7"
                    className="px-6 py-12 text-center text-gray-500"
                  >
                    No contractors found
                  </td>
                </tr>
              ) : (
                currentContractors.map((contractor) => (
                  <tr
                    key={contractor.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      <button
                        onClick={() =>
                          router.push(
                            `/admin/manage-contractors/${contractor.id}`
                          )
                        }
                        className="text-blue-600 hover:text-blue-800 hover:underline transition-colors"
                      >
                        {contractor.name}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {contractor.companyName || "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {contractor.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {contractor.phoneNumber || "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col gap-1">
                        <span
                          className={`inline-block px-3 py-1 rounded-full mx-auto text-xs font-medium ${
                            contractor.isApproved
                              ? contractor.isSuspended
                                ? "bg-yellow-100 text-yellow-700"
                                : "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {!contractor.isApproved
                            ? "Not Approved"
                            : contractor.isSuspended
                            ? "Suspended"
                            : "Active"}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(contractor.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {contractor.certificateCount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2 action-dropdown-container">
                        <button
                          onClick={() => openContractorModal(contractor)}
                          className="text-blue-600 hover:text-blue-800 transition-colors p-1"
                          title="View Details"
                        >
                          <Eye className="w-5 h-5" />
                        </button>

                        <button
                          onClick={() => downloadHandler(contractor.id)}
                          className="text-green-600 hover:text-green-800 transition-colors p-1"
                          title="Download Data"
                        >
                          <Download className="w-5 h-5" />
                        </button>

                        {/* Action Dropdown */}
                        <div className="relative">
                          <button
                            onClick={(e) =>
                              handleOpenActionMenu(contractor.id, e)
                            }
                            className="text-gray-600 hover:text-gray-800 transition-colors p-1"
                            title="More Actions"
                          >
                            <MoreVertical className="w-5 h-5" />
                          </button>

                          {/* Dropdown Menu */}
                          {showActionMenu === contractor.id && (
                            <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg border border-gray-200 z-50 shadow-xl">
                              <div className="py-1">
                                {/* Suspend/Unsuspend option */}
                                {contractor.isApproved &&
                                  !contractor.isSuspended && (
                                    <button
                                      onClick={() =>
                                        openSuspendModal(contractor, "suspend")
                                      }
                                      className="w-full text-left px-4 py-2 text-sm text-yellow-700 hover:bg-yellow-50 flex items-center gap-2"
                                    >
                                      <PauseCircle className="w-4 h-4" />
                                      Suspend User
                                    </button>
                                  )}

                                {contractor.isSuspended && (
                                  <button
                                    onClick={() =>
                                      openSuspendModal(contractor, "unsuspend")
                                    }
                                    className="w-full text-left px-4 py-2 text-sm text-green-700 hover:bg-green-50 flex items-center gap-2"
                                  >
                                    <PlayCircle className="w-4 h-4" />
                                    Unsuspend User
                                  </button>
                                )}

                                <div className="border-t border-gray-200 my-1"></div>

                                <button
                                  onClick={() => {
                                    setShowActionMenu(null);
                                    handleDelete(contractor.id);
                                  }}
                                  className="w-full text-left px-4 py-2 text-sm text-red-700 hover:bg-red-50 flex items-center gap-2"
                                >
                                  <Trash2 className="w-4 h-4" />
                                  Delete Contractor
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-sm text-gray-600">
                Showing {startIndex + 1} to{" "}
                {Math.min(endIndex, filteredContractors.length)} of{" "}
                {filteredContractors.length} contractors
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(1, prev - 1))
                  }
                  disabled={currentPage === 1}
                  className="px-3 py-1 text-sm text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Previous
                </button>

                <div className="flex items-center gap-1">
                  {[...Array(totalPages)].map((_, index) => {
                    const pageNumber = index + 1;
                    if (
                      pageNumber === 1 ||
                      pageNumber === totalPages ||
                      (pageNumber >= currentPage - 1 &&
                        pageNumber <= currentPage + 1)
                    ) {
                      return (
                        <button
                          key={pageNumber}
                          onClick={() => setCurrentPage(pageNumber)}
                          className={`px-3 py-1 text-sm rounded ${
                            currentPage === pageNumber
                              ? "bg-blue-600 text-white"
                              : "text-gray-600 hover:text-gray-900"
                          }`}
                        >
                          {pageNumber}
                        </button>
                      );
                    } else if (
                      pageNumber === currentPage - 2 ||
                      pageNumber === currentPage + 2
                    ) {
                      return (
                        <span key={pageNumber} className="px-2 text-gray-400">
                          ...
                        </span>
                      );
                    }
                    return null;
                  })}
                </div>

                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                  }
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 text-sm text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  Next
                  <ChevronRight className="w-4 h-4 ml-1" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Mobile Pagination */}
      {totalPages > 1 && (
        <div className="md:hidden bg-white border border-gray-200 rounded-lg p-4 mt-4">
          <div className="flex flex-col items-center gap-4">
            <div className="text-sm text-gray-600 text-center">
              Showing {startIndex + 1} to{" "}
              {Math.min(endIndex, filteredContractors.length)} of{" "}
              {filteredContractors.length} contractors
            </div>
            <div className="flex items-center justify-between w-full">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Prev
              </button>

              <div className="text-sm text-gray-700">
                Page {currentPage} of {totalPages}
              </div>

              <button
                onClick={() =>
                  setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                }
                disabled={currentPage === totalPages}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                Next
                <ChevronRight className="w-4 h-4 ml-1" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
