// app/api/admin/certificates/top-contractors/route.js
import connectDB from "@/lib/db";
import Insurance from "@/models/Insurance";
import User from "@/models/User";
import { authenticate } from "@/middleware/auth";

export async function GET(request) {
  try {
    // Auth check
    const auth = await authenticate(request);
    if (!auth.success || auth.userRole !== "admin") {
      return Response.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectDB();

    // Aggregate certificates by contractor (user)
    const topContractors = await Insurance.aggregate([
      {
        $match: {
          userId: { $exists: true, $ne: null }
        }
      },
      {
        $group: {
          _id: "$userId",
          certificates: { $sum: 1 },
          totalValue: { $sum: { $toDouble: "$contractValue" } },
          lastCertificate: { $max: "$createdAt" }
        }
      },
      {
        $sort: { certificates: -1 }
      },
      {
        $limit: 10
      }
    ]);

    // Get user details for each contractor
    const contractorIds = topContractors.map(c => c._id);
    const users = await User.find({ _id: { $in: contractorIds } })
      .select("name email companyName")
      .lean();

    // Combine data
    const result = topContractors.map(contractor => {
      const user = users.find(u => u._id.toString() === contractor._id.toString());
      return {
        userId: contractor._id,
        name: user?.name || "Unknown",
        companyName: user?.companyName || "N/A",
        email: user?.email || "N/A",
        certificates: contractor.certificates,
        totalValue: contractor.totalValue,
        lastCertificate: contractor.lastCertificate
      };
    });

    return Response.json({
      success: true,
      contractors: result
    });

  } catch (error) {
    console.error("Top contractors error:", error);
    return Response.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}