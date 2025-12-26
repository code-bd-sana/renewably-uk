"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Search, Eye, Download, Edit, Trash2 } from "lucide-react";

export default function ManageContractorsPage() {
  const router = useRouter();
  const [contractors, setContractors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
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
  // const handleDelete = async (contractorId) => {
  //   if (
  //     !confirm(
  //       "Are you sure you want to delete this contractor? This action cannot be undone."
  //     )
  //   ) {
  //     return;
  //   }

  //   try {
  //     const res = await fetch("/api/admin/reject-user", {
  //       method: "POST",
  //       headers: { "Content-Type": "application/x-www-form-urlencoded" },
  //       body: new URLSearchParams({ userId: contractorId }),
  //     });

  //     const data = await res.json();

  //     if (data.success) {
  //       // Remove contractor from list
  //       setContractors((prev) => prev.filter((c) => c.id !== contractorId));
  //       alert("Contractor deleted successfully");
  //     } else {
  //       alert("Failed to delete contractor: " + data.error);
  //     }
  //   } catch (error) {
  //     console.error("Delete error:", error);
  //     alert("Failed to delete contractor");
  //   }
  // };

  const handleDelete = async (contractorId) => {
    console.log("🔴 DELETE clicked");
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
  // Handle edit - navigate to edit page
  const handleEdit = (contractorId) => {
    router.push(`/admin/contractor/${contractorId}/edit`);
  };

  // Handle view - navigate to details page
  const handleView = (contractorId) => {
    router.push(`/admin/contractor/${contractorId}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-blue-600 text-lg">Loading contractors...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white p-8">
      {/* Header with Search */}
      <div className="flex justify-between items-center mb-8">
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

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
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

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
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
                      {contractor.name}
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
                      {new Date(contractor.createdAt).toLocaleDateString(
                        "en-GB"
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => handleView(contractor.id)}
                          className="text-blue-600 hover:text-blue-800 transition-colors p-1"
                          title="View Details"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleEdit(contractor.id)}
                          className="text-gray-600 hover:text-gray-800 transition-colors p-1"
                          title="Edit Contractor"
                        >
                          <Edit className="w-5 h-5" />
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
            <div className="flex items-center justify-between">
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
                  className="px-3 py-1 text-sm text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  ‹ Previous
                </button>

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

                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                  }
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 text-sm text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next ›
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
