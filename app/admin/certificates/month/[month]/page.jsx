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
import Image from "next/image";
import { downloadPdf } from "@/utils/pdfGenerator";

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
          `/api/admin/certificates/month/${month}?page=${currentPage}`,
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
      contractValue: certificate.contractValue.replace("£ ", ""),
    });

    setShowModal(true);
    setRequestType("");
    setModalError("");
  };

  const handleDownloadSingle = async (certificate) => {
    try {
      // setDownloading(true);

      // Create a contractor object for the downloadPdf function
      const contractor = {
        name: certificate.contractorName || "Unknown Contractor",
        companyName: certificate.contractorName || "Unknown Company",
        address: certificate.rawData?.contractorAddress || "Not provided",
        email: certificate.rawData?.contractorEmail || "Not provided",
      };

      // Use your existing downloadPdf function
      await downloadPdf(certificate, contractor);
    } catch (error) {
      console.error("Download error:", error);
      alert("Failed to download certificate");
    } finally {
      setDownloading(false);
    }
  };

  const handleDownloadCSV = () => {
    if (certificates.length === 0) {
      alert("No data to export");
      return;
    }

    try {
      // Define CSV headers
      const headers = [
        "Policy Number",
        "Policy Holder",
        "Policy Holder Address",
        "Product Type",
        "Contract Value",
        "Inception Date",
        "Expiry Date",
        "Price",
        "Contractor Name",
        "Email",
        "Phone",
        "Country",
        "Postcode",
        "Creation Date",
      ];

      // Convert data to CSV rows
      const csvRows = certificates.map((cert) => [
        cert.policyNo || "",
        cert.holderName || "",
        cert.address || "",
        cert.productType || "",
        cert.contractValue || "",
        cert.inceptionDate || "",
        cert.expiryDate || "",
        cert.price || "",
        cert.contractorName || "",
        cert.email || "",
        cert.phone || "",
        cert.country || "",
        cert.postcode || "",
        formatTimestamp(cert.createdAt),
      ]);

      // Combine headers and rows
      const csvContent = [
        headers.join(","),
        ...csvRows.map((row) => row.map((field) => `"${field}"`).join(",")),
      ].join("\n");

      // Create and download CSV file
      const csvContentWithBom = "\uFEFF" + csvContent; // ← Add UTF-8 BOM

      const blob = new Blob([csvContentWithBom], {
        type: "text/csv;charset=utf-8;",
      });
      // const blob = new Blob([csvContent], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${monthData?.name || "month"}_${
        monthData?.year || new Date().getFullYear()
      }_certificates.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      alert(
        `CSV exported successfully! ${certificates.length} records downloaded.`,
      );
    } catch (error) {
      console.error("CSV export error:", error);
      alert("Failed to export CSV file");
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
        selectedRows.includes(cert.id),
      );

      // Download each certificate
      for (const cert of selectedCerts) {
        // Create contractor object for each certificate
        const contractor = {
          name: cert.contractorName || "Unknown Contractor",
          companyName: cert.contractorName || "Unknown Company",
          address: cert.rawData?.contractorAddress || "Not provided",
          email: cert.rawData?.contractorEmail || "Not provided",
        };

        // Use your existing downloadPdf function
        await downloadPdf(cert, contractor);

        // Add a small delay between downloads
        if (selectedCerts.length > 1) {
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
    <div className='flex flex-col sm:flex-row sm:items-start py-2'>
      <div className='w-full sm:w-1/3 text-sm font-medium text-gray-700 mb-1 sm:mb-0'>
        {label}
      </div>
      <div className='w-full sm:w-2/3 flex items-center gap-2'>
        {requestType === "edit" && editable ? (
          <input
            type='text'
            value={value || ""}
            onChange={(e) =>
              setEditableFields((prev) => ({
                ...prev,
                [field]: e.target.value,
              }))
            }
            className='flex-1 px-3 py-2 text-sm text-gray-900 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500'
          />
        ) : (
          <span className='flex-1 text-sm text-gray-600 wrap-break-words'>
            {value || "Not provided"}
          </span>
        )}
        {requestType === "edit" && editable && (
          <Edit2 className='w-4 h-4 text-gray-400 shrink-0' />
        )}
      </div>
    </div>
  );

  const renderStaticField = (label, value) => (
    <div className='flex flex-col sm:flex-row sm:items-start py-2'>
      <div className='w-full sm:w-1/3 text-sm font-medium text-gray-700 mb-1 sm:mb-0'>
        {label}
      </div>
      <div className='w-full sm:w-2/3'>
        <span className='text-sm text-gray-600 wrap-break-words'>{value}</span>
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
        error.message || "Failed to submit request. Please try again.",
      );
    } finally {
      setSubmitting(false);
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
      cert.productType?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  // Pagination
  const totalPages = Math.ceil(filteredCertificates.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedCertificates = filteredCertificates.slice(
    startIndex,
    endIndex,
  );
  console.log(paginatedCertificates);
  if (loading) {
    return (
      <div className='min-h-screen bg-gray-50 p-8 flex items-center justify-center'>
        <div className='text-center'>
          <Loader2 className='w-8 h-8 animate-spin text-blue-600 mx-auto mb-3' />
          <p className='text-gray-600'>
            Loading certificates for {monthData?.name}...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gray-50 p-4 lg:p-8'>
      {/* Header */}
      <div className='mb-6'>
        <button
          onClick={() => router.push("/admin")}
          className='flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-4'>
          <ArrowLeft className='w-4 h-4' />
          Back to Dashboard
        </button>

        <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4'>
          <div>
            <h1 className='text-xl lg:text-2xl font-medium text-gray-900'>
              {monthData?.name} {monthData?.year} - Certificates
            </h1>
            <p className='text-gray-600 mt-1'>
              {certificates.length} certificates generated this month
            </p>
          </div>

          <div className='flex items-center gap-3'>
            <div className='relative'>
              <input
                type='text'
                placeholder='Search certificates...'
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className='pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-64 text-sm'
              />
              <Search className='absolute left-3 top-2.5 w-4 h-4 text-gray-400' />
            </div>

            {/* CSV Download Button */}
            <button
              onClick={handleDownloadCSV}
              className='flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm'
              title='Download CSV for entire month'>
              <DownloadIcon size={16} />
              Export CSV
            </button>

            {/* Selected PDFs Download Button */}
            <button
              onClick={handleDownloadSelected}
              disabled={downloadingAll || selectedRows.length === 0}
              className='flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm'>
              <DownloadIcon size={16} />
              Download PDFs ({selectedRows.length})
            </button>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className='bg-white rounded-xl shadow-sm p-6'>
        {/* Table Container */}
        <div className='border border-gray-300 rounded-lg overflow-hidden'>
          {/* Desktop Table */}
          <div className='hidden lg:block overflow-x-auto'>
            <table className='w-full'>
              <thead>
                <tr className='bg-gray-50'>
                  <th className='px-4 lg:px-6 py-3'>
                    <input
                      type='checkbox'
                      checked={
                        selectedRows.length === paginatedCertificates.length &&
                        paginatedCertificates.length > 0
                      }
                      onChange={handleSelectAll}
                      className='w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500'
                    />
                  </th>
                  <th className='px-4 lg:px-6 py-3 text-left text-xs sm:text-sm font-medium text-gray-700'>
                    Policy Number
                  </th>
                  <th className='px-4 lg:px-6 py-3 text-left text-xs sm:text-sm font-medium text-gray-700'>
                    Policy Holder
                  </th>
                  <th className='px-4 lg:px-6 py-3 text-left text-xs sm:text-sm font-medium text-gray-700'>
                    Policy Holder Address
                  </th>
                  <th className='px-4 lg:px-6 py-3 text-left text-xs sm:text-sm font-medium text-gray-700'>
                    Product Type
                  </th>
                  <th className='px-4 lg:px-6 py-3 text-left text-xs sm:text-sm font-medium text-gray-700'>
                    Contract Value
                  </th>

                  <th className='px-4 lg:px-6 py-3 text-left text-xs sm:text-sm font-medium text-gray-700'>
                    Inception Date
                  </th>
                  <th className='px-4 lg:px-6 py-3 text-left text-xs sm:text-sm font-medium text-gray-700'>
                    Expiry Date
                  </th>
                  <th className='px-4 lg:px-6 py-3 text-left text-xs sm:text-sm font-medium text-gray-700'>
                    Price
                  </th>
                  <th className='px-4 lg:px-6 py-3 text-left text-xs sm:text-sm font-medium text-gray-700'>
                    Creation Date
                  </th>
                  <th className='px-4 lg:px-6 py-3 text-left text-xs sm:text-sm font-medium text-gray-700'>
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {paginatedCertificates.length === 0 ? (
                  <tr>
                    <td
                      colSpan='10'
                      className='px-6 py-12 text-center text-gray-500'>
                      <FileText className='w-12 h-12 mx-auto mb-3 text-gray-300' />
                      <p className='text-sm sm:text-base'>
                        No certificates found
                      </p>
                      {searchTerm && (
                        <p className='text-xs sm:text-sm mt-1'>
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
                      }`}>
                      <td className='px-4 lg:px-6 py-3'>
                        <input
                          type='checkbox'
                          checked={isRowSelected(cert.id)}
                          onChange={() => handleSelectRow(cert.id)}
                          className='w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500'
                        />
                      </td>
                      <td className='px-4 lg:px-6 py-3'>
                        <div className='flex items-center gap-2'>
                          <span className='font-medium text-gray-900 text-xs sm:text-sm'>
                            {cert.policyNo}
                          </span>
                        </div>
                      </td>
                      <td className='px-4 lg:px-6 py-3 text-gray-700 text-xs sm:text-sm'>
                        <div className='truncate max-w-37.5'>
                          {cert.holderName}
                        </div>
                      </td>
                      <td className='px-4 lg:px-6 py-3 text-gray-700 text-xs sm:text-sm'>
                        <div className='truncate max-w-37.5'>
                          {cert.address}
                        </div>
                      </td>
                      <td className='px-4 lg:px-6 py-3 text-gray-700 text-xs sm:text-sm'>
                        <div className='truncate max-w-30'>
                          {cert.productType}
                        </div>
                      </td>
                      <td className='px-4 lg:px-6 py-3 text-gray-700 text-xs sm:text-sm'>
                        {cert.contractValue}
                      </td>
                      <td className='px-4 lg:px-6 py-3 text-gray-700 text-xs sm:text-sm'>
                        {cert.inceptionDate}
                      </td>
                      <td className='px-4 lg:px-6 py-3 text-gray-700 text-xs sm:text-sm'>
                        {cert.expiryDate}
                      </td>
                      <td className='px-4 lg:px-6 py-3 font-medium text-gray-900 text-xs sm:text-sm'>
                        {cert.price}
                      </td>
                      <td className='px-4 lg:px-6 py-3 text-gray-700 text-xs sm:text-sm'>
                        <div className='whitespace-nowrap'>
                          {formatTimestamp(cert.createdAt)}
                        </div>
                      </td>
                      <td className='px-4 lg:px-6 py-3'>
                        <div className='flex items-center gap-2'>
                          <button
                            onClick={() => handleViewCertificate(cert)}
                            className='text-blue-600 hover:text-blue-800 transition-colors p-1 cursor-pointer'
                            title='View'>
                            <EyeIcon size={16} />
                          </button>
                          <button
                            onClick={() => handleDownloadSingle(cert)}
                            disabled={downloading}
                            className='text-blue-600 hover:text-blue-800 transition-colors p-1 disabled:opacity-50 cursor-pointer'
                            title='Download'>
                            {downloading ? (
                              <Loader2 className='w-4 h-4 animate-spin' />
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
          <div className='lg:hidden'>
            {paginatedCertificates.length === 0 ? (
              <div className='px-4 py-12 text-center text-gray-500'>
                <FileText className='w-12 h-12 mx-auto mb-3 text-gray-300' />
                <p className='text-sm'>No certificates found</p>
                {searchTerm && (
                  <p className='text-xs mt-1'>Try a different search term</p>
                )}
              </div>
            ) : (
              <div className='divide-y divide-gray-200'>
                {paginatedCertificates.map((cert) => (
                  <div
                    key={cert.id}
                    className={`p-3 hover:bg-gray-50 transition-colors ${
                      isRowSelected(cert.id) ? "bg-blue-50" : ""
                    }`}>
                    <div className='flex items-start justify-between mb-2'>
                      <div className='flex items-center gap-2'>
                        <input
                          type='checkbox'
                          checked={isRowSelected(cert.id)}
                          onChange={() => handleSelectRow(cert.id)}
                          className='w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 mt-1'
                        />
                        <div>
                          <div className='font-medium text-gray-900 text-sm'>
                            {cert.policyNo}
                          </div>
                          <div className='text-xs text-gray-500'>
                            {cert.holderName}
                          </div>
                        </div>
                      </div>
                      <div className='flex items-center gap-1'>
                        <button
                          onClick={() => handleViewCertificate(cert)}
                          className='text-blue-600 hover:text-blue-800 transition-colors p-1'
                          title='View'>
                          <EyeIcon size={16} />
                        </button>
                        <button
                          onClick={() => handleDownloadSingle(cert)}
                          disabled={downloading}
                          className='text-blue-600 hover:text-blue-800 transition-colors p-1 disabled:opacity-50'
                          title='Download'>
                          {downloading ? (
                            <Loader2 className='w-4 h-4 animate-spin' />
                          ) : (
                            <DownloadIcon size={16} />
                          )}
                        </button>
                      </div>
                    </div>

                    <div className='grid grid-cols-2 gap-2 text-xs'>
                      <div>
                        <div className='text-gray-500'>Product Type</div>
                        <div className='font-medium truncate'>
                          {cert.productType}
                        </div>
                      </div>
                      <div>
                        <div className='text-gray-500'>Contract Value</div>
                        <div className='font-medium'>{cert.contractValue}</div>
                      </div>
                      <div>
                        <div className='text-gray-500'>Inception Date</div>
                        <div className='font-medium'>{cert.inceptionDate}</div>
                      </div>
                      <div>
                        <div className='text-gray-500'>Expiry Date</div>
                        <div className='font-medium'>{cert.expiryDate}</div>
                      </div>
                      <div>
                        <div className='text-gray-500'>Created</div>
                        <div className='font-medium text-xs'>
                          {formatTimestamp(cert.createdAt)}
                        </div>
                      </div>
                      <div>
                        <div className='text-gray-500'>Price</div>
                        <div className='font-medium'>{cert.price}</div>
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
          <div className='flex flex-col sm:flex-row justify-center items-center gap-2 mt-4 sm:mt-6'>
            <div className='flex items-center gap-2'>
              <button
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className='px-3 py-1.5 text-xs sm:text-sm text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed border border-gray-300 rounded hover:bg-gray-50 transition-colors'>
                ‹ Prev
              </button>

              {/* Page Numbers */}
              <div className='flex items-center gap-1'>
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
                      }`}>
                      {pageNum}
                    </button>
                  );
                })}

                {totalPages > 3 && (
                  <>
                    <span className='px-1 text-gray-400 text-xs'>...</span>
                    <button
                      onClick={() => setCurrentPage(totalPages)}
                      className={`px-2 py-1 text-xs sm:text-sm rounded transition-colors ${
                        currentPage === totalPages
                          ? "bg-blue-600 text-white"
                          : "text-gray-700 hover:bg-gray-100"
                      }`}>
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
                className='px-3 py-1.5 text-xs sm:text-sm text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed border border-gray-300 rounded hover:bg-gray-50 transition-colors'>
                Next ›
              </button>
            </div>

            <div className='text-xs sm:text-sm text-gray-500 mt-2 sm:mt-0'>
              Page {currentPage} of {totalPages}
            </div>
          </div>
        )}

        {/* Summary */}
        <div className='mt-4 sm:mt-6 text-center text-xs sm:text-sm text-gray-600 px-2'>
          Showing {paginatedCertificates.length} certificates for{" "}
          {monthData?.name} {monthData?.year}
        </div>
      </div>

      {/* View/Edit Certificate Modal */}
      {showModal && selectedCertificate && !requestType && (
        <div className='fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto'>
          <div className='bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden'>
            {/* Modal Header with Bluedrop */}
            <div className='p-6 border-b border-gray-200 bg-linear-to-r from-blue-50 to-white'>
              <div className='flex justify-between items-start mb-6'>
                <div>
                  <div className='flex items-center gap-3 mb-2'>
                    <Image
                      src='/bluedrop.png'
                      height={200}
                      width={200}
                      alt='Bluedrop'
                      className='h-auto'
                    />
                  </div>
                  <div className='text-2xl font-bold text-blue-800'>
                    {selectedCertificate.policyNo ||
                      selectedCertificate.policyNumber}
                  </div>
                </div>

                <div className='flex items-center gap-3'>
                  <button
                    onClick={() => handleDownloadSingle(selectedCertificate)}
                    disabled={downloading}
                    className='flex items-center gap-2 px-4 py-2 '>
                    {downloading ? (
                      <Loader2 className='w-6 h-6 animate-spin' />
                    ) : (
                      <Download className='w-6 h-6' />
                    )}
                  </button>
                  <button
                    onClick={() => setShowModal(false)}
                    className='p-2 hover:bg-gray-100 rounded-lg'>
                    <X className='w-5 h-5' />
                  </button>
                </div>
              </div>
            </div>

            {/* Certificate Content - Matching Figma Design */}
            <div className='p-6 overflow-y-auto max-h-[70vh]'>
              {/* Policy Holder Name - Big and Bold */}
              <div className='mb-8'>
                <div className='text-sm text-gray-500 mb-1'>
                  Policy Holder Name
                </div>
                <div className='text-2xl font-bold text-gray-900'>
                  {selectedCertificate.holderName ||
                    selectedCertificate.policyHolderName}
                </div>
              </div>

              {/* Divider */}
              <div className='border-t border-gray-300 my-6'></div>

              {/* Details Grid - 2 columns */}
              <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                {/* Left Column */}
                <div className='space-y-4'>
                  <div>
                    <div className='text-sm text-gray-500 mb-1'>Address</div>
                    <div className='text-base font-medium'>
                      {selectedCertificate.address ||
                        selectedCertificate.policyHolderAddress ||
                        "Not specified"}
                    </div>
                  </div>

                  <div>
                    <div className='text-sm text-gray-500 mb-1'>Country</div>
                    <div className='text-base font-medium'>
                      {selectedCertificate.country ||
                        selectedCertificate.rawData?.insurance?.country ||
                        "Not specified"}
                    </div>
                  </div>

                  <div>
                    <div className='text-sm text-gray-500 mb-1'>Postcode</div>
                    <div className='text-base font-medium'>
                      {selectedCertificate.postcode ||
                        selectedCertificate.rawData?.insurance?.postcode ||
                        "Not specified"}
                    </div>
                  </div>

                  <div>
                    <div className='text-sm text-gray-500 mb-1'>
                      Policyholder email
                    </div>
                    <div className='text-base font-medium'>
                      {selectedCertificate.email ||
                        selectedCertificate.rawData?.insurance?.email ||
                        "Not specified"}
                    </div>
                  </div>

                  <div>
                    <div className='text-sm text-gray-500 mb-1'>
                      Policyholder Phone
                    </div>
                    <div className='text-base font-medium'>
                      {selectedCertificate.phone ||
                        selectedCertificate.rawData?.insurance?.phone ||
                        "Not specified"}
                    </div>
                  </div>
                </div>

                {/* Right Column */}
                <div className='space-y-4'>
                  <div>
                    <div className='text-sm text-gray-500 mb-1'>
                      Product Type
                    </div>
                    <div className='text-base font-medium'>
                      {selectedCertificate.productType}
                    </div>
                  </div>

                  <div>
                    <div className='text-sm text-gray-500 mb-1'>
                      Contract Value
                    </div>
                    <div className='text-base font-medium'>
                      {selectedCertificate.contractValue}
                    </div>
                  </div>

                  <div>
                    <div className='text-sm text-gray-500 mb-1'>
                      Insurance Coverage
                    </div>
                    <div className='text-base font-medium'>
                      Insurance Backed Guarantee
                    </div>
                  </div>

                  <div>
                    <div className='text-sm text-gray-500 mb-1'>
                      Inception Date
                    </div>
                    <div className='text-base font-medium'>
                      {selectedCertificate.inceptionDate}
                    </div>
                  </div>

                  <div>
                    <div className='text-sm text-gray-500 mb-1'>
                      Expiry Date
                    </div>
                    <div className='text-base font-medium'>
                      {selectedCertificate.expiryDate}
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Section */}
              <div className='mt-8 space-y-4'>
                <div>
                  <div className='text-sm text-gray-500 mb-1'>
                    IBG Creation Date Stamp
                  </div>
                  <div className='text-base font-medium'>
                    {formatTimestamp(selectedCertificate.createdAt)}
                  </div>
                </div>

                <div>
                  <div className='text-sm text-gray-500 mb-1'>
                    Transaction Type
                  </div>
                  <div className='text-base font-medium'>
                    Certificate Generated
                  </div>
                </div>

                <div>
                  <div className='text-sm text-gray-500 mb-1'>Price</div>
                  <div className='text-base font-medium text-green-600'>
                    {selectedCertificate.price}
                  </div>
                </div>
              </div>

              {/* Divider */}
              <div className='border-t border-gray-300 my-6'></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
