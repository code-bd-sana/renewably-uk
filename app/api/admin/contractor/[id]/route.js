import connectDB from "@/lib/db";
import User from "@/models/User";
import { authenticate } from "@/middleware/auth";
import Insurance from "@/models/Insurance";
import { sendInsuranceRequestApprovalEmail, sendInsuranceRequestRejectedEmail } from "@/lib/email";

export async function GET(request, { params }) {
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

    // Await params in Next.js 13/14
    const { id } = await params;

    console.log("Fetching contractor with ID:", id);

    // Find contractor by ID
    const contractor = await User.findOne({
      _id: id,
      role: "contractor",
    })
      .select("-passwordHash")
      .lean();

    if (!contractor) {
      console.log("Contractor not found for ID:", id);
      return Response.json(
        { success: false, error: "Contractor not found" },
        { status: 404 }
      );
    }

    console.log("Contractor found:", contractor.email);

    // Get certificate count for this contractor (optional)
    const certificateCount = await Insurance.countDocuments({
      email: contractor.email, // Assuming email links contractor to insurances
    });

    return Response.json({
      success: true,
      contractor: {
        id: contractor._id.toString(),
        name: contractor.name,
        email: contractor.email,
        phone: contractor.phone || "",
        companyName: contractor.companyName || "",
        companyAddress: contractor.companyAddress || "",
        position: contractor.position || "",
        role: contractor.role,
        isApproved: contractor.isApproved,
        createdAt: contractor.createdAt,
        updatedAt: contractor.updatedAt,
        certificateCount: certificateCount, // Add this for stats
      },
    });
  } catch (error) {
    console.error("GET /api/admin/contractor/[id] error:", error);
    return Response.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// POST
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

// async function handleInsuranceRequest(insuranceId, request) {
//   console.log(insuranceId, "ami hola insurance id");
//   const { action, notes } = await request.json();

//   if (!action || !["approve", "reject"].includes(action)) {
//     return Response.json(
//       { success: false, error: "Valid action required (approve/reject)" },
//       { status: 400 }
//     );
//   }

//   // Find the insurance request
//   const insurance = await Insurance.findById(insuranceId);

//   if (!insurance) {
//     return Response.json(
//       { success: false, error: "Insurance request not found" },
//       { status: 404 }
//     );
//   }

//   // FIX: Check for any pending status
//   const isPending =
//     insurance.status === "pending" ||
//     insurance.status === "pending_edit" ||
//     insurance.status === "pending_cancel";

//   if (!isPending) {
//     return Response.json(
//       { success: false, error: "No pending request found" },
//       { status: 400 }
//     );
//   }

//   if (action === "approve") {
//     // Apply changes if edit request
//     if (
//       insurance.requestData?.type === "edit" &&
//       insurance.requestData?.changes
//     ) {
//       // Update insurance fields with requested changes
//       Object.keys(insurance.requestData.changes).forEach((key) => {
//         if (insurance[key] !== undefined) {
//           insurance[key] = insurance.requestData.changes[key];
//         }
//       });
//     }

//     // Update status based on request type
//     if (insurance.requestData?.type === "edit") {
//       insurance.status = "active"; // Edit approved → active
//     } else if (insurance.requestData?.type === "cancel") {
//       insurance.status = "cancelled"; // Cancel approved → cancelled
//     } else {
//       insurance.status = "active"; // Default
//     }
//   } else if (action === "reject") {
//     // Reject - just change status back to active
//     insurance.status = "active";
//   }

//   // Save admin notes
//   if (!insurance.requestData) insurance.requestData = {};
//   insurance.requestData.adminNotes = notes || "";
//   insurance.requestData.processedAt = new Date();
//   insurance.requestData.processedBy = (await authenticate(request)).userId;

//   await insurance.save();

//   return Response.json({
//     success: true,
//     message: `Request ${action === "approve" ? "approved" : "rejected"}`,
//     status: insurance.status,
//     insurance: {
//       id: insurance._id,
//       policyNumber: insurance.policyNumber,
//       status: insurance.status,
//     },
//   });
// }
async function handleInsuranceRequest(insuranceId, request) {
  console.log(insuranceId, "ami hola insurance id");
  const { action, notes } = await request.json();

  if (!action || !["approve", "reject"].includes(action)) {
    return Response.json(
      { success: false, error: "Valid action required (approve/reject)" },
      { status: 400 }
    );
  }

  // Find the insurance request with populated contractor info
  const insurance = await Insurance.findById(insuranceId)
    .populate('userId', 'name email companyName');

  if (!insurance) {
    return Response.json(
      { success: false, error: "Insurance request not found" },
      { status: 404 }
    );
  }

  // FIX: Check for any pending status
  const isPending =
    insurance.status === "pending" ||
    insurance.status === "pending_edit" ||
    insurance.status === "pending_cancel";

  if (!isPending) {
    return Response.json(
      { success: false, error: "No pending request found" },
      { status: 400 }
    );
  }

  let statusAfterUpdate = 'active';
  
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

    // Update status based on request type
    if (insurance.requestData?.type === "edit") {
      insurance.status = "active"; // Edit approved → active
      statusAfterUpdate = 'active';
    } else if (insurance.requestData?.type === "cancel") {
      insurance.status = "cancelled"; // Cancel approved → cancelled
      statusAfterUpdate = 'cancelled';
    } else {
      insurance.status = "active"; // Default
      statusAfterUpdate = 'active';
    }
  } else if (action === "reject") {
    // Reject - just change status back to active
    insurance.status = "active";
    statusAfterUpdate = 'active';
  }

  // Save admin notes
  if (!insurance.requestData) insurance.requestData = {};
  insurance.requestData.adminNotes = notes || "";
  insurance.requestData.processedAt = new Date();
  const auth = await authenticate(request);
  insurance.requestData.processedBy = auth.userId;

  await insurance.save();

  // ✅ SEND EMAIL TO CONTRACTOR
  try {
    const contractorEmail = insurance.userId?.email;
    const contractorName = insurance.userId?.name;
    const policyNumber = insurance.policyNumber;
    
    if (contractorEmail && contractorName) {
      if (action === "approve") {
        await sendInsuranceRequestApprovalEmail(
          contractorEmail, 
          contractorName, 
          policyNumber, 
          notes || ''
        );
        console.log(`Approval email sent to contractor: ${contractorEmail}`);
      } else if (action === "reject") {
        await sendInsuranceRequestRejectedEmail(
          contractorEmail, 
          contractorName, 
          policyNumber, 
          notes || ''
        );
        console.log(`Rejection email sent to contractor: ${contractorEmail}`);
      }
    } else {
      console.warn('Contractor email or name not found, skipping email');
    }
  } catch (emailError) {
    console.error("Failed to send email to contractor:", emailError);
    // Don't fail the whole request if email fails
  }

  return Response.json({
    success: true,
    message: `Request ${action === "approve" ? "approved" : "rejected"}`,
    status: statusAfterUpdate,
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
