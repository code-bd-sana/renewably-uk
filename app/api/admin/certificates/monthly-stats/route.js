// app/api/admin/certificates/monthly-stats/route.js
import connectDB from "@/lib/db";
import Insurance from "@/models/Insurance";
import { authenticate } from "@/middleware/auth";
import User from "@/models/User";

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

    // Get certificates grouped by month for current year
    const currentYear = new Date().getFullYear();
    
    // Aggregate certificates by month
    const monthlyStats = await Insurance.aggregate([
      {
        $match: {
          createdAt: {
            $gte: new Date(`${currentYear}-01-01`),
            $lt: new Date(`${currentYear + 1}-01-01`)
          }
        }
      },
      {
        $group: {
          _id: { $month: "$createdAt" },
          count: { $sum: 1 },
          totalValue: { $sum: { $toDouble: "$contractValue" } }
        }
      },
      {
        $sort: { "_id": 1 }
      }
    ]);

    // Format the response with all 12 months
    const months = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun", 
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ];

    const result = months.map((monthName, index) => {
      const monthData = monthlyStats.find(stat => stat._id === index + 1);
      return {
        month: monthName,
        value: monthData?.count || 0,
        totalValue: monthData?.totalValue || 0,
        monthNumber: index + 1
      };
    });

    return Response.json({
      success: true,
      data: result,
      year: currentYear
    });

  } catch (error) {
    console.error("Monthly stats error:", error);
    return Response.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}