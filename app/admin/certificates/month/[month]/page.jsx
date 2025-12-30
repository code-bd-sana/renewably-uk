"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Eye,
  Download,
  Search,
  ChevronLeft,
  ChevronRight,
  FileText,
  Edit2,
  ChevronDown,
  X,
  Loader2,
  Filter,
  Calendar,
  DownloadIcon,
  EyeIcon,
  ArrowLeft,
} from "lucide-react";
import { jsPDF } from "jspdf";

export default function MonthCertificatesPage() {
  const params = useParams();
  const router = useRouter();
  const [certificates, setCertificates] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [downloading, setDownloading] = useState(false);
  const [downloadingAll, setDownloadingAll] = useState(false);
  const [monthData, setMonthData] = useState(null);

  const [showModal, setShowModal] = useState(false);
  const [selectedCertificate, setSelectedCertificate] = useState(null);
  const [requestType, setRequestType] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [editableFields, setEditableFields] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [modalError, setModalError] = useState("");
  const [requestReason, setRequestReason] = useState("");

  const itemsPerPage = 10;

  useEffect(() => {
    const fetchMonthCertificates = async () => {
      try {
        setLoading(true);
        const month = await params.month;

        console.log("Fetching certificates for month:", month);

        const response = await fetch(
          `/api/admin/certificates/month/${month}?page=${currentPage}`
        );

        if (!response.ok) {
          throw new Error(`Failed to fetch certificates: ${response.status}`);
        }

        const data = await response.json();

        if (data.success) {
          setCertificates(data.certificates || []);
          setMonthData(data.month);
        } else {
          throw new Error(data.error || "Failed to fetch certificates");
        }
      } catch (error) {
        console.error("Error fetching month certificates:", error);
        alert(`Error: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchMonthCertificates();
  }, [params, currentPage]);

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedRows(certificates.map((cert) => cert.id));
    } else {
      setSelectedRows([]);
    }
  };

  const handleSelectRow = (id) => {
    if (selectedRows.includes(id)) {
      setSelectedRows(selectedRows.filter((rowId) => rowId !== id));
    } else {
      setSelectedRows([...selectedRows, id]);
    }
  };

  const isRowSelected = (id) => selectedRows.includes(id);

  const handleViewCertificate = (certificate) => {
    console.log("Opening certificate:", certificate);

    setSelectedCertificate({
      policyNumber: certificate.policyNo,
      policyHolderName: certificate.holderName,
      productType: certificate.productType,
      contractValue: certificate.contractValue,
      inceptionDate: certificate.inceptionDate,
      expiryDate: certificate.expiryDate,
      price: certificate.price,
      status: certificate.status || "active",
      contractorName: certificate.contractorName || "Not provided",
      contractorAddress:
        certificate.rawData?.contractorAddress || "Not provided",
      email: certificate.email || "Not provided",
      phone: certificate.phone || "Not provided",
      address: certificate.address || "Not provided",
      country: certificate.country || "Not provided",
      postcode: certificate.postcode || "Not provided",
      insuranceId: certificate.insuranceId || certificate.id?.split("-")[0],
      rawData: certificate.rawData || {},
    });

    setEditableFields({
      policyHolderName: certificate.holderName,
      address: certificate.address || "",
      country: certificate.country || "",
      postcode: certificate.postcode || "",
      email: certificate.email || "",
      phone: certificate.phone || "",
      productType: certificate.productType,
      contractValue: certificate.contractValue.replace("€ ", ""),
    });

    setShowModal(true);
    setRequestType("");
    setModalError("");
  };

  const handleDownloadSingle = async (certificate) => {
    try {
      setDownloading(true);
      await generatePDF(certificate, `${certificate.policyNo}_certificate.pdf`);
    } catch (error) {
      console.error("Download error:", error);
      alert("Failed to download certificate");
    } finally {
      setDownloading(false);
    }
  };

  const handleDownloadSelected = async () => {
    if (selectedRows.length === 0) {
      alert("Please select certificates to download");
      return;
    }

    try {
      setDownloadingAll(true);
      const selectedCerts = certificates.filter((cert) =>
        selectedRows.includes(cert.id)
      );

      if (selectedCerts.length === 1) {
        await generatePDF(
          selectedCerts[0],
          `${selectedCerts[0].policyNo}_certificate.pdf`
        );
      } else {
        for (const cert of selectedCerts) {
          await generatePDF(cert, `${cert.policyNo}_certificate.pdf`);
          await new Promise((resolve) => setTimeout(resolve, 100));
        }
      }
    } catch (error) {
      console.error("Download error:", error);
      alert("Failed to download certificates");
    } finally {
      setDownloadingAll(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isDropdownOpen && !event.target.closest(".request-dropdown")) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [isDropdownOpen]);

  const renderField = (label, field, value, editable = true) => (
    <div className="flex flex-col sm:flex-row sm:items-start py-2">
      <div className="w-full sm:w-1/3 text-sm font-medium text-gray-700 mb-1 sm:mb-0">
        {label}
      </div>
      <div className="w-full sm:w-2/3 flex items-center gap-2">
        {requestType === "edit" && editable ? (
          <input
            type="text"
            value={value || ""}
            onChange={(e) =>
              setEditableFields((prev) => ({
                ...prev,
                [field]: e.target.value,
              }))
            }
            className="flex-1 px-3 py-2 text-sm text-gray-900 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        ) : (
          <span className="flex-1 text-sm text-gray-600 wrap-break-words">
            {value || "Not provided"}
          </span>
        )}
        {requestType === "edit" && editable && (
          <Edit2 className="w-4 h-4 text-gray-400 shrink-0" />
        )}
      </div>
    </div>
  );

  const renderStaticField = (label, value) => (
    <div className="flex flex-col sm:flex-row sm:items-start py-2">
      <div className="w-full sm:w-1/3 text-sm font-medium text-gray-700 mb-1 sm:mb-0">
        {label}
      </div>
      <div className="w-full sm:w-2/3">
        <span className="text-sm text-gray-600 wrap-break-words">{value}</span>
      </div>
    </div>
  );

  const handleSubmitRequest = async () => {
    if (!selectedCertificate) return;

    try {
      setSubmitting(true);
      setModalError("");

      const requestData = {
        insuranceId: selectedCertificate.insuranceId || selectedCertificate.id,
        type: requestType,
        changes: requestType === "edit" ? editableFields : {},
        reason:
          requestReason || `Request for ${requestType} submitted by admin`,
      };

      const response = await fetch("/api/admin/insurance/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to submit request");
      }

      alert(result.message || "Request submitted successfully!");
      setShowModal(false);
      setRequestType("");
    } catch (error) {
      console.error("Submit request error:", error);
      setModalError(
        error.message || "Failed to submit request. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const generatePDF = async (certificate, filename) => {
    try {
      const doc = new jsPDF();

      // Add header
      doc.setFontSize(20);
      doc.text("INSURANCE BACKED GUARANTEE", 20, 20);
      doc.setFontSize(16);
      doc.text("POLICY CERTIFICATE", 20, 30);

      // Add policy details
      doc.setFontSize(12);
      let yPosition = 50;

      const details = [
        `Policy No: ${certificate.policyNo || "N/A"}`,
        `Policy Holder: ${certificate.holderName || "N/A"}`,
        `Product Type: ${certificate.productType || "N/A"}`,
        `Contract Value: ${certificate.contractValue || "N/A"}`,
        `Inception Date: ${certificate.inceptionDate || "N/A"}`,
        `Expiry Date: ${certificate.expiryDate || "N/A"}`,
        `Transaction Type: ${certificate.transactionType || "N/A"}`,
        `Price: ${certificate.price || "N/A"}`,
        `Contractor: ${certificate.contractorName || "N/A"}`,
        `Month: ${monthData?.name || "N/A"} ${monthData?.year || "N/A"}`,
        `Generated: ${new Date(
          certificate.createdAt || Date.now()
        ).toLocaleDateString()}`,
      ];

      details.forEach((detail) => {
        doc.text(detail, 20, yPosition);
        yPosition += 10;
      });

      // Add footer
      doc.setFontSize(10);
      doc.text("Renewably UK - Insurance Backed Guarantee System", 20, 200);
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 210);

      // Save PDF
      doc.save(`${certificate.policyNo || "policy"}_certificate.pdf`);
    } catch (error) {
      console.error("PDF generation error:", error);
      generateTextCertificate(certificate, filename);
    }
  };

  const generateTextCertificate = (certificate, filename) => {
    const content = `
INSURANCE BACKED GUARANTEE CERTIFICATE
========================================
Policy Number: ${certificate.policyNo}
Month: ${monthData?.name || "N/A"} ${monthData?.year || "N/A"}
Generated: ${new Date().toLocaleDateString()}

CONTRACTOR DETAILS
------------------
Name: ${certificate.contractorName || "Not Provided"}

POLICY HOLDER DETAILS
---------------------
Name: ${certificate.holderName}
Product Type: ${certificate.productType}
Inception Date: ${certificate.inceptionDate}
Expiry Date: ${certificate.expiryDate}
Contract Value: ${certificate.contractValue}
Certificate Price: ${certificate.price}

========================================
Renewably UK - Powering Renewables
  `;

    const blob = new Blob([content], { type: "text/plain" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${filename.replace(".pdf", ".txt")}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  // Format timestamp
  const formatTimestamp = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date
      .toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
      })
      .replace(",", "");
  };

  // Filter certificates
  const filteredCertificates = certificates.filter(
    (cert) =>
      searchTerm === "" ||
      cert.holderName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cert.policyNo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cert.productType?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination
  const totalPages = Math.ceil(filteredCertificates.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedCertificates = filteredCertificates.slice(
    startIndex,
    endIndex
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-3" />
          <p className="text-gray-600">
            Loading certificates for {monthData?.name}...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 lg:p-8">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => router.push("/admin/dashboard")}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </button>

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-xl lg:text-2xl font-medium text-gray-900">
              {monthData?.name} {monthData?.year} - Certificates
            </h1>
            <p className="text-gray-600 mt-1">
              {certificates.length} certificates generated this month
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <input
                type="text"
                placeholder="Search certificates..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-64 text-sm"
              />
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
            </div>

            <button
              onClick={handleDownloadSelected}
              disabled={downloadingAll || selectedRows.length === 0}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              <DownloadIcon size={16} />
              Download ({selectedRows.length})
            </button>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        {/* Table Container */}
        <div className="border border-gray-300 rounded-lg overflow-hidden">
          {/* Desktop Table */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 lg:px-6 py-3">
                    <input
                      type="checkbox"
                      checked={
                        selectedRows.length === paginatedCertificates.length &&
                        paginatedCertificates.length > 0
                      }
                      onChange={handleSelectAll}
                      className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </th>
                  <th className="px-4 lg:px-6 py-3 text-left text-xs sm:text-sm font-medium text-gray-700">
                    Policy No
                  </th>
                  <th className="px-4 lg:px-6 py-3 text-left text-xs sm:text-sm font-medium text-gray-700">
                    Policy Holder
                  </th>
                  <th className="px-4 lg:px-6 py-3 text-left text-xs sm:text-sm font-medium text-gray-700">
                    Product Type
                  </th>
                  <th className="px-4 lg:px-6 py-3 text-left text-xs sm:text-sm font-medium text-gray-700">
                    Contract Value
                  </th>
                  <th className="px-4 lg:px-6 py-3 text-left text-xs sm:text-sm font-medium text-gray-700">
                    Creation Date
                  </th>
                  <th className="px-4 lg:px-6 py-3 text-left text-xs sm:text-sm font-medium text-gray-700">
                    Inception Date
                  </th>
                  <th className="px-4 lg:px-6 py-3 text-left text-xs sm:text-sm font-medium text-gray-700">
                    Expiry Date
                  </th>
                  <th className="px-4 lg:px-6 py-3 text-left text-xs sm:text-sm font-medium text-gray-700">
                    Price
                  </th>
                  <th className="px-4 lg:px-6 py-3 text-left text-xs sm:text-sm font-medium text-gray-700">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {paginatedCertificates.length === 0 ? (
                  <tr>
                    <td
                      colSpan="10"
                      className="px-6 py-12 text-center text-gray-500"
                    >
                      <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                      <p className="text-sm sm:text-base">
                        No certificates found
                      </p>
                      {searchTerm && (
                        <p className="text-xs sm:text-sm mt-1">
                          Try a different search term
                        </p>
                      )}
                    </td>
                  </tr>
                ) : (
                  paginatedCertificates.map((cert, index) => (
                    <tr
                      key={cert.id}
                      className={`border-t border-gray-200 hover:bg-gray-50 transition-colors ${
                        isRowSelected(cert.id) ? "bg-blue-50" : ""
                      }`}
                    >
                      <td className="px-4 lg:px-6 py-3">
                        <input
                          type="checkbox"
                          checked={isRowSelected(cert.id)}
                          onChange={() => handleSelectRow(cert.id)}
                          className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-4 lg:px-6 py-3">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-900 text-xs sm:text-sm">
                            {cert.policyNo}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 lg:px-6 py-3 text-gray-700 text-xs sm:text-sm">
                        <div className="truncate max-w-37.5">
                          {cert.holderName}
                        </div>
                      </td>
                      <td className="px-4 lg:px-6 py-3 text-gray-700 text-xs sm:text-sm">
                        <div className="truncate max-w-30">
                          {cert.productType}
                        </div>
                      </td>
                      <td className="px-4 lg:px-6 py-3 text-gray-700 text-xs sm:text-sm">
                        {cert.contractValue}
                      </td>
                      <td className="px-4 lg:px-6 py-3 text-gray-700 text-xs sm:text-sm">
                        <div className="whitespace-nowrap">
                          {formatTimestamp(cert.createdAt)}
                        </div>
                      </td>
                      <td className="px-4 lg:px-6 py-3 text-gray-700 text-xs sm:text-sm">
                        {cert.inceptionDate}
                      </td>
                      <td className="px-4 lg:px-6 py-3 text-gray-700 text-xs sm:text-sm">
                        {cert.expiryDate}
                      </td>
                      <td className="px-4 lg:px-6 py-3 font-medium text-gray-900 text-xs sm:text-sm">
                        {cert.price}
                      </td>
                      <td className="px-4 lg:px-6 py-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleViewCertificate(cert)}
                            className="text-blue-600 hover:text-blue-800 transition-colors p-1"
                            title="View"
                          >
                            <EyeIcon size={16} />
                          </button>
                          <button
                            onClick={() => handleDownloadSingle(cert)}
                            disabled={downloading}
                            className="text-blue-600 hover:text-blue-800 transition-colors p-1 disabled:opacity-50"
                            title="Download"
                          >
                            {downloading ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <DownloadIcon size={16} />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards View */}
          <div className="lg:hidden">
            {paginatedCertificates.length === 0 ? (
              <div className="px-4 py-12 text-center text-gray-500">
                <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p className="text-sm">No certificates found</p>
                {searchTerm && (
                  <p className="text-xs mt-1">Try a different search term</p>
                )}
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {paginatedCertificates.map((cert) => (
                  <div
                    key={cert.id}
                    className={`p-3 hover:bg-gray-50 transition-colors ${
                      isRowSelected(cert.id) ? "bg-blue-50" : ""
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={isRowSelected(cert.id)}
                          onChange={() => handleSelectRow(cert.id)}
                          className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 mt-1"
                        />
                        <div>
                          <div className="font-medium text-gray-900 text-sm">
                            {cert.policyNo}
                          </div>
                          <div className="text-xs text-gray-500">
                            {cert.holderName}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleViewCertificate(cert)}
                          className="text-blue-600 hover:text-blue-800 transition-colors p-1"
                          title="View"
                        >
                          <EyeIcon size={16} />
                        </button>
                        <button
                          onClick={() => handleDownloadSingle(cert)}
                          disabled={downloading}
                          className="text-blue-600 hover:text-blue-800 transition-colors p-1 disabled:opacity-50"
                          title="Download"
                        >
                          {downloading ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <DownloadIcon size={16} />
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <div className="text-gray-500">Product Type</div>
                        <div className="font-medium truncate">
                          {cert.productType}
                        </div>
                      </div>
                      <div>
                        <div className="text-gray-500">Contract Value</div>
                        <div className="font-medium">{cert.contractValue}</div>
                      </div>
                      <div>
                        <div className="text-gray-500">Inception Date</div>
                        <div className="font-medium">{cert.inceptionDate}</div>
                      </div>
                      <div>
                        <div className="text-gray-500">Expiry Date</div>
                        <div className="font-medium">{cert.expiryDate}</div>
                      </div>
                      <div>
                        <div className="text-gray-500">Created</div>
                        <div className="font-medium text-xs">
                          {formatTimestamp(cert.createdAt)}
                        </div>
                      </div>
                      <div>
                        <div className="text-gray-500">Price</div>
                        <div className="font-medium">{cert.price}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row justify-center items-center gap-2 mt-4 sm:mt-6">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1.5 text-xs sm:text-sm text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed border border-gray-300 rounded hover:bg-gray-50 transition-colors"
              >
                ‹ Prev
              </button>

              {/* Page Numbers */}
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(3, totalPages) }, (_, i) => {
                  const pageNum = i + 1;
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`px-2 py-1 text-xs sm:text-sm rounded transition-colors ${
                        currentPage === pageNum
                          ? "bg-blue-600 text-white"
                          : "text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}

                {totalPages > 3 && (
                  <>
                    <span className="px-1 text-gray-400 text-xs">...</span>
                    <button
                      onClick={() => setCurrentPage(totalPages)}
                      className={`px-2 py-1 text-xs sm:text-sm rounded transition-colors ${
                        currentPage === totalPages
                          ? "bg-blue-600 text-white"
                          : "text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      {totalPages}
                    </button>
                  </>
                )}
              </div>

              <button
                onClick={() =>
                  setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                }
                disabled={currentPage === totalPages}
                className="px-3 py-1.5 text-xs sm:text-sm text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed border border-gray-300 rounded hover:bg-gray-50 transition-colors"
              >
                Next ›
              </button>
            </div>

            <div className="text-xs sm:text-sm text-gray-500 mt-2 sm:mt-0">
              Page {currentPage} of {totalPages}
            </div>
          </div>
        )}

        {/* Summary */}
        <div className="mt-4 sm:mt-6 text-center text-xs sm:text-sm text-gray-600 px-2">
          Showing {paginatedCertificates.length} certificates for{" "}
          {monthData?.name} {monthData?.year}
        </div>
      </div>

      {/* View/Edit Certificate Modal */}
      {showModal && selectedCertificate && (
        <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-start sm:items-center justify-center p-2 sm:p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[95vh] sm:max-h-[90vh] overflow-hidden m-2 sm:m-4">
            {/* Request Action Buttons */}
            {(requestType === "edit" || requestType === "cancel") && (
              <div className="p-4 sm:p-6 border-t border-gray-200 bg-gray-50">
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {requestType === "edit"
                      ? "Reason for Edit Request"
                      : "Reason for Cancellation"}
                  </label>
                  <textarea
                    value={requestReason}
                    onChange={(e) => setRequestReason(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows="3"
                    placeholder={
                      requestType === "edit"
                        ? "Explain what changes you want to make..."
                        : "Why do you want to cancel this policy?"
                    }
                    required
                  />
                </div>

                <div className="flex flex-col sm:flex-row justify-end gap-3">
                  <button
                    onClick={() => {
                      setRequestType("");
                      setRequestReason("");
                      setModalError("");
                    }}
                    className="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-100 order-2 sm:order-1"
                    disabled={submitting}
                  >
                    Cancel
                  </button>

                  <button
                    onClick={handleSubmitRequest}
                    className="px-4 py-2 text-sm text-white bg-blue-600 rounded hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2 order-1 sm:order-2 mb-2 sm:mb-0"
                    disabled={submitting || !requestReason.trim()}
                  >
                    {submitting ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        Sending...
                      </>
                    ) : (
                      "Submit Request"
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Modal Header */}
            <div className="p-4 sm:p-6 border-b border-gray-200">
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <div className="inline-flex items-center gap-2">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-500 rounded-full"></div>
                  <div>
                    <span className="font-bold text-lg sm:text-xl">
                      BLUE<span className="text-blue-500">DROP</span>
                    </span>
                    <span className="text-xs text-gray-500 ml-1 sm:ml-2">
                      SERVICES
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowModal(false);
                    setRequestType("");
                    setModalError("");
                  }}
                  className="p-1 sm:p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X size={18} className="sm:w-5 sm:h-5" />
                </button>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-semibold text-gray-900 wrap-break-words">
                  {selectedCertificate.policyNo ||
                    selectedCertificate.policyNumber}
                </h1>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <button
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                      className="flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm text-gray-600 bg-white border border-gray-300 rounded hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      disabled={
                        selectedCertificate.status &&
                        selectedCertificate.status.includes("pending")
                      }
                    >
                      <span className="truncate max-w-25 sm:max-w-none">
                        {requestType
                          ? requestType === "edit"
                            ? "Request for Edit"
                            : "Request For Cancellation"
                          : "Request for"}
                      </span>
                      <ChevronDown className="w-3 h-3 sm:w-4 sm:h-4 shrink-0" />
                    </button>

                    {isDropdownOpen && (
                      <div className="absolute right-0 mt-2 w-48 sm:w-56 bg-white rounded-md shadow-lg border border-gray-200 z-10">
                        <div className="py-1">
                          <button
                            onClick={() => {
                              setRequestType("edit");
                              setIsDropdownOpen(false);
                            }}
                            className="block w-full text-left px-3 py-2 text-xs sm:text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700"
                            disabled={
                              selectedCertificate.status === "pending_edit"
                            }
                          >
                            Request for Edit
                          </button>
                          <button
                            onClick={() => {
                              setRequestType("cancel");
                              setIsDropdownOpen(false);
                            }}
                            className="block w-full text-left px-3 py-2 text-xs sm:text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700"
                            disabled={
                              selectedCertificate.status === "pending_cancel"
                            }
                          >
                            Request For Cancellation
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => handleDownloadSingle(selectedCertificate)}
                    className="p-1.5 sm:p-2 text-gray-600 hover:bg-gray-100 rounded"
                    disabled={downloading}
                  >
                    {downloading ? (
                      <Loader2
                        size={18}
                        className="animate-spin sm:w-5 sm:h-5"
                      />
                    ) : (
                      <Download size={18} className="sm:w-5 sm:h-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Show status badge */}
              {selectedCertificate.status && (
                <div className="mt-3">
                  <span
                    className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      selectedCertificate.status === "active"
                        ? "bg-green-100 text-green-800"
                        : selectedCertificate.status === "pending_edit"
                        ? "bg-yellow-100 text-yellow-800"
                        : selectedCertificate.status === "pending_cancel"
                        ? "bg-orange-100 text-orange-800"
                        : selectedCertificate.status === "cancelled"
                        ? "bg-red-100 text-red-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    Status:{" "}
                    {selectedCertificate.status.replace("_", " ").toUpperCase()}
                  </span>
                </div>
              )}
            </div>

            {/* Error Message */}
            {modalError && (
              <div className="mx-4 sm:mx-6 mt-4 p-2 sm:p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs sm:text-sm">
                {modalError}
              </div>
            )}

            {/* Policy Details */}
            <div className="p-4 sm:p-6 overflow-y-auto max-h-[calc(95vh-300px)] sm:max-h-[calc(90vh-200px)]">
              {/* Contractor Details */}
              <div className="mb-6">
                <h2 className="text-base sm:text-lg font-semibold text-gray-800 mb-3">
                  Contractor Details
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <div className="text-xs sm:text-sm text-gray-500 mb-1">
                      Contractor Name
                    </div>
                    <div className="text-sm sm:text-base font-medium wrap-break-words">
                      {selectedCertificate.contractorName || "Not provided"}
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <div className="text-xs sm:text-sm text-gray-500">
                        Contractor Address
                      </div>
                      {requestType === "edit" && (
                        <Edit2 className="w-3 h-3 text-gray-400" />
                      )}
                    </div>
                    {requestType === "edit" ? (
                      <textarea
                        value={editableFields.contractorAddress || ""}
                        onChange={(e) =>
                          setEditableFields((prev) => ({
                            ...prev,
                            contractorAddress: e.target.value,
                          }))
                        }
                        className="w-full px-3 py-2 text-xs sm:text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows="2"
                        placeholder="Enter contractor address"
                      />
                    ) : (
                      <div className="text-sm sm:text-base wrap-break-words">
                        {selectedCertificate.contractorAddress ||
                          "Not provided"}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Policy Holder Details */}
              <div className="mb-6">
                <h2 className="text-base sm:text-lg font-semibold text-gray-800 mb-3">
                  Policy Holder Details
                </h2>
                <div className="space-y-2 sm:space-y-3">
                  {renderField(
                    "Policy Holder Name",
                    "policyHolderName",
                    editableFields.policyHolderName ||
                      selectedCertificate.holderName ||
                      "Not provided"
                  )}

                  {renderField(
                    "Address",
                    "address",
                    editableFields.address ||
                      selectedCertificate.rawData?.insurance?.address ||
                      "Not provided"
                  )}

                  {renderField(
                    "Country",
                    "country",
                    editableFields.country ||
                      selectedCertificate.rawData?.insurance?.country ||
                      "Not provided"
                  )}

                  {renderField(
                    "Postcode",
                    "postcode",
                    editableFields.postcode ||
                      selectedCertificate.rawData?.insurance?.postcode ||
                      "Not provided"
                  )}

                  {renderField(
                    "Policyholder email",
                    "email",
                    editableFields.email ||
                      selectedCertificate.rawData?.insurance?.email ||
                      "Not provided"
                  )}

                  {renderField(
                    "Policyholder Phone",
                    "phone",
                    editableFields.phone ||
                      selectedCertificate.rawData?.insurance?.phone ||
                      "Not provided"
                  )}
                </div>
              </div>

              {/* Product Details */}
              <div className="mb-6">
                <h2 className="text-base sm:text-lg font-semibold text-gray-800 mb-3">
                  Product Details
                </h2>
                <div className="space-y-2 sm:space-y-3">
                  {renderField(
                    "Product Type",
                    "productType",
                    editableFields.productType
                  )}
                  {renderStaticField(
                    "Insurance Coverage",
                    "Insurance Backed Guarantee"
                  )}
                  {renderStaticField(
                    "Inception Date",
                    selectedCertificate.inceptionDate || "Not available"
                  )}
                  {renderStaticField(
                    "Expiry Date",
                    selectedCertificate.expiryDate || "Not available"
                  )}
                  {renderField(
                    "Contract Value",
                    "contractValue",
                    editableFields.contractValue
                  )}
                  {renderStaticField(
                    "Transaction Type",
                    "Certificate Generated"
                  )}
                  {renderStaticField(
                    "Price",
                    selectedCertificate.price || "€ 0.00"
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            {(requestType === "edit" || requestType === "cancel") && (
              <div className="p-4 sm:p-6 border-t border-gray-200 bg-gray-50">
                <div className="flex flex-col sm:flex-row justify-end gap-3">
                  <button
                    onClick={() => {
                      setRequestType("");
                      setModalError("");
                    }}
                    className="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-100 order-2 sm:order-1"
                    disabled={submitting}
                  >
                    Cancel Request
                  </button>
                  <button
                    onClick={handleSubmitRequest}
                    className="px-4 py-2 text-sm text-white bg-blue-600 rounded hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2 order-1 sm:order-2 mb-2 sm:mb-0"
                    disabled={submitting}
                  >
                    {submitting ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      "Submit Request"
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
