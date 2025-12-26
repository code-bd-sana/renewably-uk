import connectDB from "@/lib/db";
import User from "@/models/User";
import crypto from "crypto";
import { sendResetPasswordEmail } from "@/lib/email";

export async function POST(request) {
  try {
    console.log("=== FORGOT PASSWORD REQUEST ===");
    const { email } = await request.json();
    console.log("Email:", email);

    if (!email) {
      return Response.json(
        { success: false, error: "Email is required" },
        { status: 400 }
      );
    }

    await connectDB();
    console.log("Database connected");

    // Find user
    const user = await User.findOne({ email });
    console.log("User found:", user ? `Yes (${user.email})` : "No");
    
    if (!user) {
      // For security
      return Response.json({
        success: true,
        message: "If an account exists with this email, a reset link will be sent"
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour

    console.log("Generated token (first 10 chars):", resetToken.substring(0, 10) + "...");
    console.log("Full token:", resetToken);
    console.log("Token expiry:", resetTokenExpiry);

    // Update user with new token - use save() instead of findByIdAndUpdate
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = resetTokenExpiry;
    
    console.log("Before save - user object:", {
      token: user.resetPasswordToken,
      expires: user.resetPasswordExpires
    });

    // Save the user
    await user.save();
    
    console.log("User saved successfully");

    // Verify by fetching fresh data
    const updatedUser = await User.findById(user._id);
    console.log("After save - verified:", {
      token: updatedUser.resetPasswordToken,
      tokenMatches: updatedUser.resetPasswordToken === resetToken,
      expires: updatedUser.resetPasswordExpires
    });

    if (!updatedUser.resetPasswordToken || updatedUser.resetPasswordToken !== resetToken) {
      console.error("TOKEN NOT SAVED PROPERLY!");
      return Response.json({
        success: false,
        error: "Failed to save reset token"
      });
    }

    // Send email
    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;
    console.log("Reset URL:", resetUrl);
    
    try {
      await sendResetPasswordEmail(email, user.name, resetUrl);
      console.log("Reset email sent successfully");
    } catch (emailError) {
      console.error("Email sending failed:", emailError);
    }

    console.log("=== FORGOT PASSWORD COMPLETE ===");
    
    return Response.json({
      success: true,
      message: "Password reset email sent"
    });

  } catch (error) {
    console.error("=== FORGOT PASSWORD ERROR ===");
    console.error("Error:", error);
    console.error("Error stack:", error.stack);
    return Response.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}