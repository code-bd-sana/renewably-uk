"use client";

import { generateCertificatePDF } from "@/utils/pdfGenerator";
import jsPDF from "jspdf";
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
        certificate.rawData?.insurance?.contractorName || "Not provided",
      contractorAddress:
        certificate.rawData?.insurance?.contractorAddress || "Not provided",
      email: certificate.rawData?.insurance?.email || "Not provided",
      phone: certificate.rawData?.insurance?.phone || "Not provided",
      address: certificate.rawData?.insurance?.address || "Not provided",
      country: certificate.rawData?.insurance?.country || "Not provided",
      postcode: certificate.rawData?.insurance?.postcode || "Not provided",
      insuranceId: certificate.insuranceId || certificate.id?.split("-")[0],
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

  const handleDownload = async (contractorId) => {
    try {
      const contractor = certificates.find((c) => c.id === contractorId);
      if (!contractor) {
        alert("Contractor not found");
        return;
      }

      // Create PDF with large size to fit everything
      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: [297, 520],
      });

      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();

      // Set margins
      const margin = 15;
      let yPos = margin;
      const contentWidth = pageWidth - margin * 2;

      // Add light background
      doc.setFillColor(248, 250, 252);
      doc.rect(0, 0, pageWidth, pageHeight, "F");

      // Main white container
      doc.setFillColor(255, 255, 255);
      doc.setDrawColor(226, 232, 240);
      doc.rect(margin, yPos, contentWidth, pageHeight - margin * 2, "F");
      doc.rect(margin, yPos, contentWidth, pageHeight - margin * 2, "S");

      yPos += 8; // কম padding

      // Page Title
      doc.setFontSize(16);
      doc.setTextColor(31, 41, 55);
      doc.setFont("helvetica", "normal");

      yPos += 12; // কম padding

      // Divider
      doc.setDrawColor(229, 231, 235);
      doc.line(margin + 10, yPos, pageWidth - margin - 10, yPos);

      yPos += 15; // কম padding

      // Main Header
      doc.setFontSize(28);
      doc.setTextColor(15, 71, 168);
      doc.setFont("helvetica", "bold");
      doc.text("Insurance Backed Guarantee", pageWidth / 2, yPos, {
        align: "center",
      });

      yPos += 8; // কম padding

      doc.setFontSize(16);
      doc.setTextColor(15, 71, 168);
      doc.setFont("helvetica", "normal");
      doc.text("Certificate & Schedule of Insurance", pageWidth / 2, yPos, {
        align: "center",
      });

      // Logo placeholder
      doc.setFontSize(10);
      doc.setTextColor(150, 150, 150);

      yPos += 15; // কম padding

      // Cover Section
      doc.setFillColor(240, 247, 255);
      const coverHeight = 40; // কম height
      doc.rect(margin + 10, yPos, contentWidth - 20, coverHeight, "F");

      doc.setFontSize(14);
      doc.setTextColor(15, 71, 168);
      doc.setFont("helvetica", "bold");
      doc.text("Cover Option", margin + 20, yPos + 12); // কম padding

      doc.setFontSize(14);
      doc.setTextColor(31, 41, 55);
      doc.setFont("helvetica", "medium");
      doc.text("Insurance Backed Guarantee", margin + 20, yPos + 20); // কম padding

      doc.setFontSize(12);
      doc.setTextColor(75, 85, 99);
      const policyNumber = `BDIGWE${contractorId.slice(0, 6).toUpperCase()}`;
      doc.text(`Policy Number: ${policyNumber}`, margin + 20, yPos + 28); // কম padding

      doc.setFontSize(10);
      doc.setTextColor(156, 163, 175);
      doc.text(
        "Please refer to your policy wording for full details",
        margin + 20,
        yPos + 34
      );

      yPos += 46; // কম spacing

      // Two Column Section
      const columnWidth = (contentWidth - 30) / 2;

      // Left Column - Agent/Broker
      const colHeight = 40; // কম height
      doc.setFillColor(249, 250, 251);
      doc.rect(margin + 10, yPos, columnWidth, colHeight, "F");

      doc.setFontSize(14);
      doc.setTextColor(15, 71, 168);
      doc.setFont("helvetica", "bold");
      doc.text("Agent/Broker", margin + 20, yPos + 12); // কম padding

      doc.setFontSize(10);
      doc.setTextColor(156, 163, 175);
      doc.text("SERVICES", margin + 20, yPos + 22); // কম padding

      doc.setFontSize(12);
      doc.setTextColor(75, 85, 99);
      const agentAddress = "The Mill Suite, Hardmans Business Centre";
      const agentLines = doc.splitTextToSize(agentAddress, columnWidth - 30); // কম width
      doc.text(agentLines, margin + 20, yPos + 32); // কম padding

      // Right Column - Installation Contractor
      doc.setFillColor(249, 250, 251);
      doc.rect(margin + 20 + columnWidth, yPos, columnWidth, colHeight, "F");

      doc.setFontSize(14);
      doc.setTextColor(15, 71, 168);
      doc.setFont("helvetica", "bold");
      doc.text("Installation Contractor", margin + 30 + columnWidth, yPos + 12); // কম padding

      doc.setFontSize(16); // কম font size
      doc.setTextColor(31, 41, 55);
      doc.setFont("helvetica", "bold");
      const companyName =
        contractor.companyName || "North West Energy Grants Ltd";
      const companyLines = doc.splitTextToSize(companyName, columnWidth - 25);
      doc.text(companyLines, margin + 30 + columnWidth, yPos + 20); // কম padding

      doc.setFontSize(12);
      doc.setTextColor(75, 85, 99);
      const address =
        contractor.address || "2464 Royal Ln. Mesa, New Jersey 45463";
      const addressLines = doc.splitTextToSize(address, columnWidth - 35);
      doc.text(addressLines, margin + 30 + columnWidth, yPos + 30); // কম padding

      yPos += 50; // কম spacing

      // Insured/Policyholder Details
      const insuredHeight = 100; // কম height
      doc.setFillColor(249, 250, 251);
      doc.rect(margin + 10, yPos, contentWidth - 20, insuredHeight, "F");

      doc.setFontSize(14);
      doc.setTextColor(15, 71, 168);
      doc.setFont("helvetica", "bold");
      doc.text("Insured / Policyholder Details", margin + 20, yPos + 12); // কম padding

      // Row 1: Name & Inception Date
      doc.setFontSize(12);
      doc.setTextColor(31, 41, 55);
      doc.setFont("helvetica", "bold");
      doc.text("Name", margin + 20, yPos + 20); // কম padding
      doc.setFontSize(12);
      doc.setTextColor(75, 85, 99);
      doc.setFont("helvetica", "normal");
      doc.text(contractor.name || "Mr Leslie Corcoran", margin + 20, yPos + 30); // কম padding

      doc.setFontSize(12);
      doc.setTextColor(31, 41, 55);
      doc.setFont("helvetica", "bold");
      doc.text("Inception Date", margin + 20 + columnWidth + 10, yPos + 20);
      const inceptionDate = new Date();
      doc.setFontSize(12);
      doc.setTextColor(75, 85, 99);
      doc.text(
        inceptionDate.toISOString().split("T")[0],
        margin + 20 + columnWidth + 10,
        yPos + 30
      );

      // Row 2: Address & Expiry Date
      doc.setFontSize(12);
      doc.setTextColor(31, 41, 55);
      doc.setFont("helvetica", "bold");
      doc.text("Address", margin + 20, yPos + 40); // কম padding
      doc.setFontSize(12);
      doc.setTextColor(75, 85, 99);
      const insuredAddress =
        contractor.address || "Shadyview Gn, Richardson, California 62639";
      const insuredAddrLines = doc.splitTextToSize(
        insuredAddress,
        columnWidth - 15
      );
      doc.text(insuredAddrLines, margin + 20, yPos + 48); // কম padding

      doc.setFontSize(12);
      doc.setTextColor(31, 41, 55);
      doc.setFont("helvetica", "bold");
      doc.text("Expiry Date", margin + 20 + columnWidth + 10, yPos + 40);
      const expiryDate = new Date();
      expiryDate.setFullYear(expiryDate.getFullYear() + 2);
      doc.setFontSize(12);
      doc.setTextColor(75, 85, 99);
      doc.text(
        expiryDate.toISOString().split("T")[0],
        margin + 20 + columnWidth + 10,
        yPos + 48
      );

      // Row 3: Installation Type & Premium
      doc.setFontSize(12);
      doc.setTextColor(31, 41, 55);
      doc.setFont("helvetica", "bold");
      doc.text("Type of Installation", margin + 20, yPos + 60); // কম padding
      doc.setFontSize(12);
      doc.setTextColor(75, 85, 99);
      doc.text("Gas-Fired Condensing Boiler", margin + 20, yPos + 70); // কম padding

      doc.setFontSize(12);
      doc.setTextColor(31, 41, 55);
      doc.setFont("helvetica", "bold");
      doc.text("Premium", margin + 20 + columnWidth + 10, yPos + 60);
      doc.setFontSize(24); // কম font size
      doc.setTextColor(31, 41, 55);
      doc.setFont("helvetica", "bold");
      doc.text("£19.04", margin + 20 + columnWidth + 10, yPos + 70); // কম padding
      doc.setFontSize(9); // কম font size
      doc.setTextColor(156, 163, 175);
      doc.setFont("helvetica", "normal");
      doc.text(
        "Including Fire policy Premium Tax",
        margin + 20 + columnWidth + 10,
        yPos + 78
      );

      yPos += 105; // কম spacing

      // Scheme Information
      doc.setFillColor(249, 250, 251);
      const schemeHeight = 50; // কম height
      doc.rect(margin + 10, yPos, contentWidth - 20, schemeHeight, "F");

      doc.setFontSize(14);
      doc.setTextColor(15, 71, 168);
      doc.setFont("helvetica", "bold");
      doc.text("Scheme Information", margin + 20, yPos + 12); // কম padding

      const schemeItems = [
        { label: "Retrofit Assessor", value: "Savannah Nguyen" },
        { label: "Retrofit Coordinator", value: "Cameron Williamson" },
        { label: "Funding Partner", value: "Bessie Cooper" },
        { label: "Scheme Provider", value: "Ronald Richards" },
      ];

      // Calculate positions for 2x2 grid
      const schemeCol1X = margin + 20;
      const schemeCol2X = margin + 20 + columnWidth + 10;
      const schemeRow1Y = yPos + 20; // কম padding
      const schemeRow2Y = yPos + 36; // কম padding

      // Row 1, Col 1
      doc.setFontSize(12);
      doc.setTextColor(31, 41, 55);
      doc.setFont("helvetica", "bold");
      doc.text(schemeItems[0].label, schemeCol1X, schemeRow1Y);
      doc.setFontSize(12);
      doc.setTextColor(75, 85, 99);
      doc.setFont("helvetica", "normal");
      doc.text(schemeItems[0].value, schemeCol1X, schemeRow1Y + 7); // কম padding

      // Row 1, Col 2
      doc.setFontSize(12);
      doc.setTextColor(31, 41, 55);
      doc.setFont("helvetica", "bold");
      doc.text(schemeItems[1].label, schemeCol2X, schemeRow1Y);
      doc.setFontSize(12);
      doc.setTextColor(75, 85, 99);
      doc.setFont("helvetica", "normal");
      doc.text(schemeItems[1].value, schemeCol2X, schemeRow1Y + 7);

      // Row 2, Col 1
      doc.setFontSize(12);
      doc.setTextColor(31, 41, 55);
      doc.setFont("helvetica", "bold");
      doc.text(schemeItems[2].label, schemeCol1X, schemeRow2Y);
      doc.setFontSize(12);
      doc.setTextColor(75, 85, 99);
      doc.setFont("helvetica", "normal");
      doc.text(schemeItems[2].value, schemeCol1X, schemeRow2Y + 7);

      // Row 2, Col 2
      doc.setFontSize(12);
      doc.setTextColor(31, 41, 55);
      doc.setFont("helvetica", "bold");
      doc.text(schemeItems[3].label, schemeCol2X, schemeRow2Y);
      doc.setFontSize(12);
      doc.setTextColor(75, 85, 99);
      doc.setFont("helvetica", "normal");
      doc.text(schemeItems[3].value, schemeCol2X, schemeRow2Y + 7);

      yPos += 60; // কম spacing

      // Information Text
      doc.setFillColor(255, 251, 239);
      const infoHeight = 46; // কম height
      doc.rect(margin + 10, yPos, contentWidth - 20, infoHeight, "F");

      // First paragraph
      doc.setFontSize(10); // কম font size
      doc.setTextColor(75, 85, 99);
      const para1 =
        "This document includes information provided to us. It shows you who is insured, the period of insurance, the level of cover, and the premium paid. This policy is made up of this document, the IBG and the Policy Wording documents. These documents can be found at:";
      const para1Lines = doc.splitTextToSize(para1, contentWidth - 40);
      doc.text(para1Lines, margin + 20, yPos + 15); // কম padding

      const para1Height = para1Lines.length * 3.5; // কম line height

      // Website URL
      doc.setTextColor(15, 71, 168);
      doc.setFontSize(10); // কম font size
      doc.text(
        "www.bluedropservices.co.uk/Insurance-Backed-Guarantee",
        margin + 20,
        yPos + para1Height + 20
      );

      // Second paragraph
      doc.setTextColor(75, 85, 99);
      const para2 =
        "Should the property be sold please pass this document to your solicitor for transfer to the new owner.";
      const para2Lines = doc.splitTextToSize(para2, contentWidth - 40);
      doc.text(para2Lines, margin + 20, yPos + para1Height + 30);

      yPos += 60; // কম spacing

      // Insurer Section
      doc.setFontSize(16);
      doc.setTextColor(31, 41, 55);
      doc.setFont("helvetica", "bold");
      doc.text(
        "Insurer – Financial & Legal Insurance Company Ltd",
        margin + 10,
        yPos
      );

      yPos += 16; // কম spacing

      // Phone section
      doc.setFontSize(20); // কম font size
      doc.setTextColor(15, 71, 168);
      doc.text("", margin + 20, yPos);

      doc.setFontSize(10); // কম font size
      doc.setTextColor(107, 114, 128);
      doc.setFont("helvetica", "normal");
      doc.text("Claims Line", margin + 40, yPos - 3);

      doc.setFontSize(13); // কম font size
      doc.setTextColor(31, 41, 55);
      doc.text("01760 658687", margin + 40, yPos + 4);

      // Email section
      doc.setFontSize(20); // কম font size
      doc.setTextColor(15, 71, 168);
      doc.text("", margin + 140, yPos);

      doc.setFontSize(10); // কম font size
      doc.setTextColor(107, 114, 128);
      doc.setFont("helvetica", "normal");
      doc.text("Claims Email", margin + 160, yPos - 3);

      doc.setFontSize(13); // কম font size
      doc.setTextColor(31, 41, 55);
      doc.text("claims@bluedropservices.co.uk", margin + 160, yPos + 4);

      yPos += 25; // কম spacing

      // Verified & Authenticated Certificate
      doc.setFillColor(220, 252, 231);
      doc.setTextColor(21, 128, 61);

      const badgeWidth = 120; // কম width
      const badgeHeight = 12; // কম height
      const badgeX = (pageWidth - badgeWidth) / 2;
      doc.rect(badgeX, yPos, badgeWidth, badgeHeight, "F");

      // Checkmark
      doc.setFontSize(20); // কম font size

      // Text
      doc.setFontSize(14); // কম font size
      doc.setFont("helvetica", "medium");
      doc.text(
        "Verified & Authenticated Certificate",
        badgeX + 25,
        yPos + badgeHeight / 2 + 2
      );

      // Footer
      const footerY = pageHeight - margin - 15;
      doc.setFillColor(37, 99, 235);
      doc.rect(margin, footerY, contentWidth, 15, "F");

      doc.setFontSize(10); // কম font size
      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "normal");
      doc.text(
        "© 2024 Bluedrop Services Limited. All rights reserved.",
        margin + 10,
        footerY + 10
      );

      const issueDate = new Date().toLocaleDateString("en-US");
      doc.text(
        `Certificate ID: ${policyNumber} | Issue Date: ${issueDate}`,
        pageWidth - margin - 10,
        footerY + 10,
        { align: "right" }
      );

      // Save the PDF
      const fileName = `certificate-${companyName.replace(
        /\s+/g,
        "-"
      )}-${Date.now()}.pdf`;
      doc.save(fileName);
    } catch (error) {
      console.error("PDF generation error:", error);
      alert("Failed to generate certificate. Please try again.");
    }
  };

  // আপডেটেড ফাংশন:
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

      // প্রতিটি সিলেক্টেড সার্টিফিকেটের জন্য handleDownload কল করুন
      for (const cert of selectedCerts) {
        await handleDownload(cert.id); // এখানে সার্টিফিকেটের ID পাঠানো হচ্ছে
        // প্রতিটি ডাউনলোডের মধ্যে 100ms ডিলে
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
    } catch (error) {
      console.error("Download error:", error);
      alert("Failed to download certificates");
    } finally {
      setDownloadingAll(false);
    }
  };

  // Helper function to render editable fields - FIXED VERSION
  const renderField = (label, field, value, editable = true) => (
    <div className='flex items-start py-2'>
      <div className='w-1/3 text-sm font-medium text-gray-700'>{label}</div>
      <div className='w-2/3 flex items-center gap-2'>
        {requestType === "edit" && editable ? (
          <div className='flex-1'>
            {field === "productType" ? (
              <div className='relative product-dropdown'>
                <button
                  type='button'
                  onClick={() => setShowProductDropdown(!showProductDropdown)}
                  className='w-full px-3 py-2 text-sm text-left border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center justify-between hover:border-gray-400'>
                  <span
                    className={
                      editableFields[field] ? "text-gray-900" : "text-gray-400"
                    }>
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
                  <div className='absolute z-50 top-full mt-1 bg-white rounded-lg shadow-lg border w-full max-w-md max-h-64 overflow-hidden'>
                    <div className='p-3 border-b'>
                      <div className='relative'>
                        <Search
                          size={16}
                          className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400'
                        />
                        <input
                          type='text'
                          placeholder='Search products...'
                          className='w-full pl-10 pr-3 py-2 border rounded-lg text-sm'
                          value={productSearchQuery}
                          onChange={(e) =>
                            setProductSearchQuery(e.target.value)
                          }
                          onClick={(e) => e.stopPropagation()}
                        />
                      </div>
                    </div>

                    <div className='overflow-y-auto max-h-48'>
                      {productsLoading ? (
                        <div className='px-4 py-3 text-center text-gray-500'>
                          <Loader2
                            size={16}
                            className='animate-spin mx-auto mb-2'
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
                            }`}>
                            <div>
                              <span className='font-medium text-sm'>
                                {product.Measures}
                              </span>
                              <div className='text-xs text-gray-500 mt-1'>
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
                                className='text-white bg-blue-600 rounded-full p-0.5'
                              />
                            )}
                          </button>
                        ))
                      ) : (
                        <div className='px-4 py-3 text-center text-gray-500 text-sm'>
                          No products found
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <input
                type='text'
                value={editableFields[field] || ""}
                onChange={(e) =>
                  setEditableFields((prev) => ({
                    ...prev,
                    [field]: e.target.value,
                  }))
                }
                className='w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500'
              />
            )}
          </div>
        ) : (
          <span className='flex-1 text-sm text-gray-600'>
            {value || "Not provided"}
          </span>
        )}
        {/* EDIT ICON - FIXED: Always show when in edit mode and editable */}
        {requestType === "edit" && editable && (
          <Edit2 className='w-4 h-4 text-gray-400 shrink-0' />
        )}
      </div>
    </div>
  );

  const renderStaticField = (label, value) => (
    <div className='flex items-start py-2'>
      <div className='w-1/3 text-sm font-medium text-gray-700'>{label}</div>
      <div className='w-2/3'>
        <span className='text-sm text-gray-600'>{value}</span>
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

  if (loading) {
    return (
      <main className='p-4 lg:p-6'>
        <div className='flex items-center justify-center h-64'>
          <div className='text-center'>
            <Loader2 className='w-8 h-8 animate-spin text-blue-600 mx-auto mb-3' />
            <p className='text-gray-600'>Loading certificates...</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className='p-4 lg:p-6'>
      {/* Logo */}
      <div className='mb-6'>
        <div className='inline-flex items-center gap-2'>
          <div className='w-10 h-10 bg-blue-500 rounded-full'></div>
          <span className='font-bold text-xl'>
            BLUE<span className='text-blue-500'>DROP</span>
          </span>
          <span className='text-xs text-gray-500 ml-2'>SERVICES</span>
        </div>
      </div>

      {/* Header */}
      <div className='flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6'>
        <h1 className='text-2xl font-semibold text-gray-800'>
          My Insurance Backed Guarantee Certificates
          <span className='text-sm font-normal text-gray-600 ml-2'>
            ({filteredCertificates.length} certificates)
          </span>
        </h1>
        <div className='flex items-center gap-3 w-full sm:w-auto'>
          <div className='relative flex-1 sm:flex-initial'>
            <Search
              className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-400'
              size={18}
            />
            <input
              type='text'
              placeholder='Search by policy holder name...'
              className='w-full sm:w-64 border border-gray-300 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button
            onClick={handleDownloadSelected}
            disabled={downloadingAll || selectedRows.length === 0}
            className='bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed'>
            {downloadingAll ? (
              <Loader2 className='w-4 h-4 animate-spin' />
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
      <div className='bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200'>
        {filteredCertificates.length === 0 ? (
          <div className='p-8 text-center text-gray-500'>
            <FileText className='w-12 h-12 mx-auto mb-3 text-gray-300' />
            <p>No certificates found</p>
            {searchTerm && (
              <p className='text-sm mt-1'>Try a different search term</p>
            )}
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className='hidden lg:block overflow-x-auto'>
              <table className='w-full'>
                <thead>
                  <tr className='border-b border-gray-200'>
                    <th className='px-4 py-3 text-left'>
                      <input
                        type='checkbox'
                        checked={
                          selectedRows.length === filteredCertificates.length &&
                          filteredCertificates.length > 0
                        }
                        onChange={handleSelectAll}
                        className='w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500'
                      />
                    </th>
                    <th className='px-4 py-3 text-left text-sm font-medium text-gray-700'>
                      Policy No
                    </th>
                    <th className='px-4 py-3 text-left text-sm font-medium text-gray-700'>
                      Policy Holder Name
                    </th>
                    <th className='px-4 py-3 text-left text-sm font-medium text-gray-700'>
                      Product Type
                    </th>
                    <th className='px-4 py-3 text-left text-sm font-medium text-gray-700'>
                      Contract Value
                    </th>
                    <th className='px-4 py-3 text-left text-sm font-medium text-gray-700'>
                      Inception Date
                    </th>
                    <th className='px-4 py-3 text-left text-sm font-medium text-gray-700'>
                      Expiry Date
                    </th>
                    <th className='px-4 py-3 text-left text-sm font-medium text-gray-700'>
                      Transaction Type
                    </th>
                    <th className='px-4 py-3 text-left text-sm font-medium text-gray-700'>
                      Price
                    </th>
                    <th className='px-4 py-3 text-left text-sm font-medium text-gray-700'>
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
                      }`}>
                      <td className='px-4 py-3'>
                        <input
                          type='checkbox'
                          checked={isRowSelected(cert.id)}
                          onChange={() => handleSelectRow(cert.id)}
                          className='w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500'
                        />
                      </td>
                      <td className='px-4 py-3 text-sm text-gray-700 font-medium'>
                        {cert.policyNo}
                      </td>
                      <td className='px-4 py-3 text-sm text-gray-700'>
                        {cert.holderName}
                      </td>
                      <td className='px-4 py-3 text-sm text-gray-700'>
                        {cert.productType}
                      </td>
                      <td className='px-4 py-3 text-sm text-gray-700'>
                        {cert.contractValue}
                      </td>
                      <td className='px-4 py-3 text-sm text-gray-700'>
                        {cert.inceptionDate}
                      </td>
                      <td className='px-4 py-3 text-sm text-gray-700'>
                        {cert.expiryDate}
                      </td>
                      <td className='px-4 py-3 text-sm text-gray-700'>
                        {cert.transactionType}
                      </td>
                      <td className='px-4 py-3 text-sm text-gray-700 font-semibold'>
                        {cert.price}
                      </td>
                      <td className='px-4 py-3'>
                        <div className='flex items-center gap-2'>
                          <button
                            onClick={() => handleViewCertificate(cert)}
                            className='p-2 hover:bg-gray-100 rounded'
                            title='View Certificate'>
                            <Eye size={18} className='text-blue-600' />
                          </button>
                          <button
                            onClick={() => handleDownload(cert?.id)}
                            disabled={downloading}
                            className='p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50'
                            title='Download Certificate'>
                            {downloading ? (
                              <Loader2
                                size={18}
                                className='text-gray-600 animate-spin'
                              />
                            ) : (
                              <Download size={18} className='text-gray-600' />
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
            <div className='lg:hidden'>
              {paginatedCertificates.map((cert) => (
                <div
                  key={cert.id}
                  className={`p-4 border-b border-gray-100 ${
                    isRowSelected(cert.id) ? "bg-blue-50" : ""
                  }`}>
                  <div className='flex items-start gap-3 mb-3'>
                    <input
                      type='checkbox'
                      checked={isRowSelected(cert.id)}
                      onChange={() => handleSelectRow(cert.id)}
                      className='w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 mt-1'
                    />
                    <div className='flex-1'>
                      <div className='flex justify-between items-start mb-2'>
                        <div>
                          <div className='text-xs text-gray-500 mb-1'>
                            Policy No
                          </div>
                          <div className='text-sm font-medium text-gray-700'>
                            {cert.policyNo}
                          </div>
                        </div>
                        <div className='text-right'>
                          <div className='text-xs text-gray-500 mb-1'>
                            Price
                          </div>
                          <div className='text-sm font-semibold text-gray-700'>
                            {cert.price}
                          </div>
                        </div>
                      </div>

                      <div className='space-y-2 mb-3'>
                        <div>
                          <div className='text-xs text-gray-500'>
                            Policy Holder Name
                          </div>
                          <div className='text-sm text-gray-700'>
                            {cert.holderName}
                          </div>
                        </div>
                        <div>
                          <div className='text-xs text-gray-500'>
                            Product Type
                          </div>
                          <div className='text-sm text-gray-700'>
                            {cert.productType}
                          </div>
                        </div>
                        <div className='grid grid-cols-2 gap-2'>
                          <div>
                            <div className='text-xs text-gray-500'>
                              Inception Date
                            </div>
                            <div className='text-sm text-gray-700'>
                              {cert.inceptionDate}
                            </div>
                          </div>
                          <div>
                            <div className='text-xs text-gray-500'>
                              Expiry Date
                            </div>
                            <div className='text-sm text-gray-700'>
                              {cert.expiryDate}
                            </div>
                          </div>
                        </div>
                        <div>
                          <div className='text-xs text-gray-500'>
                            Transaction Type
                          </div>
                          <div className='text-sm text-gray-700'>
                            {cert.transactionType}
                          </div>
                        </div>
                      </div>

                      <div className='flex gap-2'>
                        <button
                          onClick={() => handleViewCertificate(cert)}
                          className='flex-1 bg-blue-600 text-white py-2 rounded-lg flex items-center justify-center gap-2 text-sm hover:bg-blue-700 transition-colors'>
                          <Eye size={16} />
                          View
                        </button>
                        <button
                          onClick={() => handleDownloadSingle(cert)}
                          disabled={downloading}
                          className='flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg flex items-center justify-center gap-2 text-sm hover:bg-gray-200 transition-colors disabled:opacity-50'>
                          {downloading ? (
                            <Loader2 size={16} className='animate-spin' />
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
              <div className='px-4 py-4 flex items-center justify-center border-t border-gray-200'>
                <nav className='flex items-center gap-2'>
                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(1, prev - 1))
                    }
                    disabled={currentPage === 1}
                    className='px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg flex items-center gap-1 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'>
                    <ChevronLeft size={16} />
                    Previous
                  </button>

                  <div className='flex items-center gap-1'>
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
                            className={`w-8 h-8 flex items-center justify-center text-sm rounded-lg transition-colors ${
                              currentPage === pageNum
                                ? "bg-blue-600 text-white"
                                : "text-gray-600 hover:bg-gray-100"
                            }`}>
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
                    className='px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg flex items-center gap-1 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'>
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
        <div className='fixed inset-0 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto'>
          <div className='bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden'>
            {/* Modal Header */}
            <div className='p-6 border-b border-gray-200'>
              <div className='flex items-center justify-between mb-6'>
                <div className='inline-flex items-center gap-2'>
                  <div className='w-10 h-10 bg-blue-500 rounded-full'></div>
                  <span className='font-bold text-xl'>
                    BLUE<span className='text-blue-500'>DROP</span>
                  </span>
                  <span className='text-xs text-gray-500 ml-2'>SERVICES</span>
                </div>
                <button
                  onClick={() => {
                    setShowModal(false);
                    setRequestType("");
                    setModalError("");
                    setShowProductDropdown(false);
                    setProductSearchQuery("");
                  }}
                  className='p-2 hover:bg-gray-100 rounded-lg'>
                  <X size={20} />
                </button>
              </div>

              <div className='flex items-center justify-between'>
                <h1 className='text-3xl font-semibold text-gray-900'>
                  {selectedCertificate.policyNo ||
                    selectedCertificate.policyNumber}
                </h1>
                <div className='flex items-center gap-3'>
                  <div className='relative request-dropdown'>
                    <button
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                      className='flex items-center gap-2 px-4 py-2 text-sm text-gray-600 bg-white border border-gray-300 rounded hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500'
                      disabled={
                        selectedCertificate.status &&
                        selectedCertificate.status.includes("pending")
                      }>
                      <span>
                        {requestType
                          ? requestType === "edit"
                            ? "Request for Edit"
                            : "Request For Cancellation"
                          : "Request for"}
                      </span>
                      <ChevronDown className='w-4 h-4' />
                    </button>

                    {isDropdownOpen && (
                      <div className='absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg border border-gray-200 z-10'>
                        <div className='py-1'>
                          <button
                            onClick={() => {
                              setRequestType("edit");
                              setIsDropdownOpen(false);
                            }}
                            className='block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700'
                            disabled={
                              selectedCertificate.status === "pending_edit"
                            }>
                            Request for Edit
                          </button>
                          <button
                            onClick={() => {
                              setRequestType("cancel");
                              setIsDropdownOpen(false);
                            }}
                            className='block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700'
                            disabled={
                              selectedCertificate.status === "pending_cancel"
                            }>
                            Request For Cancellation
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => handleDownloadSingle(selectedCertificate)}
                    className='p-2 text-gray-600 hover:bg-gray-100 rounded'
                    disabled={downloading}>
                    {downloading ? (
                      <Loader2 size={20} className='animate-spin' />
                    ) : (
                      <Download size={20} />
                    )}
                  </button>
                </div>
              </div>

              {/* Show status badge */}
              {selectedCertificate.status && (
                <div className='mt-3'>
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
                    }`}>
                    Status:{" "}
                    {selectedCertificate.status.replace("_", " ").toUpperCase()}
                  </span>
                </div>
              )}
              {/* Show existing request status */}
              {selectedCertificate.status &&
                selectedCertificate.status.includes("pending") && (
                  <div className='mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg'>
                    <div className='flex items-center gap-2'>
                      <div className='w-3 h-3 bg-yellow-500 rounded-full'></div>
                      <span className='font-medium text-yellow-800'>
                        {selectedCertificate.status === "pending_edit"
                          ? "Edit Request Pending"
                          : "Cancellation Request Pending"}
                      </span>
                    </div>
                    {selectedCertificate.rawData?.insurance?.requestData
                      ?.reason && (
                      <p className='text-sm text-yellow-700 mt-1'>
                        Reason:{" "}
                        {
                          selectedCertificate.rawData.insurance.requestData
                            .reason
                        }
                      </p>
                    )}
                    <p className='text-xs text-yellow-600 mt-1'>
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
              <div className='mx-6 mt-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm'>
                {modalError}
              </div>
            )}
            {(requestType === "edit" || requestType === "cancel") && (
              <div className='p-6 border-t border-gray-200 bg-gray-50'>
                <div className='mb-4'>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    {requestType === "edit"
                      ? "Reason for Edit Request"
                      : "Reason for Cancellation"}
                  </label>
                  <textarea
                    value={requestReason}
                    onChange={(e) => setRequestReason(e.target.value)}
                    className='w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500'
                    rows='3'
                    placeholder={
                      requestType === "edit"
                        ? "Explain what changes you want to make..."
                        : "Why do you want to cancel this policy?"
                    }
                    required
                  />
                </div>

                <div className='flex justify-end gap-3'>
                  <button
                    onClick={() => {
                      setRequestType("");
                      setRequestReason("");
                      setModalError("");
                    }}
                    className='px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-100'
                    disabled={submitting}>
                    Cancel
                  </button>

                  <button
                    onClick={handleSubmitRequest}
                    className='px-4 py-2 text-sm text-white bg-blue-600 rounded hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2'
                    disabled={submitting || !requestReason.trim()}>
                    {submitting ? (
                      <>
                        <Loader2 size={16} className='animate-spin' />
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
            <div className='p-6 overflow-y-auto max-h-[calc(90vh-200px)]'>
              {/* Contractor Details */}
              <div className='mb-6'>
                <h2 className='text-lg font-semibold text-gray-800 mb-3'>
                  Contractor Details
                </h2>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <div>
                    <div className='text-sm text-gray-500 mb-1'>
                      Contractor Name
                    </div>
                    <div className='text-base font-medium'>
                      {selectedCertificate.contractorName || "Not provided"}
                    </div>
                  </div>
                  <div>
                    <div className='flex items-center justify-between mb-1'>
                      <div className='text-sm text-gray-500'>
                        Contractor Address
                      </div>
                      {requestType === "edit" && (
                        <Edit2 className='w-3 h-3 text-gray-400' />
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
                        className='w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500'
                        rows='2'
                        placeholder='Enter contractor address'
                      />
                    ) : (
                      <div className='text-base'>
                        {selectedCertificate.contractorAddress ||
                          "Not provided"}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Policy Holder Details */}
              <div className='mb-6'>
                <h2 className='text-lg font-semibold text-gray-800 mb-3'>
                  Policy Holder Details
                </h2>
                <div className='space-y-3'>
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
              <div className='mb-6'>
                <h2 className='text-lg font-semibold text-gray-800 mb-3'>
                  Product Details
                </h2>
                <div className='space-y-3'>
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

            {/* Request Action Buttons */}
          </div>
        </div>
      )}
    </main>
  );
}
