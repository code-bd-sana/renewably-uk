import CertificatePDF from "@/components/CertificatePDF";
import { pdf } from "@react-pdf/renderer";

export const downloadPdf = async (certificate, contractor) => {
  try {
    console.log("Generating PDF with react-pdf...");

    const pdfComponent = (
      <CertificatePDF certificate={certificate} contractor={contractor} />
    );
    const blob = await pdf(pdfComponent).toBlob();

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
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
