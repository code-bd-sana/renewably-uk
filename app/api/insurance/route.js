// app/api/insurance/route.js
import connectDB from "@/lib/db";
import Insurance from "@/models/Insurance";
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
        { status: 401 }
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
      insurancess,
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
      { status: 500 }
    );
  }
}

// Handle POST (create new insurance)
export async function POST(request) {
  try {
    // Check authentication
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, error: "Not authenticated" },
        { status: 401 }
      );
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const data = await request.json();

    console.log("Creating insurance with data:", data);

    await connectDB();

    // Validate required fields
    if (
      !data.contractorName ||
      !data.policyHolderName ||
      !data.email ||
      !data.phone ||
      !data.address ||
      !data.products ||
      data.products.length === 0
    ) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Create new insurance
    const insurance = new Insurance({
      ...data,
      userId: decoded.userId,
      status: "active",
    });

    await insurance.save();

    return NextResponse.json({
      success: true,
      message: "Insurance created successfully",
      insuranceId: insurance._id,
      policyNumber: insurance.policyNumber,
    });
  } catch (error) {
    console.error("Create insurance error:", error);

    if (error.name === "ValidationError") {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: "Failed to create insurance" },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  await connectDB();
  const data = await request.json();
  console.log("Higima lamha -->", data);

  try {
    // Parse request body
    // const data = await request.json();
    // console.log("Higima lamha -->", data);

    const certificateId = data?.certificateId;
    const documentUrls = data?.documentUrls;

    // Validate required fields
    if (!certificateId) {
      return NextResponse.json(
        { success: false, error: "Certificate ID is required" },
        { status: 400 }
      );
    }

    if (!documentUrls || !Array.isArray(documentUrls)) {
      return NextResponse.json(
        { success: false, error: "Valid document URLs array is required" },
        { status: 400 }
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
        { status: 400 }
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
      }
    );

    console.log("Update result:", updated);

    if (updated.matchedCount === 0) {
      return NextResponse.json(
        {
          success: false,
          error: `Certificate not found with ID: ${cleanCertificateId}`,
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Insurance Updated Successfully",
        data: updated,
      },
      { status: 200 }
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
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to update insurance",
      },
      { status: 500 }
    );
  }
}
