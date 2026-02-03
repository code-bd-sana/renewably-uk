import CertificatePDF from "@/components/CertificatePDF";
import { renderToBuffer } from "@react-pdf/renderer";
import React from "react";

export const generateCertificatePDF = async (
  certificateData,
  contractorData,
) => {
  try {
    console.log("🔄 Generating PDF for email...");

    // Create the PDF component
    const pdfComponent = (
      <CertificatePDF
        certificate={certificateData}
        contractor={contractorData}
      />
    );

    // Render to buffer
    const pdfBuffer = await renderToBuffer(pdfComponent);

    console.log(`PDF generated, size: ${pdfBuffer.length} bytes`);
    return pdfBuffer;
  } catch (error) {
    console.error("PDF generation failed:", error);
    throw error;
  }
};
