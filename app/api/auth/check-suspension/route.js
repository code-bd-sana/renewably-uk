import { NextResponse } from "next/server";
import User from "@/models/User";
import { verifyAccessToken } from "@/middleware/auth";
import connectDB from "@/lib/db";

export async function GET(request) {
  try {
    // Get token from cookies or headers
    const token = request.cookies.get('auth_token')?.value || 
                  request.headers.get('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json(
        { success: false, error: "Not authenticated" },
        { status: 401 }
      );
    }
    
    // Verify token (use your JWT verification method)
    const decoded = verifyAccessToken(token); // Implement this based on your auth
    
    if (!decoded) {
      return NextResponse.json(
        { success: false, error: "Invalid token" },
        { status: 401 }
      );
    }
    
    await connectDB();
    
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      isSuspended: user.isSuspended,
      suspensionReason: user.suspensionReason || ""
    });
    
  } catch (error) {
    console.error("Check suspension error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}