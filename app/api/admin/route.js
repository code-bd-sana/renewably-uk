import connectDB from "@/lib/db";
import User from "@/models/User";
import { authenticate } from "@/middleware/auth";
import Insurance from "@/models/Insurance";

export async function GET(request) {
  try {
    // Authenticate user
    const auth = await authenticate(request);

    if (!auth.success) {
      return Response.json(
        { success: false, error: auth.error },
        { status: auth.status || 401 }
      );
    }

    // Check if user is admin
    if (auth.userRole !== "admin") {
      return Response.json(
        { success: false, error: "Admin access required" },
        { status: 403 }
      );
    }

    // Get URL parameters
    const url = new URL(request.url);
    const action = url.searchParams.get("action");

    if (action === "get-stats") {
      await connectDB();

      // Get counts from database
      const totalContractors = await User.countDocuments({
        role: "contractor",
      });
      const approvedContractors = await User.countDocuments({
        role: "contractor",
        isApproved: true,
      });
      const pendingContractors = await User.countDocuments({
        role: "contractor",
        isApproved: false,
      });

      const totalPolicies = await Insurance.countDocuments();
      const activePolicies = await Insurance.countDocuments({
        status: "active",
      });
      const pendingEditRequests = await Insurance.countDocuments({
        status: "pending_edit",
      });
      const pendingCancelRequests = await Insurance.countDocuments({
        status: "pending_cancel",
      });

      // Calculate premium total (sum of all products' prices)
      const insuranceAggregation = await Insurance.aggregate([
        { $unwind: "$products" },
        { $group: { _id: null, totalPremium: { $sum: "$products.price" } } },
      ]);

      const premiumTotal = insuranceAggregation[0]?.totalPremium || 0;

      // This month policies
      const currentDate = new Date();
      const startOfMonth = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        1
      );
      const endOfMonth = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() + 1,
        0
      );

      const thisMonthPolicies = await Insurance.countDocuments({
        createdAt: { $gte: startOfMonth, $lte: endOfMonth },
      });

      const thisMonthContractors = await User.countDocuments({
        role: "contractor",
        createdAt: { $gte: startOfMonth, $lte: endOfMonth },
      });

      return Response.json({
        success: true,
        stats: {
          totalPolicies,
          premiumTotal,
          thisMonthPolicies,
          totalContractors: approvedContractors,
          pendingApprovals: pendingContractors,
          thisMonthContractors,
          editRequests: pendingEditRequests + pendingCancelRequests,
          pendingEditRequests,
          pendingCancelRequests,
          activePolicies,
        },
      });
    }

    // If no specific action, just return admin status
    return Response.json({
      success: true,
      isAdmin: true,
      message: "Admin access granted",
    });
  } catch (error) {
    console.error("Admin stats error:", error);
    return Response.json(
      { success: false, error: "Server error" },
      { status: 500 }
    );
  }
}

// POST handler for backward compatibility
export async function POST(request) {
  return Response.json(
    {
      success: false,
      error:
        "Use specific endpoints: /api/admin/approve-user or /api/admin/reject-user",
    },
    { status: 400 }
  );
}
