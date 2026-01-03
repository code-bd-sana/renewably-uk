import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import connectDB from "@/lib/db";
import User from "@/models/User";

export async function GET(request) {
  try {
    // Get auth token from cookies
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;

    if (!token) {
      return Response.json({
        isAuthenticated: false,
        user: null,
        message: "No authentication token found",
      });
    }

    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded) {
      return Response.json({
        isAuthenticated: false,
        user: null,
        message: "Invalid or expired token",
      });
    }

    // Connect to DB and get user data (without password)
    await connectDB();
    const user = await User.findById(decoded.userId)
      .select("-passwordHash")
      .lean(); // Convert to plain object

    if (!user) {
      return Response.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    // SKIP SUSPENSION CHECK FOR ADMIN
    if (user.role === "admin") {
      return Response.json({
        success: true,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          isAdmin: true,
          companyName: user.companyName,
          isApproved: user.isApproved,
        },
      });
    }

    // ONLY check suspension for contractors
    if (user.role === "contractor" && user.isSuspended) {
      // Clear auth cookie
      const response = Response.json(
        {
          success: false,
          error: "Account suspended",
          message:
            user.suspensionReason ||
            "Your account has been suspended by admin.",
        },
        { status: 403 }
      );

      // Clear the auth cookie
      response.cookies.delete("auth_token");

      return response;
    }
    // Return user data
    return Response.json({
      isAuthenticated: true,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        companyName: user.companyName,
        role: user.role,
        isApproved: user.isApproved,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error("Me route error:", error);

    // Handle JWT errors specifically
    if (
      error.name === "JsonWebTokenError" ||
      error.name === "TokenExpiredError"
    ) {
      return Response.json({
        isAuthenticated: false,
        user: null,
        error: "Authentication token is invalid or expired",
      });
    }

    return Response.json(
      {
        isAuthenticated: false,
        user: null,
        error: "Authentication check failed",
      },
      { status: 500 }
    );
  }
}
