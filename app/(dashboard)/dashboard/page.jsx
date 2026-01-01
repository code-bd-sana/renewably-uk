"use client";

import bluedrop from "@/public/shared/bluedrop.jpg";
import logo2 from "@/public/shared/logo3.jpg";
import jsPDF from "jspdf";
import {
  ChevronLeft,
  ChevronRight,
  Download,
  Eye,
  FileText,
  Loader2,
  Search,
  X,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

function DashboardPage() {
  const [stats, setStats] = useState({
    totalCertificates: 0,
    thisMonthCertificates: 0,
    accountBalance: "$0",
    editPending: 0,
  });
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [selectedCertificate, setSelectedCertificate] = useState(null);
  const [downloading, setDownloading] = useState(false);
  const router = useRouter();

  const itemsPerPage = 10;

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        // Fetch certificates
        const certsResponse = await fetch("/api/certificates", {
          credentials: "include",
        });

        if (!certsResponse.ok) {
          if (certsResponse.status === 401) {
            router.push("/login");
            return;
          }
        }

        if (certsResponse.ok) {
          const certsData = await certsResponse.json();
          if (certsData.success) {
            setCertificates(certsData.certificates || []);

            // Update stats
            const now = new Date();
            const thisMonthCertificates = certsData.certificates.filter(
              (cert) => {
                const certDate = new Date(
                  cert.inceptionDate.split("/").reverse().join("-")
                );
                return (
                  certDate.getMonth() === now.getMonth() &&
                  certDate.getFullYear() === now.getFullYear()
                );
              }
            ).length;

            setStats({
              totalCertificates: certsData.certificates.length,
              thisMonthCertificates: thisMonthCertificates,
              accountBalance: "$1,850.00",
              editPending: certsData.certificates.filter(
                (cert) => cert.status === "pending_edit"
              ).length,
            });
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, [router]);

  const filteredCertificates = certificates.filter(
    (cert) =>
      cert.holderName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cert.policyNo?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredCertificates.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedCertificates = filteredCertificates.slice(
    startIndex,
    endIndex
  );

  // View Certificate Modal Function
  const handleViewCertificate = (certificate) => {
    setSelectedCertificate({
      policyNumber: certificate.policyNo,
      policyHolderName: certificate.holderName,
      productType: certificate.productType || certificate.measureType,
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
    setShowModal(true);
  };

  // Download Certificate Function
  const handleDownloadCertificate = async (contractorId) => {
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

  // Helper function to render fields in modal
  const renderField = (label, value) => (
    <div className='flex items-start py-2'>
      <div className='w-1/3 text-sm font-medium text-gray-700'>{label}</div>
      <div className='w-2/3'>
        <span className='text-sm text-gray-600'>{value || "Not provided"}</span>
      </div>
    </div>
  );

  if (loading) {
    return (
      <main className='p-4 lg:p-6'>
        <div className='animate-pulse'>
          <div className='bg-gray-200 h-32 rounded-lg mb-6'></div>
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6'>
            {[...Array(4)].map((_, i) => (
              <div key={i} className='bg-gray-200 h-24 rounded-lg'></div>
            ))}
          </div>
          <div className='bg-gray-200 h-64 rounded-lg'></div>
        </div>
      </main>
    );
  }

  return (
    <main className='p-4 lg:p-6 bg-[#FAFAF9]'>
      {/* Blue Banner */}
      <div className='bg-[#0F47A8] text-white p-6 rounded-lg mb-6 flex items-center justify-between'>
        <h2 className='text-2xl font-semibold'>RENEWABLY UK</h2>
        <div className='w-16 h-16   rounded flex items-center justify-center'>
          <div>
            <Image src={logo2} />
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6'>
        <div className='bg-white p-4 rounded-lg shadow-sm'>
          <div className='flex items-center justify-between mb-2'>
            <h3 className='text-2xl font-bold font-mono '>
              {stats.totalCertificates}
            </h3>
            <div className='w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center'>
              <svg
                className='w-5 h-5 text-blue-600'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'>
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
                />
              </svg>
            </div>
          </div>
          <p className='text-sm text-[#6B7280] font-sans '>
            Total Certificates
          </p>
        </div>

        <div className='bg-white p-4 rounded-lg shadow-sm'>
          <div className='flex items-center justify-between mb-2'>
            <h3 className='text-2xl font-bold font-mono'>
              {stats.thisMonthCertificates}
            </h3>
            <div className='w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center'>
              <svg
                className='w-5 h-5 text-blue-600'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'>
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M13 7h8m0 0v8m0-8l-8 8-4-4-6 6'
                />
              </svg>
            </div>
          </div>
          <p className='text-sm text-[#6B7280] font-sans'>This Month</p>
        </div>

        <div className='bg-white p-4 rounded-lg shadow-sm'>
          <div className='flex items-center justify-between mb-2'>
            <h3 className='text-2xl font-semibold font-mono'>
              {stats.accountBalance}
            </h3>
            <div className='w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center'>
              <svg
                className='w-5 h-5 text-blue-600'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'>
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z'
                />
              </svg>
            </div>
          </div>
          <p className='text-sm text-[#6B7280] font-sans'>Account Balance</p>
        </div>

        <div className='bg-white p-4 rounded-lg shadow-sm'>
          <div className='flex items-center justify-between mb-2'>
            <h3 className='text-2xl font-bold font-mono'>
              {stats.editPending}
            </h3>
            <div className='w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center'>
              <svg
                className='w-5 h-5 text-blue-600'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'>
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z'
                />
              </svg>
            </div>
          </div>
          <p className='text-sm text-[#6B7280] font-sans'>Edit Pending</p>
        </div>
      </div>

      {/* Bluedrop Services Logo */}

      {/* Certificates Table */}
      <div className='bg-[#FFFFFF] pb-12 border border-gray-200 rounded-xl  overflow-hidden'>
        <div className='mb-6 px-4 mt-4'>
          <Image src={bluedrop} height={150} width={192} />
        </div>
        <div className='px-6 pb-4 text-[#262626]  font-medium flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4'>
          <h3 className='font-semibold font-sans text-[28px]'>
            Recent Insurance Backed Guarantee Certificates
            {/* <span className='text-sm font-normal text-gray-600 ml-2'>
              ({filteredCertificates.length} certificates)
            </span> */}
          </h3>
          <div className='relative w-full sm:w-64'>
            <Search
              className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-400'
              size={18}
            />
            <input
              type='text'
              placeholder='Search by policy holder name...'
              className='border border-gray-200 rounded-lg pl-10 pr-4 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-500'
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

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
            {/* Mobile Cards View */}
            <div className='md:hidden'>
              {paginatedCertificates.map((cert, index) => (
                <div key={index} className='p-4 border-b border-gray-200'>
                  <div className='space-y-2'>
                    <div className='flex justify-between'>
                      <span className='text-xs text-gray-500'>Policy No:</span>
                      <span className='text-sm font-medium'>
                        {cert.policyNo}
                      </span>
                    </div>
                    <div className='flex justify-between'>
                      <span className='text-xs text-gray-500'>Holder:</span>
                      <span className='text-sm'>{cert.holderName}</span>
                    </div>
                    <div className='flex justify-between'>
                      <span className='text-xs text-gray-500'>Type:</span>
                      <span className='text-sm'>
                        {cert.productType || cert.measureType}
                      </span>
                    </div>
                    <div className='flex justify-between'>
                      <span className='text-xs text-gray-500'>Price:</span>
                      <span className='text-sm font-semibold'>
                        {cert.price}
                      </span>
                    </div>
                    <div className='flex gap-2 mt-3'>
                      <button
                        onClick={() => handleViewCertificate(cert)}
                        className='flex-1 bg-blue-600 text-white py-2 rounded-lg flex items-center justify-center gap-2 text-sm hover:bg-blue-700 transition-colors'>
                        <Eye size={16} />
                        View
                      </button>
                      <button
                        onClick={() => handleDownloadCertificate(cert.id)}
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
              ))}
            </div>

            {/* Desktop Table View */}
            <div className='hidden border-b  border-t mt-4  md:block  mx-6 border border-gray-200 overflow-x-auto'>
              <table className='w-full '>
                <thead className='bg-[#FAFAF9] border-b border-gray-200'>
                  <tr>
                    <th className='px-4 py-3 text-left text-xs font-semibold text-[#030712]'>
                      Policy No
                    </th>
                    <th className='px-4 py-3 text-left text-xs font-semibold text-[#030712]'>
                      Policy Holder Name
                    </th>
                    <th className='px-4 py-3 text-left text-xs font-semibold text-[#030712]'>
                      Product Type
                    </th>
                    <th className='px-4 py-3 text-left text-xs font-semibold text-[#030712]'>
                      Contract Value
                    </th>
                    <th className='px-4 py-3 text-left text-xs font-semibold text-[#030712]'>
                      Inception Date
                    </th>
                    <th className='px-4 py-3 text-left text-xs font-semibold text-[#030712]'>
                      Expiry Date
                    </th>
                    <th className='px-4 py-3 text-left text-xs font-semibold text-[#030712]'>
                      Transaction Type
                    </th>
                    <th className='px-4 py-3 text-left text-xs font-semibold text-[#030712]'>
                      Price
                    </th>
                    <th className='px-4 py-3 text-left text-xs font-semibold text-[#030712]'>
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className='bg-[#FFFFFF] '>
                  {paginatedCertificates.map((cert, index) => (
                    <tr
                      key={index}
                      className='border-b border-gray-200 hover:bg-gray-50'>
                      <td className='px-4 py-3 text-sm font-mono text-[#030712]'>
                        {cert.policyNo}
                      </td>
                      <td className='px-4 py-3 text-sm font-normal font-sans text-[#6B7280]'>
                        {cert.holderName}
                      </td>
                      <td className='px-4 py-3 text-sm font-normal font-sans text-[#6B7280]'>
                        {cert.productType || cert.measureType}
                      </td>
                      <td className='px-4 py-3 text-sm font-normal text-[#6B7280] font-mono'>
                        {cert.contractValue}
                      </td>
                      <td className='px-4 py-3 text-sm font-normal text-[#6B7280] font-mono'>
                        {cert.inceptionDate}
                      </td>
                      <td className='px-4 py-3 text-sm font-normal text-[#6B7280] font-mono'>
                        {cert.expiryDate}
                      </td>
                      <td className='px-4 py-3 text-sm font-normal text-[#6B7280] font-sans'>
                        {cert.transactionType}
                      </td>
                      <td className='px-4 py-3 text-sm font-normal text-[#6B7280] font-mono'>
                        {cert.price}
                      </td>
                      <td className='px-4 py-3 text-sm'>
                        <div className='flex gap-2'>
                          <button
                            onClick={() => handleViewCertificate(cert)}
                            className='p-2 hover:bg-gray-100 cursor-pointer rounded'>
                            <Eye size={18} className='text-blue-600' />
                          </button>
                          <button
                            onClick={() => handleDownloadCertificate(cert.id)}
                            disabled={downloading}
                            className='p-2 hover:bg-gray-100 cursor-pointer rounded disabled:opacity-50'>
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

      {/* View Certificate Modal */}
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
                    setSelectedCertificate(null);
                  }}
                  className='p-2 hover:bg-gray-100 rounded-lg'>
                  <X size={20} />
                </button>
              </div>

              <div className='flex items-center justify-between'>
                <h1 className='text-3xl font-semibold text-gray-900'>
                  {selectedCertificate.policyNumber}
                </h1>
                <button
                  onClick={() => {
                    const cert = certificates.find(
                      (c) => c.policyNo === selectedCertificate.policyNumber
                    );
                    if (cert) {
                      handleDownloadCertificate(cert.id);
                    }
                  }}
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

            {/* Certificate Details */}
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
                      {selectedCertificate.contractorName}
                    </div>
                  </div>
                  <div>
                    <div className='text-sm text-gray-500 mb-1'>
                      Contractor Address
                    </div>
                    <div className='text-base'>
                      {selectedCertificate.contractorAddress}
                    </div>
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
                    selectedCertificate.policyHolderName
                  )}
                  {renderField("Address", selectedCertificate.address)}
                  {renderField("Country", selectedCertificate.country)}
                  {renderField("Postcode", selectedCertificate.postcode)}
                  {renderField("Policyholder email", selectedCertificate.email)}
                  {renderField("Policyholder Phone", selectedCertificate.phone)}
                </div>
              </div>

              {/* Product Details */}
              <div className='mb-6'>
                <h2 className='text-lg font-semibold text-gray-800 mb-3'>
                  Product Details
                </h2>
                <div className='space-y-3'>
                  {renderField("Product Type", selectedCertificate.productType)}
                  {renderField(
                    "Insurance Coverage",
                    "Insurance Backed Guarantee"
                  )}
                  {renderField(
                    "Inception Date",
                    selectedCertificate.inceptionDate
                  )}
                  {renderField("Expiry Date", selectedCertificate.expiryDate)}
                  {renderField(
                    "Contract Value",
                    selectedCertificate.contractValue
                  )}
                  {renderField("Transaction Type", "Certificate Generated")}
                  {renderField("Price", selectedCertificate.price)}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

export default DashboardPage;
