// app/api/admin/contractor/prefix/route.js
import connectDB from "@/lib/db";
import User from "@/models/User";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { contractorId, prefix } = await request.json();

    // Basic validation
    if (!contractorId || !prefix || prefix.trim() === '') {
      return NextResponse.json(
        { success: false, error: "Contractor ID and prefix are required" },
        { status: 400 }
      );
    }

    const cleanPrefix = prefix.trim().toUpperCase();

    // Prefix rules: 3–10 uppercase letters only
    if (!/^[A-Z]{3,10}$/.test(cleanPrefix)) {
      return NextResponse.json(
        { success: false, error: "Prefix must be 3–10 uppercase letters only (A-Z)" },
        { status: 400 }
      );
    }

    await connectDB();

    const contractor = await User.findById(contractorId);

    if (!contractor) {
      return NextResponse.json(
        { success: false, error: "Contractor not found" },
        { status: 404 }
      );
    }

    // Cannot change if already locked (after first certificate)
    if (contractor.isPrefixLocked) {
      return NextResponse.json(
        { success: false, error: "Prefix is locked — cannot be changed after first certificate" },
        { status: 403 }
      );
    }

    // Update prefix (and reset sequence to 0 if needed)
    await User.findByIdAndUpdate(contractorId, {
      $set: {
        policyNoPrefix: cleanPrefix,
        lastCertificateSequence: 0, // start from 00001 next time
        isPrefixLocked: false       // unlock until first certificate
      }
    });

    return NextResponse.json({
      success: true,
      message: `Prefix set to ${cleanPrefix}`,
      prefix: cleanPrefix
    });

  } catch (error) {
    console.error("Set prefix error:", error);
    return NextResponse.json(
      { success: false, error: "Server error while setting prefix" },
      { status: 500 }
    );
  }
}