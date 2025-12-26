import connectDB from "@/lib/db";
import User from "@/models/User";
import { authenticate } from "@/middleware/auth";

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
