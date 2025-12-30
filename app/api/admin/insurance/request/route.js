import connectDB from "@/lib/db";
import Insurance from "@/models/Insurance";
import { authenticate } from "@/middleware/auth";

export async function POST(request) {
  try {
    // Auth check
    const auth = await authenticate(request);

    if (!auth.success) {
      return Response.json(
        { success: false, error: auth.error },
        { status: auth.status || 401 }
      );
    }

    // Allow both admin and users to make requests
    if (!["admin", "contractor"].includes(auth.userRole)) {
      return Response.json(
        { success: false, error: "Access denied" },
        { status: 403 }
      );
    }

    await connectDB();

    const data = await request.json();
    const { insuranceId, type, changes, reason } = data;

    if (!insuranceId || !type || !["edit", "cancel"].includes(type)) {
      return Response.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Find the insurance record
    const insurance = await Insurance.findById(insuranceId);

    if (!insurance) {
      return Response.json(
        { success: false, error: "Insurance record not found" },
        { status: 404 }
      );
    }

    // Check if there's already a pending request
    if (insurance.status.includes("pending")) {
      return Response.json(
        { success: false, error: "There's already a pending request for this policy" },
        { status: 400 }
      );
    }

    // Update insurance with request data
    insurance.status = type === "edit" ? "pending_edit" : "pending_cancel";
    
    insurance.requestData = {
      type: type,
      changes: changes || {},
      reason: reason || `Request for ${type} submitted`,
      requestedBy: auth.userId,
      requestedAt: new Date(),
      status: "pending",
    };

    await insurance.save();

    return Response.json({
      success: true,
      message: `Request for ${type} submitted successfully`,
      insurance: {
        id: insurance._id,
        policyNumber: insurance.policyNumber,
        status: insurance.status,
      },
    });
  } catch (error) {
    console.error("POST /api/admin/insurance/request error:", error);
    return Response.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function GET(request) {
  try {
    // Auth check
    const auth = await authenticate(request);

    if (!auth.success) {
      return Response.json(
        { success: false, error: auth.error },
        { status: auth.status || 401 }
      );
    }

    // Only admin can view all requests
    if (auth.userRole !== "admin") {
      return Response.json(
        { success: false, error: "Admin access required" },
        { status: 403 }
      );
    }

    await connectDB();

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || "pending";
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 20;

    // Build query for pending requests
    let query = {
      $or: [
        { status: "pending_edit" },
        { status: "pending_cancel" },
      ],
    };

    if (status !== "all") {
      query = {
        status: status === "pending" ? { $in: ["pending_edit", "pending_cancel"] } : status,
      };
    }

    // Fetch pending requests
    const requests = await Insurance.find(query)
      .populate("userId", "name email companyName")
      .sort({ "requestData.requestedAt": -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    const total = await Insurance.countDocuments(query);

    // Format response
    const formattedRequests = requests.map((insurance) => ({
      id: insurance._id.toString(),
      policyNumber: insurance.policyNumber,
      policyHolderName: insurance.policyHolderName,
      type: insurance.requestData?.type || "unknown",
      reason: insurance.requestData?.reason || "",
      requestedAt: insurance.requestData?.requestedAt,
      requestedBy: insurance.userId?.name || "Unknown",
      contractorName: insurance.contractorName,
      contractorEmail: insurance.userId?.email,
      status: insurance.status,
      changes: insurance.requestData?.changes || {},
    }));

    return Response.json({
      success: true,
      requests: formattedRequests,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("GET /api/admin/insurance/request error:", error);
    return Response.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}