import connectDB from "@/lib/db";
import User from "@/models/User";
import { authenticate } from "@/middleware/auth";
import Insurance from "@/models/Insurance";

export async function GET(request) {
  try {
    // AUTH CHECK
    const auth = await authenticate(request);

    if (!auth.success) {
      return Response.json(
        { success: false, error: auth.error },
        { status: auth.status || 401 }
      );
    }

    // ADMIN CHECK
    if (auth.userRole !== "admin") {
      return Response.json(
        { success: false, error: "Admin access required" },
        { status: 403 }
      );
    }

    // GET CONTRACTORS
    await connectDB();

    // Get query params for filtering
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");

    const status = searchParams.get("status");
    const type = searchParams.get("type");

    // ========== Handle requests type ==========
    if (type === "requests") {
      console.log("=== ADMIN API DEBUG ===");
      console.log("Query parameters:", { type, status, page, limit });

      let requestQuery = {
        status: "pending",
      };

      if (status === "edit") {
        requestQuery["requestData.type"] = "edit";
      } else if (status === "cancel") {
        requestQuery["requestData.type"] = "cancel";
      }

      console.log(
        "Final MongoDB query:",
        JSON.stringify(requestQuery, null, 2)
      );

      // Get total count
      const total = await Insurance.countDocuments(requestQuery);
      console.log("Total documents matching query:", total);

      // Get the actual documents
      const rawRequests = await Insurance.find(requestQuery)
        .populate("userId", "name email companyName")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit);

      console.log("Raw requests found:", rawRequests.length);

      if (rawRequests.length > 0) {
        console.log("First request details:");
        console.log("ID:", rawRequests[0]._id);
        console.log("Status:", rawRequests[0].status);
        console.log("Policy Number:", rawRequests[0].policyNumber);
        console.log("Request Data:", rawRequests[0].requestData);
        console.log("User ID populated?", !!rawRequests[0].userId);
      }

      console.log("=== END DEBUG ===");

      const requests = rawRequests.map((insurance) => ({
        id: insurance._id,
        policyNumber: insurance.policyNumber,
        policyHolderName: insurance.policyHolderName,
        contractor: insurance.userId
          ? {
              id: insurance.userId._id,
              name: insurance.userId.name,
              email: insurance.userId.email,
              companyName: insurance.userId.companyName,
            }
          : null,
        requestType: insurance.requestData?.type || "edit",
        status: insurance.status,
        requestedAt: insurance.requestData?.requestedAt || insurance.createdAt,
        changes: insurance.requestData?.changes || {},
        reason: insurance.requestData?.reason || "",
        createdAt: insurance.createdAt,
      }));

      console.log("Formatted requests being returned:", requests.length);

      return Response.json({
        success: true,
        requests,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      });
    }
    // ========== END SECTION ==========
    // Build query - only get contractors
    let query = { role: "contractor" };

    if (status === "pending") {
      query.isApproved = false;
    } else if (status === "approved") {
      query.isApproved = true;
    }
    // Get total count for pagination
    const total = await User.countDocuments(query);

    // Get contractors with pagination
    const contractors = await User.find(query)
      .select("-passwordHash")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    return Response.json({
      success: true,
      users: contractors.map((contractor) => ({
        id: contractor._id,
        name: contractor.name,
        email: contractor.email,
        phone: contractor.phone || "",
        companyName: contractor.companyName || "",
        companyAddress: contractor.companyAddress || "",
        position: contractor.position || "",
        role: contractor.role,
        isApproved: contractor.isApproved,
        createdAt: contractor.createdAt,
        updatedAt: contractor.updatedAt,
      })),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get contractors error:", error);
    return Response.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
