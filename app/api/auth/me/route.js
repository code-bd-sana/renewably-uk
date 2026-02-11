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
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (jwtError) {
      console.error("JWT verification failed:", jwtError.message);
      console.error("JWT error name:", jwtError.name);

      // Clear invalid cookie
      const response = Response.json({
        isAuthenticated: false,
        user: null,
        error: jwtError.message,
      });

      // Delete the invalid cookie
      response.cookies.delete("auth_token");
      return response;
    }

    if (!decoded) {
      return Response.json({
        isAuthenticated: false,
        user: null,
        message: "Invalid token",
      });
    }

    // Connect to DB and get user data
    await connectDB();

    const user = await User.findById(decoded.userId)
      .select("-passwordHash")
      .lean();

    if (!user) {
      return Response.json({
        isAuthenticated: false,
        user: null,
        message: "User not found",
      });
    }

    // Return successful authentication
    return Response.json({
      isAuthenticated: true,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        companyName: user.companyName,
        companyAddress: user.companyAddress,
        phoneNumber: user.phoneNumber,
        isApproved: user.isApproved,
        isSuspended: user.isSuspended,
        createdAt: user.createdAt,
        allowedProducts: user.allowedProducts || [],
        role: user.role,
        roles: user.roles || [],
        requestedRoles: user.requestedRoles || [],
      },
    });
  } catch (error) {
    console.error("Error stack:", error.stack);

    return Response.json(
      {
        isAuthenticated: false,
        user: null,
        error: "Internal server error",
      },
      { status: 500 },
    );
  }
}
