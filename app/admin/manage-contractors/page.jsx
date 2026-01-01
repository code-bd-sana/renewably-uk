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
  const itemsPerPage = 10;

  console.log(
    "contractors --->",
    contractors,
    "certificat --->",
    certificates,
    "ya allah please"
  );

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
      console.log(
        "Certificates response text (first 500 chars):",
        certsText.substring(0, 500)
      );

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

    // Fetch documents for this contractor
    if (!contractorDocuments[contractor.id]) {
      await fetchContractorDocuments(contractor.id);
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

  // Handle download contractor data - Generate certificate PDF
  // আপডেটেড downloadPdf ফাংশন

  const downloadHandler = async (contractorId) => {
    setLoader2(true);
    try {
      // Fetch contractor details
      const contractorRes = await fetch(
        `/api/admin/contractor/${contractorId}`
      );

      if (!contractorRes.ok) {
        throw new Error(`Failed to fetch contractor: ${contractorRes.status}`);
        setLoader2(false);
      }

      const contractorData = await contractorRes.json();

      if (!contractorData.success) {
        throw new Error(
          contractorData.error || "Failed to fetch contractor data"
        );
        setLoader2(false);
      }

      // Fetch certificates for this contractor
      const certsRes = await fetch(
        `/api/admin/certificates?contractorId=${contractorId}`
      );
      setLoader2(false);

      if (!certsRes.ok) {
        throw new Error(`Failed to fetch certificates: ${certsRes.status}`);
        setLoader2(false);
      }

      const certsData = await certsRes.json();

      if (
        certsData.success &&
        certsData.certificates &&
        certsData.certificates.length > 0
      ) {
        // যদি একটাই certificate থাকে
        if (certsData.certificates.length === 1) {
          await downloadPdf(certsData.certificates[0], contractor);
          setLoader2(false);
        }
        // যদি একাধিক certificate থাকে
        else {
          // প্রতিটি certificate এর জন্য একেকটা PDF generate করুন
          for (const certificate of certsData.certificates) {
            await downloadPdf(certificate, contractor);
            // প্রতিটি ডাউনলোডের মধ্যে সামান্য ডিলে (optional)
            await new Promise((resolve) => setTimeout(resolve, 500));
            setLoader2(false);
          }
        }
      } else {
        alert("No certificates found for this contractor");
        setLoader2(false);
      }
    } catch (error) {
      console.error("Download error:", error);
      alert(`Error: ${error.message}`);
      setLoader2(false);
    } finally {
      setLoader2(false);
    }
  };

  // const downloadPdf = async (certificate) => {
  //   try {
  //     // Find the certificate

  //     // Create PDF with large size to fit everything
  //     const doc = new jsPDF({
  //       orientation: "portrait",
  //       unit: "mm",
  //       format: [297, 520],
  //     });

  //     const pageWidth = doc.internal.pageSize.getWidth();
  //     const pageHeight = doc.internal.pageSize.getHeight();

  //     // Set margins
  //     const margin = 15;
  //     let yPos = margin;
  //     const contentWidth = pageWidth - margin * 2;

  //     // Add light background
  //     doc.setFillColor(248, 250, 252);
  //     doc.rect(0, 0, pageWidth, pageHeight, "F");

  //     // Main white container
  //     doc.setFillColor(255, 255, 255);
  //     doc.setDrawColor(226, 232, 240);
  //     doc.rect(margin, yPos, contentWidth, pageHeight - margin * 2, "F");
  //     doc.rect(margin, yPos, contentWidth, pageHeight - margin * 2, "S");

  //     yPos += 8;

  //     // Page Title
  //     doc.setFontSize(16);
  //     doc.setTextColor(31, 41, 55);
  //     doc.setFont("helvetica", "normal");

  //     yPos += 12;

  //     // Divider
  //     doc.setDrawColor(229, 231, 235);
  //     doc.line(margin + 10, yPos, pageWidth - margin - 10, yPos);

  //     yPos += 15;

  //     // Main Header
  //     doc.setFontSize(28);
  //     doc.setTextColor(15, 71, 168);
  //     doc.setFont("helvetica", "bold");
  //     doc.text("Insurance Backed Guarantee", pageWidth / 2, yPos, {
  //       align: "center",
  //     });

  //     yPos += 8;

  //     doc.setFontSize(16);
  //     doc.setTextColor(15, 71, 168);
  //     doc.setFont("helvetica", "normal");
  //     doc.text("Certificate & Schedule of Insurance", pageWidth / 2, yPos, {
  //       align: "center",
  //     });

  //     // Logo placeholder
  //     doc.setFontSize(10);
  //     doc.setTextColor(150, 150, 150);

  //     yPos += 15;

  //     // Cover Section
  //     doc.setFillColor(240, 247, 255);
  //     const coverHeight = 40;
  //     doc.rect(margin + 10, yPos, contentWidth - 20, coverHeight, "F");

  //     doc.setFontSize(14);
  //     doc.setTextColor(15, 71, 168);
  //     doc.setFont("helvetica", "bold");
  //     doc.text("Cover Option", margin + 20, yPos + 12);

  //     doc.setFontSize(14);
  //     doc.setTextColor(31, 41, 55);
  //     doc.setFont("helvetica", "medium");
  //     doc.text("Insurance Backed Guarantee", margin + 20, yPos + 20);

  //     doc.setFontSize(12);
  //     doc.setTextColor(75, 85, 99);
  //     const policyNumber = `BDIGWE${certificate?.policyNumber}`;
  //     doc.text(`Policy Number: ${policyNumber}`, margin + 20, yPos + 28);

  //     doc.setFontSize(10);
  //     doc.setTextColor(156, 163, 175);
  //     doc.text(
  //       "Please refer to your policy wording for full details",
  //       margin + 20,
  //       yPos + 34
  //     );

  //     yPos += 46;

  //     // Two Column Section
  //     const columnWidth = (contentWidth - 30) / 2;

  //     // Left Column - Agent/Broker
  //     const colHeight = 40;
  //     doc.setFillColor(249, 250, 251);
  //     doc.rect(margin + 10, yPos, columnWidth, colHeight, "F");

  //     doc.setFontSize(14);
  //     doc.setTextColor(15, 71, 168);
  //     doc.setFont("helvetica", "bold");
  //     doc.text("Agent/Broker", margin + 20, yPos + 12);

  //     doc.setFontSize(10);
  //     doc.setTextColor(156, 163, 175);
  //     doc.text("SERVICES", margin + 20, yPos + 22);

  //     doc.setFontSize(12);
  //     doc.setTextColor(75, 85, 99);
  //     const agentAddress = "The Mill Suite, Hardmans Business Centre";
  //     const agentLines = doc.splitTextToSize(agentAddress, columnWidth - 30);
  //     doc.text(agentLines, margin + 20, yPos + 32);

  //     // Right Column - Installation Contractor
  //     doc.setFillColor(249, 250, 251);
  //     doc.rect(margin + 20 + columnWidth, yPos, columnWidth, colHeight, "F");

  //     doc.setFontSize(14);
  //     doc.setTextColor(15, 71, 168);
  //     doc.setFont("helvetica", "bold");
  //     doc.text("Installation Contractor", margin + 30 + columnWidth, yPos + 12);

  //     doc.setFontSize(16);
  //     doc.setTextColor(31, 41, 55);
  //     doc.setFont("helvetica", "bold");
  //     const companyName =
  //       contractor?.companyName || "North West Energy Grants Ltd";
  //     const companyLines = doc.splitTextToSize(companyName, columnWidth - 25);
  //     doc.text(companyLines, margin + 30 + columnWidth, yPos + 20);

  //     doc.setFontSize(12);
  //     doc.setTextColor(75, 85, 99);
  //     const address =
  //       contractor?.address || "2464 Royal Ln. Mesa, New Jersey 45463";
  //     const addressLines = doc.splitTextToSize(address, columnWidth - 35);
  //     doc.text(addressLines, margin + 30 + columnWidth, yPos + 30);

  //     yPos += 50;

  //     // Insured/Policyholder Details
  //     const insuredHeight = 100;
  //     doc.setFillColor(249, 250, 251);
  //     doc.rect(margin + 10, yPos, contentWidth - 20, insuredHeight, "F");

  //     doc.setFontSize(14);
  //     doc.setTextColor(15, 71, 168);
  //     doc.setFont("helvetica", "bold");
  //     doc.text("Insured / Policyholder Details", margin + 20, yPos + 12);

  //     // Row 1: Name & Inception Date
  //     doc.setFontSize(12);
  //     doc.setTextColor(31, 41, 55);
  //     doc.setFont("helvetica", "bold");
  //     doc.text("Name", margin + 20, yPos + 20);
  //     doc.setFontSize(12);
  //     doc.setTextColor(75, 85, 99);
  //     doc.setFont("helvetica", "normal");
  //     doc.text(
  //       certificate.holderName || "Mr Leslie Corcoran",
  //       margin + 20,
  //       yPos + 30
  //     );

  //     doc.setFontSize(12);
  //     doc.setTextColor(31, 41, 55);
  //     doc.setFont("helvetica", "bold");
  //     doc.text("Inception Date", margin + 20 + columnWidth + 10, yPos + 20);
  //     doc.setFontSize(12);
  //     doc.setTextColor(75, 85, 99);
  //     doc.text(
  //       certificate.inceptionDate || new Date().toISOString().split("T")[0],
  //       margin + 20 + columnWidth + 10,
  //       yPos + 30
  //     );

  //     // Row 2: Address & Expiry Date
  //     doc.setFontSize(12);
  //     doc.setTextColor(31, 41, 55);
  //     doc.setFont("helvetica", "bold");
  //     doc.text("Address", margin + 20, yPos + 40);
  //     doc.setFontSize(12);
  //     doc.setTextColor(75, 85, 99);
  //     const insuredAddress =
  //       certificate.address || "Shadyview Gn, Richardson, California 62639";
  //     const insuredAddrLines = doc.splitTextToSize(
  //       insuredAddress,
  //       columnWidth - 15
  //     );
  //     doc.text(insuredAddrLines, margin + 20, yPos + 48);

  //     doc.setFontSize(12);
  //     doc.setTextColor(31, 41, 55);
  //     doc.setFont("helvetica", "bold");
  //     doc.text("Expiry Date", margin + 20 + columnWidth + 10, yPos + 40);
  //     doc.setFontSize(12);
  //     doc.setTextColor(75, 85, 99);
  //     doc.text(
  //       certificate.expiryDate ||
  //         new Date(new Date().setFullYear(new Date().getFullYear() + 2))
  //           .toISOString()
  //           .split("T")[0],
  //       margin + 20 + columnWidth + 10,
  //       yPos + 48
  //     );

  //     // Row 3: Installation Type & Premium
  //     doc.setFontSize(12);
  //     doc.setTextColor(31, 41, 55);
  //     doc.setFont("helvetica", "bold");
  //     doc.text("Type of Installation", margin + 20, yPos + 60);
  //     doc.setFontSize(12);
  //     doc.setTextColor(75, 85, 99);
  //     doc.text(
  //       certificate.productType || "Gas-Fired Condensing Boiler",
  //       margin + 20,
  //       yPos + 70
  //     );

  //     doc.setFontSize(12);
  //     doc.setTextColor(31, 41, 55);
  //     doc.setFont("helvetica", "bold");
  //     doc.text("Premium", margin + 20 + columnWidth + 10, yPos + 60);
  //     doc.setFontSize(24);
  //     doc.setTextColor(31, 41, 55);
  //     doc.setFont("helvetica", "bold");
  //     doc.text(
  //       certificate.price || "£19.04",
  //       margin + 20 + columnWidth + 10,
  //       yPos + 70
  //     );
  //     doc.setFontSize(9);
  //     doc.setTextColor(156, 163, 175);
  //     doc.setFont("helvetica", "normal");
  //     doc.text(
  //       "Including Fire policy Premium Tax",
  //       margin + 20 + columnWidth + 10,
  //       yPos + 78
  //     );

  //     yPos += 105;

  //     // Scheme Information
  //     doc.setFillColor(249, 250, 251);
  //     const schemeHeight = 50;
  //     doc.rect(margin + 10, yPos, contentWidth - 20, schemeHeight, "F");

  //     doc.setFontSize(14);
  //     doc.setTextColor(15, 71, 168);
  //     doc.setFont("helvetica", "bold");
  //     doc.text("Scheme Information", margin + 20, yPos + 12);

  //     const schemeItems = [
  //       { label: "Retrofit Assessor", value: "Savannah Nguyen" },
  //       { label: "Retrofit Coordinator", value: "Cameron Williamson" },
  //       { label: "Funding Partner", value: "Bessie Cooper" },
  //       { label: "Scheme Provider", value: "Ronald Richards" },
  //     ];

  //     // Calculate positions for 2x2 grid
  //     const schemeCol1X = margin + 20;
  //     const schemeCol2X = margin + 20 + columnWidth + 10;
  //     const schemeRow1Y = yPos + 20;
  //     const schemeRow2Y = yPos + 36;

  //     // Row 1, Col 1
  //     doc.setFontSize(12);
  //     doc.setTextColor(31, 41, 55);
  //     doc.setFont("helvetica", "bold");
  //     doc.text(schemeItems[0].label, schemeCol1X, schemeRow1Y);
  //     doc.setFontSize(12);
  //     doc.setTextColor(75, 85, 99);
  //     doc.setFont("helvetica", "normal");
  //     doc.text(schemeItems[0].value, schemeCol1X, schemeRow1Y + 7);

  //     // Row 1, Col 2
  //     doc.setFontSize(12);
  //     doc.setTextColor(31, 41, 55);
  //     doc.setFont("helvetica", "bold");
  //     doc.text(schemeItems[1].label, schemeCol2X, schemeRow1Y);
  //     doc.setFontSize(12);
  //     doc.setTextColor(75, 85, 99);
  //     doc.setFont("helvetica", "normal");
  //     doc.text(schemeItems[1].value, schemeCol2X, schemeRow1Y + 7);

  //     // Row 2, Col 1
  //     doc.setFontSize(12);
  //     doc.setTextColor(31, 41, 55);
  //     doc.setFont("helvetica", "bold");
  //     doc.text(schemeItems[2].label, schemeCol1X, schemeRow2Y);
  //     doc.setFontSize(12);
  //     doc.setTextColor(75, 85, 99);
  //     doc.setFont("helvetica", "normal");
  //     doc.text(schemeItems[2].value, schemeCol1X, schemeRow2Y + 7);

  //     // Row 2, Col 2
  //     doc.setFontSize(12);
  //     doc.setTextColor(31, 41, 55);
  //     doc.setFont("helvetica", "bold");
  //     doc.text(schemeItems[3].label, schemeCol2X, schemeRow2Y);
  //     doc.setFontSize(12);
  //     doc.setTextColor(75, 85, 99);
  //     doc.setFont("helvetica", "normal");
  //     doc.text(schemeItems[3].value, schemeCol2X, schemeRow2Y + 7);

  //     yPos += 60;

  //     // Information Text
  //     doc.setFillColor(255, 251, 239);
  //     const infoHeight = 46;
  //     doc.rect(margin + 10, yPos, contentWidth - 20, infoHeight, "F");

  //     // First paragraph
  //     doc.setFontSize(10);
  //     doc.setTextColor(75, 85, 99);
  //     const para1 =
  //       "This document includes information provided to us. It shows you who is insured, the period of insurance, the level of cover, and the premium paid. This policy is made up of this document, the IBG and the Policy Wording documents. These documents can be found at:";
  //     const para1Lines = doc.splitTextToSize(para1, contentWidth - 40);
  //     doc.text(para1Lines, margin + 20, yPos + 15);

  //     const para1Height = para1Lines.length * 3.5;

  //     // Website URL
  //     doc.setTextColor(15, 71, 168);
  //     doc.setFontSize(10);
  //     doc.text(
  //       "www.bluedropservices.co.uk/Insurance-Backed-Guarantee",
  //       margin + 20,
  //       yPos + para1Height + 20
  //     );

  //     // Second paragraph
  //     doc.setTextColor(75, 85, 99);
  //     const para2 =
  //       "Should the property be sold please pass this document to your solicitor for transfer to the new owner.";
  //     const para2Lines = doc.splitTextToSize(para2, contentWidth - 40);
  //     doc.text(para2Lines, margin + 20, yPos + para1Height + 30);

  //     yPos += 60;

  //     // Insurer Section
  //     doc.setFontSize(16);
  //     doc.setTextColor(31, 41, 55);
  //     doc.setFont("helvetica", "bold");
  //     doc.text(
  //       "Insurer – Financial & Legal Insurance Company Ltd",
  //       margin + 10,
  //       yPos
  //     );

  //     yPos += 16;

  //     // Phone section
  //     doc.setFontSize(20);
  //     doc.setTextColor(15, 71, 168);
  //     doc.text("", margin + 20, yPos);

  //     doc.setFontSize(10);
  //     doc.setTextColor(107, 114, 128);
  //     doc.setFont("helvetica", "normal");
  //     doc.text("Claims Line", margin + 40, yPos - 3);

  //     doc.setFontSize(13);
  //     doc.setTextColor(31, 41, 55);
  //     doc.text("01760 658687", margin + 40, yPos + 4);

  //     // Email section
  //     doc.setFontSize(20);
  //     doc.setTextColor(15, 71, 168);
  //     doc.text("", margin + 140, yPos);

  //     doc.setFontSize(10);
  //     doc.setTextColor(107, 114, 128);
  //     doc.setFont("helvetica", "normal");
  //     doc.text("Claims Email", margin + 160, yPos - 3);

  //     doc.setFontSize(13);
  //     doc.setTextColor(31, 41, 55);
  //     doc.text("claims@bluedropservices.co.uk", margin + 160, yPos + 4);

  //     yPos += 25;

  //     // Verified & Authenticated Certificate
  //     doc.setFillColor(220, 252, 231);
  //     doc.setTextColor(21, 128, 61);

  //     const badgeWidth = 120;
  //     const badgeHeight = 12;
  //     const badgeX = (pageWidth - badgeWidth) / 2;
  //     doc.rect(badgeX, yPos, badgeWidth, badgeHeight, "F");

  //     // Text
  //     doc.setFontSize(14);
  //     doc.setFont("helvetica", "medium");
  //     doc.text(
  //       "Verified & Authenticated Certificate",
  //       badgeX + 25,
  //       yPos + badgeHeight / 2 + 2
  //     );

  //     // Footer
  //     const footerY = pageHeight - margin - 15;
  //     doc.setFillColor(37, 99, 235);
  //     doc.rect(margin, footerY, contentWidth, 15, "F");

  //     doc.setFontSize(10);
  //     doc.setTextColor(255, 255, 255);
  //     doc.setFont("helvetica", "normal");
  //     doc.text(
  //       "© 2024 Bluedrop Services Limited. All rights reserved.",
  //       margin + 10,
  //       footerY + 10
  //     );

  //     const issueDate = new Date().toLocaleDateString("en-US");
  //     doc.text(
  //       `Certificate ID: ${policyNumber} | Issue Date: ${issueDate}`,
  //       pageWidth - margin - 10,
  //       footerY + 10,
  //       { align: "right" }
  //     );

  //     // Save the PDF
  //     const fileName = `certificate-${
  //       certificate.holderName?.replace(/\s+/g, "-") || "certificate"
  //     }-${Date.now()}.pdf`;
  //     doc.save(fileName);
  //   } catch (error) {
  //     console.error("PDF generation error:", error);
  //     alert("Failed to generate certificate. Please try again.");
  //   }
  // };

  // আরো গুরুত্বপূর্ণ - downloadPdfSelected ফাংশন ঠিক করুন
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

      // প্রতিটি সিলেক্টেড সার্টিফিকেটের জন্য ডাউনলোড করুন
      for (const cert of selectedCerts) {
        await downloadPdf(cert.id);
        // প্রতিটি ডাউনলোডের মধ্যে 500ms ডিলে
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
    } catch (error) {
      console.error("Download error:", error);
      alert("Failed to download certificates");
    } finally {
      setDownloadingAll(false);
    }
  };

  // downloadPdfSingle ফাংশন আপডেট করুন
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
            {/* Simple Spinner */}
            <div className='relative w-20 h-20 mx-auto mb-6'>
              <Loader2 className='w-20 h-20 text-blue-600 animate-spin' />
            </div>

            {/* Simple Text */}
            <h3 className='text-xl font-bold text-gray-800 mb-3'>
              Downloading Certificates
            </h3>

            {/* Simple Progress Steps */}
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

            {/* Simple Progress Bar */}

            {/* Simple Message */}
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
      {/* Contractor Details Modal */}
      {showContractorModal && selectedContractor && (
        <div className='fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50'>
          <div className='bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto'>
            {/* Modal Header */}
            <div className='flex justify-between items-center p-4 bg-gray-50 border-b border-gray-200'>
              <div className='flex items-center gap-3'>
                <button
                  onClick={closeContractorModal}
                  className='text-gray-600 hover:text-gray-900 text-2xl p-1'
                  title='Back'>
                  ≫
                </button>
              </div>
              <div className='flex items-center gap-3'>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    selectedContractor.isApproved
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}>
                  {selectedContractor.isApproved ? "Active" : "Inactive"}
                </span>
                <button
                  onClick={() => downloadPdf(selectedContractor.id)}
                  className='text-gray-600 hover:text-gray-900 p-1'
                  title='Download Data'>
                  <Download className='w-5 h-5' />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className='p-6'>
              {/* Details Grid */}
              <div className='space-y-4'>
                <div className='space-y-4'>
                  <div className='flex justify-between items-start py-3 border-b border-gray-100'>
                    <div className='text-sm font-medium text-gray-700'>
                      Create Account Date
                    </div>
                    <div className='text-sm text-gray-900 text-right'>
                      {formatDate(selectedContractor.createdAt)}
                    </div>
                  </div>

                  <div className='flex justify-between items-start py-3 border-b border-gray-100'>
                    <div className='text-sm font-medium text-gray-700'>
                      Contractor Name
                    </div>
                    <div className='text-sm text-gray-900 text-right'>
                      <Link
                        href={`/admin/manage-contractors/${selectedContractor.id}`}
                        className='text-blue-600 hover:text-blue-800 hover:underline transition-colors'
                        target='_blank'>
                        {selectedContractor.name || "N/A"}
                      </Link>
                    </div>
                  </div>

                  <div className='flex justify-between items-start py-3 border-b border-gray-100'>
                    <div className='text-sm font-medium text-gray-700'>
                      Company Name
                    </div>
                    <div className='text-sm text-gray-900 text-right'>
                      {selectedContractor.companyName || "N/A"}
                    </div>
                  </div>

                  <div className='flex justify-between items-start py-3 border-b border-gray-100'>
                    <div className='text-sm font-medium text-gray-700'>
                      Company Address
                    </div>
                    <div className='text-sm text-gray-900 text-right'>
                      {selectedContractor.address || "N/A"}
                    </div>
                  </div>

                  <div className='flex justify-between items-start py-3 border-b border-gray-100'>
                    <div className='text-sm font-medium text-gray-700'>
                      Phone Number
                    </div>
                    <div className='text-sm text-gray-900 text-right'>
                      {selectedContractor.phone || "N/A"}
                    </div>
                  </div>

                  <div className='flex justify-between items-start py-3 border-b border-gray-100'>
                    <div className='text-sm font-medium text-gray-700'>
                      Email Address
                    </div>
                    <div className='text-sm text-gray-900 text-right'>
                      <a
                        href={`mailto:${selectedContractor.email}`}
                        className='text-blue-600 hover:text-blue-800 hover:underline'>
                        {selectedContractor.email}
                      </a>
                    </div>
                  </div>

                  {/* Additional Stats - Replace with real API data */}
                  <div className='flex justify-between items-start py-3 border-b border-gray-100'>
                    <div className='text-sm font-medium text-gray-700'>
                      Total Certificate
                    </div>
                    <div className='text-sm text-gray-900 text-right'>
                      {getContractorStats(selectedContractor).totalCertificates}
                    </div>
                  </div>

                  <div className='flex justify-between items-start py-3 border-b border-gray-100'>
                    <div className='text-sm font-medium text-gray-700'>
                      Pending Edit Request
                    </div>
                    <div className='text-sm text-gray-900 text-right'>
                      {
                        getContractorStats(selectedContractor)
                          .pendingEditRequests
                      }
                    </div>
                  </div>

                  <div className='flex justify-between items-start py-3 border-b border-gray-100'>
                    <div className='text-sm font-medium text-gray-700'>
                      Last Certificate Generated
                    </div>
                    <div className='text-sm text-gray-900 text-right'>
                      {formatDate(
                        getContractorStats(selectedContractor)
                          .lastCertificateDate
                      )}
                    </div>
                  </div>

                  <div className='flex justify-between items-start py-3'>
                    <div className='text-sm font-medium text-gray-700'>
                      Documents
                    </div>
                    <div className='text-sm text-gray-900 text-right'>
                      <div className='space-y-1'>
                        {getContractorDocuments(selectedContractor).map(
                          (doc, index) => (
                            <div
                              key={index}
                              className='flex items-center justify-end gap-1'>
                              <a
                                href={`/api/admin/documents/${doc.id}`}
                                target='_blank'
                                rel='noopener noreferrer'
                                className='text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1'>
                                <FileText className='w-3 h-3' />
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
                <div className='pt-4 border-t border-gray-100'>
                  <div className='flex justify-between items-start mb-3'>
                    <div>
                      <h4 className='text-sm font-medium text-gray-700'>
                        Documents
                      </h4>
                      <p className='text-xs text-gray-500 mt-1'>
                        Contractor uploaded documents
                      </p>
                    </div>
                    {documentsLoading && (
                      <Loader2 className='w-4 h-4 animate-spin text-blue-600' />
                    )}
                  </div>

                  {documentsLoading ? (
                    <div className='text-center py-4'>
                      <Loader2 className='w-6 h-6 animate-spin text-gray-400 mx-auto' />
                      <p className='text-sm text-gray-500 mt-2'>
                        Loading documents...
                      </p>
                    </div>
                  ) : (
                    <div className='space-y-2'>
                      {getContractorDocuments(selectedContractor.id).length >
                      0 ? (
                        getContractorDocuments(selectedContractor.id).map(
                          (doc, index) => (
                            <div
                              key={doc._id || index}
                              className='flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200'>
                              <div className='flex-1'>
                                <div className='flex items-center gap-2 mb-1'>
                                  <FileText className='w-4 h-4 text-gray-500' />
                                  <span className='text-sm font-medium text-gray-700'>
                                    {doc.title || `Document ${index + 1}`}
                                  </span>
                                </div>
                                <div className='text-xs text-gray-500'>
                                  <span className='inline-block px-2 py-0.5 bg-gray-100 rounded mr-2'>
                                    {doc.category || "Other"}
                                  </span>
                                  {doc.description && (
                                    <span className='truncate'>
                                      {doc.description}
                                    </span>
                                  )}
                                </div>
                              </div>
                              <div className='flex items-center gap-2 ml-4'>
                                <button
                                  onClick={() => handleViewDocument(doc)}
                                  className='p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors'
                                  title='View Document'>
                                  <Eye className='w-4 h-4' />
                                </button>
                              </div>
                            </div>
                          )
                        )
                      ) : (
                        <div className='text-center py-6'>
                          <FileText className='w-12 h-12 text-gray-300 mx-auto mb-2' />
                          <p className='text-sm text-gray-500'>
                            No documents found
                          </p>
                          <p className='text-xs text-gray-400 mt-1'>
                            This contractor has not uploaded any documents yet
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className='flex justify-between items-center mt-8 pt-6 border-t border-gray-200'>
                <button
                  onClick={() => {
                    closeContractorModal();
                    handleDelete(selectedContractor.id);
                  }}
                  className='px-4 py-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors text-sm font-medium'>
                  Delete Contractor
                </button>
                <button
                  onClick={closeContractorModal}
                  className='px-4 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors text-sm font-medium'>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Header */}
      <div className='md:hidden mb-4'>
        <div className='flex items-center justify-between mb-4'>
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className='p-2'>
            {isMobileMenuOpen ? (
              <X className='w-6 h-6' />
            ) : (
              <Menu className='w-6 h-6' />
            )}
          </button>
          <h1 className='text-xl font-semibold text-gray-900'>Contractors</h1>
          <div className='w-10'></div>
        </div>

        {/* Mobile Search */}
        <div className='relative mb-4'>
          <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5' />
          <input
            type='text'
            placeholder='Search contractors...'
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className='pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full text-base'
          />
        </div>
      </div>

      {/* Desktop Header */}
      <div className='hidden md:flex justify-between items-center mb-8'>
        <div>
          <h1 className='text-2xl font-semibold text-gray-900'>Contractors</h1>
          <p className='text-gray-600 mt-1'>
            Manage all registered contractors
          </p>
        </div>

        <div className='relative w-96'>
          <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5' />
          <input
            type='text'
            placeholder='Search by name, company, or email...'
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className='pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full text-sm'
          />
        </div>
      </div>

      {/* Mobile Stats Grid */}
      <div className='md:hidden grid grid-cols-2 gap-3 mb-6'>
        <div className='bg-white border border-gray-200 rounded-lg p-3'>
          <p className='text-xs text-gray-600'>Total</p>
          <p className='text-xl font-bold text-gray-900'>
            {contractors.length}
          </p>
        </div>
        <div className='bg-white border border-gray-200 rounded-lg p-3'>
          <p className='text-xs text-gray-600'>Active</p>
          <p className='text-xl font-bold text-green-600'>
            {contractors.filter((c) => c.isApproved).length}
          </p>
        </div>
        <div className='bg-white border border-gray-200 rounded-lg p-3'>
          <p className='text-xs text-gray-600'>Inactive</p>
          <p className='text-xl font-bold text-red-600'>
            {contractors.filter((c) => !c.isApproved).length}
          </p>
        </div>
        <div className='bg-white border border-gray-200 rounded-lg p-3'>
          <p className='text-xs text-gray-600'>This Month</p>
          <p className='text-xl font-bold text-blue-600'>
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
      <div className='hidden md:grid grid-cols-4 gap-4 mb-6'>
        <div className='bg-white border border-gray-200 rounded-lg p-4'>
          <p className='text-sm text-gray-600'>Total Contractors</p>
          <p className='text-2xl font-bold text-gray-900'>
            {contractors.length}
          </p>
        </div>
        <div className='bg-white border border-gray-200 rounded-lg p-4'>
          <p className='text-sm text-gray-600'>Active</p>
          <p className='text-2xl font-bold text-green-600'>
            {contractors.filter((c) => c.isApproved).length}
          </p>
        </div>
        <div className='bg-white border border-gray-200 rounded-lg p-4'>
          <p className='text-sm text-gray-600'>Inactive</p>
          <p className='text-2xl font-bold text-red-600'>
            {contractors.filter((c) => !c.isApproved).length}
          </p>
        </div>
        <div className='bg-white border border-gray-200 rounded-lg p-4'>
          <p className='text-sm text-gray-600'>This Month</p>
          <p className='text-2xl font-bold text-blue-600'>
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
      <div className='md:hidden space-y-4 mb-6'>
        {currentContractors.length === 0 ? (
          <div className='text-center py-12 text-gray-500'>
            No contractors found
          </div>
        ) : (
          currentContractors.map((contractor) => (
            <div
              key={contractor.id}
              className='bg-white border border-gray-200 rounded-lg p-4'>
              <div className='flex justify-between items-start mb-3'>
                <div>
                  <h3 className='font-medium text-gray-900'>
                    {contractor.name}
                  </h3>
                  <p className='text-sm text-gray-600'>
                    {contractor.companyName || "N/A"}
                  </p>
                </div>
                <span
                  className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                    contractor.isApproved
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}>
                  {contractor.isApproved ? "Active" : "Inactive"}
                </span>
              </div>

              <div className='space-y-2 text-sm text-gray-600 mb-4'>
                <div className='flex items-center'>
                  <span className='w-24 font-medium'>Email:</span>
                  <span className='truncate'>{contractor.email}</span>
                </div>
                <div className='flex items-center'>
                  <span className='w-24 font-medium'>Phone:</span>
                  <span>{contractor.phone || "N/A"}</span>
                </div>
                <div className='flex items-center'>
                  <span className='w-24 font-medium'>Registered:</span>
                  <span>{formatDate(contractor.createdAt)}</span>
                </div>
              </div>

              <div className='flex justify-between border-t border-gray-100 pt-3'>
                <button
                  onClick={() => openContractorModal(contractor)}
                  className='text-blue-600 hover:text-blue-800 transition-colors p-2'
                  title='View Details'>
                  <Eye className='w-5 h-5' />
                </button>
                <button
                  onClick={() => downloadPdf(contractor.id)}
                  className='text-green-600 hover:text-green-800 transition-colors p-2'
                  title='Download Data'>
                  <Download className='w-5 h-5' />
                </button>
                <button
                  onClick={() => handleDelete(contractor.id)}
                  className='text-red-600 hover:text-red-800 transition-colors p-2'
                  title='Delete Contractor'>
                  <Trash2 className='w-5 h-5' />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Desktop Table */}
      <div className='hidden md:block bg-white border border-gray-200 rounded-lg overflow-hidden'>
        <div className='overflow-x-auto'>
          <table className='w-full'>
            <thead className='bg-gray-50 border-b border-gray-200'>
              <tr>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider'>
                  Contractor Name
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider'>
                  Company Name
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider'>
                  Email Address
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider'>
                  Phone Number
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider'>
                  Status
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider'>
                  Registered Date
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider'>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className='bg-white divide-y divide-gray-100'>
              {currentContractors.length === 0 ? (
                <tr>
                  <td
                    colSpan='7'
                    className='px-6 py-12 text-center text-gray-500'>
                    No contractors found
                  </td>
                </tr>
              ) : (
                currentContractors.map((contractor) => (
                  <tr
                    key={contractor.id}
                    className='hover:bg-gray-50 transition-colors'>
                    <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900'>
                      <button
                        onClick={() =>
                          router.push(
                            `/admin/manage-contractors/${contractor.id}`
                          )
                        }
                        className='text-blue-600 hover:text-blue-800 hover:underline transition-colors'>
                        {contractor.name}
                      </button>
                    </td>
                    <td className='px-6 py-4 text-sm text-gray-600'>
                      {contractor.companyName || "N/A"}
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-600'>
                      {contractor.email}
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-600'>
                      {contractor.phone || "N/A"}
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap'>
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                          contractor.isApproved
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}>
                        {contractor.isApproved ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                      {formatDate(contractor.createdAt)}
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap'>
                      <div className='flex items-center gap-3'>
                        <button
                          onClick={() => openContractorModal(contractor)}
                          className='text-blue-600 hover:text-blue-800 transition-colors p-1'
                          title='View Details'>
                          <Eye className='w-5 h-5' />
                        </button>
                        <button
                          onClick={() => downloadHandler(contractor.id)}
                          className='text-green-600 hover:text-green-800 transition-colors p-1'
                          title='Download Data'>
                          <Download className='w-5 h-5' />
                        </button>
                        <button
                          onClick={() => handleDelete(contractor.id)}
                          className='text-red-600 hover:text-red-800 transition-colors p-1'
                          title='Delete Contractor'>
                          <Trash2 className='w-5 h-5' />
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
          <div className='px-6 py-4 border-t border-gray-200'>
            <div className='flex flex-col sm:flex-row items-center justify-between gap-4'>
              <div className='text-sm text-gray-600'>
                Showing {startIndex + 1} to{" "}
                {Math.min(endIndex, filteredContractors.length)} of{" "}
                {filteredContractors.length} contractors
              </div>
              <div className='flex items-center gap-2'>
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(1, prev - 1))
                  }
                  disabled={currentPage === 1}
                  className='px-3 py-1 text-sm text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed flex items-center'>
                  <ChevronLeft className='w-4 h-4 mr-1' />
                  Previous
                </button>

                <div className='flex items-center gap-1'>
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
                          }`}>
                          {pageNumber}
                        </button>
                      );
                    } else if (
                      pageNumber === currentPage - 2 ||
                      pageNumber === currentPage + 2
                    ) {
                      return (
                        <span key={pageNumber} className='px-2 text-gray-400'>
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
                  className='px-3 py-1 text-sm text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed flex items-center'>
                  Next
                  <ChevronRight className='w-4 h-4 ml-1' />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Mobile Pagination */}
      {totalPages > 1 && (
        <div className='md:hidden bg-white border border-gray-200 rounded-lg p-4 mt-4'>
          <div className='flex flex-col items-center gap-4'>
            <div className='text-sm text-gray-600 text-center'>
              Showing {startIndex + 1} to{" "}
              {Math.min(endIndex, filteredContractors.length)} of{" "}
              {filteredContractors.length} contractors
            </div>
            <div className='flex items-center justify-between w-full'>
              <button
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className='px-4 py-2 text-sm text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed flex items-center'>
                <ChevronLeft className='w-4 h-4 mr-1' />
                Prev
              </button>

              <div className='text-sm text-gray-700'>
                Page {currentPage} of {totalPages}
              </div>

              <button
                onClick={() =>
                  setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                }
                disabled={currentPage === totalPages}
                className='px-4 py-2 text-sm text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed flex items-center'>
                Next
                <ChevronRight className='w-4 h-4 ml-1' />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
