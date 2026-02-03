import { sendCertificateEmail } from "@/lib/email";
import { generateCertificatePDF } from "./serverPdfGenerator";

export async function sendCertificateWithEmail(
  insuranceId,
  certificateData,
  contractorData,
  policyHolderEmail,
) {
  try {
    console.log(
      "📧 Starting email process for certificate:",
      certificateData.policyNumber,
    );

    // 1. Generate PDF
    console.log("🔄 Generating PDF...");
    const pdfBuffer = await generateCertificatePDF(
      certificateData,
      contractorData,
    );

    if (!pdfBuffer || pdfBuffer.length === 0) {
      throw new Error("PDF generation returned empty buffer");
    }

    console.log("✅ PDF generated, size:", pdfBuffer.length, "bytes");

    // 2. Create filename
    const policyNumber = certificateData.policyNumber || `CERT_${insuranceId}`;
    const fileName = `Insurance_Certificate_${policyNumber}.pdf`;

    // 3. Send email with PDF attachment
    console.log("📤 Sending email to:", policyHolderEmail);
    const emailSent = await sendCertificateEmail(
      policyHolderEmail,
      certificateData.policyHolderName || certificateData.holderName,
      contractorData.companyName,
      policyNumber,
      pdfBuffer,
      fileName,
    );

    if (!emailSent) {
      throw new Error("Email sending failed");
    }

    console.log("✅ Certificate emailed successfully");
    return {
      success: true,
      message: "Certificate emailed successfully",
      fileName: fileName,
    };
  } catch (error) {
    console.error("❌ Error in sendCertificateWithEmail:", error);
    throw error;
  }
}
