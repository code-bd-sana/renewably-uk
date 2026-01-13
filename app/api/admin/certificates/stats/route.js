// app/api/admin/certificates/stats/route.js
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

    // Get current month and year for filtering
    const now = new Date();
    const currentMonth = now.getMonth() + 1; // 1-12
    const currentYear = now.getFullYear();

    // Calculate start and end dates for current month
    const startOfMonth = new Date(currentYear, currentMonth - 1, 1);
    const endOfMonth = new Date(currentYear, currentMonth, 1);

    // Get stats in parallel
    const [
      totalCertificates,
      totalContractors,
      thisMonthCertificates,
      totalRevenue,
      thisMonthRevenue,
    ] = await Promise.all([
      // Total certificates count
      Insurance.countDocuments(),

      // Total contractors count
      User.countDocuments({ role: "contractor" }),

      // This month's certificates count
      Insurance.countDocuments({
        createdAt: {
          $gte: startOfMonth,
          $lt: endOfMonth,
        },
      }),

      // Calculate total revenue
      Insurance.aggregate([
        {
          $match: {
            "products.price": { $exists: true },
          },
        },
        {
          $unwind: "$products",
        },
        {
          $group: {
            _id: null,
            total: { $sum: { $toDouble: "$products.price" } },
          },
        },
      ]),

      // Calculate this month's revenue
      Insurance.aggregate([
        {
          $match: {
            createdAt: {
              $gte: startOfMonth,
              $lt: endOfMonth,
            },
            "products.price": { $exists: true },
          },
        },
        {
          $unwind: "$products",
        },
        {
          $group: {
            _id: null,
            total: { $sum: { $toDouble: "$products.price" } },
          },
        },
      ]),
    ]);

    return Response.json({
      success: true,
      totalCertificates,
      totalContractors,
      thisMonthCertificates,
      totalRevenue: totalRevenue.length > 0 ? totalRevenue[0].total : 0,
      thisMonthRevenue:
        thisMonthRevenue.length > 0 ? thisMonthRevenue[0].total : 0,
    });
  } catch (error) {
    console.error("Stats error:", error);
    return Response.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
