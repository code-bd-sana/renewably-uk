import { NextResponse } from "next/server";
import User from "@/models/User";
import connectDB from "@/lib/db";

export async function POST(request, { params }) {
  try {
    const { id } = await params;
    const { isSuspended, reason } = await request.json();

    console.log("Suspension request for user:", id, "isSuspended:", isSuspended, "reason:", reason);

    await connectDB();

    // Find user
    const user = await User.findById(id);
    if (!user) {
      console.log("User not found:", id);
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    console.log("Found user:", user.email, "Current isSuspended:", user.isSuspended);

    // Update suspension status
    user.isSuspended = isSuspended;
    
    if (isSuspended) {
      user.suspensionReason = reason || "";
      user.suspendedAt = new Date();
      // user.suspendedBy = "admin-id"; // You can add admin tracking later
    } else {
      user.suspensionReason = "";
      user.suspendedAt = null;
      user.suspendedBy = null;
    }

    await user.save();
    console.log("User updated successfully. New isSuspended:", user.isSuspended);

    return NextResponse.json({
      success: true,
      message: isSuspended 
        ? "User suspended successfully" 
        : "User unsuspended successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isApproved: user.isApproved,
        isSuspended: user.isSuspended,
        suspensionReason: user.suspensionReason,
        suspendedAt: user.suspendedAt,
      },
    });
  } catch (error) {
    console.error("Error updating suspension status:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}