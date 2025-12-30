"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Eye,
  Download,
  Edit,
  Trash2,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  FileText,
  ExternalLink,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";

export default function ManageContractorsPage() {
  const router = useRouter();
  const [contractors, setContractors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [selectedContractor, setSelectedContractor] = useState(null);
  const [showContractorModal, setShowContractorModal] = useState(false);
  const itemsPerPage = 10;

  // Fetch contractors
  const fetchContractors = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/contractor");
      const data = await res.json();

      if (data.success) {
        setContractors(data.users);
      }
    } catch (error) {
      console.error("Error fetching contractors:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchContractors();
  }, [fetchContractors]);

  // Open contractor details modal
  const openContractorModal = (contractor) => {
    setSelectedContractor(contractor);
    setShowContractorModal(true);
  };

  // Close contractor modal
  const closeContractorModal = () => {
    setShowContractorModal(false);
    setSelectedContractor(null);
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

  // Handle download contractor data
  const handleDownload = async (contractorId) => {
    try {
      const res = await fetch(`/api/admin/contractor/${contractorId}/export`, {
        method: "GET",
      });

      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `contractor-${contractorId}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error("Download error:", error);
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

  // Handle view - navigate to details page
  const handleView = (contractorId) => {
    router.push(`/admin/contractor/${contractorId}`);
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

  // Calculate documents (mock data - replace with real data)
  const getContractorDocuments = (contractor) => {
    // Mock documents - replace with actual document data from your API
    return [
      { id: "doc1", name: "Business License" },
      { id: "doc2", name: "Insurance Certificate" },
      { id: "doc3", name: "Tax ID Document" },
    ];
  };

  // Calculate additional contractor stats (mock data - replace with real data)
  const getContractorStats = (contractor) => {
    // Mock stats - replace with actual data from your API
    return {
      totalCertificates: Math.floor(Math.random() * 20) + 1,
      pendingEditRequests: Math.floor(Math.random() * 5),
      lastCertificateDate: new Date(
        Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000
      ).toISOString(),
    };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-blue-600 text-lg">Loading contractors...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white p-4 md:p-8">
      {/* Contractor Details Modal */}
      {showContractorModal && selectedContractor && (
        <div className="fixed inset-0  bg-opacity-80 backdrop-blur-md flex items-center justify-center p-4 z-50">
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
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    selectedContractor.isApproved
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {selectedContractor.isApproved ? "Active" : "Inactive"}
                </span>
                <button
                  onClick={() => handleDownload(selectedContractor.id)}
                  className="text-gray-600 hover:text-gray-900 p-1"
                  title="Download Data"
                >
                  <Download className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              {/* Details Grid */}
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
                    {getContractorStats(selectedContractor).totalCertificates}
                  </div>
                </div>

                <div className="flex justify-between items-start py-3 border-b border-gray-100">
                  <div className="text-sm font-medium text-gray-700">
                    Pending Edit Request
                  </div>
                  <div className="text-sm text-gray-900 text-right">
                    {getContractorStats(selectedContractor).pendingEditRequests}
                  </div>
                </div>

                <div className="flex justify-between items-start py-3 border-b border-gray-100">
                  <div className="text-sm font-medium text-gray-700">
                    Last Certificate Generated
                  </div>
                  <div className="text-sm text-gray-900 text-right">
                    {formatDate(
                      getContractorStats(selectedContractor).lastCertificateDate
                    )}
                  </div>
                </div>

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
          <p className="text-gray-600 mt-1">
            Manage all registered contractors
          </p>
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
                    {contractor.name}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {contractor.companyName || "N/A"}
                  </p>
                </div>
                <span
                  className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                    contractor.isApproved
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {contractor.isApproved ? "Active" : "Inactive"}
                </span>
              </div>

              <div className="space-y-2 text-sm text-gray-600 mb-4">
                <div className="flex items-center">
                  <span className="w-24 font-medium">Email:</span>
                  <span className="truncate">{contractor.email}</span>
                </div>
                <div className="flex items-center">
                  <span className="w-24 font-medium">Phone:</span>
                  <span>{contractor.phone || "N/A"}</span>
                </div>
                <div className="flex items-center">
                  <span className="w-24 font-medium">Registered:</span>
                  <span>{formatDate(contractor.createdAt)}</span>
                </div>
              </div>

              <div className="flex justify-between border-t border-gray-100 pt-3">
                <button
                  onClick={() => openContractorModal(contractor)}
                  className="text-blue-600 hover:text-blue-800 transition-colors p-2"
                  title="View Details"
                >
                  <Eye className="w-5 h-5" />
                </button>
                <button
                  onClick={() => handleDownload(contractor.id)}
                  className="text-green-600 hover:text-green-800 transition-colors p-2"
                  title="Download Data"
                >
                  <Download className="w-5 h-5" />
                </button>
                <button
                  onClick={() => handleDelete(contractor.id)}
                  className="text-red-600 hover:text-red-800 transition-colors p-2"
                  title="Delete Contractor"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Registered Date
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
                      {contractor.phone || "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                          contractor.isApproved
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {contractor.isApproved ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(contractor.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => openContractorModal(contractor)}
                          className="text-blue-600 hover:text-blue-800 transition-colors p-1"
                          title="View Details"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDownload(contractor.id)}
                          className="text-green-600 hover:text-green-800 transition-colors p-1"
                          title="Download Data"
                        >
                          <Download className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(contractor.id)}
                          className="text-red-600 hover:text-red-800 transition-colors p-1"
                          title="Delete Contractor"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
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
