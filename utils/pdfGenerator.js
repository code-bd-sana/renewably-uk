// utils/pdfGenerator.js
import CertificatePDF from "@/components/CertificatePDF";
import { pdf } from '@react-pdf/renderer';
import jsPDF from "jspdf";

export const generateCertificatePDF = (certificate, contractor) => {
  console.log(contractor, "contractor aysot re toi");
  const doc = new jsPDF();

  // Set document properties
  doc.setProperties({
    title: `Certificate - ${certificate.policyNo}`,
    subject: "Insurance Backed Guarantee Certificate",
    author: "Renewably UK",
  });

  // Add header
  doc.setFontSize(20);
  doc.setTextColor(37, 99, 235); // Blue color
  doc.text("RENEWABLY UK", 105, 20, { align: "center" });

  doc.setFontSize(16);
  doc.text("Insurance Backed Guarantee Certificate", 105, 30, {
    align: "center",
  });

  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  doc.text(`Policy Number: ${certificate.policyNo}`, 105, 40, {
    align: "center",
  });

  // Draw line
  doc.setLineWidth(0.5);
  doc.line(20, 45, 190, 45);

  let yPos = 55;

  // Contractor Details
  doc.setFontSize(14);
  doc.setTextColor(55, 65, 81); // Gray-700
  doc.text("Contractor Details", 20, yPos);
  yPos += 10;

  doc.setFontSize(11);
  doc.setTextColor(0, 0, 0);
  doc.text(
    `Name: ${certificate.rawData?.insurance?.contractorName || "Not Provided"}`,
    20,
    yPos
  );
  yPos += 8;
  doc.text(
    `Address: ${
      certificate.rawData?.insurance?.contractorAddress || "Not Provided"
    }`,
    20,
    yPos
  );
  yPos += 15;

  // Policy Holder Details
  doc.setFontSize(14);
  doc.setTextColor(55, 65, 81);
  doc.text("Policy Holder Details", 20, yPos);
  yPos += 10;

  doc.setFontSize(11);
  doc.setTextColor(0, 0, 0);
  doc.text(`Name: ${contractor?.name || certificate.rawData?.insurance?.contractorName || "Not Provided"}`, 20, yPos);
  yPos += 8;
  doc.text(
    `Email: ${certificate.rawData?.insurance?.email || "Not Provided"}`,
    20,
    yPos
  );
  yPos += 8;
  doc.text(
    `Phone: ${certificate.rawData?.insurance?.phone || "Not Provided"}`,
    20,
    yPos
  );
  yPos += 8;
  doc.text(
    `Address: ${certificate.rawData?.insurance?.address || "Not Provided"}`,
    20,
    yPos
  );
  yPos += 15;

  // Product Details
  doc.setFontSize(14);
  doc.setTextColor(55, 65, 81);
  doc.text("Product Details", 20, yPos);
  yPos += 10;

  doc.setFontSize(11);
  doc.setTextColor(0, 0, 0);
  doc.text(`Product Type: ${certificate.productType}`, 20, yPos);
  yPos += 8;
  doc.text(
    `Cover Option: ${
      certificate.rawData?.product?.coverOption || "Insurance Backed Guarantee"
    }`,
    20,
    yPos
  );
  yPos += 8;
  doc.text(`Inception Date: ${certificate.inceptionDate}`, 20, yPos);
  yPos += 8;
  doc.text(`Expiry Date: ${certificate.expiryDate}`, 20, yPos);
  yPos += 8;
  doc.text(`Contract Value: ${certificate.contractValue}`, 20, yPos);
  yPos += 8;
  doc.setTextColor(37, 99, 235); // Blue for price
  doc.text(`Certificate Price: ${certificate.price}`, 20, yPos);

  // Footer
  doc.setFontSize(10);
  doc.setTextColor(107, 114, 128); // Gray-500
  doc.text(
    `Generated on: ${new Date().toLocaleDateString("en-GB")}`,
    105,
    280,
    { align: "center" }
  );
  doc.text("Renewably UK - Powering Renewables", 105, 285, { align: "center" });

  // Save the PDF
  doc.save(`${certificate.policyNo}_certificate.pdf`);
};

export const downloadPdf = async (certificate, contractor) => {
  try {
    console.log("Generating PDF with react-pdf...");
    
    const pdfComponent = <CertificatePDF certificate={certificate} contractor={contractor} />;
    const blob = await pdf(pdfComponent).toBlob();
    
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    
    const fileName = `certificate-${certificate.policyNo || certificate.policyNumber}.pdf`;
    link.download = fileName;
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
    
  } catch (error) {
    console.error("React PDF generation error:", error);
    alert("Failed to generate certificate PDF.");
  }
};


// // utils/pdfGenerator.js
// import jsPDF from "jspdf";

// export const generateCertificatePDF = (certificate) => {
//   console.log(contractor, "contractor aysot re toi");
//   const doc = new jsPDF();

//   // Set document properties
//   doc.setProperties({
//     title: `Certificate - ${certificate.policyNo}`,
//     subject: "Insurance Backed Guarantee Certificate",
//     author: "Renewably UK",
//   });

//   // Add header
//   doc.setFontSize(20);
//   doc.setTextColor(37, 99, 235); // Blue color
//   doc.text("RENEWABLY UK", 105, 20, { align: "center" });

//   doc.setFontSize(16);
//   doc.text("Insurance Backed Guarantee Certificate", 105, 30, {
//     align: "center",
//   });

//   doc.setFontSize(12);
//   doc.setTextColor(0, 0, 0);
//   doc.text(`Policy Number: ${certificate.policyNo}`, 105, 40, {
//     align: "center",
//   });

//   // Draw line
//   doc.setLineWidth(0.5);
//   doc.line(20, 45, 190, 45);

//   let yPos = 55;

//   // Contractor Details
//   doc.setFontSize(14);
//   doc.setTextColor(55, 65, 81); // Gray-700
//   doc.text("Contractor Details", 20, yPos);
//   yPos += 10;

//   doc.setFontSize(11);
//   doc.setTextColor(0, 0, 0);
//   doc.text(
//     `Name: ${certificate.rawData?.insurance?.contractorName || "Not Provided"}`,
//     20,
//     yPos
//   );
//   yPos += 8;
//   doc.text(
//     `Address: ${
//       certificate.rawData?.insurance?.contractorAddress || "Not Provided"
//     }`,
//     20,
//     yPos
//   );
//   yPos += 15;

//   // Policy Holder Details
//   doc.setFontSize(14);
//   doc.setTextColor(55, 65, 81);
//   doc.text("Policy Holder Details", 20, yPos);
//   yPos += 10;

//   doc.setFontSize(11);
//   doc.setTextColor(0, 0, 0);
//   doc.text(`Name: ${certificate.holderName}`, 20, yPos);
//   yPos += 8;
//   doc.text(
//     `Email: ${certificate.rawData?.insurance?.email || "Not Provided"}`,
//     20,
//     yPos
//   );
//   yPos += 8;
//   doc.text(
//     `Phone: ${certificate.rawData?.insurance?.phone || "Not Provided"}`,
//     20,
//     yPos
//   );
//   yPos += 8;
//   doc.text(
//     `Address: ${certificate.rawData?.insurance?.address || "Not Provided"}`,
//     20,
//     yPos
//   );
//   yPos += 15;

//   // Product Details
//   doc.setFontSize(14);
//   doc.setTextColor(55, 65, 81);
//   doc.text("Product Details", 20, yPos);
//   yPos += 10;

//   doc.setFontSize(11);
//   doc.setTextColor(0, 0, 0);
//   doc.text(`Product Type: ${certificate.productType}`, 20, yPos);
//   yPos += 8;
//   doc.text(
//     `Cover Option: ${
//       certificate.rawData?.product?.coverOption || "Insurance Backed Guarantee"
//     }`,
//     20,
//     yPos
//   );
//   yPos += 8;
//   doc.text(`Inception Date: ${certificate.inceptionDate}`, 20, yPos);
//   yPos += 8;
//   doc.text(`Expiry Date: ${certificate.expiryDate}`, 20, yPos);
//   yPos += 8;
//   doc.text(`Contract Value: ${certificate.contractValue}`, 20, yPos);
//   yPos += 8;
//   doc.setTextColor(37, 99, 235); // Blue for price
//   doc.text(`Certificate Price: ${certificate.price}`, 20, yPos);

//   // Footer
//   doc.setFontSize(10);
//   doc.setTextColor(107, 114, 128); // Gray-500
//   doc.text(
//     `Generated on: ${new Date().toLocaleDateString("en-GB")}`,
//     105,
//     280,
//     { align: "center" }
//   );
//   doc.text("Renewably UK - Powering Renewables", 105, 285, { align: "center" });

//   // Save the PDF
//   doc.save(`${certificate.policyNo}_certificate.pdf`);
// };

// export const downloadPdf = async (certificate, contractor) => {
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
//     console.log(contractor, "contractor aysot re toi");
//     console.error("PDF generation error:", error);
//     alert("Failed to generate certificate. Please try again.");
//   }
// };
