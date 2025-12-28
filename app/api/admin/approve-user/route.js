import connectDB from "@/lib/db";
import User from "@/models/User";
import { sendApprovalEmail } from "@/lib/email";
import { authenticate } from "@/middleware/auth";

export async function POST(request) {
  try {
    //  CHECK AUTH
    const auth = await authenticate(request);

    if (!auth.success) {
      return Response.json(
        { success: false, error: auth.error },
        { status: auth.status || 401 }
      );
    }

    // CHECK IF USER IS ADMIN
    if (auth.userRole !== "admin") {
      return Response.json(
        { success: false, error: "Admin access required" },
        { status: 403 }
      );
    }

    // NOW THE APPROVAL LOGIC
    await connectDB();

    // Get form data
    const formData = await request.formData();
    const userId = formData.get("userId");

    if (!userId) {
      return new Response(
        JSON.stringify({ success: false, error: "User ID required" }),
        { status: 400 }
      );
    }

    // Update user
    const user = await User.findByIdAndUpdate(
      userId,
      {
        isApproved: true,
        updatedAt: new Date(),
      },
      { new: true }
    );

    if (!user) {
      return new Response(
        JSON.stringify({ success: false, error: "User not found" }),
        { status: 404 }
      );
    }

    // Send approval email
    try {
      await sendApprovalEmail(user.email, user.name, user.companyName);
      console.log(`Approval email sent to: ${user.email}`);
    } catch (emailError) {
      console.error("Failed to send approval email:", emailError);
    }

    // Return success response
    return Response.json(
      {
        success: true,
        message: "User approved successfully. Approval email sent.",
        user: {
          id: user._id,
          email: user.email,
          companyName: user.companyName,
          name: user.name,
          isApproved: user.isApproved,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Approve error:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
