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
} from "lucide-react";
import { jsPDF } from "jspdf";

export default function ContractorCertificatesPage() {
  const params = useParams();
  const router = useRouter();
  const [contractor, setContractor] = useState(null);
  const [certificates, setCertificates] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [downloading, setDownloading] = useState(false);
  const [downloadingAll, setDownloadingAll] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState("");

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
    const fetchData = async () => {
      try {
        setLoading(true);
        const contractorId = await params.id;

        console.log("Fetching data for contractor ID:", contractorId);

        // Fetch contractor details
        const contractorRes = await fetch(
          `/api/admin/contractor/${contractorId}`
        );

        console.log("Contractor response status:", contractorRes.status);

        if (!contractorRes.ok) {
          throw new Error(
            `Failed to fetch contractor: ${contractorRes.status}`
          );
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

        console.log("Certificates response status:", certsRes.status);

        if (!certsRes.ok) {
          throw new Error(`Failed to fetch certificates: ${certsRes.status}`);
        }

        const certsText = await certsRes.text();
        console.log(
          "Certificates response text (first 500 chars):",
          certsText.substring(0, 500)
        );

        if (!certsText) {
          console.warn(
            "Empty response from certificates API, using empty array"
          );
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

    fetchData();
  }, [params]);

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
      contractorName:
        contractor?.companyName || contractor?.name || "Not provided",
      contractorAddress: contractor?.address || "Not provided",
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
    <div className="flex items-start py-2">
      <div className="w-1/3 text-sm font-medium text-gray-700">{label}</div>
      <div className="w-2/3 flex items-center gap-2">
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
          <span className="flex-1 text-sm text-gray-600">
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
    <div className="flex items-start py-2">
      <div className="w-1/3 text-sm font-medium text-gray-700">{label}</div>
      <div className="w-2/3">
        <span className="text-sm text-gray-600">{value}</span>
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
        reason: `Request for ${requestType} submitted by admin for contractor ${contractor?.name}`,
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
        `Contractor: ${contractor?.companyName || "N/A"}`,
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
Generated: ${new Date().toLocaleDateString()}

CONTRACTOR DETAILS
------------------
Name: ${contractor?.companyName || contractor?.name || "Not Provided"}
Email: ${contractor?.email || "Not Provided"}

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

  // Filter by month
  const months = [
    { value: "", label: "All Months" },
    { value: "1", label: "January" },
    { value: "2", label: "February" },
    { value: "3", label: "March" },
    { value: "4", label: "April" },
    { value: "5", label: "May" },
    { value: "6", label: "June" },
    { value: "7", label: "July" },
    { value: "8", label: "August" },
    { value: "9", label: "September" },
    { value: "10", label: "October" },
    { value: "11", label: "November" },
    { value: "12", label: "December" },
  ];

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

  // Apply month filter
  const monthFilteredCertificates = selectedMonth
    ? filteredCertificates.filter((cert) => {
        const certDate = new Date(cert.createdAt || cert.inceptionDate);
        return certDate.getMonth() + 1 === parseInt(selectedMonth);
      })
    : filteredCertificates;

  // Pagination
  const totalPages = Math.ceil(monthFilteredCertificates.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedCertificates = monthFilteredCertificates.slice(
    startIndex,
    endIndex
  );

  // Calculate summary
  const calculateSummary = () => {
    const monthCerts = selectedMonth
      ? certificates.filter((cert) => {
          const certDate = new Date(cert.createdAt || cert.inceptionDate);
          return certDate.getMonth() + 1 === parseInt(selectedMonth);
        })
      : paginatedCertificates;

    const totalCerts = monthCerts.length;
    const totalPremium = monthCerts.reduce((sum, cert) => {
      const price = parseFloat(cert.price?.replace(/[^0-9.-]+/g, "") || 0);
      return sum + price;
    }, 0);

    const monthNames = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];

    return {
      totalCerts,
      totalPremium: `£${totalPremium.toFixed(2)}`,
      monthName: selectedMonth
        ? monthNames[parseInt(selectedMonth) - 1]
        : monthNames[new Date().getMonth()],
      year: new Date().getFullYear(),
    };
  };

  const summary = calculateSummary();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-3" />
          <p className="text-gray-600">Loading contractor certificates...</p>
        </div>
      </div>
    );
  }

  if (!contractor) {
    return (
      <div className="min-h-screen bg-gray-50 p-8 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Contractor not found</p>
          <button
            onClick={() => router.push("/admin/manage-contractors")}
            className="mt-4 text-blue-600 hover:text-blue-800"
          >
            ← Back to contractors
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 lg:p-8">
      {/* Main Container */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
          <h1 className="text-xl lg:text-2xl font-medium text-gray-900">
            {contractor.companyName || contractor.name}
          </h1>

          <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
            {/* Filter Button */}
            <div className="relative">
              <button
                onClick={() => setFilterOpen(!filterOpen)}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <span>☰</span>
                Filter by month
              </button>

              {filterOpen && (
                <div className="absolute top-full left-0 mt-2 bg-white rounded-lg shadow-lg border border-gray-200 z-10 min-w-50">
                  <div className="p-2">
                    {months.map((month) => (
                      <button
                        key={month.value}
                        onClick={() => {
                          setSelectedMonth(month.value);
                          setFilterOpen(false);
                          setCurrentPage(1);
                        }}
                        className={`w-full text-left px-3 py-2 rounded hover:bg-gray-100 transition-colors ${
                          selectedMonth === month.value
                            ? "bg-blue-50 text-blue-600"
                            : "text-gray-700"
                        }`}
                      >
                        {month.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Search Input */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search by policy no..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-4 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-64"
              />
            </div>

            {/* Download Button */}
            <button
              onClick={handleDownloadSelected}
              disabled={downloadingAll || selectedRows.length === 0}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span>⬇</span>
              Download ({selectedRows.length})
            </button>
          </div>
        </div>

        {/* Table Container */}
        <div className="border border-gray-300 rounded-lg overflow-hidden">
          {/* Desktop Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-6 py-4">
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
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">
                    Policy No
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">
                    Policy Holder Name
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">
                    Product Type
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">
                    Contract Value
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">
                    IBG Creation Date Stamp
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">
                    Inception Date
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">
                    Expiry Date
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">
                    Transaction Type
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">
                    Price
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {paginatedCertificates.length === 0 ? (
                  <tr>
                    <td
                      colSpan="11"
                      className="px-6 py-12 text-center text-gray-500"
                    >
                      <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                      <p>No certificates found</p>
                      {searchTerm && (
                        <p className="text-sm mt-1">
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
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          checked={isRowSelected(cert.id)}
                          onChange={() => handleSelectRow(cert.id)}
                          className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() =>
                              window.open(
                                `/api/certificates/${cert.id}`,
                                "_blank"
                              )
                            }
                            className="text-gray-400 hover:text-blue-600 transition-colors p-1"
                            title="Open policy"
                          >
                            🔗
                          </button>
                          <span className="font-medium text-gray-900">
                            {cert.policyNo}
                          </span>
                          {index === 0 && cert.createdAt && (
                            <span className="inline-flex items-center gap-1 bg-gray-900 text-white text-xs px-2 py-1 rounded-full">
                              <Calendar className="w-3 h-3" />G
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-700">
                        {cert.holderName}
                      </td>
                      <td className="px-6 py-4 text-gray-700">
                        {cert.productType}
                      </td>
                      <td className="px-6 py-4 text-gray-700">
                        {cert.contractValue}
                      </td>
                      <td className="px-6 py-4 text-gray-700">
                        {formatTimestamp(cert.createdAt)}
                      </td>
                      <td className="px-6 py-4 text-gray-700">
                        {cert.inceptionDate}
                      </td>
                      <td className="px-6 py-4 text-gray-700">
                        {cert.expiryDate}
                      </td>
                      <td className="px-6 py-4 text-gray-700">
                        {cert.transactionType}
                      </td>
                      <td className="px-6 py-4 font-medium text-gray-900">
                        {cert.price}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => handleViewCertificate(cert)}
                            className="text-blue-600 hover:text-blue-800 transition-colors p-1"
                            title="View"
                          >
                            👁
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
                              "⬇"
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
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-6">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed border border-gray-300 rounded hover:bg-gray-50 transition-colors"
            >
              ‹ Previous
            </button>

            {/* Page Numbers */}
            {Array.from({ length: Math.min(6, totalPages) }, (_, i) => {
              const pageNum = i + 1;
              return (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`px-3 py-1 text-sm rounded transition-colors ${
                    currentPage === pageNum
                      ? "bg-blue-600 text-white"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}

            {totalPages > 6 && (
              <>
                <span className="px-2 text-gray-400">...</span>
                <button
                  onClick={() => setCurrentPage(totalPages)}
                  className={`px-3 py-1 text-sm rounded transition-colors ${
                    currentPage === totalPages
                      ? "bg-blue-600 text-white"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  {totalPages}
                </button>
              </>
            )}

            <button
              onClick={() =>
                setCurrentPage((prev) => Math.min(totalPages, prev + 1))
              }
              disabled={currentPage === totalPages}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed border border-gray-300 rounded hover:bg-gray-50 transition-colors"
            >
              Next ›
            </button>
          </div>
        )}

        {/* Summary */}
        <div className="mt-6 text-center text-sm text-gray-600">
          {selectedMonth
            ? `${summary.monthName} ${summary.year}: Total certificates created: ${summary.totalCerts}, Total Premium Value: ${summary.totalPremium}`
            : `All Time: Total certificates created: ${certificates.length}`}
        </div>
      </div>

      {/* View/Edit Certificate Modal */}
      {showModal && selectedCertificate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            {/* Request Action Buttons - ADD THIS SECTION */}
            {(requestType === "edit" || requestType === "cancel") && (
              <div className="p-6 border-t border-gray-200 bg-gray-50">
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

                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => {
                      setRequestType("");
                      setRequestReason("");
                      setModalError("");
                    }}
                    className="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-100"
                    disabled={submitting}
                  >
                    Cancel
                  </button>

                  <button
                    onClick={handleSubmitRequest}
                    className="px-4 py-2 text-sm text-white bg-blue-600 rounded hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
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
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between mb-6">
                <div className="inline-flex items-center gap-2">
                  <div className="w-10 h-10 bg-blue-500 rounded-full"></div>
                  <span className="font-bold text-xl">
                    BLUE<span className="text-blue-500">DROP</span>
                  </span>
                  <span className="text-xs text-gray-500 ml-2">SERVICES</span>
                </div>
                <button
                  onClick={() => {
                    setShowModal(false);
                    setRequestType("");
                    setModalError("");
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <h1 className="text-3xl font-semibold text-gray-900">
                  {selectedCertificate.policyNo ||
                    selectedCertificate.policyNumber}
                </h1>
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <button
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 bg-white border border-gray-300 rounded hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      disabled={
                        selectedCertificate.status &&
                        selectedCertificate.status.includes("pending")
                      }
                    >
                      <span>
                        {requestType
                          ? requestType === "edit"
                            ? "Request for Edit"
                            : "Request For Cancellation"
                          : "Request for"}
                      </span>
                      <ChevronDown className="w-4 h-4" />
                    </button>

                    {isDropdownOpen && (
                      <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg border border-gray-200 z-10">
                        <div className="py-1">
                          <button
                            onClick={() => {
                              setRequestType("edit");
                              setIsDropdownOpen(false);
                            }}
                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700"
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
                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700"
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
                    className="p-2 text-gray-600 hover:bg-gray-100 rounded"
                    disabled={downloading}
                  >
                    {downloading ? (
                      <Loader2 size={20} className="animate-spin" />
                    ) : (
                      <Download size={20} />
                    )}
                  </button>
                </div>
              </div>

              {/* Show status badge */}
              {selectedCertificate.status && (
                <div className="mt-3">
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
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
              {/* Show existing request status */}
              {selectedCertificate.status &&
                selectedCertificate.status.includes("pending") && (
                  <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                      <span className="font-medium text-yellow-800">
                        {selectedCertificate.status === "pending_edit"
                          ? "Edit Request Pending"
                          : "Cancellation Request Pending"}
                      </span>
                    </div>
                    {selectedCertificate.rawData?.insurance?.requestData
                      ?.reason && (
                      <p className="text-sm text-yellow-700 mt-1">
                        Reason:{" "}
                        {
                          selectedCertificate.rawData.insurance.requestData
                            .reason
                        }
                      </p>
                    )}
                    <p className="text-xs text-yellow-600 mt-1">
                      Submitted:{" "}
                      {new Date(
                        selectedCertificate.rawData?.insurance?.requestData
                          ?.requestedAt || selectedCertificate.createdAt
                      ).toLocaleDateString()}
                    </p>
                  </div>
                )}
            </div>

            {/* Error Message */}
            {modalError && (
              <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                {modalError}
              </div>
            )}

            {/* Policy Details */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
              {/* Contractor Details */}
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-3">
                  Contractor Details
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-gray-500 mb-1">
                      Contractor Name
                    </div>
                    <div className="text-base font-medium">
                      {selectedCertificate.contractorName || "Not provided"}
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <div className="text-sm text-gray-500">
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
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows="2"
                        placeholder="Enter contractor address"
                      />
                    ) : (
                      <div className="text-base">
                        {selectedCertificate.contractorAddress ||
                          "Not provided"}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Policy Holder Details */}
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-3">
                  Policy Holder Details
                </h2>
                <div className="space-y-3">
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
                <h2 className="text-lg font-semibold text-gray-800 mb-3">
                  Product Details
                </h2>
                <div className="space-y-3">
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
              <div className="p-6 border-t border-gray-200 bg-gray-50">
                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => {
                      setRequestType("");
                      setModalError("");
                    }}
                    className="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-100"
                    disabled={submitting}
                  >
                    Cancel Request
                  </button>
                  <button
                    onClick={handleSubmitRequest}
                    className="px-4 py-2 text-sm text-white bg-blue-600 rounded hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
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
