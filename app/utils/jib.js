const handleDownload = async (contractorId) => {
  try {
    const contractor = certificates.find((c) => c.id === contractorId);
    if (!contractor) {
      alert("Contractor not found");
      return;
    }

    console.log(contractor, "ha ami kinto contracator somossa nai ");

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
    const inceptionDate = contractor.inceptionDate;
    doc.setFontSize(12);
    doc.setTextColor(75, 85, 99);
    doc.text(inceptionDate, margin + 20 + columnWidth + 10, yPos + 30);

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
    const expiryDate = contractor.expiryDate;
    doc.setFontSize(12);
    doc.setTextColor(75, 85, 99);
    doc.text(expiryDate, margin + 20 + columnWidth + 10, yPos + 48);

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
