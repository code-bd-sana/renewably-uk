// app/api/change-password/route.js

import connectDB from "@/lib/db";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    await connectDB();

    const body = await request.json();
    const { userId, oldPassword, newPassword, confirmPassword } = body;

    // Validate required fields
    if (!userId || !oldPassword || !newPassword || !confirmPassword) {
      return NextResponse.json(
        {
          success: false,
          error: "All fields are required",
        },
        { status: 400 }
      );
    }

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: "User not found",
        },
        { status: 404 }
      );
    }

    // Verify old password
    const isPasswordValid = await bcrypt.compare(
      oldPassword,
      user.passwordHash
    );
    if (!isPasswordValid) {
      return NextResponse.json(
        {
          success: false,
          error: "Current password is incorrect",
        },
        { status: 401 }
      );
    }

    // Check if new password is same as old password
    const isSamePassword = await bcrypt.compare(newPassword, user.passwordHash);
    if (isSamePassword) {
      return NextResponse.json(
        {
          success: false,
          error: "New password cannot be the same as current password",
        },
        { status: 400 }
      );
    }

    // Check passwords match
    if (newPassword !== confirmPassword) {
      return NextResponse.json(
        {
          success: false,
          error: "New passwords do not match",
        },
        { status: 400 }
      );
    }

    // Validate new password length
    if (newPassword.length < 6) {
      return NextResponse.json(
        {
          success: false,
          error: "Password must be at least 6 characters",
        },
        { status: 400 }
      );
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update user's password
    user.passwordHash = hashedPassword;
    user.updatedAt = new Date();
    await user.save();

    console.log(`Password changed for user: ${user.email}`);

    return NextResponse.json(
      {
        success: true,
        message: "Password changed successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Change password error:", error);

    // Handle validation errors
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((err) => err.message);
      return NextResponse.json(
        { success: false, error: messages.join(", ") },
        { status: 400 }
      );
    }

    // Handle MongoDB errors
    if (error.name === "CastError") {
      return NextResponse.json(
        { success: false, error: "Invalid user ID" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to change password",
      },
      { status: 500 }
    );
  }
}
