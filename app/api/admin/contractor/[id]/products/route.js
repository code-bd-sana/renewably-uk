import connectDB from "@/lib/db";
import User from "@/models/User";
import { authenticate } from "@/middleware/auth";

export async function PATCH(request, { params }) {
  try {
    const auth = await authenticate(request);
    if (!auth.success || auth.userRole !== "admin") {
      return Response.json({ error: "Admin access required" }, { status: 403 });
    }

    await connectDB();

    const { id } = await params;
    const body = await request.json();
    const { allowedProductIds = [] } = body;

    const updated = await User.findByIdAndUpdate(
      id,
      { allowedProducts: allowedProductIds },
      { new: true },
    );

    if (!updated) {
      return Response.json({ error: "Contractor not found" }, { status: 404 });
    }

    return Response.json({
      success: true,
      message: "Allowed products updated",
      allowedProducts: updated.allowedProducts,
    });
  } catch (err) {
    console.error(err);
    return Response.json({ error: err.message }, { status: 500 });
  }
}
