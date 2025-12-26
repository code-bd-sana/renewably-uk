import connectDB from "@/lib/db";
import User from "@/models/User";
import { authenticate } from "@/middleware/auth";

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
