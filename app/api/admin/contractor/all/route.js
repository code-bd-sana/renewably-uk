import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import User from "@/models/User";

export async function GET() {
  try {
    await connectDB();

    const pipeline = [
      // Sort newest first
      { $sort: { createdAt: -1 } },

      // Lookup allowedProducts
      {
        $lookup: {
          from: "products",
          let: { productIds: { $ifNull: ["$allowedProducts", []] } },
          pipeline: [
            { $match: { $expr: { $in: ["$_id", "$$productIds"] } } },
            {
              // Convert _id to string here inside the aggregation
              $project: {
                _id: { $toString: "$_id" },
                Measures: 1,
              },
            },
          ],
          as: "allowedProducts",
        },
      },

      // Add frontend-friendly id for users
      {
        $addFields: {
          id: { $toString: "$_id" },
        },
      },

      // Project only required fields
      {
        $project: {
          _id: 1,
          id: 1,
          name: 1,
          email: 1,
          phoneNumber: 1,
          companyName: 1,
          isApproved: 1,
          isSuspended: 1,
          roles: 1,
          policyNoPrefix: 1,
          isPrefixLocked: 1,
          createdAt: 1,
          certificateCount: 1,
          allowedProducts: 1, // already has _id as string
        },
      },
    ];

    const contractors = await User.aggregate(pipeline);

    return NextResponse.json({
      success: true,
      contractors,
    });
  } catch (error) {
    console.error("Contractor aggregation error:", error);

    return NextResponse.json(
      {
        success: false,
        error: error.message || "Internal server error",
      },
      { status: 500 },
    );
  }
}
