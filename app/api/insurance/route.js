// app/api/insurance/route.js
import connectDB from "@/lib/db";
import { sendCertificateEmail } from "@/lib/email";
import Insurance from "@/models/Insurance";
import User from "@/models/User";
import { sendCertificateWithEmail } from "@/utils/certificateUtils";
import { generateCertificatePDF } from "@/utils/serverPdfGenerator";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

// Handle GET (get all insurances for user)
export async function GET(request) {
  try {
    // Check authentication
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, error: "Not authenticated" },
        { status: 401 },
      );
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    await connectDB();

    // Find all insurances for this user
    const insurances = await Insurance.find({ userId: decoded.userId }).sort({
      createdAt: -1,
    });

    return NextResponse.json({
      success: true,
      insurances,
      insurances: insurances.map((insurance) => ({
        id: insurance._id,
        policyNumber: insurance.policyNumber,
        contractorName: insurance.contractorName,
        policyHolderName: insurance.policyHolderName,
        email: insurance.email,
        phone: insurance.phone,
        document: insurance.document,
        status: insurance.status,
        products: insurance.products,
        createdAt: insurance.createdAt,
      })),
    });
  } catch (error) {
    console.error("Fetch insurances error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch insurances" },
      { status: 500 },
    );
  }
}

// Handle POST (create new insurance)
export async function POST(request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, error: "Not authenticated" },
        { status: 401 },
      );
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (jwtErr) {
      console.error("JWT verification failed:", jwtErr.message);
      return NextResponse.json(
        { success: false, error: "Invalid token" },
        { status: 401 },
      );
    }

    const userId = decoded.userId;

    const data = await request.json();
    console.log("Received form data:", JSON.stringify(data, null, 2));

    await connectDB();

    // Validation (unchanged)
    if (
      !data.policyHolderName ||
      !data.email ||
      !data.phone ||
      !data.address ||
      !data.country ||
      !data.postcode ||
      !data.products ||
      data.products.length === 0
    ) {
      console.log("Missing required fields in data:", data);
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 },
      );
    }

    // Load contractor
    const contractor = await User.findById(userId).select(
      "policyNoPrefix lastCertificateSequence companyName name isPrefixLocked",
    );

    if (!contractor) {
      console.log("Contractor not found for userId:", userId);
      return NextResponse.json(
        { success: false, error: "Contractor not found" },
        { status: 404 },
      );
    }

    console.log("Contractor loaded:", {
      id: contractor._id,
      prefix: contractor.policyNoPrefix,
      sequence: contractor.lastCertificateSequence,
    });

    // Sync sequence counter ONLY if it's at default (0) to recover from orphaned records
    // Skip if sequence is already > 0 (normal operation)
    if (
      contractor.lastCertificateSequence === 0 &&
      contractor.policyNoPrefix &&
      contractor.policyNoPrefix.trim() !== ""
    ) {
      const prefixPattern = new RegExp(`^${contractor.policyNoPrefix}(\\d+)$`);
      const lastInsurance = await Insurance.findOne({
        userId: userId,
        policyNumber: prefixPattern,
      })
        .sort({ policyNumber: -1 })
        .select("policyNumber");

      if (lastInsurance) {
        const match = lastInsurance.policyNumber.match(prefixPattern);
        if (match) {
          const lastSequence = parseInt(match[1], 10);
          console.log(
            `Found existing records. Syncing sequence: 0 → ${lastSequence}`,
          );
          await User.updateOne(
            { _id: userId },
            { $set: { lastCertificateSequence: lastSequence } },
          );
          contractor.lastCertificateSequence = lastSequence;
        }
      }
    }

    const createdInsurances = [];
    let emailSent = false;
    let emailError = null;
    let generatedPdfs = [];
    let creationFailed = false;

    try {
      console.log(`Processing ${data.products.length} products`);

      // Create one document per product - each gets next sequence number
      for (let i = 0; i < data.products.length; i++) {
        const product = data.products[i];

        let policyNumber;

        if (
          contractor.policyNoPrefix &&
          contractor.policyNoPrefix.trim() !== ""
        ) {
          // Increment sequence for EVERY product (unique number each time)
          const updated = await User.findByIdAndUpdate(
            userId,
            { $inc: { lastCertificateSequence: 1 } },
            { new: true, select: "lastCertificateSequence policyNoPrefix" },
          );

          const sequence = updated.lastCertificateSequence;
          policyNumber = `${updated.policyNoPrefix}${sequence.toString().padStart(5, "0")}`;

          // Lock prefix after first certificate overall (not per product)
          if (sequence === 1 && !contractor.isPrefixLocked) {
            await User.updateOne(
              { _id: userId },
              { $set: { isPrefixLocked: true } },
            );
          }
        } else {
          // Fallback - still unique
          const year = new Date().getFullYear().toString().slice(-2);
          const random = Math.floor(Math.random() * 1000000)
            .toString()
            .padStart(6, "0");
          policyNumber = `${year}${random}`;
        }

        const insurance = new Insurance({
          ...data,
          products: [product], // only this product
          policyNumber,
          userId,
          contractorName:
            contractor.companyName || contractor.name || data.contractorName,
          status: "active",
          emailGenerated: false,
          emailAttempts: 0,
          emailSentTo: data.email,
        });

        try {
          await insurance.save();
          createdInsurances.push(insurance);
          console.log(`Created certificate ${i + 1}: ${policyNumber}`);
        } catch (saveErr) {
          console.error(
            `Failed to save certificate ${i + 1} (${policyNumber}):`,
            saveErr.message,
          );
          if (saveErr.code === 11000) {
            // Duplicate key error - policy number already exists
            emailError = `Duplicate policy number: ${policyNumber}. This may have been created previously. Please contact support.`;
          } else {
            emailError = `Failed to save certificate: ${saveErr.message}`;
          }
          creationFailed = true;
          throw saveErr; // Re-throw to exit the product loop
        }
      }

      // Generate PDFs
      const pdfAttachments = [];

      for (let i = 0; i < createdInsurances.length; i++) {
        const ins = createdInsurances[i];
        const product = ins.products[0];

        const certificateData = {
          _id: ins._id,
          policyNumber: ins.policyNumber,
          productIndex: i + 1,
          totalProducts: data.products.length,
          policyHolderName: data.policyHolderName,
          holderName: data.policyHolderName,
          address: data.address,
          email: data.email,
          phone: data.phone,
          inceptionDate: product.inceptionDate || "",
          expiryDate: product.expiryDate || "",
          productType: product.measureType || "",
          price: product.price || product.contractValue * 0.05 || 0,
          contractValue: product.contractValue || 0,
          retrofitAssessor: data.retrofitAssessor || "",
          retrofitCoordinator: data.retrofitCoordinator || "",
          fundingPartner: data.fundingPartner || "",
          schemeProvider: data.schemeProvider || "",
          abs: data.abs || "",
          rawData: {
            insurance: data,
            product: product,
          },
          createdAt: ins.createdAt,
        };

        const contractorData = {
          companyName: contractor.companyName || contractor.name,
          name: contractor.name,
          address: data.contractorAddress || contractor.address,
          email: contractor.email,
        };

        const pdfBuffer = await generateCertificatePDF(
          certificateData,
          contractorData,
        );

        const fileName = `Insurance_Certificate_${ins.policyNumber}.pdf`;

        pdfAttachments.push({
          filename: fileName,
          content: pdfBuffer,
          contentType: "application/pdf",
          productIndex: i + 1,
          productType: product.measureType,
        });

        generatedPdfs.push({
          productIndex: i + 1,
          productType: product.measureType,
          fileName,
          size: pdfBuffer.length,
        });
      }

      // Send one email with all PDFs
      const emailResult = await sendCertificateEmail(
        data.email,
        data.policyHolderName,
        contractor.companyName || contractor.name,
        createdInsurances.map((ins) => ins.policyNumber).join(", "),
        pdfAttachments,
        data.products.length,
      );

      if (!emailResult) {
        throw new Error("Failed to send email with attachments");
      }

      emailSent = true;

      // Update each insurance
      for (const ins of createdInsurances) {
        await Insurance.findByIdAndUpdate(ins._id, {
          emailGenerated: true,
          emailGeneratedAt: new Date(),
          emailAttempts: 1,
          emailError: null,
          emailDetails: {
            totalProducts: data.products.length,
            sent: true,
            generatedPdfs,
            singleEmail: true,
          },
        });
      }
    } catch (err) {
      console.error("Creation or email error:", err);
      emailError = err.message;
      emailSent = false;
      creationFailed = true;
    }

    // If creation failed, return error response
    if (creationFailed || createdInsurances.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: emailError || "Failed to create insurance certificates",
          createdCount: createdInsurances.length,
        },
        { status: 400 },
      );
    }

    // Response for successful creation
    return NextResponse.json({
      success: true,
      message: emailSent
        ? `${createdInsurances.length} certificates created and sent in one email`
        : `${createdInsurances.length} certificates created but email failed`,
      insuranceIds: createdInsurances.map((ins) => ins._id.toString()),
      policyNumbers: createdInsurances.map((ins) => ins.policyNumber),
      emailSent,
      emailError,
      totalCertificates: createdInsurances.length,
      singleEmail: true,
    });
  } catch (error) {
    console.error("POST /api/insurance full error:", error);
    console.error("Error stack:", error.stack);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create insurance" },
      { status: 500 },
    );
  }
}

export async function PUT(request) {
  await connectDB();
  const data = await request.json();

  try {
    const certificateId = data?.certificateId;
    const documentUrls = data?.documentUrls;

    // Validate required fields
    if (!certificateId) {
      return NextResponse.json(
        { success: false, error: "Certificate ID is required" },
        { status: 400 },
      );
    }

    if (!documentUrls || !Array.isArray(documentUrls)) {
      return NextResponse.json(
        { success: false, error: "Valid document URLs array is required" },
        { status: 400 },
      );
    }

    // Clean the certificate ID - remove the "-0" suffix if present
    let cleanCertificateId = certificateId;
    if (certificateId.includes("-0")) {
      cleanCertificateId = certificateId.split("-0")[0];
      console.log("Cleaned certificate ID:", cleanCertificateId);
    }

    // Check if it's a valid ObjectId
    const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(cleanCertificateId);
    if (!isValidObjectId) {
      return NextResponse.json(
        {
          success: false,
          error: `Invalid certificate ID format: ${cleanCertificateId}. Expected 24-character hex string.`,
        },
        { status: 400 },
      );
    }

    console.log("Updating insurance with ID:", cleanCertificateId);
    console.log("Document URLs:", documentUrls);

    const updated = await Insurance.updateOne(
      { _id: cleanCertificateId },
      {
        $set: {
          document: documentUrls[0],
          status: "submitted",
          updatedAt: new Date(),
        },
      },
    );

    console.log("Update result:", updated);

    if (updated.matchedCount === 0) {
      return NextResponse.json(
        {
          success: false,
          error: `Certificate not found with ID: ${cleanCertificateId}`,
        },
        { status: 404 },
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Insurance Updated Successfully",
        data: updated,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error updating insurance:", error);

    // Check for specific MongoDB errors
    if (error.name === "CastError") {
      console.log("CastError details:", error.message);
      return NextResponse.json(
        {
          success: false,
          error: `Invalid certificate ID format. ${error.message}`,
        },
        { status: 400 },
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to update insurance",
      },
      { status: 500 },
    );
  }
}
