// app/api/certificates/[id]/send-email/route.js
import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Insurance from "@/models/Insurance";

import { generateCertificatePDF } from "@/utils/serverPdfGenerator";
import { sendCertificateEmail } from "@/lib/email";

export async function POST(request, { params }) {
  const { id } = await params; // insurance _id

  try {
    await connectDB();

    const insurance = await Insurance.findById(id);
    if (!insurance) {
      return NextResponse.json(
        { error: "Certificate not found" },
        { status: 404 },
      );
    }

    // Optional: you can allow re-sending even if already issued
    // If you want to BLOCK re-sending, uncomment this:
    // if (insurance.emailGenerated) {
    //   return NextResponse.json({ error: "Already issued" }, { status: 400 });
    // }

    // Prepare data for PDF (minimal version – adjust fields as needed)
    const pdfData = {
      policyNo: insurance.policyNumber,
      holderName: insurance.policyHolderName,
      address: insurance.address,
      productType: insurance.products?.[0]?.productType || "Unknown",
      inceptionDate: insurance.products?.[0]?.inceptionDate
        ? new Date(insurance.products[0].inceptionDate).toLocaleDateString(
            "en-GB",
          )
        : "—",
      expiryDate: insurance.products?.[0]?.expiryDate
        ? new Date(insurance.products[0].expiryDate).toLocaleDateString("en-GB")
        : "—",
      price: insurance.products?.[0]?.price
        ? `£${insurance.products[0].price.toFixed(2)}`
        : "—",
      createdAt: insurance.createdAt,
      // Add more fields your PDF component expects
    };

    const contractor = {
      companyName: insurance.contractorName || "—",
      address: insurance.contractorAddress || "—",
    };

    // Generate PDF using your reusable function
    const pdfBuffer = await generateCertificatePDF(pdfData, contractor);

    const pdfAttachments = [
      {
        filename: `IBG_Certificate_${insurance.policyNumber}.pdf`,
        content: pdfBuffer,
        contentType: "application/pdf",
      },
    ];

    if (!insurance.email || !insurance.email.includes("@")) {
      return NextResponse.json({ error: "No valid email" }, { status: 400 });
    }

    console.log("Sending email TO:", insurance.email);
    console.log("Attachments prepared:", pdfAttachments.length);

    // FIXED CALL: positional arguments (NOT object)
    const emailSent = await sendCertificateEmail(
      insurance.email,
      insurance.policyHolderName || "Policy Holder",
      insurance.contractorName || "Contractor",
      insurance.policyNumber,
      pdfAttachments,
      insurance.products?.length || 1,
    );

    if (!emailSent) {
      throw new Error("Email sending returned false");
    }

    console.log("Email successfully sent to:", insurance.email);

    // Update DB
    insurance.emailGenerated = true;
    insurance.emailGeneratedAt = new Date();
    insurance.emailSentTo = insurance.email;
    insurance.emailAttempts = (insurance.emailAttempts || 0) + 1;
    insurance.emailError = null;
    await insurance.save();

    return NextResponse.json({ success: true, message: "Email sent" });
  } catch (error) {
    console.error("Email send error:", error);

    // Save error if possible
    const insurance = await Insurance.findById(id);
    if (insurance) {
      insurance.emailError = error.message?.slice(0, 200) || "Unknown error";
      insurance.emailAttempts = (insurance.emailAttempts || 0) + 1;
      await insurance.save();
    }

    return NextResponse.json(
      { error: "Failed to send email: " + error.message },
      { status: 500 },
    );
  }
}
