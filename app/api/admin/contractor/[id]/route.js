import connectDB from "@/lib/db";
import User from "@/models/User";
import { authenticate } from "@/middleware/auth";

// POST
// Add this POST method to your existing file
export async function POST(request, { params }) {
  try {
    // AUTH CHECK
    const auth = await authenticate(request);

    if (!auth.success) {
      return Response.json(
        { success: false, error: auth.error },
        { status: auth.status || 401 }
      );
    }

    // ADMIN CHECK
    if (auth.userRole !== "admin") {
      return Response.json(
        { success: false, error: "Admin access required" },
        { status: 403 }
      );
    }

    await connectDB();

    const awaitedParams = await params;
    const { id } = awaitedParams;

    // Check if it's a request ID (Insurance) or user ID
    const isInsuranceId = id.length === 24; // MongoDB ObjectId length

    if (isInsuranceId) {
      // Handle insurance request (approve/reject)
      return await handleInsuranceRequest(id, request);
    } else {
      // Handle user/contractor request
      return Response.json(
        { success: false, error: "Invalid ID format" },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Process request error:", error);
    return Response.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// Helper function to handle insurance requests
async function handleInsuranceRequest(insuranceId, request) {
  const { action, notes } = await request.json();

  if (!action || !["approve", "reject"].includes(action)) {
    return Response.json(
      { success: false, error: "Valid action required (approve/reject)" },
      { status: 400 }
    );
  }

  // Find the insurance request
  const insurance = await Insurance.findById(insuranceId);

  if (!insurance) {
    return Response.json(
      { success: false, error: "Insurance request not found" },
      { status: 404 }
    );
  }

  if (insurance.status !== "pending") {
    return Response.json(
      { success: false, error: "No pending request found" },
      { status: 400 }
    );
  }

  if (action === "approve") {
    // Apply changes if edit request
    if (
      insurance.requestData?.type === "edit" &&
      insurance.requestData?.changes
    ) {
      // Update insurance fields with requested changes
      Object.keys(insurance.requestData.changes).forEach((key) => {
        if (insurance[key] !== undefined) {
          insurance[key] = insurance.requestData.changes[key];
        }
      });
    }

    // Update status
    insurance.status =
      insurance.status === "pending_edit" ? "active" : "cancelled";
  } else if (action === "reject") {
    // Reject - just change status back to active
    insurance.status = "active";
  }

  // Save admin notes
  if (!insurance.requestData) insurance.requestData = {};
  insurance.requestData.adminNotes = notes || "";
  insurance.requestData.processedAt = new Date();
  insurance.requestData.processedBy = (await authenticate(request)).userId;

  await insurance.save();

  return Response.json({
    success: true,
    message: `Request ${action === "approve" ? "approved" : "rejected"}`,
    status: insurance.status,
    insurance: {
      id: insurance._id,
      policyNumber: insurance.policyNumber,
      status: insurance.status,
    },
  });
}

// PUT

// Add PUT method for updating contractor details
export async function PUT(request, { params }) {
  try {
    // AUTH CHECK
    const auth = await authenticate(request);

    if (!auth.success) {
      return Response.json(
        { success: false, error: auth.error },
        { status: auth.status || 401 }
      );
    }

    // ADMIN CHECK
    if (auth.userRole !== "admin") {
      return Response.json(
        { success: false, error: "Admin access required" },
        { status: 403 }
      );
    }

    await connectDB();

    const awaitedParams = await params;
    const { id } = awaitedParams;

    const data = await request.json();

    // Only allow certain fields to be updated
    const allowedUpdates = [
      "companyName",
      "companyAddress",
      "position",
      "phone",
    ];
    const updates = {};

    allowedUpdates.forEach((field) => {
      if (data[field] !== undefined) {
        updates[field] = data[field];
      }
    });

    // Update contractor
    const contractor = await User.findOneAndUpdate(
      { _id: id, role: "contractor" },
      { $set: updates },
      { new: true, runValidators: true }
    ).select("-passwordHash");

    if (!contractor) {
      return Response.json(
        { success: false, error: "Contractor not found" },
        { status: 404 }
      );
    }

    return Response.json({
      success: true,
      message: "Contractor updated successfully",
      contractor: {
        id: contractor._id,
        name: contractor.name,
        email: contractor.email,
        phone: contractor.phone,
        companyName: contractor.companyName,
        companyAddress: contractor.companyAddress,
        position: contractor.position,
      },
    });
  } catch (error) {
    console.error("Update contractor error:", error);
    return Response.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// DELETE
export async function DELETE(request, { params }) {
  try {
    // AUTH CHECK
    const auth = await authenticate(request);

    if (!auth.success) {
      return Response.json(
        { success: false, error: auth.error },
        { status: auth.status || 401 }
      );
    }

    // ADMIN CHECK
    if (auth.userRole !== "admin") {
      return Response.json(
        { success: false, error: "Admin access required" },
        { status: 403 }
      );
    }

    // DELETE CONTRACTOR
    await connectDB();

    const awaitedParams = await params;
    const { id } = awaitedParams;

    // Find and delete the contractor
    const contractor = await User.findOneAndDelete({
      _id: id,
      role: "contractor",
    });

    if (!contractor) {
      return Response.json(
        { success: false, error: "Contractor not found" },
        { status: 404 }
      );
    }

    return Response.json({
      success: true,
      message: "Contractor deleted successfully",
      deletedContractor: {
        id: contractor._id,
        name: contractor.name,
        email: contractor.email,
      },
    });
  } catch (error) {
    console.error("Delete contractor error:", error);
    return Response.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
