// app/api/insurance/route.js
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import connectDB from "@/lib/db";
import Insurance from "@/models/Insurance";

// Handle GET (get all insurances for user)
export async function GET(request) {
  try {
    // Check authentication
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, error: "Not authenticated" },
        { status: 401 }
      );
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    await connectDB();

    // Find all insurances for this user
    const insurances = await Insurance.find({ userId: decoded.userId }).sort({
      createdAt: -1,
    });

    return NextResponse.json({
      success: true,
      insurances: insurances.map((insurance) => ({
        id: insurance._id,
        policyNumber: insurance.policyNumber,
        contractorName: insurance.contractorName,
        policyHolderName: insurance.policyHolderName,
        email: insurance.email,
        phone: insurance.phone,
        status: insurance.status,
        products: insurance.products,
        createdAt: insurance.createdAt,
      })),
    });
  } catch (error) {
    console.error("Fetch insurances error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch insurances" },
      { status: 500 }
    );
  }
}

// Handle POST (create new insurance)
export async function POST(request) {
  try {
    // Check authentication
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, error: "Not authenticated" },
        { status: 401 }
      );
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const data = await request.json();

    console.log("Creating insurance with data:", data);

    await connectDB();

    // Validate required fields
    if (
      !data.contractorName ||
      !data.policyHolderName ||
      !data.email ||
      !data.phone ||
      !data.address ||
      !data.products ||
      data.products.length === 0
    ) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Create new insurance
    const insurance = new Insurance({
      ...data,
      userId: decoded.userId,
      status: "active",
    });

    await insurance.save();

    return NextResponse.json({
      success: true,
      message: "Insurance created successfully",
      insuranceId: insurance._id,
      policyNumber: insurance.policyNumber,
    });
  } catch (error) {
    console.error("Create insurance error:", error);

    if (error.name === "ValidationError") {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: "Failed to create insurance" },
      { status: 500 }
    );
  }
}

// export async function PUT(request) {
//   await connectDB();

//   try {

//     const data = await request.json();
//     const id = data?.id;

//     const updated = await

//   } catch (error) {
//      return NextResponse.json(
//        { success: false, error: "Failed to create insurance" },
//        { status: 500 }
//      );
//   }

// }
