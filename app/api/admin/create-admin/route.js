import connectDB from "@/lib/db";
import User from "@/models/User";
import bcrypt from "bcryptjs";

export async function POST(request) {
  try {
    const body = await request.json();

    // Master admin key for secure access (use strong key in .env.local)
    const adminKey = request.headers.get("x-admin-key") || body.adminKey;
    const ADMIN_CREATION_KEY = process.env.ADMIN_CREATION_KEY;

    if (!ADMIN_CREATION_KEY) {
      return Response.json(
        {
          success: false,
          error: "Server misconfiguration: ADMIN_CREATION_KEY is not set",
        },
        { status: 500 },
      );
    }

    if (!adminKey || adminKey !== ADMIN_CREATION_KEY) {
      return Response.json(
        {
          success: false,
          error: "Unauthorized: Invalid admin key",
        },
        { status: 401 },
      );
    }

    await connectDB();

    const { name, email, password } = body;

    // Validate required fields
    if (!name || !email || !password) {
      return Response.json(
        {
          success: false,
          error: "Name, email, and password are required",
        },
        { status: 400 },
      );
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return Response.json(
        {
          success: false,
          error: "User with this email already exists",
        },
        { status: 400 },
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create admin user
    const newAdmin = new User({
      name,
      email: email.toLowerCase(),
      companyName: "Admin Account",
      companyAddress: "",
      phoneNumber: "0000000000",
      passwordHash: hashedPassword,
      role: "admin",
      roles: ["admin"],
      isApproved: true,
      isSuspended: false,
    });

    await newAdmin.save();

    return Response.json(
      {
        success: true,
        message: "Admin account created successfully",
        admin: {
          id: newAdmin._id,
          email: newAdmin.email,
          name: newAdmin.name,
          role: newAdmin.role,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error creating admin:", error);
    return Response.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 },
    );
  }
}
