import connectDB from "@/lib/db";
import Insurance from "@/models/Insurance";
import { authenticate } from "@/middleware/auth";
import User from "@/models/User";

export async function GET(request, { params }) {
  try {
    const auth = await authenticate(request);
    if (!auth.success || auth.userRole !== "admin") {
      return Response.json(
        { success: false, error: "Unauthorized" },
        { status: 403 }
      );
    }

    await connectDB();

    const { id } = await params;
    console.log("Fetching certificate with ID:", id);

    // Find the certificate
    const certificate = await Insurance.findById(id);

    if (!certificate) {
      return Response.json(
        { success: false, error: "Certificate not found" },
        { status: 404 }
      );
    }

    // Get contractor/user data
    const contractor = await User.findById(certificate.userId);

    // Return both certificate and contractor
    return Response.json({
      success: true,
      certificate: {
        ...certificate.toObject(),
        _id: certificate._id.toString(),
      },
      contractor: contractor ? {
        id: contractor._id.toString(),
        name: contractor.name,
        email: contractor.email,
        phone: contractor.phone,
        companyName: contractor.companyName,
        address: contractor.address,
        postcode: contractor.postcode,
        country: contractor.country
      } : {
        name: "Unknown Contractor",
        companyName: "Unknown Company"
      }
    });
    
  } catch (error) {
    console.error("Fetch certificate error:", error);
    return Response.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const auth = await authenticate(request);
    if (!auth.success || auth.userRole !== "admin") {
      return Response.json(
        { success: false, error: "Unauthorized" },
        { status: 403 }
      );
    }

    await connectDB();

    const { id } = await params;
    console.log("PERMANENTLY deleting certificate with ID:", id);

    // Find the certificate first to get details
    const certificate = await Insurance.findById(id);

    if (!certificate) {
      return Response.json(
        { success: false, error: "Certificate not found" },
        { status: 404 }
      );
    }

    const policyNumber = certificate.policyNumber;
    const holderName = certificate.policyHolderName;
    const deleted = await Insurance.findByIdAndDelete(id);

    return Response.json({
      success: true,
      message: "Certificate permanently deleted from database",
      deletedId: deleted._id,
      deletedPolicyNumber: deleted.policyNumber,
      deletedHolderName: deleted.policyHolderName,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Permanent delete error:", error);
    return Response.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
