import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import connectDB from "@/lib/db";
// import Insurance from '@/models/Insurance';

export async function GET(request) {
  try {
    // Check authentication
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Connect to database
    await connectDB();

    // Get user's certificates
    // const certificates = await Insurance.find({ userId: decoded.userId });

    // Calculate stats
    const totalCertificates = certificates.length;
    const thisMonthCertificates = certificates.filter((cert) => {
      const certDate = new Date(cert.createdAt);
      const now = new Date();
      return (
        certDate.getMonth() === now.getMonth() &&
        certDate.getFullYear() === now.getFullYear()
      );
    }).length;

    // Calculate account balance (example logic)
    const totalSpent = certificates.reduce((sum, cert) => {
      return sum + (cert.price || 0);
    }, 0);
    const accountBalance = 1850 - totalSpent; // Starting balance minus spent

    // Count pending edits
    const editPending = certificates.filter(
      (cert) => cert.status === "pending_edit",
    ).length;

    // Get recent certificates
    const recentCertificates = certificates
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 10)
      .map((cert) => ({
        policyNo: cert.policyNumber,
        holderName: cert.holderName,
        measureType: cert.measureType,
        contractValue: `£${cert.contractValue.toFixed(2)}`,
        inceptionDate: new Date(cert.inceptionDate).toLocaleDateString("en-GB"),
        expiryDate: new Date(cert.expiryDate).toLocaleDateString("en-GB"),
        transactionType: "Certificate Generated",
        price: `£${cert.price.toFixed(2)}`,
        status: cert.status,
      }));

    return NextResponse.json({
      stats: {
        totalCertificates,
        thisMonthCertificates,
        accountBalance: `$${accountBalance.toFixed(2)}`,
        editPending,
      },
      certificates: recentCertificates,
      user: {
        name: decoded.name,
        companyName: decoded.companyName,
      },
    });
  } catch (error) {
    console.error("Dashboard stats error:", error);

    if (
      error.name === "JsonWebTokenError" ||
      error.name === "TokenExpiredError"
    ) {
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 401 },
      );
    }

    return NextResponse.json(
      { error: "Failed to fetch dashboard data" },
      { status: 500 },
    );
  }
}
