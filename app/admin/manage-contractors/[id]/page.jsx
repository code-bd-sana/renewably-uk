"use client";

import { downloadPdf } from "@/utils/pdfGenerator";
import { jsPDF } from "jspdf";
import {
  Download,
  DownloadIcon,
  Edit2,
  EyeIcon,
  FileText,
  Filter,
  Loader2,
  Menu,
  Search,
  X,
} from "lucide-react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

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

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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

  const handleDownload = async (certificateId) => {
    try {
      // Find the certificate
      const certificate = certificates.find((c) => c.id === certificateId);
      if (!certificate) {
        alert("Certificate not found");
        return;
      }

      console.log("Downloading certificate:", certificate);
      console.log("Contractor data:", contractor);

      // Download using the utility function
      downloadPdf(certificate, contractor);
    } catch (error) {
      console.error("Download error:", error);

      // Fallback to simple PDF if detailed one fails
      try {
        generateSimplePDF(certificate, contractor);
      } catch (fallbackError) {
        console.error("Fallback PDF error:", fallbackError);
        alert("Failed to generate certificate. Please try again.");
      }
    }
  };

  const handleDownloadSingle = async (certificate) => {
    try {
      setDownloading(true);
      await handleDownload(certificate.id);
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

      // এখানে সব certificates একসাথে download করবেন না, user কে একের পর এক save করার option দিন
      if (selectedCerts.length === 1) {
        downloadPdf(selectedCerts[0], contractor);
      } else {
        for (const cert of selectedCerts) {
          downloadPdf(cert, contractor);
          // প্রতিটি ডাউনলোডের মধ্যে 500ms ডিলে
          await new Promise((resolve) => setTimeout(resolve, 500));
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
      <div className="min-h-screen bg-gray-50 p-4 sm:p-8 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-3" />
          <p className="text-gray-600">Loading contractor certificates...</p>
        </div>
      </div>
    );
  }

  if (!contractor) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 sm:p-8 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Contractor not found</p>
          <button
            onClick={() => router.push("/admin/manage-contractors")}
            className="mt-4 text-blue-600 hover:text-blue-800 text-sm sm:text-base"
          >
            ← Back to contractors
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-2 px-4 py-16 lg:p-8">
      {/* Main Container */}
      <div className="bg-white rounded-xl shadow-sm p-3 sm:p-4 lg:p-6">
        {/* Mobile Header */}
        <div className="lg:hidden mb-4">
          <div className="flex items-center justify-between mb-3">
            <button
              onClick={() => router.push("/admin/manage-contractors")}
              className="text-blue-600 hover:text-blue-800 text-sm"
            >
              ← Back
            </button>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <Menu size={20} />
            </button>
          </div>

          <h1 className="text-lg font-medium text-gray-900 truncate">
            {contractor.companyName || contractor.name}
          </h1>

          {isMobileMenuOpen && (
            <div className="mt-3 p-3 bg-gray-50 rounded-lg">
              <div className="flex flex-col gap-2">
                <div className="relative">
                  <button
                    onClick={() => setFilterOpen(!filterOpen)}
                    className="flex items-center justify-between w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors text-sm"
                  >
                    <span>Filter by month</span>
                    <Filter size={16} />
                  </button>

                  {filterOpen && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                      <div className="p-2 max-h-60 overflow-y-auto">
                        {months.map((month) => (
                          <button
                            key={month.value}
                            onClick={() => {
                              setSelectedMonth(month.value);
                              setFilterOpen(false);
                              setCurrentPage(1);
                              setIsMobileMenuOpen(false);
                            }}
                            className={`w-full text-left px-3 py-2 rounded hover:bg-gray-100 transition-colors text-sm ${
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

                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search certificates..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
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
          )}
        </div>

        {/* Desktop Header */}
        <div className="hidden lg:flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
          <h1 className="text-xl lg:text-2xl font-medium text-gray-900">
            {contractor.companyName || contractor.name}
          </h1>

          <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
            {/* Filter Button */}
            <div className="relative">
              <button
                onClick={() => setFilterOpen(!filterOpen)}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors text-sm"
              >
                <Filter size={16} />
                Filter by month
              </button>

              {filterOpen && (
                <div className="absolute top-full left-0 mt-2 bg-white rounded-lg shadow-lg border border-gray-200 z-10 min-w-48">
                  <div className="p-2 max-h-60 overflow-y-auto">
                    {months.map((month) => (
                      <button
                        key={month.value}
                        onClick={() => {
                          setSelectedMonth(month.value);
                          setFilterOpen(false);
                          setCurrentPage(1);
                        }}
                        className={`w-full text-left px-3 py-2 rounded hover:bg-gray-100 transition-colors text-sm ${
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
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-64 text-sm"
              />
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
            </div>

            {/* Download Button */}
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
          {selectedMonth
            ? `${summary.monthName} ${summary.year}: Total certificates: ${summary.totalCerts}, Premium: ${summary.totalPremium}`
            : `All Time: Total certificates: ${certificates.length}`}
        </div>
      </div>

      {/* View/Edit Certificate Modal - Made Responsive */}
      {showModal && selectedCertificate && (
        <div className="fixed inset-0 bg-black/50 flex items-start sm:items-center justify-center p-2 sm:p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[95vh] sm:max-h-[90vh] overflow-hidden m-2 sm:m-4">
            {/* Modal Header */}
            <div className="p-4 sm:p-6 border-b border-gray-200">
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <div className="inline-flex items-center gap-2">
                  <div>
                    <Image
                      src="/bluedrop.png"
                      height="190"
                      width="190"
                      alt="Renewably UK"
                      className="h-auto w-auto"
                      onError={(e) => {
                        e.target.style.display = "none";
                        e.target.nextSibling.style.display = "flex";
                      }}
                    />
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
              </div>

              {/* Show status badge */}
              {/* {selectedCertificate.status && (
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
              )} */}
              {/* Show existing request status */}
              {selectedCertificate.status &&
                selectedCertificate.status.includes("pending") && (
                  <div className="mt-3 p-2 sm:p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 sm:w-3 sm:h-3 bg-yellow-500 rounded-full"></div>
                      <span className="font-medium text-yellow-800 text-xs sm:text-sm">
                        {selectedCertificate.status === "pending_edit"
                          ? "Edit Request Pending"
                          : "Cancellation Request Pending"}
                      </span>
                    </div>
                    {selectedCertificate.rawData?.insurance?.requestData
                      ?.reason && (
                      <p className="text-xs text-yellow-700 mt-1">
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
