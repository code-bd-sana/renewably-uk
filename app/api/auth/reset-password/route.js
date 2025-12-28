import connectDB from "@/lib/db";
import User from "@/models/User";
import bcrypt from "bcryptjs";

export async function GET(request) {
  try {
    console.log("=== TOKEN VERIFICATION ===");
    const url = new URL(request.url);
    const token = url.searchParams.get("token");

    console.log("Raw token from URL:", token);
    console.log("Token length:", token?.length);

    if (!token) {
      console.log("No token provided");
      return Response.json({ valid: false });
    }

    await connectDB();
    console.log("Database connected");

    // First, check ALL users to see what's in DB
    const allUsers = await User.find({}).select(
      "email resetPasswordToken resetPasswordExpires"
    );
    console.log(`Total users: ${allUsers.length}`);

    // Log users with tokens
    const usersWithTokens = allUsers.filter((u) => u.resetPasswordToken);
    console.log(`Users with tokens: ${usersWithTokens.length}`);

    usersWithTokens.forEach((u, i) => {
      console.log(`User ${i + 1}: ${u.email}`);
      console.log(`  Token in DB: ${u.resetPasswordToken}`);
      console.log(`  Token length: ${u.resetPasswordToken?.length}`);
      console.log(`  Expires: ${u.resetPasswordExpires}`);
      console.log(`  Token match?: ${u.resetPasswordToken === token}`);
    });

    // Try to find user with exact token match
    console.log("\nLooking for exact token match...");
    const user = await User.findOne({
      resetPasswordToken: token,
    });

    if (user) {
      console.log("FOUND USER WITH TOKEN:", user.email);
      console.log("Token from DB:", user.resetPasswordToken);
      console.log("Token expiry:", user.resetPasswordExpires);
      console.log("Current time:", new Date());
      console.log("Is expired?", user.resetPasswordExpires < new Date());

      const isValid =
        user.resetPasswordExpires && user.resetPasswordExpires > new Date();
      console.log("Token valid?", isValid);

      return Response.json({ valid: isValid });
    } else {
      console.log("NO USER FOUND WITH THIS TOKEN");

      // Try case-insensitive search (just in case)
      const allUsers = await User.find({});
      const matchedUser = allUsers.find(
        (u) =>
          u.resetPasswordToken &&
          u.resetPasswordToken.toLowerCase() === token.toLowerCase()
      );

      if (matchedUser) {
        console.log("Found with case-insensitive match!");
        console.log("DB token:", matchedUser.resetPasswordToken);
        console.log("URL token:", token);
      }

      return Response.json({ valid: false });
    }
  } catch (error) {
    console.error("Token verification error:", error);
    return Response.json({ valid: false });
  }
}
export async function POST(request) {
  try {
    const { token, password } = await request.json();

    if (!token || !password) {
      return Response.json(
        { success: false, error: "Token and password are required" },
        { status: 400 }
      );
    }

    await connectDB();

    // Find user with valid token
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return Response.json(
        { success: false, error: "Invalid or expired token" },
        { status: 400 }
      );
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update user
    user.passwordHash = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    return Response.json({
      success: true,
      message: "Password reset successful",
    });
  } catch (error) {
    console.error("Reset password error:", error);
    return Response.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
