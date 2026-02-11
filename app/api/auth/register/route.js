import connectDB from "@/lib/db";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import {
  sendRegistrationNotification,
  sendWelcomePendingEmail,
} from "@/lib/email";

export async function POST(request) {
  try {
    await connectDB();

    const body = await request.json();
    const {
      name,
      companyName,
      email,
      phoneNumber,
      password,
      confirmPassword,
      requestedRoles = [],
      companyAddress = "",
    } = body;

    // Validate required fields
    if (
      !name ||
      !companyName ||
      !email ||
      !phoneNumber ||
      !password ||
      !confirmPassword ||
      !companyAddress
    ) {
      return Response.json(
        {
          success: false,
          error: "All fields are required",
        },
        { status: 400 },
      );
    }

    // Check passwords match
    if (password !== confirmPassword) {
      return Response.json(
        {
          success: false,
          error: "Passwords do not match",
        },
        { status: 400 },
      );
    }

    if (password.length < 6) {
      return Response.json(
        { success: false, error: "Password must be at least 6 characters" },
        { status: 400 },
      );
    }

    if (phoneNumber.length < 8 || phoneNumber.length > 15) {
      return Response.json(
        { success: false, error: "Phone number must be 8–15 characters" },
        { status: 400 },
      );
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return Response.json(
        { success: false, error: "User already exists" },
        { status: 409 },
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = new User({
      name: name.trim(),
      companyName: companyName.trim(),
      email: email.toLowerCase(),
      phoneNumber: phoneNumber.trim(),
      passwordHash: hashedPassword,
      isApproved: false,
      role: "contractor",
      roles: [],
      requestedRoles: Array.isArray(requestedRoles) ? requestedRoles : [],
      companyAddress: companyAddress.trim(),
    });
    await user.save();

    // Send notification to admin (don't block if email fails)
    try {
      await sendRegistrationNotification(
        email,
        name,
        companyName,
        phoneNumber,
        requestedRoles,
        companyAddress,
      );
      await sendWelcomePendingEmail(email, name, companyName, requestedRoles);
    } catch (emailError) {
      console.log(
        "Note: Registration notification email failed, but user was created",
      );
    }

    return Response.json(
      {
        success: true,
        message: "Registration successful. Waiting for admin approval.",
        userId: user._id,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Registration error:", error);

    // Handle duplicate email error
    if (error.code === 11000) {
      return Response.json(
        { success: false, error: "Email already exists" },
        { status: 409 },
      );
    }

    // Handle validation errors
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((err) => err.message);
      return Response.json(
        { success: false, error: messages.join(", ") },
        { status: 400 },
      );
    }

    return Response.json(
      { success: false, error: "Registration failed" },
      { status: 500 },
    );
  }
}
