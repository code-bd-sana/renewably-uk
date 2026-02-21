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
        { status: 403 },
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
        { status: 404 },
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
      contractor: contractor
        ? {
            id: contractor._id.toString(),
            name: contractor.name,
            email: contractor.email,
            phone: contractor.phone,
            companyName: contractor.companyName,
            address: contractor.address,
            postcode: contractor.postcode,
            country: contractor.country,
          }
        : {
            name: "Unknown Contractor",
            companyName: "Unknown Company",
          },
    });
  } catch (error) {
    console.error("Fetch certificate error:", error);
    return Response.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const auth = await authenticate(request);
    if (!auth.success || auth.userRole !== "admin") {
      return Response.json(
        { success: false, error: "Unauthorized" },
        { status: 403 },
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
        { status: 404 },
      );
    }

    const policyNumber = certificate.policyNumber;
    const holderName = certificate.policyHolderName;
    const userId = certificate.userId;

    const deleted = await Insurance.findByIdAndDelete(id);

    // Update user's sequence counter based on remaining certificates
    if (userId) {
      const remainingInsurances = await Insurance.find({
        userId: userId,
      }).select("policyNumber");

      if (remainingInsurances.length === 0) {
        // No more certificates - reset sequence to 0
        await User.updateOne(
          { _id: userId },
          {
            $set: {
              lastCertificateSequence: 0,
              isPrefixLocked: false,
            },
          },
        );
        console.log(
          `User ${userId} sequence reset to 0 (no certificates remaining)`,
        );
      } else {
        // Find the highest sequence number from remaining certificates
        const user = await User.findById(userId).select("policyNoPrefix");
        if (user && user.policyNoPrefix) {
          const prefixPattern = new RegExp(`^${user.policyNoPrefix}(\\d+)$`);
          let maxSequence = 0;

          for (const ins of remainingInsurances) {
            const match = ins.policyNumber.match(prefixPattern);
            if (match) {
              const sequence = parseInt(match[1], 10);
              if (sequence > maxSequence) {
                maxSequence = sequence;
              }
            }
          }

          if (maxSequence > 0) {
            await User.updateOne(
              { _id: userId },
              { $set: { lastCertificateSequence: maxSequence } },
            );
            console.log(
              `User ${userId} sequence updated to ${maxSequence} (highest remaining)`,
            );
          }
        }
      }
    }

    return Response.json({
      success: true,
      message: "Certificate permanently deleted from database",
      deletedId: deleted._id,
      deletedPolicyNumber: deleted.policyNumber,
      deletedHolderName: deleted.policyHolderName,
      sequenceUpdated: true,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Permanent delete error:", error);
    return Response.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}
