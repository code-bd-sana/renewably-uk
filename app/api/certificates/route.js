// app/api/certificates/route.js
import connectDB from "@/lib/db";
import Insurance from "@/models/Insurance";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

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

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Connect to database
    await connectDB();

    // Get user's certificates
    const insurances = await Insurance.find({ userId: decoded.userId })
      .sort({ createdAt: -1 })
      .lean();

    // Flatten products into individual certificates
    const certificates = [];

    insurances.forEach((insurance) => {
      insurance.products.forEach((product, productIndex) => {
        const certificate = {
          id: `${insurance._id}-${productIndex}`,
          insuranceId: insurance._id.toString(),
          policyNo: insurance.policyNumber,
          policyNumber: insurance.policyNumber,
          holderName: insurance.policyHolderName,
          productType: product.productType,
          address: insurance.address,
          fundingPartner: insurance.fundingPartner,
          abs: insurance.abs,
          createdAt: insurance.createdAt,
          document: insurance.document,
          contractValue: `£ ${product.contractValue.toFixed(2)}`,
          inceptionDate: new Date(product.inceptionDate).toLocaleDateString(
            "en-GB"
          ),
          expiryDate: new Date(product.expiryDate).toLocaleDateString("en-GB"),
          transactionType: "Certificate Generated",
          price: `£ ${product.price.toFixed(2)}`,
          status: insurance.status,
          rawData: {
            insurance: {
              contractorName: insurance.contractorName,
              contractorAddress: insurance.contractorAddress,
              policyHolderName: insurance.policyHolderName,
              email: insurance.email,
              phone: insurance.phone,
              address: insurance.address,
              country: insurance.country,
              postcode: insurance.postcode,
              document: insurance.document,
              status: insurance.status,
              requestData: insurance.requestData,
              fundingPartner: insurance.fundingPartner,
              abs: insurance.abs,
              retrofitAssessor: insurance.retrofitAssessor,
              retrofitCoordinator: insurance.retrofitCoordinator,
              schemeProvider: insurance.schemeProvider,
            },
            product: product,
          },
        };

        certificates.push(certificate);
      });
    });

    return NextResponse.json({
      success: true,
      certificates,
      total: certificates.length,
    });
  } catch (error) {
    console.error("Fetch certificates error:", error);

    if (
      error.name === "JsonWebTokenError" ||
      error.name === "TokenExpiredError"
    ) {
      return NextResponse.json(
        { success: false, error: "Invalid or expired token" },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { success: false, error: "Failed to fetch certificates" },
      { status: 500 }
    );
  }
}
