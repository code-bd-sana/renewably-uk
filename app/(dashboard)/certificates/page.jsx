"use client";

import bluedrop from "@/public/shared/bluedrop.jpg";
import { downloadPdf, generateCertificatePDF } from "@/utils/pdfGenerator";
import {
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Download,
  Edit2,
  Eye,
  FileText,
  Loader2,
  Search,
  X,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

export default function CertificatesPage() {
  const router = useRouter();
  const [certificates, setCertificates] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [productsLoading, setProductsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [downloading, setDownloading] = useState(false);
  const [downloadingAll, setDownloadingAll] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [selectedCertificate, setSelectedCertificate] = useState(null);
  const [requestType, setRequestType] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [editableFields, setEditableFields] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [modalError, setModalError] = useState("");
  const [requestReason, setRequestReason] = useState("");
  const [showProductDropdown, setShowProductDropdown] = useState(false);
  const [productSearchQuery, setProductSearchQuery] = useState("");

  const itemsPerPage = 10;

  // Fetch products from API
  const fetchProducts = async () => {
    try {
      setProductsLoading(true);
      const response = await fetch("/api/admin/products");
      const data = await response.json();
      if (data.success) {
        setProducts(data.products.filter((p) => p.Measures));
      }
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setProductsLoading(false);
    }
  };

  const fetchCertificates = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/certificates", {
        credentials: "include",
      });

      if (!response.ok) {
        if (response.status === 401) {
          router.push("/login");
          return;
        }
        throw new Error("Failed to fetch certificates");
      }

      const data = await response.json();
      if (data.success) {
        setCertificates(data.certificates || []);
      }
    } catch (error) {
      console.error("Error fetching certificates:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCertificates();
    fetchProducts();
  }, [router]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isDropdownOpen && !event.target.closest(".request-dropdown")) {
        setIsDropdownOpen(false);
      }

      if (showProductDropdown && !event.target.closest(".product-dropdown")) {
        setShowProductDropdown(false);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [isDropdownOpen, showProductDropdown]);

  const filteredProducts = useMemo(() => {
    if (!productSearchQuery.trim()) {
      return products;
    }

    const query = productSearchQuery.toLowerCase();
    return products.filter((product) =>
      product.Measures.toLowerCase().includes(query)
    );
  }, [products, productSearchQuery]);

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
    console.log("=== VIEW CERTIFICATE DEBUG ===");
    console.log("Full certificate object:", certificate);
    console.log("Certificate status from API:", certificate.status);
    console.log(
      "rawData.insurance.status:",
      certificate.rawData?.insurance?.status
    );
    console.log("rawData.status:", certificate.rawData?.status);

    // Get the actual status - it's directly on certificate.status
    const actualStatus = certificate.status || "active";

    setSelectedCertificate({
      policyNumber: certificate.policyNo,
      policyHolderName: certificate.holderName,
      productType: certificate.productType,
      contractValue: certificate.contractValue,
      inceptionDate: certificate.inceptionDate,
      expiryDate: certificate.expiryDate,
      createdAt: certificate.createdAt,
      price: certificate.price,
      status: actualStatus, // Use certificate.status directly
      contractorName:
        certificate.rawData?.insurance?.contractorName || "Not provided",
      contractorAddress:
        certificate.rawData?.insurance?.contractorAddress || "Not provided",
      email: certificate.rawData?.insurance?.email || "Not provided",
      phone: certificate.rawData?.insurance?.phone || "Not provided",
      address: certificate.rawData?.insurance?.address || "Not provided",
      country: certificate.rawData?.insurance?.country || "Not provided",
      postcode: certificate.rawData?.insurance?.postcode || "Not provided",
      insuranceId: certificate.insuranceId || certificate.id,
      // Store the full rawData for reference
      rawData: certificate.rawData,
    });

    setEditableFields({
      policyHolderName: certificate.holderName,
      address: certificate.rawData?.insurance?.address || "",
      country: certificate.rawData?.insurance?.country || "",
      postcode: certificate.rawData?.insurance?.postcode || "",
      email: certificate.rawData?.insurance?.email || "",
      phone: certificate.rawData?.insurance?.phone || "",
      productType: certificate.productType,
      contractValue: certificate.contractValue.replace("€ ", ""),
    });

    setShowModal(true);
    setRequestType("");
    setModalError("");
  };
  const handleDownload = async (cert) => {
    await downloadPdf(cert);
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

      for (const cert of selectedCerts) {
        await handleDownload(cert.id);
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
    } catch (error) {
      console.error("Download error:", error);
      alert("Failed to download certificates");
    } finally {
      setDownloadingAll(false);
    }
  };

  // Helper function to render editable fields
  // const renderField = (
  //   label,
  //   field,
  //   value,
  //   editable = true,
  //   nonEditable = false
  // ) => (
  //   <div className="flex items-start py-2">
  //     <div className="w-1/3 text-sm font-medium text-gray-700">{label}</div>
  //     <div className="w-2/3 flex items-center gap-2">
  //       {requestType === "edit" && editable && !nonEditable ? (
  //         <div className="flex-1">
  //           {field === "productType" ? (
  //             <div className="relative product-dropdown">
  //               <button
  //                 type="button"
  //                 onClick={() => setShowProductDropdown(!showProductDropdown)}
  //                 className="w-full px-3 py-2 text-sm text-left border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center justify-between hover:border-gray-400"
  //               >
  //                 <span
  //                   className={
  //                     editableFields[field] ? "text-gray-900" : "text-gray-400"
  //                   }
  //                 >
  //                   {editableFields[field] || "Select product type"}
  //                 </span>
  //                 <ChevronDown
  //                   size={16}
  //                   className={`transition-transform ${
  //                     showProductDropdown ? "rotate-180" : ""
  //                   }`}
  //                 />
  //               </button>

  //               {showProductDropdown && (
  //                 <div className="absolute z-50 top-full mt-1 bg-white rounded-lg shadow-lg border w-full max-w-md max-h-64 overflow-hidden">
  //                   <div className="p-3 border-b">
  //                     <div className="relative">
  //                       <Search
  //                         size={16}
  //                         className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
  //                       />
  //                       <input
  //                         type="text"
  //                         placeholder="Search products..."
  //                         className="w-full pl-10 pr-3 py-2 border rounded-lg text-sm"
  //                         value={productSearchQuery}
  //                         onChange={(e) =>
  //                           setProductSearchQuery(e.target.value)
  //                         }
  //                         onClick={(e) => e.stopPropagation()}
  //                       />
  //                     </div>
  //                   </div>

  //                   <div className="overflow-y-auto max-h-48">
  //                     {productsLoading ? (
  //                       <div className="px-4 py-3 text-center text-gray-500">
  //                         <Loader2
  //                           size={16}
  //                           className="animate-spin mx-auto mb-2"
  //                         />
  //                         Loading products...
  //                       </div>
  //                     ) : filteredProducts.length > 0 ? (
  //                       filteredProducts.map((product, index) => (
  //                         <button
  //                           key={product._id}
  //                           onClick={() => {
  //                             setEditableFields((prev) => ({
  //                               ...prev,
  //                               [field]: product.Measures,
  //                             }));
  //                             setShowProductDropdown(false);
  //                             setProductSearchQuery("");
  //                           }}
  //                           className={`w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center justify-between ${
  //                             index === 0 ? "" : "border-t"
  //                           }`}
  //                         >
  //                           <div>
  //                             <span className="font-medium text-sm">
  //                               {product.Measures}
  //                             </span>
  //                             <div className="text-xs text-gray-500 mt-1">
  //                               <span>
  //                                 Guarantee Period: {product.Year} years
  //                               </span>
  //                               {product.Month > 0 && (
  //                                 <span>, {product.Month} months</span>
  //                               )}
  //                               {product.Days > 0 && (
  //                                 <span>, {product.Days} days</span>
  //                               )}
  //                             </div>
  //                           </div>
  //                           {editableFields[field] === product.Measures && (
  //                             <Check
  //                               size={16}
  //                               className="text-white bg-blue-600 rounded-full p-0.5"
  //                             />
  //                           )}
  //                         </button>
  //                       ))
  //                     ) : (
  //                       <div className="px-4 py-3 text-center text-gray-500 text-sm">
  //                         No products found
  //                       </div>
  //                     )}
  //                   </div>
  //                 </div>
  //               )}
  //             </div>
  //           ) : (
  //             <input
  //               type="text"
  //               value={editableFields[field] || ""}
  //               onChange={(e) =>
  //                 setEditableFields((prev) => ({
  //                   ...prev,
  //                   [field]: e.target.value,
  //                 }))
  //               }
  //               className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
  //             />
  //           )}
  //         </div>
  //       ) : (
  //         <span className="flex-1 text-sm text-gray-600">
  //           {value || "Not provided"}
  //         </span>
  //       )}
  //       {/* EDIT ICON - FIXED: Always show when in edit mode and editable */}
  //       {requestType === "edit" && editable && !nonEditable && (
  //         <Edit2 className="w-4 h-4 text-gray-400 shrink-0" />
  //       )}
  //     </div>
  //   </div>
  // );

  const renderField = (label, field, value, editable = true, options = {}) => {
    const {
      type = "text",
      nonEditable = false,
      calculateExpiry = false,
    } = options;

    return (
      <div className="flex items-start py-2">
        <div className="w-1/3 text-sm font-medium text-gray-700">{label}</div>
        <div className="w-2/3 flex items-center gap-2">
          {requestType === "edit" && editable && !nonEditable ? (
            <div className="flex-1">
              {type === "date" ? (
                <input
                  type="date"
                  value={editableFields[field] || ""}
                  onChange={(e) => {
                    const newDate = e.target.value;
                    setEditableFields((prev) => {
                      let updated = { ...prev, [field]: newDate };

                      // Auto-calculate Expiry Date when Inception Date changes
                      if (calculateExpiry && editableFields.productType) {
                        const selectedProduct = products.find(
                          (p) => p.Measures === editableFields.productType
                        );
                        if (selectedProduct && newDate) {
                          const inception = new Date(newDate);
                          const expiry = new Date(inception);

                          if (selectedProduct.Year)
                            expiry.setFullYear(
                              expiry.getFullYear() + selectedProduct.Year
                            );
                          if (selectedProduct.Month)
                            expiry.setMonth(
                              expiry.getMonth() + selectedProduct.Month
                            );
                          if (selectedProduct.Days)
                            expiry.setDate(
                              expiry.getDate() + selectedProduct.Days
                            );

                          updated.expiryDateCalculated = expiry
                            .toISOString()
                            .split("T")[0];
                        }
                      }

                      return updated;
                    });
                  }}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              ) : field === "productType" ? (
                // ← Keep your existing product dropdown code exactly as it is
                <div className="relative product-dropdown">
                  <button
                    type="button"
                    onClick={() => setShowProductDropdown(!showProductDropdown)}
                    className="w-full px-3 py-2 text-sm text-left border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center justify-between hover:border-gray-400"
                  >
                    <span
                      className={
                        editableFields[field]
                          ? "text-gray-900"
                          : "text-gray-400"
                      }
                    >
                      {editableFields[field] || "Select product type"}
                    </span>
                    <ChevronDown
                      size={16}
                      className={`transition-transform ${
                        showProductDropdown ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  {showProductDropdown && (
                    <div className="absolute z-50 top-full mt-1 bg-white rounded-lg shadow-lg border w-full max-w-md max-h-64 overflow-hidden">
                      <div className="p-3 border-b">
                        <div className="relative">
                          <Search
                            size={16}
                            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                          />
                          <input
                            type="text"
                            placeholder="Search products..."
                            className="w-full pl-10 pr-3 py-2 border rounded-lg text-sm"
                            value={productSearchQuery}
                            onChange={(e) =>
                              setProductSearchQuery(e.target.value)
                            }
                            onClick={(e) => e.stopPropagation()}
                          />
                        </div>
                      </div>

                      <div className="overflow-y-auto max-h-48">
                        {productsLoading ? (
                          <div className="px-4 py-3 text-center text-gray-500">
                            <Loader2
                              size={16}
                              className="animate-spin mx-auto mb-2"
                            />
                            Loading products...
                          </div>
                        ) : filteredProducts.length > 0 ? (
                          filteredProducts.map((product, index) => (
                            <button
                              key={product._id}
                              onClick={() => {
                                setEditableFields((prev) => ({
                                  ...prev,
                                  [field]: product.Measures,
                                }));
                                setShowProductDropdown(false);
                                setProductSearchQuery("");
                              }}
                              className={`w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center justify-between ${
                                index === 0 ? "" : "border-t"
                              }`}
                            >
                              <div>
                                <span className="font-medium text-sm">
                                  {product.Measures}
                                </span>
                                <div className="text-xs text-gray-500 mt-1">
                                  <span>
                                    Guarantee Period: {product.Year} years
                                  </span>
                                  {product.Month > 0 && (
                                    <span>, {product.Month} months</span>
                                  )}
                                  {product.Days > 0 && (
                                    <span>, {product.Days} days</span>
                                  )}
                                </div>
                              </div>
                              {editableFields[field] === product.Measures && (
                                <Check
                                  size={16}
                                  className="text-white bg-blue-600 rounded-full p-0.5"
                                />
                              )}
                            </button>
                          ))
                        ) : (
                          <div className="px-4 py-3 text-center text-gray-500 text-sm">
                            No products found
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  {/* ... rest of your dropdown code stays exactly the same ... */}
                </div>
              ) : (
                <input
                  type="text"
                  value={editableFields[field] || ""}
                  onChange={(e) =>
                    setEditableFields((prev) => ({
                      ...prev,
                      [field]: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              )}
            </div>
          ) : (
            <span className="flex-1 text-sm text-gray-600">
              {field === "inceptionDate" && editableFields.expiryDateCalculated
                ? `${value} → New Expiry: ${editableFields.expiryDateCalculated}`
                : value || "Not provided"}
            </span>
          )}
          {requestType === "edit" && editable && !nonEditable && (
            <Edit2 className="w-4 h-4 text-gray-400 shrink-0" />
          )}
        </div>
      </div>
    );
  };

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

    if (
      (requestType === "edit" || requestType === "cancel") &&
      !requestReason.trim()
    ) {
      setModalError("Please provide a reason for your request");
      return;
    }

    try {
      setSubmitting(true);
      setModalError("");

      const requestData = {
        insuranceId: selectedCertificate.insuranceId || selectedCertificate.id,
        type: requestType,
        changes: requestType === "edit" ? editableFields : {},
        reason:
          requestReason || `Request for ${requestType} submitted by contractor`,
      };

      const response = await fetch("/api/insurance/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(requestData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to submit request");
      }

      alert(
        result.message ||
          "Request submitted successfully! Admin will review it."
      );

      setShowModal(false);
      setRequestType("");
      setRequestReason("");

      // Refresh certificates
      const refreshResponse = await fetch("/api/certificates", {
        credentials: "include",
      });
      if (refreshResponse.ok) {
        const refreshData = await refreshResponse.json();
        if (refreshData.success) {
          setCertificates(refreshData.certificates || []);
        }
      }
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
      generateCertificatePDF(certificate);
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
Name: ${certificate.rawData?.insurance?.contractorName || "Not Provided"}
Address: ${certificate.rawData?.insurance?.contractorAddress || "Not Provided"}

POLICY HOLDER DETAILS
---------------------
Name: ${certificate.holderName}
Email: ${certificate.rawData?.insurance?.email || "Not Provided"}
Phone: ${certificate.rawData?.insurance?.phone || "Not Provided"}
Address: ${certificate.rawData?.insurance?.address || "Not Provided"}

PRODUCT DETAILS
---------------
Product Type: ${certificate.productType}
Cover Option: ${
      certificate.rawData?.product?.coverOption || "Insurance Backed Guarantee"
    }
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

  const filteredCertificates = certificates.filter(
    (cert) =>
      cert.holderName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cert.policyNo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cert.productType?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredCertificates.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedCertificates = filteredCertificates.slice(
    startIndex,
    endIndex
  );
  console.log("lweksy", paginatedCertificates);

  if (loading) {
    return (
      <main className="p-4 lg:p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-3" />
            <p className="text-gray-600">Loading certificates...</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <div className="bg-[#FAFAF9]">
      <main className="p-4 bg-white border border-gray-100 rounded-lg m-6 mt-8 lg:p-6">
        {/* Logo */}
        <div className="mb-6">
          <div className="mb-6 px-4 mt-4">
            <Image src={bluedrop} height={150} width={192} alt="logo" />
          </div>
        </div>

        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <h1 className="text-2xl font-sans text-[28px] ml-4  font-semibold text-gray-800">
            My Insurance Backed Guarantee Certificates
          </h1>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:flex-initial">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                size={18}
              />
              <input
                type="text"
                placeholder="Search by policy holder name..."
                className="w-full sm:w-64 border border-gray-300 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button
              onClick={handleDownloadSelected}
              disabled={downloadingAll || selectedRows.length === 0}
              className="bg-[#0F47A8] text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {downloadingAll ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Download size={18} />
              )}
              {downloadingAll
                ? "Downloading..."
                : `Download (${selectedRows.length})`}
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg  overflow-hidden ">
          {filteredCertificates.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>No certificates found</p>
              {searchTerm && (
                <p className="text-sm mt-1">Try a different search term</p>
              )}
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden  border border-gray-200 lg:block overflow-x-auto">
                <table className="w-full ">
                  <thead>
                    <tr className="border-b bg-[#FAFAF9] border-gray-200">
                      <th className="px-4 py-3 text-left">
                        <input
                          type="checkbox"
                          checked={
                            selectedRows.length ===
                              filteredCertificates.length &&
                            filteredCertificates.length > 0
                          }
                          onChange={handleSelectAll}
                          className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-[#030712]">
                        Policy No
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-[#030712]">
                        Policy Holder Name
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-[#030712]">
                        Policy Holder Address
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-[#030712]">
                        Product Type
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-[#030712]">
                        Contract Value
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-[#030712]">
                        Inception Date
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-[#030712]">
                        Expiry Date
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-[#030712]">
                        Transaction Type
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-[#030712]">
                        Price
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-[#030712]">
                        Creation Date
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-[#030712]">
                        Status
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-[#030712]">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedCertificates.map((cert) => (
                      <tr
                        key={cert.id}
                        className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                          isRowSelected(cert.id) ? "bg-blue-50" : ""
                        }`}
                      >
                        <td className="px-4 py-3">
                          <input
                            type="checkbox"
                            checked={isRowSelected(cert.id)}
                            onChange={() => handleSelectRow(cert.id)}
                            className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                        </td>
                        <td className="px-4 py-3 text-sm text-[#0307120] font-mono font-medium">
                          {cert.policyNo}
                        </td>
                        <td className="px-4 py-3 text-sm font-normal font-sans text-[#6B7280]">
                          {cert.holderName}
                        </td>
                        <td className="px-4 py-3 text-sm font-normal font-sans text-[#6B7280]">
                          {cert.address}
                        </td>
                        <td className="px-4 py-3 text-sm font-normal font-sans text-[#6B7280]">
                          {cert.productType}
                        </td>
                        <td className="px-4 py-3 text-sm font-normal text-[#6B7280] font-mono">
                          {cert.contractValue}
                        </td>
                        <td className="px-4 py-3 text-sm font-normal text-[#6B7280] font-mono">
                          {cert.inceptionDate}
                        </td>
                        <td className="px-4 py-3 text-sm font-normal text-[#6B7280] font-mono">
                          {cert.expiryDate}
                        </td>
                        <td className="px-4 py-3 text-sm font-normal text-[#6B7280] font-sans">
                          {cert.transactionType}
                        </td>
                        <td className="px-4 py-3 text-sm font-normal text-[#6B7280] font-mono">
                          {cert.price}
                        </td>
                        <td className="px-4 py-3 text-sm font-normal text-[#6B7280] font-mono">
                          {cert.createdAt}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              cert.status === "active"
                                ? "bg-green-100 text-green-800"
                                : cert.status === "pending_edit"
                                ? "bg-yellow-100 text-yellow-800"
                                : cert.status === "pending_cancel"
                                ? "bg-orange-100 text-orange-800"
                                : cert.status === "cancelled"
                                ? "bg-red-100 text-red-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {cert.status === "pending_edit"
                              ? "Pending Edit"
                              : cert.status === "pending_cancel"
                              ? "Pending Cancellation"
                              : cert.status?.charAt(0).toUpperCase() +
                                  cert.status?.slice(1) || "Active"}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleViewCertificate(cert)}
                              className="p-2 hover:bg-gray-100 cursor-pointer rounded"
                              title="View Certificate"
                            >
                              <Eye size={18} className="text-[#0284C7]" />
                            </button>
                            <button
                              onClick={() => handleDownload(cert)}
                              disabled={downloading}
                              className="p-2 hover:bg-gray-100 cursor-pointer rounded-lg transition-colors disabled:opacity-50"
                              title="Download Certificate"
                            >
                              {downloading ? (
                                <Loader2
                                  size={18}
                                  className="text-gray-600 animate-spin"
                                />
                              ) : (
                                <Download size={18} className="text-gray-600" />
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="lg:hidden">
                {paginatedCertificates.map((cert) => (
                  <div
                    key={cert.id}
                    className={`p-4 border-b border-gray-100 ${
                      isRowSelected(cert.id) ? "bg-blue-50" : ""
                    }`}
                  >
                    <div className="flex items-start gap-3 mb-3">
                      <input
                        type="checkbox"
                        checked={isRowSelected(cert.id)}
                        onChange={() => handleSelectRow(cert.id)}
                        className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 mt-1"
                      />
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <div className="text-xs text-gray-500 mb-1">
                              Policy No
                            </div>
                            <div className="text-sm font-medium text-gray-700">
                              {cert.policyNo}
                            </div>
                          </div>
                          <div className="flex items-center gap-2 mt-2">
                            <span
                              className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                cert.status === "active"
                                  ? "bg-green-100 text-green-800"
                                  : cert.status === "pending_edit"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : cert.status === "pending_cancel"
                                  ? "bg-orange-100 text-orange-800"
                                  : cert.status === "cancelled"
                                  ? "bg-red-100 text-red-800"
                                  : "bg-gray-100 text-gray-800"
                              }`}
                            >
                              {cert.status === "pending_edit"
                                ? "Pending Edit"
                                : cert.status === "pending_cancel"
                                ? "Pending Cancellation"
                                : cert.status?.charAt(0).toUpperCase() +
                                    cert.status?.slice(1) || "Active"}
                            </span>
                          </div>
                          <div className="text-right">
                            <div className="text-xs text-gray-500 mb-1">
                              Price
                            </div>
                            <div className="text-sm font-semibold text-gray-700">
                              {cert.price}
                            </div>
                          </div>
                        </div>

                        <div className="space-y-2 mb-3">
                          <div>
                            <div className="text-xs text-gray-500">
                              Policy Holder Name
                            </div>
                            <div className="text-sm text-gray-700">
                              {cert.holderName}
                            </div>
                          </div>
                          <div>
                            <div className="text-xs text-gray-500">
                              Product Type
                            </div>
                            <div className="text-sm text-gray-700">
                              {cert.productType}
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <div className="text-xs text-gray-500">
                                Inception Date
                              </div>
                              <div className="text-sm text-gray-700">
                                {cert.inceptionDate}
                              </div>
                            </div>
                            <div>
                              <div className="text-xs text-gray-500">
                                Expiry Date
                              </div>
                              <div className="text-sm text-gray-700">
                                {cert.expiryDate}
                              </div>
                            </div>
                          </div>
                          <div>
                            <div className="text-xs text-gray-500">
                              Transaction Type
                            </div>
                            <div className="text-sm text-gray-700">
                              {cert.transactionType}
                            </div>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <button
                            onClick={() => handleViewCertificate(cert)}
                            className="flex-1 bg-[#0F47A8] text-white py-2 rounded-lg flex items-center justify-center gap-2 text-sm hover:bg-blue-700 transition-colors"
                          >
                            <Eye size={16} />
                            View
                          </button>
                          <button
                            onClick={() => handleDownload(cert.id)}
                            disabled={downloading}
                            className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg flex items-center justify-center gap-2 text-sm hover:bg-gray-200 transition-colors disabled:opacity-50"
                          >
                            {downloading ? (
                              <Loader2 size={16} className="animate-spin" />
                            ) : (
                              <Download size={16} />
                            )}
                            Download
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="px-4 pt-8 flex items-center justify-center border-t border-gray-200">
                  <nav className="flex items-center gap-2">
                    <button
                      onClick={() =>
                        setCurrentPage((prev) => Math.max(1, prev - 1))
                      }
                      disabled={currentPage === 1}
                      className="px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg flex items-center gap-1 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft size={16} />
                      Previous
                    </button>

                    <div className="flex items-center gap-1">
                      {[...Array(totalPages)].map((_, index) => {
                        const pageNum = index + 1;
                        if (
                          pageNum === 1 ||
                          pageNum === totalPages ||
                          (pageNum >= currentPage - 1 &&
                            pageNum <= currentPage + 1)
                        ) {
                          return (
                            <button
                              key={pageNum}
                              onClick={() => setCurrentPage(pageNum)}
                              className={`w-8 h-8 flex font-semibold items-center justify-center text-sm rounded-lg transition-colors ${
                                currentPage === pageNum
                                  ? "bg-[#F5F5F4] border border-[#D1D5DB] text-black "
                                  : "text-gray-600 hover:bg-gray-100"
                              }`}
                            >
                              {pageNum}
                            </button>
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
                      className="px-3 py-2 text-sm text-[#030712]  hover:bg-gray-100 rounded-lg flex items-center gap-1 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                      <ChevronRight size={16} />
                    </button>
                  </nav>
                </div>
              )}
            </>
          )}
        </div>

        {/* View/Edit Certificate Modal */}
        {showModal && selectedCertificate && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
              {/* Modal Header */}
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between mb-6">
                  <div className="inline-flex items-center gap-2">
                    <Image
                      src="/bluedrop.png"
                      height={200}
                      width={200}
                      alt="Renewably UK"
                      className="h-auto w-auto my-2"
                    />
                  </div>
                  <button
                    onClick={() => {
                      setShowModal(false);
                      setRequestType("");
                      setModalError("");
                      setShowProductDropdown(false);
                      setProductSearchQuery("");
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
                    <div className="relative request-dropdown">
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
                      onClick={() => handleDownload(selectedCertificate)}
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
                      {/* Status:{" "}
                      {selectedCertificate.status
                        .replace("_", " ")
                        .toUpperCase()} */}
                      Status:{" "}
                      {selectedCertificate.status === "pending_edit"
                        ? "PENDING EDIT"
                        : selectedCertificate.status === "pending_cancel"
                        ? "PENDING CANCELLATION"
                        : selectedCertificate.status
                            ?.replace("_", " ")
                            .toUpperCase() || "ACTIVE"}
                    </span>
                  </div>
                )}
              </div>

              {/* Error Message */}
              {modalError && (
                <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                  {modalError}
                </div>
              )}
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
                    {/* <div>
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
                    </div> */}

                    {renderField(
                      "Contractor Address",
                      "contractorAddress",
                      selectedCertificate.contractorAddress || "Not provided",
                      false, // editable = false (not used anyway for contractor)
                      true // nonEditable = true → no input + no edit icon
                    )}
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
                      editableFields.productType ||
                        selectedCertificate.productType ||
                        "Not provided",
                      true, // editable = true (so it shows dropdown if allowed)
                      true // nonEditable = true → shows as text only, no dropdown/input, no edit icon
                    )}
                    {renderField(
                      "Contract Value",
                      "contractValue",
                      editableFields.contractValue
                    )}
                    {renderStaticField(
                      "Insurance Coverage",
                      "Insurance Backed Guarantee"
                    )}
                    {/* {renderStaticField(
                      "Inception Date",
                      selectedCertificate.inceptionDate || "Not available"
                    )}
                    {renderStaticField(
                      "Expiry Date",
                      selectedCertificate.expiryDate || "Not available"
                    )} */}

                    {renderField(
                      "Inception Date",
                      "inceptionDate",
                      selectedCertificate.inceptionDate || "Not available",
                      true, // editable
                      { type: "date", calculateExpiry: true } // makes it a date input + triggers calculation
                    )}

                    {renderField(
                      "Expiry Date",
                      "expiryDate",
                      editableFields.expiryDateCalculated ||
                        selectedCertificate.expiryDate ||
                        "Not available",
                      false, // not editable
                      { nonEditable: true } // shows as text only
                    )}

                    {renderStaticField(
                      "IBG Creation Date Stamp",
                      selectedCertificate.createdAt || "Not available"
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

              {/* Request Action Buttons */}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
