import connectDB from "@/lib/db";
import Insurance from "@/models/Insurance";
import { authenticate } from "@/middleware/auth";

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
