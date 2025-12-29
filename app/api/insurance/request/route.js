// app/api/insurance/request/route.js
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import connectDB from "@/lib/db";
import Insurance from "@/models/Insurance";

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
    const { insuranceId, type, changes, reason } = data;

    console.log("Received request:", { insuranceId, type, changes, reason });

    if (!insuranceId || !type) {
      return NextResponse.json(
        { success: false, error: "Insurance ID and request type required" },
        { status: 400 }
      );
    }

    if (!["edit", "cancel"].includes(type)) {
      return NextResponse.json(
        { success: false, error: "Invalid request type" },
        { status: 400 }
      );
    }

    await connectDB();

    // Find the insurance
    const insurance = await Insurance.findById(insuranceId);

    if (!insurance) {
      return NextResponse.json(
        { success: false, error: "Insurance not found" },
        { status: 404 }
      );
    }

    // Check if user owns this insurance
    if (insurance.userId.toString() !== decoded.userId) {
      return NextResponse.json(
        { success: false, error: "Not authorized" },
        { status: 403 }
      );
    }

    // Check if there's already a pending request
    const currentStatus = insurance.status.toString();
    if (currentStatus === "pending" || currentStatus.includes("pending")) {
      return NextResponse.json(
        {
          success: false,
          error: "A request is already pending for this policy",
        },
        { status: 409 }
      );
    }

    const newStatus = "pending"; // Use the existing 'pending' status

    // Update insurance with request - bypass validation
    await Insurance.findByIdAndUpdate(
      insuranceId,
      {
        status: newStatus,
        requestData: {
          type, // 'edit' or 'cancel' - store type here
          changes: changes || {},
          reason: reason || "",
          requestedBy: decoded.userId,
          requestedAt: new Date(),
          status: "pending",
        },
      },
      { runValidators: false } 
    );

    console.log("Request saved for policy:", insurance.policyNumber);

    return NextResponse.json({
      success: true,
      message: `${
        type === "edit" ? "Edit" : "Cancellation"
      } request submitted. Waiting for admin approval.`,
      policyNumber: insurance.policyNumber,
      status: newStatus,
    });
  } catch (error) {
    console.error("Request submission error:", error);

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
      { success: false, error: "Failed to submit request" },
      { status: 500 }
    );
  }
}
// Same file, add GET method
export async function GET(request) {
  try {
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

    // Get user's pending requests - look for status 'pending'
    const pendingRequests = await Insurance.find({
      userId: decoded.userId,
      status: "pending", // Changed from ["pending_edit", "pending_cancel"]
      "requestData.status": "pending",
    }).select("policyNumber status requestData createdAt");

    return NextResponse.json({
      success: true,
      requests: pendingRequests.map((insurance) => ({
        id: insurance._id,
        policyNumber: insurance.policyNumber,
        status: insurance.status,
        requestType: insurance.requestData?.type || "edit", // Get type from requestData
        reason: insurance.requestData?.reason || "",
        requestedAt: insurance.requestData?.requestedAt || insurance.createdAt,
      })),
    });
  } catch (error) {
    console.error("Get requests error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch requests" },
      { status: 500 }
    );
  }
}
